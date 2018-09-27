import gql from 'graphql-tag';

export const query = {
  GET_TRACK: gql`query Track($cameraTrackId: ID!, $serial: String!) {
    Track(cameraTrackId: $cameraTrackId, serial: $serial) {
      cameraTrackId
      count
      name
      geoData {
        accuracy
        altitude
        heading
        createdAt
        location {
          coordinates
        }
        media {
          file
          type
        }
        speed
      }
    }
  }`,
};

export const mutation = {
  POST_TRACK: gql`mutation newTrack($cameraTrackId: ID!, $name: String, $camera: String!) {
    createTrack(cameraTrackId: $cameraTrackId, name: $name, camera: $camera) {
      id
      name
    }
  }`,
  DELETE_TRACK_ID: gql`mutation stopTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {
    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {
      cameraTrackId
      camera
      isLive
    }
  }`,
  PUT_TRACKRESUME_ID: gql`mutation resumeTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {
    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {
      cameraTrackId
      camera
      isLive
    }
  }`,
  POST_TRACK_ID: gql`mutation newGeoPosition($cameraTrackId: ID!, $camera: String!, $geoData: GeoDataInput!) {
    updateTrack(cameraTrackId: $cameraTrackId, camera: $camera, geoData: $geoData) {
      id
      name
      count
      camera
    }
  }`,
  CAMERA_STATUS: gql`mutation camStatus($camera: String!, $status: String!, $metadata: String) {
    cameraStatus(camera: $camera, status: $status, metadata: $metadata) {
      camera
      status
      metadata
    }
  }`,
  SET_CAMERA_IP: gql`mutation setCameraIp($camera: String!, $ip: String!) {
    setCameraIp(camera: $camera, ip: $ip) {
      name
      ip
    }
  }`,
};

export const subscription = {
  CAMERA_STATUS_SUB: gql`subscription cameraStatusUpdated($camera: [SerialInput]!) {
    cameraStatusUpdated(camera: $camera) {
      status
      metadata
    }
  }`,
};

export const variables = (GQL, camera, params, body) => {
  let vars = {};
  switch (GQL) {
    case 'DELETE_TRACK_ID':
      vars = {
        cameraTrackId: params.id,
        camera,
        isLive: false,
      };
      break;
    case 'PUT_TRACKRESUME_ID':
      vars = {
        cameraTrackId: params.id,
        camera,
        isLive: true,
      };
      break;
    case 'POST_TRACK_ID':
      vars = {
        cameraTrackId: params.id,
        camera,
        geoData: {
          location: {
            coordinates: [
              body.geoData.latitude,
              body.geoData.longitude,
            ],
            type: 'Point',
          },
          media: {
            type: (body.geoData.media) ? body.geoData.media.type : null,
            file: (body.geoData.media) ? body.geoData.media.file : null,
          },
          speed: body.geoData.speed,
          heading: body.geoData.heading,
          altitude: body.geoData.altitude,
          accuracy: body.geoData.accuracy,
        },
      };
      break;
    default:
  }
  return vars;
};
