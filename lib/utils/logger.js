'use strict';

var _require = require('winston'),
    createLogger = _require.createLogger,
    format = _require.format,
    transports = _require.transports;

var combine = format.combine,
    timestamp = format.timestamp,
    label = format.label,
    printf = format.printf;


var wawyLogFormat = printf(function (info) {
  return info.timestamp + ' ' + info.message;
});

var logger = module.exports = createLogger({
  transports: [new transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'silly' : 'error'
  })],
  format: combine(format.splat(), format.colorize({ all: true }), timestamp(), wawyLogFormat)
});