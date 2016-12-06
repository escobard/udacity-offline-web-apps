'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _ws = require('ws');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _throttle = require('throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _lodashNumberRandom = require('lodash/number/random');

var _lodashNumberRandom2 = _interopRequireDefault(_lodashNumberRandom);

var _templatesIndex = require('./templates/index');

var _templatesIndex2 = _interopRequireDefault(_templatesIndex);

var _templatesPosts = require('./templates/posts');

var _templatesPosts2 = _interopRequireDefault(_templatesPosts);

var _templatesPost = require('./templates/post');

var _templatesPost2 = _interopRequireDefault(_templatesPost);

var _templatesRemoteExecutor = require('./templates/remote-executor');

var _templatesRemoteExecutor2 = _interopRequireDefault(_templatesRemoteExecutor);

var _templatesIdbTest = require('./templates/idb-test');

var _templatesIdbTest2 = _interopRequireDefault(_templatesIdbTest);

var _generateMessage = require('./generateMessage');

var maxMessages = 30;

var compressor = (0, _compression2['default'])({
  flush: _zlib2['default'].Z_PARTIAL_FLUSH
});

var appServerPath = _os2['default'].platform() == 'win32' ? '\\\\.\\pipe\\offlinefirst' + Date.now() + '.sock' : 'offlinefirst.sock';

var connectionProperties = {
  perfect: { bps: 100000000, delay: 0 },
  slow: { bps: 4000, delay: 3000 },
  'lie-fi': { bps: 1, delay: 10000 }
};

var imgSizeToFlickrSuffix = {
  '1024px': 'b',
  '800px': 'c',
  '640px': 'z',
  '320px': 'n'
};

function findIndex(arr, func) {
  for (var i = 0; i < arr.length; i++) {
    if (func(arr[i], i, arr)) return i;
  }
  return -1;
}

