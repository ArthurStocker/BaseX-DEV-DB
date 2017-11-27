/**
 * @fileOverview Provides the Server Application.
 * @author Arthur Stocker
 * @version 0.0.1
 */

export( 'init');

// var {main} = org.template.core.main;
var jsengine = require('ringo/engine');
var response = require('ringo/jsgi/response');

var {ServletConsole} = require('./global/ServletConsole.js');
var {ServletStorage} = require('./global/ServletStorage.js');
var {ServletSession} = require('./global/ServletSession.js');


/**
 * The module version string with the major and minor version number.
 */
var Version = '0.0.1';


/**
 * This function stores the root path in a global property.
 * @see -
 * @since 0.0.1
 * @param -
 * @returns -
 */
module.singleton("root", function() {
  var _root;

  /**
   * The root path for all instances of this application.
   * @see module.directory 
   * @name root
   */
  Object.defineProperty(global, "root", {
    get: function() {
      if (!_root)
        _root = module.directory;
      return _root;
    },
    enumerable: true
  });
});

/**
 * This function provides support to access virtual console.
 * @see -
 * @since 0.0.1
 * @param -
 * @returns -
 */
module.singleton("vconsole", function(_vconsole) {
  var _vconsole;

  if (typeof ServletConsole === 'function') {

    /**
     * A virtual console object for all instances of this module. If no vconsole exists
     * a new one will be created.
     * @see ServletConsole
     * @name vconsole
     */
    Object.defineProperty(global, "vconsole", {
      get: function() {
        if (!_vconsole)
          _vconsole = new ServletConsole();
        return _vconsole;
      },
      enumerable: true
    });
  }
});

/**
 * This function provides support to access storages based on file extention.
 * @see -
 * @since 0.0.1
 * @param -
 * @returns -
 */
module.singleton("storage", function(_storage) {
  var _storage;

  if (typeof ServletStorage === 'function') {

    /**
     * A storage object for all instances of thie module. If no storage exists
     * a new one will be created.
     * @see ServletStorage
     * @name storage
     */
    Object.defineProperty(global, "storage", {
      get: function() {
        if (!_storage)
          _storage = new ServletStorage();
        return _storage;
      },
      enumerable: true
    });
  }
});


/**
 * This function provides support for anonymous user sessions.
 * @see -
 * @since 0.0.1
 * @param {request} request - The request Object.
 * @returns -
 */
function openSession(request) {
  if (typeof ServletSession === 'function') {
    var _session;

    /**
     * A session object for the current request. If no session exists
     * a new one will be created.
     * @see ServletSession
     * @name request.session
     */
    Object.defineProperty(request, "session", {
      get: function() {
        if (!_session)
          _session = new ServletSession(request);
        return _session;
      },
      enumerable: true
    });
  }
}


/**
 * Minimalistic request dispatcher in lieu of a proper framework
 * @see -
 * @since 0.0.1
 * @param {request} request - A JSGI or servlet request object.
 * @returns -
 */
function init(request) {
  //jsengine
  //addToClasspath("/Users/arthur/Downloads/Projects/WEB/_BUILD/Documentation/APPDEVData/webapp_BaseX844/BaseX844/WEB-INF/lib/basex-8.4.4.jar");
  jsengine.addRepository(request.env.servletRequest.getPathTranslated().replace(request.env.servletRequest.getPathInfo(),'')+jsengine.getRingoHome().getPath()+'lib');


console.dir(root);


  openSession(request);



  vconsole.isDebug = true;
  vconsole.info('a', '>> from {init} in main.js - TEST A');
console.dir(vconsole.show('a',1));
  vconsole.info('b', '>> from {init} in main.js - TEST B');
  vconsole.flush = 'a';
console.dir(vconsole.show('a',1));
console.dir(vconsole.show('b',1));


  storage.connectors = [{id: 'sjs', client: './basex/client'}];
console.log('>> from {init} in main.js');
  require('./global/scripts/TEST.sjs').test();
//  storage.require('./global/scripts/TEST.sjs');


console.dir(request);


  // return 200 and content
  return  {
            status: 200,
            headers: {"Content-Type": "text/html; charset=utf-8"},
            body: ['<h1>DONE</h1>']
          };
}


/**
 * main script to start application
 */
if (require.main === module) {
  require('ringo/httpserver').main(module.id);
}
