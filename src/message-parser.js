'use strict';

/**
 * Message parser.
 */
export default class MessageParser {

  /**
   * Constructor.
   * @constructor
   */
  constructor() {
  }

  /**
   * Parse a buffer.
   * @param {Buffer} data - The buffer.
   */
  parse(data) {
    if (!data) {
      return null;
    }

    // Must be a buffer
    if (!Buffer.isBuffer(data)) {
      return null;
    }

    // No point trying if length is less than 3
    if (data.length < 3) {
      return null;
    }

    // Make sure message ends wit \r\n
    if (data[data.length - 1] != 10 || data[data.length - 2] != 13) {
      return null;
    }

    // Determine message type
    let res = this._determineTypeAndParse(data);
    console.log(res);

    return res;
  }

  /**
   * Determine message type.
   */
  _determineTypeAndParse(data) {
    let res = null;
    let c = String.fromCharCode(data[0]);
    switch (c) {
      case MessageParser.SIMPLE_STRING: {
        res = this._parseSimpleString(data);
        break;
      }
      case MessageParser.BULK_STRING: {
        res = this._parseBulkString(data);
        break;
      }
      case MessageParser.ARRAY: {
        res = this._parseArray(data);
        break;
      }
      default: {
        break;
      }
    }
    return res;
  }

  /**
   * Parse a simple string.
   */
  _parseSimpleString(data) {
    let string = data.slice(1, data.length - 2).toString();
    return {
      type: MessageParser.SIMPLE_STRING,
      value: string
    };
  }

  /**
   * Parse a bulk string.
   */
  _parseBulkString(data) {
    let lines = data.toString().split('\r\n');
    // Line 1 is the length of the string
    console.log(lines);
  }

  /**
   * Parse an array.
   */
  _parseArray(data) {
    let lines = data.toString().split('\r\n');
    console.log(lines);
    // Line 1 is the number of elements in the array
    let numElements = lines[0].substring(1);
    console.log('Num elements:', numElements);
    //let numElements = data.slice(1, data.length - 2).toString();
    //console.log(numElements);
    return {
      type: MessageParser.ARRAY,
      value: [
      ]
    };
  }

  static get SIMPLE_STRING() {
    return '+';
  }

  static get BULK_STRING() {
    return '$';
  }

  static get ARRAY() {
    return '*';
  }

}
