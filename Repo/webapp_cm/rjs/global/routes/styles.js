/**
 * @fileOverview INDEX PAGE.
 */

export('Action');


/**
 * The module global system object.
 */
var gs = new global.System.Class();

/**
 * The module version string with the major and minor version number.
 */
var Version = '0.0.1';

/**
 * Initialize module
 * @param {}
 * @since: 0.0.1
 * @returns -
 */
function _init() {
  global.System.Actions.styles = {};
  global.System.Actions.styles.Version = Version;
}

/**
 * BaseX Test
 * @param {} 
 */
function Action(options) {
  // validate options 
  if (!options) {
    options = {};
  }

  // save options
  var _options = options;


  // main stuff
  var template = '';

  template = template+'html, body {';
  template = template+'    margin: 0;';
  template = template+'    padding: 0;';
  template = template+'    font-family: sans-serif;';
  template = template+'    background: #eeeeee;';
  template = template+'}';
  template = template+'';
  template = template+'li {';
  template = template+'    margin: 0.8em;';
  template = template+'}';
  template = template+'';
  template = template+'#section_one {';
  template = template+'    background-color: #eeff66;';
  template = template+'}';
  template = template+'';
  template = template+'#section_one h1 {';
  template = template+'    font-weight: normal;';
  template = template+'    font-size: 28px;';
  template = template+'    margin: 0;';
  template = template+'}';
  template = template+'';
  template = template+'#body {';
  template = template+'    background-color: #ffffff;';
  template = template+'}';
  template = template+'';
  template = template+'#section_one, #body {';
  template = template+'    padding: 30px;';
  template = template+'    border-bottom: 1px solid #aaaaaa;';
  template = template+'}';
  

  // return template and content
  return  {
            status: 200,
            headers: {'Content-Type': 'text/css; charset=utf-8'},
            body: [template]
          };
}


/**
 * Load module
 */
_init();

