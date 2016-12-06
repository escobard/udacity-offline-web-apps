'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _events = require('events');

var _readFormBody = require('./readFormBody');

var _readFormBody2 = _interopRequireDefault(_readFormBody);

var _templatesIndex = require('./templates/index');

var _templatesIndex2 = _interopRequireDefault(_templatesIndex);

var _templatesSettings = require('./templates/settings');

var _templatesSettings2 = _interopRequireDefault(_templatesSettings);

var compressor = (0, _compression2['default'])({
  flush: _zlib2['default'].Z_PARTIAL_FLUSH
});

var connectionTypes = ['perfect', 'slow', 'lie-fi', 'offline'];

var Server = (function (_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(port, appPort) {
    var _this = this;

    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);
    this._app = (0, _express2['default'])();
    this._port = port;
    this._appPort = appPort;
    this._currentConnectionType = 'perfect';

    var staticOptions = {
      maxAge: 0
    };

    this._app.use('/js', _express2['default']['static']('../public/js', staticOptions));
    this._app.use('/css', _express2['default']['static']('../public/css', staticOptions));
    this._app.use('/imgs', _express2['default']['static']('../public/imgs', staticOptions));

    this._app.get('/', compressor, function (req, res) {
      res.send((0, _templatesIndex2['default'])({
        scripts: '<script src="/js/settings.js" defer></script>',
        extraCss: '<link rel="stylesheet" href="/css/settings.css" />',
        content: (0, _templatesSettings2['default'])({
          appPort: _this._appPort,
          currentConnectionType: _this._currentConnectionType,
          connectionTypes: [{ value: 'perfect', title: "Perfect" }, { value: 'slow', title: "Slow" }, { value: 'lie-fi', title: "Lie-fi" }, { value: 'offline', title: "Offline" }].map(function (type) {
            type.checked = type.value === _this._currentConnectionType;
            return type;
          })
        })
      }));
    });

    this._app.post('/set', compressor, (0, _readFormBody2['default'])(), function (req, res) {
      if (!req.body || !req.body.connectionType || connectionTypes.indexOf(req.body.connectionType) == -1) {
        return res.sendStatus(400);
      }

      res.send({
        ok: true
      });

      _this._currentConnectionType = req.body.connectionType;
      _this.emit('connectionChange', { type: req.body.connectionType });
    });
  }

  _createClass(Server, [{
    key: 'listen',
    value: function listen() {
      var _this2 = this;

      this._app.listen(this._port, function (_) {
        console.log("Config server listening at localhost:" + _this2._port);
      });
    }
  }]);

  return Server;
})(_events.EventEmitter);

exports['default'] = Server;
module.exports = exports['default'];
//# sourceMappingURL=Settings.js.map