var Server = (function () {
  function Server(port) {
    var _this = this;

    _classCallCheck(this, Server);

    this._app = (0, _express2['default'])();
    this._messages = [];
    this._sockets = [];
    this._serverUp = false;
    this._appServerUp = false;
    this._port = port;
    this._connectionType = '';
    this._connections = [];

    this._appServer = _http2['default'].createServer(this._app);
    this._exposedServer = _net2['default'].createServer();

    this._wss = new _ws.Server({
      server: this._appServer,
      path: '/updates'
    });

    var staticOptions = {
      maxAge: 0
    };

    this._exposedServer.on('connection', function (socket) {
      return _this._onServerConnection(socket);
    });
    this._wss.on('connection', function (ws) {
      return _this._onWsConnection(ws);
    });

    this._app.use(compressor);
    this._app.use('/js', _express2['default']['static']('../public/js', staticOptions));
    this._app.use('/css', _express2['default']['static']('../public/css', staticOptions));
    this._app.use('/imgs', _express2['default']['static']('../public/imgs', staticOptions));
    this._app.use('/avatars', _express2['default']['static']('../public/avatars', staticOptions));
    this._app.use('/sw.js', _express2['default']['static']('../public/sw.js', staticOptions));
    this._app.use('/sw.js.map', _express2['default']['static']('../public/sw.js.map', staticOptions));
    this._app.use('/manifest.json', _express2['default']['static']('../public/manifest.json', staticOptions));

    this._app.get('/', function (req, res) {
      res.send((0, _templatesIndex2['default'])({
        scripts: '<script src="/js/main.js" defer></script>',
        content: (0, _templatesPosts2['default'])({
          content: _this._messages.map(function (item) {
            return (0, _templatesPost2['default'])(item);
          }).join('')
        })
      }));
    });

    this._app.get('/skeleton', function (req, res) {
      res.send((0, _templatesIndex2['default'])({
        scripts: '<script src="/js/main.js" defer></script>',
        content: (0, _templatesPosts2['default'])()
      }));
    });

    this._app.get('/photos/:farm-:server-:id-:secret-:type.jpg', function (req, res) {
      var flickrUrl = 'http://farm' + req.params.farm + '.staticflickr.com/' + req.params.server + '/' + req.params.id + '_' + req.params.secret + '_' + imgSizeToFlickrSuffix[req.params.type] + '.jpg';
      var flickrRequest = _http2['default'].request(flickrUrl, function (flickrRes) {
        flickrRes.pipe(res);
      });

      flickrRequest.on('error', function (err) {
        // TODO: use a real flickr image as a fallback
        res.sendFile('imgs/icon.png', {
          root: __dirname + '/../public/'
        });
      });

      flickrRequest.end();
    });

    this._app.get('/ping', function (req, res) {
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).send({ ok: true });
    });

    this._app.get('/remote', function (req, res) {
      res.send((0, _templatesRemoteExecutor2['default'])());
    });

    this._app.get('/idb-test/', function (req, res) {
      res.send((0, _templatesIdbTest2['default'])());
    });

    _generateMessage.generateReady.then(function (_) {
      // generate initial messages
      var time = new Date();

      for (var i = 0; i < maxMessages; i++) {
        var msg = (0, _generateMessage.generateMessage)();
        var timeDiff = (0, _lodashNumberRandom2['default'])(5000, 15000);
        time = new Date(time - timeDiff);
        msg.time = time.toISOString();
        _this._messages.push(msg);
      }

      _this._generateDelayedMessages();
    });
  }

  _createClass(Server, [{
    key: '_generateDelayedMessages',
    value: function _generateDelayedMessages() {
      var _this2 = this;

      setTimeout(function (_) {
        _this2._addMessage();
        _this2._generateDelayedMessages();
      }, (0, _lodashNumberRandom2['default'])(5000, 15000));
    }
  }, {
    key: '_broadcast',
    value: function _broadcast(obj) {
      var msg = JSON.stringify(obj);
      this._sockets.forEach(function (socket) {
        return socket.send(msg);
      });
    }
  }, {
    key: '_onServerConnection',
    value: function _onServerConnection(socket) {
      var _this3 = this;

      var closed = false;
      this._connections.push(socket);

      socket.on('close', function (_) {
        closed = true;
        _this3._connections.splice(_this3._connections.indexOf(socket), 1);
      });

      socket.on('error', function (err) {
        return console.log(err);
      });

      var connection = connectionProperties[this._connectionType];
      var makeConnection = function makeConnection(_) {
        if (closed) return;
        var appSocket = _net2['default'].connect(appServerPath);
        appSocket.on('error', function (err) {
          return console.log(err);
        });
        socket.pipe(new _throttle2['default'](connection.bps)).pipe(appSocket);
        appSocket.pipe(new _throttle2['default'](connection.bps)).pipe(socket);
      };

      if (connection.delay) {
        setTimeout(makeConnection, connection.delay);
        return;
      }
      makeConnection();
    }
  }, {
    key: '_onWsConnection',
    value: function _onWsConnection(socket) {
      var _this4 = this;

      var requestUrl = _url2['default'].parse(socket.upgradeReq.url, true);

      if ('no-socket' in requestUrl.query) return;

      this._sockets.push(socket);

      socket.on('close', function (_) {
        _this4._sockets.splice(_this4._sockets.indexOf(socket), 1);
      });

      var sendNow = [];

      if (requestUrl.query.since) {
        (function () {
          var sinceDate = new Date(Number(requestUrl.query.since));
          var missedMessages = findIndex(_this4._messages, function (msg) {
            return new Date(msg.time) <= sinceDate;
          });
          if (missedMessages == -1) missedMessages = _this4._messages.length;
          sendNow = _this4._messages.slice(0, missedMessages);
        })();
      } else {
        sendNow = this._messages.slice();
      }

      if (sendNow.length) {
        socket.send(JSON.stringify(sendNow));
      }
    }
  }, {
    key: '_addMessage',
    value: function _addMessage() {
      var message = (0, _generateMessage.generateMessage)();
      this._messages.unshift(message);
      this._messages.pop();
      this._broadcast([message]);
    }
  }, {
    key: '_listen',
    value: function _listen() {
      var _this5 = this;

      this._serverUp = true;
      this._exposedServer.listen(this._port, function (_) {
        console.log("Server listening at localhost:" + _this5._port);
      });

      if (!this._appServerUp) {
        if (_fs2['default'].existsSync(appServerPath)) _fs2['default'].unlinkSync(appServerPath);
        this._appServer.listen(appServerPath);
        this._appServerUp = true;
      }
    }
  }, {
    key: '_destroyConnections',
    value: function _destroyConnections() {
      this._connections.forEach(function (c) {
        return c.destroy();
      });
    }
  }, {
    key: 'setConnectionType',
    value: function setConnectionType(type) {
      if (type === this._connectionType) return;
      this._connectionType = type;
      this._destroyConnections();

      if (type === 'offline') {
        if (!this._serverUp) return;
        this._exposedServer.close();
        this._serverUp = false;
        return;
      }

      if (!this._serverUp) {
        this._listen();
      }
    }
  }]);

  return Server;
})();

exports['default'] = Server;
module.exports = exports['default'];
//# sourceMappingURL=Server.js.map
