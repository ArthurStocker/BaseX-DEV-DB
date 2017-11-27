/**
 * @fileOverview Provides the Template.
 */

export( 'ServletConsole');

// var {main} = org.template.core.main;
var {traceHelper, assertHelper} = org.ringojs.util.ScriptUtils;
var {TermWriter, BOLD, ONRED, ONYELLOW, RESET} = require("ringo/term");


/**
 * The module version string with the major and minor version number.
 */
var Version = '0.0.1';

var timers = {};
var writer = new TermWriter(require('system').stdout);
var errWriter = new TermWriter(require('system').stderr);


/**
 * Get padded string representation of toPad.
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns padded string
 */
function pad(toPad, padding, paddedWith) {
  return padding < 1 ? '' : Array((padding + 1) - toPad.toString().length).join(paddedWith.toString() || ' ') + toPad.toString();
}

/**
 * Get Date/Time to prefix log entries.
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns formated date/time
 */
function stamp() {
  var stamp = new Date();
  var y = stamp.getFullYear();
  var m = pad(stamp.getMonth()+1, 2, 0);
  var d = pad(stamp.getDate(), 2, 0);
  var H = pad(stamp.getHours(), 2, 0);
  var M = pad(stamp.getMinutes(), 2, 0);
  var S = pad(stamp.getSeconds(), 2, 0);
  var n = pad(stamp.getMilliseconds(), 3, 0);
  return y + "-" + m + "-" + d + " " + H + ":" + M + ":" + S + "." + n + ":";
}

/**
 * Format message.
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns formated message
 */
function format() {
  var msg = arguments[0] ? String(arguments[0]) : "";
  var pattern = /%[sdifo]/;
  for (var i = 1; i < arguments.length; i++) {
    msg = pattern.test(msg)
      ? msg.replace(pattern, String(arguments[i]))
      : msg + arguments[i];
  }
  return msg;
}

/**
 * Filter for the _boffer array.
 * The Message is stored in the _buffer array;
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns filterd by stdXXX
 */
function filter(std, name, message) {
  if (name) {
    return std.filter(function(item) {
      return (item.std == name);
    });
  } else { 
    return std;
  }
}

/**
 * arguments toArray.
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns {array} args
 */
function toArray() {
  var args = new Array(arguments.length);

  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }
  return args;
}



/**
 * Define ServletConsole
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns ServletConsole
 */
