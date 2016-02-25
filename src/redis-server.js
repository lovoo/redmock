'use strict';

import net from 'net';
import MessageParser from './message-parser';

const defaultOpts = {
  port: 6379,
  sentinelPort: 26379
};

/**
 * Implement a mock Redis server for unit testing.
 */
export default class RedisServer {

  /**
   * Constructor.
   * @constructor
   */
  constructor(opts) {
    opts = opts || {
      port: 6379,
      sentinelPort: 26379
    };
    this.opts = opts;
    this.messageParser = new MessageParser();
  }

  /**
   * Start the server and begin listening.
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server = net.createServer(this.handleNewConnection);

      // Handle an error from listen
      this.server.once('error', (err) => {
        this.server.removeAllListeners('error');
        reject(err);
      });

      // We are listening
      this.server.once('listening', () => {
        this.server.removeAllListeners('error');

        // Now let's start a sentinel server
        //this.sentinelServer = net.createServer(this.handleSentinelConnection.bind(this));
        this.sentinelServer = net.createServer(null);

        // Handle an error from listen
        this.sentinelServer.once('error', (err) => {
          this.sentinelServer.removeAllListeners('error');
          reject(err);
        });

        // We are listening
        this.sentinelServer.once('listening', () => {
          this.sentinelServer.removeAllListeners('error');
          resolve(true);
        });

        this.sentinelServer.listen(this.opts.sentinelPort);
      });

      this.server.listen(this.opts.port);
    });
  }

  /**
   * Stop the server.
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (this.sentinelServer) {
            this.sentinelServer.close((err) => {
              resolve(true);
            });
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

}
