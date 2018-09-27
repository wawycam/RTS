'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (camera, filePath, cb) {
  var endpoint = _config2.default.uri + '/upload';
  var args = ['-v', '-k', '-o logfile', '-#', '-i', '-H', 'Content-Type: multipart/form-data', '-F', 'camera=' + camera, '-F', 'file=@' + filePath, endpoint];
  var child = (0, _child_process.spawn)('curl', args);
  // +'/'+idride

  child.stdout.setEncoding('utf8');
  child.stdin.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stderr.on('data', function (chunk) {
    var progress = chunk.replace(/#/g, '');
    progress = progress.replace(/%/g, '');
    progress = progress.replace(/ /g, '');
    progress = parseInt(progress, 10);
    if (progress > 0 && !Number.isNaN(progress)) {
      cb(progress);
    }
  });

  child.on('close', function () {
    cb('uploaded');
  });
};