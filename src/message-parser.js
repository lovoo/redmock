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
    let len = parseInt(lines[0].substring(1));
    if (len != lines[1].length) {
      return null;
    }
    return {
      type: MessageParser.BULK_STRING,
      value: lines[1],
      length: len
    };
  }

  /**
   * Parse an array. Damn ugly.
   */
  _parseArray(data) {
    let elementsProcessed = 0;
    let unknownType = false;
    let dataString = data.toString();
    let firstLine = dataString.split('\r\n', 1);
    let numElements = parseInt(firstLine[0].substring(1));

    let startOfElements = data.toString().indexOf('\r\n') + 2;
    dataString = dataString.substring(startOfElements);

    let res = {
      type: MessageParser.ARRAY,
      length: numElements,
      value: [
      ]
    };

    while (elementsProcessed < numElements && unknownType === false) {
      switch(dataString[0]) {
        case MessageParser.BULK_STRING: {
          let idx = this._getPosition(dataString, '\r\n', 2);
          let msg = this._parseBulkString(dataString.substring(0, idx + 2));
          dataString = dataString.substring(idx + 2);
          elementsProcessed += 1;
          res.value.push(msg);
          break;
        }
        default: {
          unknownType = true;
          res = null;
          break;
        }
      }
    }

    return res;
  }

  _getPosition(str, m, i) {
    return str.split(m, i).join(m).length;
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
