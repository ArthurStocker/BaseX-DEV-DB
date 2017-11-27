/**
 * @fileOverview TEST BaseX Client.
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
  global.System.Actions.test = {};
  global.System.Actions.test.Version = Version;
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

  // define title
  var section_header = 'BaseX Client Test';

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
  template = template+'      {{body}}';
  template = template+'    </div>';
  template = template+'  </body>';
  template = template+'</html>';

  // application stuff
  /* Moduleloader Test */
  var {JSfn} = gs.require({table: 'main_modules', script:{name:'TEST', type: 'function', options:{}}});

  /* BRjx Test */
  var {BRjxRecord} = gs.require({table: 'main_modules', script:{name:'BRjxRecord', type: 'class', options:{}}});

  var br = new BRjxRecord('main_commands');
  br.addQuery('name', 'getRecords');
  br.addQuery('type', 'xquery');
  var bror = br.addOrCondition('name', 'getTables');
  bror.addQuery('type', 'xquery');

  var result = br.query();

  /* Proxy() Test */
  var myObject = new gs.Proxy({
    object: {
      error: undefined,
      index: 0,
      records: [{a:'a1', b:'a2'}, {a:'b1', b:'b2'}]
    },
    callbacks: {
      set: function(name, start, value, _this) {
        if (name == 'index') {
          _this.object.index=value;
        } else {
          _this.object.records[_this.object.index][name]=value;
        }
      },
      get: function(name, start, _this) {
        return _this.object.records[_this.object.index][name];
      }
    }
  });

  var x = {
    records: undefined,
    error: undefined,
    exists: function() {
      if(this.record && !this.error) {
        return true;
      } else {
        return false;
      }
    },
    toString: function() {
      if (this.record) {
        return this.record.id.toString();
      } else {
        return this.error.toString();
      }
    }
  };

  var y = {
    record: {
      vars: {},
      funcs: {},
      depends: {} 
    },
    error: undefined,
    hasExports: function() {
      if((Object.keys(this.record.vars).length > 0 || Object.keys(this.record.funcs).length > 0) && !this.error) {
        return true;
      } else {
        return false;
      }
    },
    hasDependencies: function() {
      if(Object.keys(this.record.depends).length > 0 && !this.error) {
        return true;
      } else {
        return false;
      }
    },
    toString: function() {
      if (this.record) {
        return  'variables: '+Object.keys(this.record.vars).toString()+
          '\nfunctions: '+Object.keys(this.record.funcs).toString()+
          '\ndepends on: '+Object.keys(this.record.depends).toString();
      } else {
        return this.error.toString();
      }
    }
  };


  // content of "#body"
  gs.info('<h2>Global App Object</h2>');
  gs.dump(global.App);
  gs.info('<h2>Global System Object</h2>');
  gs.dump(global.System);
  gs.info('<h2>Result of call to BaseX imported function -- JSfn("Hello World!")</h2>');
  gs.dump(JSfn('Hello World!'));
  gs.info('<h2>BRjx and BRjxRecord Test</h2>');
  gs.dump(result.records);
  /**
   * TODO: iterate over gs.buffer() objects
   */
  var body = '';
  gs.buffer().forEach(function(item, index){
    body = body+item.text;
   });
  template = template.replace(/{{body}}/, body);
  
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
