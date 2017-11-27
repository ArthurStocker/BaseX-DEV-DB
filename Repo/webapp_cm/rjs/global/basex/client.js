/**
 * @fileOverview Provides access to the BaseX Server.
addToClasspath('../webapp_BaseX853/BaseX853/WEB-INF/lib/basex-8.5.3.jar');
var { BaseXServer } = org.basex;
 */

export ('require');

// var {main} = org.template.core.main;
var { ClientSession } = org.basex.api.client;


/**
 * The module version string with the major and minor version number.
 */
var Version = '0.0.1';


/**
 * default values
 */
// TODO: Fix - read BaseXClient defaults from config file
var defaults = {
    file: '',
    name: 'BaseXClient',
    host: 'localhost',
    port: 1984,
    user: 'admin',
    password: 'admin'
}


/**
 * Build the QueryString to load sjs JavaScript Code from DB.
 * @see -
 * @param resource
 * @since 0.0.1
 * @returns string
 */
function require(resource) {
    //var pool = new BaseXPool();


    for (arg in arguments) {
        console.log('>>>> ' + arg);
    }

    return 'export("test"); console.log(">> from client.js"); function test() { console.log(">> from {test} in client.js - ' + resource + '"); return ">> return from {test} in client.js"}';
}

/**
 * Create a BaseX Client
 * @see -
 * @param {}
 * @since 0.0.1
 * @returns (object) BaseXPool
 */
function BaseXPool() {
    var self = this;
    var _pool = {};

    //TODO: validate and set options (save clientID, create session with options) at the end of the constructor.

    /**
     * Add a client to the pool.
     * @see -
     * @param {object} options
     * @since 0.0.1
     * @returns -
     */
    Object.defineProperty(this, 'add', {
        set: function(options) {
            if (options && options.id && !_pool) {
                _pool[options.id] = new BaseXClient(options);
            }
        },
        enumerable: true
    });

    /**
     * Remove a client from the pool.
     * @see -
     * @param {string} id
     * @since 0.0.1
     * @returns -
     */
    Object.defineProperty(this, 'remove', {
        set: function(id) {
            if (id && _pool && _pool[id]) {
                delete _pool[id];
            }
        },
        enumerable: true
    });

    /**
     * Get an array of the client id's in the pool.
     * @see -
     * @param -
     * @since 0.0.1
     * @returns {array} id
     */
    Object.defineProperty(this, 'getIDs', {
        get: function() {
            return Object.keys(_pool);
        },
        enumerable: true
    });
}

/**
 * Create a BaseX Client
 * @see -
 * @param {options}
 * @since 0.0.1
 * @returns {object} BaseXClient
 */
function BaseXClient(options) {
    var self = this;
    var _session;

    //TODO: validate and set options (save clientID, create session with options) at the end of the constructor.

    /**
     * Open the client's session. The ClientSession is the session
     * object which is created when a connection to the Server is opened.
     * @see #ClientSession
     * @param {object} options
     * @since 0.0.1
     * @returns {object} ClientSession
     */
    Object.defineProperty(this, 'session', {
        get: function() {
            if (!_session) {
                _session = new BaseXClientSession();
            }
            return _session;
        },
        set: function(options) {
            if (_session) {
                _session.close();
            }
            if (typeof options.host === 'string' && typeof options.port === 'number' && typeof options.user === 'string' && typeof options.password === 'string') {
                _session = new BaseXClientSession(options);
            }
        },
        enumerable: true
    });

    /**
     * Execute the Query term
     * @see -
     * @param -
     * @since 0.0.1
     * @returns {object} result
     */
    this.query = function(options) {
        // local variables
        var result = {};

        // validate arguments
        if (typeof options === 'object' && typeof options.xquery === 'string' && Object.prototype.toString.call(options.variables) === '[object Array]' && options.variables.length != 0) {
            options.variables.forEach(function(item, index) {
                if (Object.prototype.toString.call(item) === '[object Array]' && item.length == 2) {
                    item.forEach(function(item, index) {
                        if (index == 0 && !(typeof item === 'string')) {
                            var msg = 'variable name must be of type String';
                            result.error = msg;
                            //BRjx.warn('BaseXClient.query() %s', msg);
                        }
                        if (index == 0 && !((typeof item === 'string') || (typeof item === 'number') || (typeof item === 'boolean'))) {
                            var msg = 'variable value must be of type String, Number or Boolean';
                            result.error = msg;
                            //BRjx.warn('BaseXClient.query() %s', msg);
                        }
                    });
                } else {
                    var msg = 'variables must be passed in an Array, [["var1","value1"](,["var2","value2"])]';
                    result.error = msg;
                    //BRjx.warn('BaseXClient.query() %s', msg);
                }
            });
        } else {
            var msg = 'xquery must be of type String and variables must be passed in an Array, [["var1","value1"](,["var2","value2"])]';
            result.error = msg;
            //BRjx.warn('BaseXClient.query() %s', msg);
        }

        // run garbage collector first
        gc();

        // open session
        if (!result.error && !self.session.error) {
            try {
                // create query
                //BRjx.objdump('XQUERY: ', options.xquery);
                var query = self.session.query(options.xquery);
                options.variables.forEach(function(item, index) {
                    query.bind(item[0], item[1]);
                });
                result.records = JSON.parse(query.execute());
            } catch (error) {
                result.error = error;
                //BRjx.error('BaseXClient.query() %s', error);
            }
            self.session.close();
        } else {
            if (!result.error) result.error = self.session.error;
            //BRjx.error('BaseXClient.query() %s', result.error);
        }

        //BRjx.objdump('RESULT: ', result);
        return result;
    }
}

/**
 * Create a BaseX ClientSession
 * @see -
 * @param {object} options: host, port, user, password
 * @since 0.0.1
 * @returns {object} session
 */
function BaseXClientSession(options) {
    var session;
    if (!options) options = {};

    try {
        session = new ClientSession(options.host || defaults.host,
            options.port || defaults.port,
            options.user || defaults.user,
            options.password || defaults.password
        );
    } catch (error) {
        session = {}; //new BRjx.result();
        session.error = error;
        //BRjx.error('BaseXClientSession() %s', error);
    }
    return session;
}

/*
h = new BaseXServer('-c INFO');
s = new BaseXClientSession();
c = new BaseXClient({host:'localhost',port:1984,user:'admin',password:'admin'});
r = new JavaAdapter(org.ringojs.repository.BaseXRepository, {getName:function(){return 'BaseXRepository';}}, 'json:serialize(element json {attribute type {"object"}, db:open("BRjx_main")/*[id="0d6ef920-7ded-4832-b6ae-e12b9c64c73e"]/*})', c);

s.execute('INFO');
s.execute('SET DBPATH (/Users/arthur/Library/Application Support/BaseX/Data)');
s.execute('SET REPOPATH (/Users/arthur/Library/Application Support/BaseX/Repo)');

*/