'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _Settings = require('./Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var argv = (0, _minimist2['default'])(process.argv, {
  'default': {
    'config-server-port': 8889,
    'server-port': 8888
  }
});
var server = new _Server2['default'](argv['server-port']);
var settings = new _Settings2['default'](argv['config-server-port'], argv['server-port']);

settings.listen();
server.setConnectionType('perfect');

settings.on('connectionChange', function (_ref) {
  var type = _ref.type;

  server.setConnectionType(type);
});
//# sourceMappingURL=index.js.map
