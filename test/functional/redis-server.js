import Redis from 'ioredis';
import RedisServer from '../../index';

describe('RedisServer', () => {

  let redis, redisServer;

  describe('connect', () => {

    it('should connect to standalone', (done) => {
      redisServer = new RedisServer();
      redisServer.start().then((res) => {
        redis = new Redis();
        redis.on('connect', () => {
          redis.disconnect();
          redisServer.stop().then((res) => {
            done();
          });
        });
      }).catch((err) => {
        done(err);
      });
    });

    it('should connect via sentinel', (done) => {
      redisServer = new RedisServer();
      redisServer.start().then((res) => {
        redis = new Redis({
          sentinels: [{ host: 'localhost', port: 26379 }],
          name: 'mymaster'
        });
        redis.on('connect', () => {
          redis.disconnect();
          redisServer.stop().then((res) => {
            done();
          });
        });
      }).catch((err) => {
        done(err);
      });
    });

  });

  describe('INFO', () => {

    before((done) => {
      redisServer = new RedisServer();
      redisServer.start().then((res) => {
        redis = new Redis();
        redis.on('connect', () => {
          done();
        });
      }).catch((err) => {
        done(err);
      });
    });

    after((done) => {
      redis.disconnect();
      redisServer.stop().then((res) => {
        done();
      });
    });

    it('should get server info', (done) => {
      redis.info().then((res) => {
        should.exist(res);
        res.should.equal('# Server\r\nredis_version:3.0.0\r\n# Clients\r\n# Memory\r\n# Persistence\r\n# Stats\r\n# Replication\r\n# CPU\r\n# Cluster\r\n# Keyspace\r\ndb0:keys=1997,expires=1,avg_ttl=98633637897');
        done();
      }).catch((err) => {
        done(err);
      });
    });

  });

  describe('SELECT', () => {

    before((done) => {
      redisServer = new RedisServer();
      redisServer.start().then((res) => {
        redis = new Redis();
        redis.on('connect', () => {
          done();
        });
      }).catch((err) => {
        done(err);
      });
    });

    after((done) => {
      redis.disconnect();
      redisServer.stop().then((res) => {
        done();
      });
    });

    it('should select a new db', (done) => {
      redis.select('1').then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

  });

  describe('GET/SET', () => {

    before((done) => {
      redisServer = new RedisServer();
      redisServer.start().then((res) => {
        redis = new Redis();
        redis.on('connect', () => {
          done();
        });
      }).catch((err) => {
        done(err);
      });
    });

    after((done) => {
      redis.disconnect();
      redisServer.stop().then((res) => {
        done();
      });
    });

    it('should fail to get non-existent key', (done) => {
      redis.get('nonexistent').then((res) => {
        should.not.exist(res);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should set with no expiration', (done) => {
      redis.set('noexp', 'noexp').then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should get key with no expiration', (done) => {
      redis.get('noexp').then((res) => {
        should.exist(res);
        res.should.equal('noexp');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should set key with expiration in ms', (done) => {
      redis.set('expinms', 'expinms', 'PX', 1).then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should set key with expiration in seconds', (done) => {
      redis.set('expinsecs', 'expinsecs', 'EX', 600).then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should get non expired key set with secs', (done) => {
      redis.get('expinsecs').then((res) => {
        should.exist(res);
        res.should.equal('expinsecs');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should fail to get expired key set with ms', (done) => {
      setTimeout(() => {
        redis.get('expinms').then((res) => {
          should.not.exist(res);
          done();
        }).catch((err) => {
          done(err);
        });
      }, 10);
    });

    it('should set with not exists', (done) => {
      redis.set('notexists', 'notexists', 'NX').then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should fail to set with not exists', (done) => {
      redis.set('notexists', 'notexists', 'NX').then((res) => {
        should.not.exist(res);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should set with exists', (done) => {
      redis.set('notexists', 'notexists', 'XX').then((res) => {
        should.exist(res);
        res.should.equal('OK');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should fail to set with exists', (done) => {
      redis.set('exists', 'exists', 'XX').then((res) => {
        should.not.exist(res);
        done();
      }).catch((err) => {
        done(err);
      });
    });

  });

});
