/**
 * @fileOverview Provides the Database Extension.
 * @author Arthur Stocker
 * @version 0.0.1
 */

export( 'ServletStorage');

// var {main} = org.template.core.main;


/**
 * The module version string with the major and minor version number.
 */
var Version = '0.0.1';


/**
 * Create a Storage
 * @class ServletStorage
 *
 * @property {object} connectors - The connectors hash storesd in the local var _client.
 *
 * @see - 
 * @since 0.0.1
 * @param -
 * @returns -
 */
function ServletStorage() {
  var _client = {};

  /**
   * Create a Connector to access JavaScript Source.
   * @param {object} extensions - extensions.id is the extension used by require.extensions and extensions.client is the path to the resource used by require() 
   */
  Object.defineProperty(this, 'connectors', {
    get: function() {
      return _client;
    },
    set: function(extensions) {
      var result = true;
      if (Object.prototype.toString.call(extensions) !== '[object Array]') {
        extensions = [extensions];
      }
      extensions.forEach(function(extension, index, array) {
        if (typeof extension === 'object' && typeof extension.id === 'string' && typeof extension.client === 'string') {
          _client[extension.id] = require(extension.client);
          if (_client[extension.id] && typeof _client[extension.id].require === 'function') {
            require.extensions['.'+extension.id] = _client[extension.id].require;
          }
        }
      });
    },
    enumerable: true
  });
}
