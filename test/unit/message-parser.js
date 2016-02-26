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

    it('should fail to parse bulk string due to invalid length', () => {
      let data = new Buffer('$20\r\nbulkstring\r\n');
      let msg = messageParser.parse(data);
      should.not.exist(msg);
    });

    it('should parse bulk string', () => {
      let data = new Buffer('$10\r\nbulkstring\r\n');
      let msg = messageParser.parse(data);
      should.exist(msg);
      msg.type.should.equal('$');
      msg.length.should.equal(10);
      msg.value.should.equal('bulkstring');
    });

    it('should fail to parse array due to uknown type', () => {
      let data = new Buffer('*3\r\n$8\r\nsentinel\r\n$23\r\nget-master-addr-by-name\r\n^8\r\nmymaster\r\n');
      let msg = messageParser.parse(data);
      should.not.exist(msg);
    });

    it('should parse array', () => {
      let data = new Buffer('*3\r\n$8\r\nsentinel\r\n$23\r\nget-master-addr-by-name\r\n$8\r\nmymaster\r\n');
      let msg = messageParser.parse(data);
      should.exist(msg);
      msg.type.should.equal('*');
      msg.length.should.equal(3);
      msg.value.length.should.equal(3);
      msg.value[0].type.should.equal('$');
      msg.value[0].length.should.equal(8);
      msg.value[0].value.should.equal('sentinel');
    });

  });

});
