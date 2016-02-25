'use strict';

import RedisServer from '../../src/redis-server';

require('../common');

describe('RedisServer', () => {

  let redisServer;

  beforeEach(() => {
    redisServer = new RedisServer();
  });

  describe('#constructor()', () => {

    it('should construct new instance with default opts', () => {
      let instance = new RedisServer();
      instance.opts.port.should.equal(6379);
    });

    it('should construct new instance with specific opts', () => {
      let instance = new RedisServer({port:666});
      instance.opts.port.should.equal(666);
    });

  });

});
