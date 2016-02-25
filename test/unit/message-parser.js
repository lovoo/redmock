'use strict';

import MessageParser from '../../src/message-parser.js';

require('../common');

describe('MessageParser', () => {

  let messageParser;

  beforeEach(() => {
    messageParser = new MessageParser();
  });

  describe('#parse()', () => {

    it('should fail due to null input', () => {
      should.not.exist(messageParser.parse());
      should.not.exist(messageParser.parse(null));
      should.not.exist(messageParser.parse(undefined));
    });

    it('should fail due to invalid input', () => {
      should.not.exist(messageParser.parse('bad'));
      should.not.exist(messageParser.parse(123));
      should.not.exist(messageParser.parse({}));
      should.not.exist(messageParser.parse(true));
    });

    it('should fail due to invalid length', () => {
      should.not.exist(messageParser.parse(new Buffer([0x00, 0x00])));
    });

    it('should fail due to invalid end of message', () => {
      should.not.exist(messageParser.parse(new Buffer('000')));
      should.not.exist(messageParser.parse(new Buffer('0\r0')));
      should.not.exist(messageParser.parse(new Buffer('00\n')));
    });

    it('should fail due to invalid type', () => {
      let data = new Buffer('#\r\n');
      should.not.exist(messageParser.parse(data));
    });

    it('should parse simple string', () => {
      let data = new Buffer('+OK\r\n');
      let msg = messageParser.parse(data);
      should.exist(msg);
      msg.type.should.equal('+');
      msg.value.should.equal('OK');
    });

  });

});
