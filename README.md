# RedMock

[![Build Status](https://travis-ci.org/smokerbag/redmock.svg?branch=master)](https://travis-ci.org/smokerbag/redmock)
[![Coverage Status](https://coveralls.io/repos/github/smokerbag/redmock/badge.svg?branch=master)](https://coveralls.io/github/smokerbag/redmock?branch=master)
[![Dependency Status](https://david-dm.org/smokerbag/redmock.svg)](https://david-dm.org/smokerbag/redmock)

Mock [Redis](http://redis.io) server for [Node](https://nodejs.org) unit tests.

Requires Node version 5.7.0 or higher for the newest language features.

# Purpose

I created this project to help unit test an application that I was writing that used Redis for caching. I didn't want to stub out my client library code since I felt that would not be reliable enough, 
and I didn't want to get to functional/integration tests and find that my code was broken. I wanted to support sentinel and clustering, and couldn't find something that I felt would work, so I wrote this POS.

# Usage

## Starting the server

Call the start method after creating a new instance of the RedisServer class. This method returns an ES6 promise.

```javascript
const RedisServer = require('redmock');

let redisServer = new RedisServer();

redisServer.start().then((res) => {
  // Server is now up
}).catch((err) => {
  // Deal with error
});

```

## Stopping the server

Call the stop method. This method returns an ES6 promise. You do not have to worry about catching errors from this method.

```javascript

redisServer.stop().then((res) => {
  // Server is now stopped
});

```

## Example test

```javascript
// require/import needed crap

describe('SomeTestSpec', () => {
  
  let redisServer, underTest;

  // Start the server
  before((done) => {
    redisServer = new RedisServer();
    redisServer.start().then((res) => {
      done();
    }).catch((err) => {
      done(err);
    });
  });

  // Stop the server
  after((done) => {
    redisServer.stop().then((res) => {
      done();
    });
  });

  describe('#somemethod()', () => {

    beforeEach(() => {
      underTest = new UnderTest();
    });

    it('should test it', () => {
      return underTest.somemethod().should.eventually.equal(true);
    });

  });

});

```