function ServletConsole() {
  var self = this;
  var _handle;
  var _buffer;

  var _debugLevels = ['error', 'warn', 'info'];
  var _debugLevel = 'info';
  var _isDebug = false;


  /**
   * Flush the console buffer.
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns true when flushed
   */
  Object.defineProperty(this, 'flush', {
    get: function() {
      return false;
    },
    set: function(value) {
      if (value == 'all') {
        _buffer.length = 0;
      } else {
        _buffer = _buffer.filter(function(item) {
          return (item.vc != value);
        });
      }
      return true;
    },
    enumerable: true
  });

  /**
   * Get the console handle.
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns handle
   */
  Object.defineProperty(this, 'handle', {
    get: function() {
      if (!_handle) {
        _handle = Date.now();
      }
      return _handle;
    },
    enumerable: true
  });

  /**
   * Get the console buffer.
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns buffer
   */
  Object.defineProperty(this, 'buffer', {
    get: function() {
      if (!_buffer) {
        _buffer = new Array()
      }
      return _buffer;
    },
    enumerable: true
  });

  /**
   * Set DebugLevel [error, warn, info]. Get DebugLevel.
   * The DebugLevel is stored in debugLevel (default info);
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns 'error' || 'warn' || 'info'
   */
  Object.defineProperty(this, 'setDebug', {
    get: function() {
      return _debugLevel;
    },
    set: function(level) {
      _debugLevel = _debugLevels.indexOf(value) ? level : debugLevel;
      return _debugLevel;
    },
    enumerable: true
  }); 

  /**
   * Set Debug ON/OFF. Get DebugState.
   * The DebugState is stored in isDebug (default false);
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns true || false
   */
  Object.defineProperty(this, 'isDebug', {
    get: function() {
      return _isDebug;
    },
    set: function(state) {
      _isDebug = (!(!state));
      return _isDebug;
    },
    enumerable: true
  });

  /**
   * Get STDOUT/STDERR from buffer.
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns -
   */
  this.show =
    function(vc, handle, toJSON, asARRAY) {
    // create html code from dump - std.push({std: name, text: JSON.stringify(message, null, 2)});
      var filtered = [];

      filtered = self.buffer.filter(function(item){
        return (item.vc == vc);
      });

      switch (handle) {
        case 1:
        case 'stdout':
          filtered = filter(filtered, 'out');
          break;
        case 2:
        case 'stderr':
          filtered = filter(filtered, 'err');
          break;
        default:
          filtered = self.buffer;
      }
      if (toJSON) {
        return filtered.map(function(item) {
            if (asARRAY && item) { 
              return JSON.stringify(item, null, 2);
            }
            if (!item) item = {};
            return JSON.stringify(item.text ? item.text : '', null, 2);
          });
      }
      return filtered || [];
    }

  /**
   * Print to dir.
   * The Message is stored in the buffer array;
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns -
   */
  this.print =
    function(info, obj) {
      if (self.isDebug) {
        console.info(info);
        console.dir(obj);
        // TODO: implement dump to buffer ....
        /*
        var replacementrules = BRjxDB.query(_options.App.ReplacementRules, [['$dbname', _options.App.ConfigDBName]]);
        return filter(self.buffer, 'err', format.apply(null, arguments)).map(function(item) {
          return (function(string, rules) {
            var result = string;
            rules.map(function(item) {
              result=result.replace(new RegExp(item[0], 'g'), item[1]);
            });
            return result;
          })(item, replacementrules.gsDumpRules)
        });
        */
      }
    }

  /**
   * Print to STDERR.
   * The Message is stored in the buffer array;
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns -
   */
  this.error =
    traceHelper.bind(null, function() {
      if (self.isDebug && (_debugLevels.indexOf(self.setDebug)+1) >= 1) {
        var msg = format.apply(null, arguments);
        var location = format("%s:%d:", this.sourceName(), this.lineNumber());
        errWriter.writeln(stamp() + ONRED + BOLD + "FAIL" + RESET + ":" + location, BOLD, msg, RESET);
        self.buffer.push({vc: '',std: 'err', text: stamp() + "FAIL:" + location + " " + msg});
      }
    }),

  /**
   * Print to STDERR.
   * The Message is stored in the buffer array;
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns -
   */
  this.warn =
    traceHelper.bind(null, function() {
      if (self.isDebug && (_debugLevels.indexOf(self.setDebug)+1) >= 2) {
        var msg = format.apply(null, arguments);
        var location = format("%s:%d:", this.sourceName(), this.lineNumber());
        errWriter.writeln(stamp() + ONYELLOW + BOLD + "WARN" + RESET + ":" + location, BOLD, msg, RESET);
        self.buffer.push({vc: '',std: 'err', text: stamp() + "WARN:" + location + " " + msg});
      }
    }),

  /**
   * Print to STDOUT.
   * The Message is stored in the buffer array;
   * @see -
   * @param {}
   * @since 0.0.1
   * @returns -
   */
  this.info = 
    traceHelper.bind(null, function() {
      if (self.isDebug && (_debugLevels.indexOf(self.setDebug)+1) >= 3) {
        var args = toArray.apply(null, arguments);
        var vc = args.shift();
        var msg = format.apply(null, args);
        var location = format("%s:%d:", this.sourceName(), this.lineNumber());
        writer.writeln(stamp() + "INFO:" + location, BOLD, msg, RESET);
        self.buffer.push({vc: vc,std: 'out', text: stamp() + "INFO:" + location + " " + msg});
      }
    });
}
