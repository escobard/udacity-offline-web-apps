'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _busboy = require('busboy');

var _busboy2 = _interopRequireDefault(_busboy);

var RE_MIME = /^(?:multipart\/.+)|(?:application\/x-www-form-urlencoded)$/i;

exports['default'] = function () {
  return function (req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD' || !hasBody(req) || !RE_MIME.test(mime(req))) {
      next();
      return;
    }

    var busboy = new _busboy2['default']({
      headers: req.headers
    });

    req.body = {};

    busboy.on('finish', function (_) {
      return next();
    });
    busboy.on('field', function (name, val) {
      return req.body[name] = val;
    });
    req.pipe(busboy);
  };
};

function hasBody(req) {
  var encoding = ('transfer-encoding' in req.headers);
  var length = 'content-length' in req.headers && req.headers['content-length'] !== '0';
  return encoding || length;
}

function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}
module.exports = exports['default'];
//# sourceMappingURL=readFormBody.js.map
