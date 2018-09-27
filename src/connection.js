import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import WebSocket from 'ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import fetch from 'node-fetch';

import Logger from './utils/logger';
import config from './config';

class Connection {
  constructor(cameraId) {
    const httpLink = createHttpLink({ uri: `${config.uri}/graphql`, fetch });

    const wsLink = new SubscriptionClient(
      `${config.uri.replace('http', 'ws')}/subscriptions`,
      {
        reconnect: true,
        timeout: 30000,
        connectionCallback: (err) => {
          if (err) {
            Logger.error('Could not connect to RTS Server');
          } else {
            Logger.warn(`Camera #${cameraId} is now connected to WaWy RTS Server`);
          }
        },
        connectionParams: {
          serial: cameraId,
        },
      },
      WebSocket,
    );

    this.link = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' &&
          operation === 'subscription';
      },
      wsLink,
      httpLink,
    );
  }

  client() {
    return new ApolloClient({
      link: this.link,
      cache: new InMemoryCache(),
      connectToDevTools: true,
      onError: (e) => {
        Logger.error(e.graphQLErrors);
      },
    });
  }
}

module.exports = Connection;
