import request from 'request';
import async from 'async';
import Logger from './utils/logger';

import Connection from './connection';
import uploader from './uploader';
import config from './config';
import { query, mutation, variables, subscription } from './gql';

const rtsRoute = ['/track/:id', '/track/resume/:id'];
const verbs = ['POST', 'PUT', 'DELETE'];
let apolloClient = null;
let camera = null;

const publish = (GQL, vars) => {
  apolloClient.mutate({
    mutation: GQL,
    variables: vars,
  }).then(data => Logger.info(data.data))
    .catch(error => Logger.error(error));
};

const validateAndPublish = (req) => {
  if (verbs.indexOf(req.method) > -1 &&
      rtsRoute.indexOf(req.route.path) > -1) {
    let GQL = req.route.path.replace(/\//g, '');
    GQL = GQL.replace(/:/g, '_').toUpperCase();
    GQL = `${req.method}_${GQL}`;
    publish(mutation[GQL], variables(GQL, camera, req.params, req.body));
  }
  return false;
};

module.exports = () => ({
  connect: async (cameraId) => {
    apolloClient = await new Connection(cameraId).client();
    setTimeout(() => {
      apolloClient.subscribe({
        query: subscription.CAMERA_STATUS_SUB,
        variables: {
          camera: [{ serial: cameraId }],
        },
      }).subscribe({
        next(data) {
          const { status, metadata } = data.data.cameraStatusUpdated;
          if (status === 'request' && metadata) {
            const { trackId, type, geoData } = JSON.parse(metadata);
            const mediaType = (type === 'image') ? 'photo' : 'video';
            const endpoint = (type === 'image') ? `${config.wawycam_uri}/photo` : `${config.wawycam_uri}/video/short`;
            request.post(endpoint, (err, response, body) => {
              if (err) { throw new Error(err); }
              const result = JSON.parse(body);
              const location = {
                accuracy: geoData.accuracy,
                altitude: geoData.altitude,
                heading: geoData.heading,
                speed: geoData.speed,
                latitude: geoData.location.coordinates[0] || null,
                longitude: geoData.location.coordinates[1] || null,
              };
              location.media = {
                type,
                file: result[mediaType],
              };
              const options = {
                uri: `${config.wawycam_uri}/track/${trackId}`,
                method: 'POST',
                json: true,
                body: {
                  geoData: location,
                },
              };
              request.post(options, (error) => {
                if (err) { throw new Error(error); }
              });
            });
          }
        },
      });
    }, 1000);
  },
  set: (cameraId) => {
    camera = cameraId;
  },
  setCameraIp: (cameraId, ip) => {
    publish(mutation.SET_CAMERA_IP, {
      camera,
      ip,
    });
  },
  track: (id, name) => {
    publish(mutation.POST_TRACK, {
      cameraTrackId: id,
      camera,
      name,
    });
  },
  syncTrack: (cameraTrackId, serial) => {
    return apolloClient.query({
      query: query.GET_TRACK,
      variables: {
        cameraTrackId,
        serial,
      },
    }).then(data => data);
  },
  uploadTrack: (cameraTrackId, serial, geoData, socket) => {
    async.eachSeries(geoData, (data, callback) => {
      uploader(camera, `/home/pi/wawycam/api/snap/${data.media.file}`, (percent) => {
        socket.emit('sync:progress', { media: data.media.file, percent });
        if (percent === 'uploaded') {
          apolloClient.mutate({
            mutation: mutation.POST_TRACK_ID,
            variables: {
              cameraTrackId,
              camera: serial,
              geoData: {
                location: {
                  coordinates: [
                    data.latitude,
                    data.longitude,
                  ],
                  type: 'Point',
                },
                media: {
                  type: (data.media) ? data.media.type : null,
                  file: (data.media) ? data.media.file : null,
                },
                speed: data.speed,
                heading: data.heading,
                altitude: data.altitude,
                accuracy: data.accuracy,
                createdAt: data.createdAt,
              },
            },
          }).then((result) => {
            Logger.info(result.data);
            callback();
          }).catch(error => Logger.error(error));
        }
      });
    }, () => {
      socket.emit('sync:done');
    });
  },
  camera: (status, file) => {
    switch (status) {
      case 'status:recording':
        publish(mutation.CAMERA_STATUS, { camera, status: 'recording', metadata: null });
        break;
      case 'status:connecting':
        publish(mutation.CAMERA_STATUS, { camera, status: 'connecting', metadata: null });
        break;
      case 'status:uploading:photo':
        uploader(camera, `/home/pi/wawycam/api/snap/${file}`, (percent) => {
          if (percent === 'uploaded') {
            if (file.indexOf('png') > -1) {
              publish(mutation.CAMERA_STATUS, { camera, status: 'uploaded', metadata: file });
            } else {
              publish(mutation.CAMERA_STATUS, { camera, status: 'processing', metadata: file });
              const options = {
                uri: `${config.uri}/processing`,
                method: 'POST',
                json: true,
                body: {
                  file,
                  camera,
                },
              };
              request.post(options, (err, response, body) => {
                if (err) { throw new Error(err); }
                const videoFile = body.file.replace('jpg', 'mp4');
                publish(mutation.CAMERA_STATUS, { camera: body.camera, status: 'videodone', metadata: videoFile });
              });
            }
          } else {
            publish(mutation.CAMERA_STATUS, { camera, status: 'uploading', metadata: percent });
          }
        });
        break;
      default:
    }
  },
  listen: (req, res, next) => {
    validateAndPublish(req);
    return (next());
  },

});
