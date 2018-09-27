'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.variables = exports.subscription = exports.mutation = exports.query = undefined;

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['query Track($cameraTrackId: ID!, $serial: String!) {\n    Track(cameraTrackId: $cameraTrackId, serial: $serial) {\n      cameraTrackId\n      count\n      name\n      geoData {\n        accuracy\n        altitude\n        heading\n        createdAt\n        location {\n          coordinates\n        }\n        media {\n          file\n          type\n        }\n        speed\n      }\n    }\n  }'], ['query Track($cameraTrackId: ID!, $serial: String!) {\n    Track(cameraTrackId: $cameraTrackId, serial: $serial) {\n      cameraTrackId\n      count\n      name\n      geoData {\n        accuracy\n        altitude\n        heading\n        createdAt\n        location {\n          coordinates\n        }\n        media {\n          file\n          type\n        }\n        speed\n      }\n    }\n  }']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['mutation newTrack($cameraTrackId: ID!, $name: String, $camera: String!) {\n    createTrack(cameraTrackId: $cameraTrackId, name: $name, camera: $camera) {\n      id\n      name\n    }\n  }'], ['mutation newTrack($cameraTrackId: ID!, $name: String, $camera: String!) {\n    createTrack(cameraTrackId: $cameraTrackId, name: $name, camera: $camera) {\n      id\n      name\n    }\n  }']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['mutation stopTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {\n    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {\n      cameraTrackId\n      camera\n      isLive\n    }\n  }'], ['mutation stopTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {\n    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {\n      cameraTrackId\n      camera\n      isLive\n    }\n  }']),
    _templateObject4 = (0, _taggedTemplateLiteral3.default)(['mutation resumeTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {\n    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {\n      cameraTrackId\n      camera\n      isLive\n    }\n  }'], ['mutation resumeTrack($cameraTrackId: ID!, $camera: String!, $isLive: Boolean!) {\n    trackStatus(cameraTrackId: $cameraTrackId, camera: $camera, isLive: $isLive) {\n      cameraTrackId\n      camera\n      isLive\n    }\n  }']),
    _templateObject5 = (0, _taggedTemplateLiteral3.default)(['mutation newGeoPosition($cameraTrackId: ID!, $camera: String!, $geoData: GeoDataInput!) {\n    updateTrack(cameraTrackId: $cameraTrackId, camera: $camera, geoData: $geoData) {\n      id\n      name\n      count\n      camera\n    }\n  }'], ['mutation newGeoPosition($cameraTrackId: ID!, $camera: String!, $geoData: GeoDataInput!) {\n    updateTrack(cameraTrackId: $cameraTrackId, camera: $camera, geoData: $geoData) {\n      id\n      name\n      count\n      camera\n    }\n  }']),
    _templateObject6 = (0, _taggedTemplateLiteral3.default)(['mutation camStatus($camera: String!, $status: String!, $metadata: String) {\n    cameraStatus(camera: $camera, status: $status, metadata: $metadata) {\n      camera\n      status\n      metadata\n    }\n  }'], ['mutation camStatus($camera: String!, $status: String!, $metadata: String) {\n    cameraStatus(camera: $camera, status: $status, metadata: $metadata) {\n      camera\n      status\n      metadata\n    }\n  }']),
    _templateObject7 = (0, _taggedTemplateLiteral3.default)(['mutation setCameraIp($camera: String!, $ip: String!) {\n    setCameraIp(camera: $camera, ip: $ip) {\n      name\n      ip\n    }\n  }'], ['mutation setCameraIp($camera: String!, $ip: String!) {\n    setCameraIp(camera: $camera, ip: $ip) {\n      name\n      ip\n    }\n  }']),
    _templateObject8 = (0, _taggedTemplateLiteral3.default)(['subscription cameraStatusUpdated($camera: [SerialInput]!) {\n    cameraStatusUpdated(camera: $camera) {\n      status\n      metadata\n    }\n  }'], ['subscription cameraStatusUpdated($camera: [SerialInput]!) {\n    cameraStatusUpdated(camera: $camera) {\n      status\n      metadata\n    }\n  }']);

var _graphqlTag = require('graphql-tag');

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var query = exports.query = {
  GET_TRACK: (0, _graphqlTag2.default)(_templateObject)
};

var mutation = exports.mutation = {
  POST_TRACK: (0, _graphqlTag2.default)(_templateObject2),
  DELETE_TRACK_ID: (0, _graphqlTag2.default)(_templateObject3),
  PUT_TRACKRESUME_ID: (0, _graphqlTag2.default)(_templateObject4),
  POST_TRACK_ID: (0, _graphqlTag2.default)(_templateObject5),
  CAMERA_STATUS: (0, _graphqlTag2.default)(_templateObject6),
  SET_CAMERA_IP: (0, _graphqlTag2.default)(_templateObject7)
};

var subscription = exports.subscription = {
  CAMERA_STATUS_SUB: (0, _graphqlTag2.default)(_templateObject8)
};

var variables = exports.variables = function variables(GQL, camera, params, body) {
  var vars = {};
  switch (GQL) {
    case 'DELETE_TRACK_ID':
      vars = {
        cameraTrackId: params.id,
        camera: camera,
        isLive: false
      };
      break;
    case 'PUT_TRACKRESUME_ID':
      vars = {
        cameraTrackId: params.id,
        camera: camera,
        isLive: true
      };
      break;
    case 'POST_TRACK_ID':
      vars = {
        cameraTrackId: params.id,
        camera: camera,
        geoData: {
          location: {
            coordinates: [body.geoData.latitude, body.geoData.longitude],
            type: 'Point'
          },
          media: {
            type: body.geoData.media ? body.geoData.media.type : null,
            file: body.geoData.media ? body.geoData.media.file : null
          },
          speed: body.geoData.speed,
          heading: body.geoData.heading,
          altitude: body.geoData.altitude,
          accuracy: body.geoData.accuracy
        }
      };
      break;
    default:
  }
  return vars;
};