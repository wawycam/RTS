'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _uploader = require('./uploader');

var _uploader2 = _interopRequireDefault(_uploader);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _gql = require('./gql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rtsRoute = ['/track/:id', '/track/resume/:id'];
var verbs = ['POST', 'PUT', 'DELETE'];
var apolloClient = null;
var _camera = null;

var publish = function publish(GQL, vars) {
  apolloClient.mutate({
    mutation: GQL,
    variables: vars
  }).then(function (data) {
    return _logger2.default.info(data.data);
  }).catch(function (error) {
    return _logger2.default.error(error);
  });
};

var validateAndPublish = function validateAndPublish(req) {
  if (verbs.indexOf(req.method) > -1 && rtsRoute.indexOf(req.route.path) > -1) {
    var GQL = req.route.path.replace(/\//g, '');
    GQL = GQL.replace(/:/g, '_').toUpperCase();
    GQL = req.method + '_' + GQL;
    publish(_gql.mutation[GQL], (0, _gql.variables)(GQL, _camera, req.params, req.body));
  }
  return false;
};

module.exports = function () {
  return {
    connect: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(cameraId) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new _connection2.default(cameraId).client();

              case 2:
                apolloClient = _context.sent;

                setTimeout(function () {
                  apolloClient.subscribe({
                    query: _gql.subscription.CAMERA_STATUS_SUB,
                    variables: {
                      camera: [{ serial: cameraId }]
                    }
                  }).subscribe({
                    next: function next(data) {
                      var _data$data$cameraStat = data.data.cameraStatusUpdated,
                          status = _data$data$cameraStat.status,
                          metadata = _data$data$cameraStat.metadata;

                      if (status === 'request' && metadata) {
                        var _JSON$parse = JSON.parse(metadata),
                            trackId = _JSON$parse.trackId,
                            type = _JSON$parse.type,
                            geoData = _JSON$parse.geoData;

                        var mediaType = type === 'image' ? 'photo' : 'video';
                        var endpoint = type === 'image' ? _config2.default.wawycam_uri + '/photo' : _config2.default.wawycam_uri + '/video/short';
                        _request2.default.post(endpoint, function (err, response, body) {
                          if (err) {
                            throw new Error(err);
                          }
                          var result = JSON.parse(body);
                          var location = {
                            accuracy: geoData.accuracy,
                            altitude: geoData.altitude,
                            heading: geoData.heading,
                            speed: geoData.speed,
                            latitude: geoData.location.coordinates[0] || null,
                            longitude: geoData.location.coordinates[1] || null
                          };
                          location.media = {
                            type: type,
                            file: result[mediaType]
                          };
                          var options = {
                            uri: _config2.default.wawycam_uri + '/track/' + trackId,
                            method: 'POST',
                            json: true,
                            body: {
                              geoData: location
                            }
                          };
                          _request2.default.post(options, function (error) {
                            if (err) {
                              throw new Error(error);
                            }
                          });
                        });
                      }
                    }
                  });
                }, 1000);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      function connect(_x) {
        return _ref.apply(this, arguments);
      }

      return connect;
    }(),
    set: function set(cameraId) {
      _camera = cameraId;
    },
    setCameraIp: function setCameraIp(cameraId, ip) {
      publish(_gql.mutation.SET_CAMERA_IP, {
        camera: _camera,
        ip: ip
      });
    },
    track: function track(id, name) {
      publish(_gql.mutation.POST_TRACK, {
        cameraTrackId: id,
        camera: _camera,
        name: name
      });
    },
    syncTrack: function syncTrack(cameraTrackId, serial) {
      return apolloClient.query({
        query: _gql.query.GET_TRACK,
        variables: {
          cameraTrackId: cameraTrackId,
          serial: serial
        }
      }).then(function (data) {
        return data;
      });
    },
    camera: function camera(status, file) {
      switch (status) {
        case 'status:recording':
          publish(_gql.mutation.CAMERA_STATUS, { camera: _camera, status: 'recording', metadata: null });
          break;
        case 'status:connecting':
          publish(_gql.mutation.CAMERA_STATUS, { camera: _camera, status: 'connecting', metadata: null });
          break;
        case 'status:uploading:photo':
          (0, _uploader2.default)(_camera, '/home/pi/wawycam/api/snap/' + file, function (percent) {
            if (percent === 'uploaded') {
              if (file.indexOf('png') > -1) {
                publish(_gql.mutation.CAMERA_STATUS, { camera: _camera, status: 'uploaded', metadata: file });
              } else {
                publish(_gql.mutation.CAMERA_STATUS, { camera: _camera, status: 'processing', metadata: file });
                var options = {
                  uri: _config2.default.uri + '/processing',
                  method: 'POST',
                  json: true,
                  body: {
                    file: file,
                    camera: _camera
                  }
                };
                _request2.default.post(options, function (err, response, body) {
                  if (err) {
                    throw new Error(err);
                  }
                  var videoFile = body.file.replace('jpg', 'mp4');
                  publish(_gql.mutation.CAMERA_STATUS, { camera: body.camera, status: 'videodone', metadata: videoFile });
                });
              }
            } else {
              publish(_gql.mutation.CAMERA_STATUS, { camera: _camera, status: 'uploading', metadata: percent });
            }
          });
          break;
        default:
      }
    },
    listen: function listen(req, res, next) {
      validateAndPublish(req);
      return next();
    }
  };
};