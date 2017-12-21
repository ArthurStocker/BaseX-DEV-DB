/**
 * @fileOverview Provides the Session Object.
 * @author Arthur Stocker
 * @version 0.0.1
 */
//addToClasspath('../xyz/abc.jar'); 

/**
 * export ( ... )
 * 
 * eslint-disable 
 */
export (
    'ServletSession'
);
/* eslint-enable */


/**
 * const ...
 */
const log = require("ringo/logging").getLogger(module.id);


/**
 * var ...
 */
// var { classABC } = org.XYZ;
var Args = require('Args');


/**
 * The module version string with the major and minor version number.
 */
var isDebug = false;
var Version = '0.0.1';


/**
 * default values
 */



/**
 * An HTTP session object based on top of servlet sessions.
 * Properties of the session's data object are persisted
 * between requests of the same client.
 * @class ServletSession
 *
 * @property {object} data - A container for things to store in this session between requests.
 *
 * @see - 
 * @since 0.0.1
 * @param {request} request - A JSGI or servlet request object.
 * @returns -
 */
function ServletSession() {
    if (!(this instanceof ServletSession)) {
        return new ServletSession(arguments);
    }

    // local variables
    var self = this;

    var data;
    var volatileData;

    // validate arguments
    var _args = Args([
        { request: Args.OBJECT | Args.Required }
    ], arguments);



    var servletRequest = _args.request instanceof javax.servlet.ServletRequest ? _args.request : _args.request instanceof org.eclipse.jetty.websocket.servlet.ServletUpgradeRequest ? _args.request.getHttpServletRequest() : _args.request.env.servletRequest;

    function getSession() {
        return servletRequest.getSession();
    }

    /**
     * A container for things to store in this session between requests.
     * @see -
     * @param -
     * @since 0.0.1
     * @returns {string} sessionAttribute
     */
    Object.defineProperty(this, "data", {
        get: function() {
            if (!data) {
                // session.data is a JavaAdapter that directly proxies property access
                // to the attributes in the servlet session object.
                data = new JavaAdapter(org.mozilla.javascript.NativeObject, {
                    put: function(name, start, value) {
                        getSession().setAttribute(name, value);
                    },
                    get: function(name, start) {
                        if (Object.prototype[name]) {
                            return Object.prototype[name];
                        }
                        return getSession().getAttribute(name);
                    }
                });
            }
            return data;
        },
        enumerable: true
    });

    /**
     * True if this session was created in the current request.
     * This can be useful to find out if the client has cookies disabled
     * for cookie-based sessions.
     */
    Object.defineProperty(this, "isNew", {
        get: function() {
            return getSession().isNew();
        },
        enumerable: true
    });

    /**
     * Createtime of the current session.
     */
    Object.defineProperty(this, "creationTime", {
        get: function() {
            return getSession().getCreationTime();
        },
        enumerable: true
    });

    /**
     * A time interval in seconds, which the session will be open.
     * If the interval is exceeded, the session gets invalidated.
     */
    Object.defineProperty(this, "maxInactiveInterval", {
        get: function() {
            return getSession().getMaxInactiveInterval();
        },
        set: function(interval) {
            return getSession().setMaxInactiveInterval(interval);
        },
        enumerable: true
    });

    /**
     * Time in Unix epoch milliseconds since the last client access.
     */
    Object.defineProperty(this, "lastAccessedTime", {
        get: function() {
            return getSession().getLastAccessedTime();
        },
        enumerable: true
    });

    /**
     * Destroys the current session and any data bound to it.
     */
    this.invalidate = function() {
        getSession().invalidate();
    };

    // save and reset the volatile session object
    volatileData = getSession().getAttribute("__volatileData__");
    getSession().setAttribute("__volatileData__", null);

    /**
     * A volatile property which survives a HTTP redirect and can be used
     * for warnings or error messages in forms. After a requests was handled,
     * the property is reset to null.
     */
    Object.defineProperty(this, "volatile", {
        get: function() {
            return volatileData;
        },
        set: function(value) {
            getSession().setAttribute("__volatileData__", value);
        },
        enumerable: true
    });

    /**
     * 
     */
    Object.defineProperty(this, "getId", {
        get: function() {
            var id = getSession().getId();
            log.info(id);
            return id;
        },
        enumerable: true
    });
}