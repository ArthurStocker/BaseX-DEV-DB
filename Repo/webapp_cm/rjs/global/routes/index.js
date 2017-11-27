/**
 * @fileOverview INDEX PAGE.
 */

export('Action');

var {Reinhardt} = require('reinhardt');


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
  global.System.Actions.index = {};
  global.System.Actions.index.Version = Version;
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
  // define page title
  var title = 'Welcome to Ringo';

  // define header 
  var section_header = 'It\'s working!!';

  // define partials
  var partials = {
                    links: '<link rel="stylesheet" href="styles?name=page&type=style&class=base" />',
                    scripts: '<!-- SCRIPT -->'
                 };

  // define template
  var template = '';

  template = template+'<!DOCTYPE html>';
  template = template+'<html>';
  template = template+'  <head>';
  template = template+'    <meta charset="utf-8">';
  template = template+'    '+partials.links+'';
  template = template+'    '+partials.scripts+'';
  template = template+'    <title>'+title+'</title>';
  template = template+'  </head>';
  template = template+'  <body>';
  template = template+'    <div id="section_one">';
  template = template+'      <h1>'+section_header+'</h1>';
  template = template+'    </div>';
  template = template+'    <div id="body">';
  template = template+'      <p>You just created a new Ringo application. Here are some possible next steps:</p>';
  template = template+'        <ul>';
  template = template+'          <li>Tweak the URL routing in <code>config.js</code>.</li>';
  template = template+'          <li>Edit and add actions in <code>actions.js</code>.</li>';
  template = template+'          <li>Visit our <a href="http://ringojs.org/documentation/">documentation</a>';
  template = template+'              to learn more about Ringo.</li>';
  template = template+'        </ul>';
  template = template+'      <p>Thank you for using Ringo!</p>';
  template = template+'    </div>';
  template = template+'  </body>';
  template = template+'</html>';

  // application stuff
  // .....

  // return template and content
  return  {
            status: 200,
            headers: {"Content-Type": "text/html; charset=utf-8"},
            body: [template]
          };
}


/**
 * Load module
 */
_init();
