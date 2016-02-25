'use strict';

import MessageParser from './message-parser';

const defaultOpts = {
  port: 6379
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
    opts = opts || defaultOpts;
    this.opts = opts;
    this.messageParser = new MessageParser();
  }

}
