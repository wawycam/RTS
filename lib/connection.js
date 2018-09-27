'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _apolloClient = require('apollo-client');

var _apolloCacheInmemory = require('apollo-cache-inmemory');

var _apolloLinkHttp = require('apollo-link-http');

var _apolloLink = require('apollo-link');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _subscriptionsTransportWs = require('subscriptions-transport-ws');

var _apolloUtilities = require('apollo-utilities');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Connection = function () {
  function Connection(cameraId) {
    (0, _classCallCheck3.default)(this, Connection);

    var httpLink = (0, _apolloLinkHttp.createHttpLink)({ uri: _config2.default.uri + '/graphql', fetch: _nodeFetch2.default });

    var wsLink = new _subscriptionsTransportWs.SubscriptionClient(_config2.default.uri.replace('http', 'ws') + '/subscriptions', {
      reconnect: true,
      timeout: 30000,
      connectionCallback: function connectionCallback(err) {
        if (err) {
          _logger2.default.error('Could not connect to RTS Server');
        } else {
          _logger2.default.warn('Camera #' + cameraId + ' is now connected to WaWy RTS Server');
        }
      },
      connectionParams: {
        serial: cameraId
      }
    }, _ws2.default);

    this.link = (0, _apolloLink.split)(function (_ref) {
      var query = _ref.query;

      var _getMainDefinition = (0, _apolloUtilities.getMainDefinition)(query),
          kind = _getMainDefinition.kind,
          operation = _getMainDefinition.operation;

      return kind === 'OperationDefinition' && operation === 'subscription';
    }, wsLink, httpLink);
  }

  (0, _createClass3.default)(Connection, [{
    key: 'client',
    value: function client() {
      return new _apolloClient.ApolloClient({
        link: this.link,
        cache: new _apolloCacheInmemory.InMemoryCache(),
        connectToDevTools: true,
        onError: function onError(e) {
          _logger2.default.error(e.graphQLErrors);
        }
      });
    }
  }]);
  return Connection;
}();

module.exports = Connection;