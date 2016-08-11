'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageParser = require('./message-parser');

var _messageParser2 = _interopRequireDefault(_messageParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('redmock:sentinel-command-parser');

/**
 * Process sentinel commands.
 */
class SentinelCommandProcessor {

  /**
   * Constructor.
   * @constructor
   */
  constructor(redisPort) {
    this.redisPort = redisPort;
    this.messageParser = new _messageParser2.default();
  }

  /**
   * Process a command.
   */
  process(msg, socket) {
    let commandType = this._getCommandType(msg);
    debug('Process sentinel command type of ' + commandType + ' from ' + socket.remoteAddress + ':' + socket.remotePort);
    switch (commandType) {
      case SentinelCommandProcessor.GET_MASTER_ADDR_BY_NAME:
        {
          this._processGetMasterAddrByName(msg, socket);
          break;
        }
      default:
        {
          this._processUnknownCommand(socket);
          break;
        }
    }
  }

  /**
   * Send message to client.
   */
  _sendMessage(msg, socket) {
    let respString = this.messageParser.toString(msg);
    debug('Sentinel send response of\n' + respString + '\nto ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.write(respString);
  }

  /**
   * Process unknown command.
   */
  _processUnknownCommand(socket) {
    let respMsg = {
      type: '-',
      value: 'ERR unknown command'
    };
    socket.write(this.messageParser.toString(respMsg));
  }

  /**
   * Process get master address by name.
   */
  _processGetMasterAddrByName(msg, socket) {
    let respMsg = {
      type: '*',
      length: 2,
      value: [{
        type: '$',
        length: 9,
        value: '127.0.0.1'
      }, {
        type: '$',
        length: 4,
        value: '6379'
      }]
    };
    this._sendMessage(respMsg, socket);
  }

  /**
   * Get command type.
   */
  _getCommandType(msg) {
    let commandType = null;
    // get-master-addr-by-name
    if (msg.type == '*' && msg.length == 3 && msg.value[0].type == '$' && msg.value[0].value == 'sentinel' && msg.value[1].type == '$' && msg.value[1].value == SentinelCommandProcessor.GET_MASTER_ADDR_BY_NAME) {
      commandType = SentinelCommandProcessor.GET_MASTER_ADDR_BY_NAME;
    }

    return commandType;
  }

  static get GET_MASTER_ADDR_BY_NAME() {
    return 'get-master-addr-by-name';
  }

}
exports.default = SentinelCommandProcessor;