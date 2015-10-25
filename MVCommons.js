//=============================================================================
// MVCommons
// By The MV Secret Team
// MVCommons.js
// Version: 1.0.5
// Released under CC0 Universal 1.0
// You can read the full license from here:
//    https://creativecommons.org/publicdomain/zero/1.0/legalcode
// but basically means "public domain" in fancy words
//=============================================================================

 /*:
  * @plugindesc Great utility library that provides common-use and simplified functions. Also expands default classes.
  *
  * @author Originally Zalerinian, Ramiro, Hudell, Dekita
  *
  * @help
  * ==============================================================================
  *    Introduction
  * ==============================================================================
  * The MVCommons (MVC) plugin is a Software Development Kit (SDK) intended to
  * help plugin makers by providing a standard way to do common functions.
  *
  * This help file will explain the provided functions and what their purpose
  * is.
  *
  * This version of the MVCommons is: 1.0.4
  * ==============================================================================
  *    The MVCommons module (Aliased as MVC)
  * ==============================================================================
  * The MVCommons module is the main part of the plugin. It provides general
  * functions that can be used to make it easier to write plugins, while
  * maintaining compatibility with other plugins, because these functions need
  * not be redefined.
  *
  * ==============================================================================
  *    Stay Up To Date
  * ==============================================================================
  * I advise that you check regularly to see if the MVC plugin has been updated.
  * Plugin updates will include things like bugfixes and new features, so it is
  * highly recommended.
  *
  * You can get the latest versions of MVC via any of the following links'
  * http://link.hudell.com/mvcommons
  * http://dekyde.com/mvcommons
  */

// Importing script
var Imported = Imported || {};
// The included PluginManager sets the version of the script itself.

var MVCommons = {};
// Shorter alias for MVCommons
var MVC = MVCommons;

(function ($) { // MVCommons
  "use strict"; // activating always strict mode for code small

  //============================================================================
  // Private functions
  //============================================================================

  /**
   * Generates a getter based on a name
   * See reader() for information about the default getter
   * @param name The name of the property.
   * @return a function than can be used as a getter.
   */
  function defaultGetter(name) {
    return function () {
      return this['_' + name];
    };
  };

  /**
   * Generates a setter based on a name
   * See writer() for information about the default setter
   * @param name The name of the property.
   * @return a function than can be used as a setter.
   */
  function defaultSetter(name) {
    return function (value) {
      var prop = '_' + name;
      if ((!this[prop]) || this[prop] !== value) {
        this[prop] = value;
        if (this._refresh) {
          this._refresh();
        }
      }
    };
  };

  //============================================================================
  // Public functions
  //============================================================================

  /**
   * Checks if an object is an array
   * @param o The object to check
   * @return A boolean value representing if the object is or not an array
   */
  function isArray(o) {
      return Object.prototype.toString.apply(o) === '[object Array]';
  };

  /**
   * Checks if an object is a function
   * @param functionToCheck The object to check
   * @return A boolean value representing if the object is or not a function
   */
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  };

  /**
    * Converts the string to a boolean. Any string except 'true' will return
    * false.
    * @param str The string to compare to true.
    */
  function boolFunc(str) {
    return Function("return (" + str + " || false) === true")();
  }

  /**
    * Loads text with Ajax synchronously.
    * It takes path to file and an optional MIME type.
    * @param filePath the path to the file
    * @param mimeType a mimeType to parse, by default it checks the file extension
    * @return the text of the file as an string
    */
  function ajaxLoadFile(filePath, mimeType) {
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);
    if (mimeType && xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
    xmlhttp.send();
    if (xmlhttp.status < 200) {
      return xmlhttp.responseText;
    }
    else {
      throw new Error("Cannot load file " + filePath);
    }
  };

  /**
    * Loads a file asynchronously (in the background), with custome callback
    * support.
    * @param filePath The full path to the file to load.
    * @param mimeType A mimeType to parse, by default itt checks the file extension.
    * @param onLoad A callback to call when the file loads successfully.
    * @param onError A callback to call if there is an error laoding the file.
    */
  function ajaxLoadFileAsync(filePath, mimeType, onLoad, onError){
    var xhr = new XMLHttpRequest();
    var name = '$' + filePath.replace(/^.*(\\|\/|\:)/, '').replace(/\..*/, '');
    xhr.open('GET', filePath);
    xhr.overrideMimeType('application/json');
    if(onLoad === undefined){
      onLoad = function(xhr, filePath, name) {
        if (xhr.status < 400) {
          window[name] = JSON.parse(xhr.responseText);
          DataManager.onLoad(window[name]);
        }
      };
    }
    if(onError === undefined) {
      onError = function() {
        DataManager._errorUrl = DataManager._errorUrl || filePath;
      };
    }
    xhr.onload = function() {
      onLoad.call(this, xhr, filePath, name);
    };
    xhr.onerror = onError;
    window[name] = null;
    xhr.send();
  };

  /**
   * Provides an easy way to extend an rgss class
   * If no parent is specified, Object will be used.
   * The default constructor just does:
   *
   * parent.apply(this, arguments)
   *
   * @param [Optional] parent The parent class
   * @param [Optional] constructor, a custom constructor
   * @return this function returns a new class prototype already cofigured.
   */
  function extend(/*parent , constructor */) {
    var constructor, parent;
    parent = arguments.length > 0 ? arguments[0] : Object;
    constructor = arguments.length > 1 ? arguments[1] : function () {
      parent.apply(this, arguments);
      if(!parent.prototype.initialize && this.initialize) {
        this.initialize.apply(this, arguments);
      }
    };
    constructor.prototype = Object.create(parent.prototype);
    constructor.prototype.constructor = constructor;
    constructor.extend = function (/* constructor*/) {
      if (arguments.length) {
        return $.extend(constructor, arguments[0]);
      }
      return $.extend(constructor, function () {
        constructor.apply(this, arguments);
      });
    };
    return constructor;
  }

  /**
   * Makes an easy way to make a reader (a variable you can read)
   * By default it gets the value of this['_' + name ]
   * @param value an object to add the reader
   * @param name The name of the porperty
   * @param [optional] getter the Getter function
   */
  function reader(value, name /*, getter */) {
    Object.defineProperty(value, name, {
      get: arguments.length > 2 ? arguments[2] : defaultGetter(name),
      configurable: true
    });
  };

  /**
   * Makes an easy way to define a writer (a setter to a variable)
   * By default it sets the function of the property this['_' + name] = value
   * It also calls a method this._refresh() if that method exists
   * @param value The object to add the property
   * @param name The property name
   * @param setter [optional] The setter function
   */
  function writer(value, name /*, setter*/) {
    Object.defineProperty(value, name, {
      set: arguments.length > 2 ? arguments[2] : defaultSetter(name),
      configurable: true
    });
  };

  /**
   * Makes an accessor (both getter and setter) of an object easily
   * See writer() and reader() for information about default values.
   * @param value The object to add the accessor
   * @param name The property name
   * @param setter [optional] The setter function
   * @param getter [optional] The getter function
   * @see reader
   * @see writer
   */
  function accessor(value, name /* , setter, getter */) {
    Object.defineProperty(value, name, {
      get: arguments.length > 3 ? arguments[3] : defaultGetter(name),
      set: arguments.length > 2 ? arguments[2] : defaultSetter(name),
      configurable: true
    });
  };

  /**
   * Gets a value from any of the following versions:
   * <tag: param1, param2, param3, param4, ...>text</param>
   * <tag: param1, param2>
   * <tag>text</tag>
   * <tag>
   * tags are case insensitive.
   * @param text The text where you want to search for.
   * @param tag The name for the tag
   * @param defaults an object containing default values if they are not found.
   * @return an object containing a params and text field.
   * @note params is an array with indexed values after : 1, 2, 3...
   * @note text is the text inside <tag></tag>
   */
  function getTag(text, tag /*, defaults */) {
    var result = arguments.length > 2 ? $.shallowClone(arguments[2]) : {};
    var match;
    result.text = result.text || null;
    result.params = result.params || [];
    var txt = '(([^<]*?))';
    var param = '([ \t]*([^>]*)[ \t]*)';
    var param_cont = '(\s[ \t]*,\s[ \t]*' + param + ')*';
    var param_list = '(' + param + param_cont + ')?';
    var open_tag = "<" + tag + '([ \t]*?\:[ \t]*?' + param_list + ")?[ \t]*>";
    var close_tag = "</" + tag + ">";
    match = text.match(new RegExp(open_tag + '(' + txt + close_tag + ')?', "im"));
    if (!match) {
      return null;
    }
    result.text = match[9] || result.text;
    if (match[2]) {
      result.params = match[2].split(',').map(function (i) { return i.trim(); });
    }
    return result;
  };

  /**
    * Gets a property value in a case insensitive way
    * @param meta the list of loaded tags from an object
    * @param propName the name of the property
    * @return the value of the property
   */
  function getProp(meta, propName){
    if (meta === undefined) return undefined;
    if (meta[propName] !== undefined) return meta[propName];
    for (var key in meta) {
      if (key.toLowerCase() == propName.toLowerCase()) {
        return meta[key];
      }
    }
    return undefined;
  }

  /**
    * Extacts notetags from all comments on all pages on the event
    * And creates a list of tags on each page
    * @param The event to extract the meta on
  */
  function extractEventMeta(event) {
    var the_event = event;
    if (the_event instanceof Game_Event) {
      the_event = event.event();
    }

    var pages = the_event.pages;
    if (pages === undefined) return;

    var re = /<([^<>:]+)(:?)([^>]*)>/g;
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      page.meta = page.meta || {};

      for (var j = 0; j < page.list.length; j++) {
        var command = page.list[j];
        if (command.code !== 108 && command.code !== 408) continue;

        for (;;) {
          var match = re.exec(command.parameters[0]);
          if (match) {
            if (match[2] === ':') {
              page.meta[match[1]] = match[3];
            } else {
              page.meta[match[1]] = true;
            }
          }
          else {
            break;
          }
        }
      }
    }
  }

  /**
   * Deep clones an object and its properties.
   * This function will crash when used on recursive objects.
   * Numbers, Strings and Functions are not deep cloned.
   * @param obj The object to clone
   * @return The cloned object
   */
  function deepClone(obj) {
    var result;
    if ($.isArray(obj)) {
      return obj.map(function (i) { return $.deepClone(i); });
    } else if (obj && !obj.prototype && (typeof obj == 'object' || obj instanceof Object)) {
      result = {};
      for (var p in obj) {
        result[p] = $.deepClone(obj[p]);
      }
      return result;
    }
    return obj;
  };

  /**
   * Clones an object with the same properties as the original.
   * This function does not clone properties.
   * Numbers, Strings and Functions are not cloned.
   * @param obj The object to clone
   * @return The cloned object
   */
  function shallowClone(obj) {
    var result;
    if ($.isArray(obj)) {
      return obj.slice(0);
    } else if (obj && !obj.prototype && (typeof obj == 'object' || obj instanceof Object)) {
      result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      return result;
    }
    return obj;
  };

  /**
   * Returns a new object with default attached objects if their properties
   * are not found.
   *
   * @param obj The object to clone
   * @param defaults default values if the properties are not found
   * @param rest [optional] [...] more default objects
   * @return a new object with all the properties
   */
  function options(obj, defaults /*, ...rest */) {
    var result = $.shallowClone(obj);
    for (var i = 1; i < arguments.length; ++i) {
      var arg = arguments[i];
      for (var p in arg) {
        if (!result[p]) {
          result[p] = arg[p];
        }
      }
    }
    return result;
  };

  //============================================================================
  // Export section
  //============================================================================

  // File manipulation
  $.ajaxLoadFile         = ajaxLoadFile;
  $.ajaxLoadFileAsync    = ajaxLoadFileAsync;

  // Class easily manipulation
  $.extend           = extend;
  $.reader           = reader;
  $.writer           = writer;
  $.accessor         = accessor;

  // Type checkers
  $.isArray          = isArray;
  $.isFunction       = isFunction;
  $.Boolean          = boolFunc;

  // Object manipulation
  $.shallowClone     = shallowClone;
  $.deepClone        = deepClone;
  $.options          = options;

  // RPG objects utilities
  $.getTag           = getTag;
  $.getProp          = getProp;
  $.extractEventMeta = extractEventMeta;

})(MVCommons);



(function($){ // PluginManager
  $._Imported = {};

  $._printAuthorWithFullData = function(author) {
    console.log("    %c%s%c <%c%s%c> @ %c%s%c.",
      "color: rgb(27, 108, 184);",
      author.name, "color: black;", "color: rgb(27, 108, 184);",
      author.email,
      "color: black;", "color: rgb(27, 108, 184);",
      author.website, "color: black;"
    );
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager._printAuthorWithWebsite(object author)
   *    author: A Javascript object with name and website fields.
   *
   *  Prints the author's name and website url to the console.
   *  This function is only intended for internal use.
   *
   *  Returns:
   *  This function does not return a value.
   *
    -----------------------------------------------------------------------
   */
  $._printAuthorWithWebsite = function(author) {
    console.log("    %c%s%c @ %c%s%c.",
      "color: rgb(27, 108, 184);",
      author.name,
      "color: black;", "color: rgb(27, 108, 184);",
      author.website, "color: black;"
    );
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager._printAuthorWithEmail(object author)
   *    author: A Javascript object with name and email fields.
   *
   *  Prints the author's name and email to the console.
   *  This function is only intended for internal use.
   *
   *  Returns:
   *  This function does not return a value.
   * -----------------------------------------------------------------------
   */
  $._printAuthorWithEmail = function(author) {
    console.log("    %c%s%c <%c%s%c>.",
      "color: rgb(27, 108, 184);",
      author.name, "color: black;", "color: rgb(27, 108, 184);",
      author.email, "color: black;"
    );
  };

  /**
  // -----------------------------------------------------------------------
  //
  //  PluginManager._printAuthorWithFullData(object author)
  //    author: author can be a string or a Javascript object with a name,
  //            and optional email, and website fields.
  //
  //  Prints the author's name, email, and website url to the console. If
  //  author is a JS object and does not have at least a name field, the
  //  function will throw an error.
  //  This function is only intended for internal use.
  //
  //  Returns:
  //  This function does not return a value.
   * -----------------------------------------------------------------------
   */
  $._printAuthor = function(pluginName, author) {
    if (typeof author == 'string') {
      console.log("     %c%s%c", "color: rgb(27, 108, 184);", author, "color: black;");
    } else {
      if (!author.name) {
        throw new Error("The plugin '" + pluginName + "' requires an author to have a name!");
      }
      if (author.name && author.email && author.website) {
        this._printAuthorWithFullData(author);
      } else if ( author.name && author.email ) {
        this._printAuthorWithEmail(author);
      } else if ( author.name && author.website ) {
        this._printAuthorWithWebsite(author);
      } else {
        console.log("    %c%s%c.",
          "color: rgb(27, 108, 184);",
          author.name, "color: black;"
        );
      }
    }
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.author(string key)
   *    key: The key for a script's entry. If the given key was not
   *         registered with the PluginManager, the function fails.
   *
   *   Returns a list of authors who created the script.
   *
   *  Returns:
   *  This function returns a string on success.
   *  This function returns false on failure.
   * -----------------------------------------------------------------------
   */
  $.author = function(key) {
    if(this.imported(key)){
      return this._Imported[key].author;
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.date(string key, boolean asString)
   *    key:      The key for a script's entry. If the given key was not
   *              registered with the PluginManager, the script fails.
   *
   *    asString: Optional. If true, the date will be returned at the
   *              string used when registering the plugin.
   *
   *   Returns the date the script was last modified on. If asString is
   *   true, return the date as the date string that was given to the
   *   register function.
   *
   *  Returns:
   *  This script returns a Date object if asString is false and is
   *    successful.
   *  This function returns a string if asString is true and is successful.
   *  This function returns false on failure.
   * -----------------------------------------------------------------------
   */
  $.date = function(key, asString) {
    if(this.imported(key)){
      if(!!asString){
        return this._Imported[key].date_s;
      } else {
        return this._Imported[key].date;
      }
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.description(string key)
   *    key: The key for a plugin's entry. If the given key was not
   *         registered with the PluginManager, the function fails.
   *
   *   Gets the description of the plugin with the given key. If the given
   *    key was not registered with the PluginManager, the function will
   *    attempt to get the description of a plugin in the plugins.js file
   *    where the name is the same as the given key.
   *
   *  Returns:
   *  This function returns a string on success.
   *  This function returns false on failure.
   *
   * -----------------------------------------------------------------------
   */
  $.description = function(key) {
    if(this.imported(key)){
      return this._Imported[key].description;
    } else {
      for (var i = 0; i < $plugins.length; i++) {
        if(key == $plugins[i].name){
          return $plugins[i].description;
        }
      }
    }
    return false;
  };


  /**
   * -----------------------------------------------------------------------
   *  PluginManager.getBasicPlugin(string key)
   *    key: The key for a plugin's entry. This is the name of the plugin
   *         as it is in the plugins.js file.
   *
   *  Returns the plugin's data object from the plugins.js file.
   *
   *  Returns:
   *  This function returns a Javascript object on success.
   *  This function returns false on failure.
   * -----------------------------------------------------------------------
   */
  $.getBasicPlugin = function(key) {
    for (var i = 0; i < $plugins.length; i++) {
      if($plugins[i].name == key){
        return $plugins[i];
      }
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *  PluginManager.getPlugin(string key)
   *    key: The key for a plugin's entry. If the given key was not
   *         registered with the PluginManager, the function fails.
   *
   *  Returns the plugin's data object, if it was registered to the
   *  PluginManager.
   *
   *  Returns:
   *  This function returns a Javascript object on success.
   *  This function returns false on failure.
   * -----------------------------------------------------------------------
   */
  $.getPlugin = function(key) {
    if(this.imported(key)){
      return this._Imported[key];
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.imported(string key)
   *    key: The key for a plugin's entry. If the given key was not
   *         registered with the PluginManager, the function fails.
   *
   *   Check if a plugin is imported.
   *
   *  Returns:
   *  This function returns true on success.
   *  This function returns false on failure.
   *
   * -----------------------------------------------------------------------
   */
  $.imported = function(key) {
    if(this._Imported[key]){
      return true;
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   * PluginManager.printPlugin(string key)
   *   key: The key for a plugin's entry. If the given key was not
   *        registered with the PluginManager, the function fails.
   *
   * Logs a plugin's information to the console.
   * -----------------------------------------------------------------------
   */
  $.printPlugin = function (key) {
    if (console) {
      if(this.imported(key)){
        var p = this.getPlugin(key);
        if(p == false) {
          console.error(key + " is not registered with the PluginManager.");
          return false;
        }
        console.log("Plugin %c" + p.id + "%c - v%c" + p.version + "%c",
        'color: rgb(27, 108, 184);', 'color: black;', 'color: rgb(231, 14, 14);', 'color: black;');
        console.log("  %cAuthors%c:", "color: rgb(27, 108, 184)", "color: black;");
        if (Object.prototype.toString.apply(p.author) === '[object Array]') {
          for(var i = 0; i < p.author.length; i++){
            this._printAuthor(name, p.author[i]);
          }
        }
        return true;
      }
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.register(string key, string version, string desc,
   *      string[] author, string date, string[] required, boolean exit)
   *    key:        The key to register. If this key is already registered,
   *                the function fails.
   *
   *    version:    The version to record for the plugin.
   *
   *    desc:       The description of the plugin.
   *
   *    author:     A string, or array of strings, listing the author(s) of
   *                the plugin.
   *
   *    date:       A string representing the date the plugin was last
   *                updated.
   *
   *    required:   Optional. A string, or array of strings, listing the
   *                text keys for plugins that are required for this one to
   *                properly work.
   *
   *    exit:       Optional. If set to true and a required plugin is
   *                missing, the game will stop. If this is set to false,
   *                an error report is made and the game continues. It is
   *                up to the plugin to disable itself in this scenario.
   *
   *  This function will register a plugin with the PluginManager. It can
   *  ensure that any required scripts are included in the game, and stop
   *  it if one or more are missing, telling you what must be added.
   *  Additionally, if exit is false and required scripts are missing,
   *  the game will continue running and the plugin attempting to register
   *  will be told to disable itself, by received "undefined" as a return
   *  value, rather than false.
   *
   *  Date may be formatted using any of the formats on the following page,
   *  but "YYYY-MM-DD" is the preferred format. All times will be set to 0
   *  by the register function.
   *  Date Formats:   http: *www.w3schools.com/js/js_date_formats.asp
   *
   *  Returns:
   *  This function returns true on success.
   *  This function returns false on failure.
   *  This function returns undefined if a required plugin is missing and
   *    exit is false.
   * -----------------------------------------------------------------------
   */
  $.register = function(key, version, desc, author, date, required, exit) {
    if(key === undefined || this.imported(key)){
      return false;
    }
    if(!!required){
      console.log(required);
      if(!(typeof required === "object")) {
        required = Array(required);
      }
      var list = "";
      for (var i = 0; i < required.length; i++) {
        if(!this.imported(required[i])){
          list += String(required[i]) + ", ";
        }
      }
      if(list != ""){
        list = list.substring(0, list.length - 2);
        if(!!exit){
          Graphics.printError("Error loading " + key + "!", "The following scripts are required:\n\n" + list);
          SceneManager.stop();
          return undefined;
        } else {
          console.log("Error loading " + key + "! The following scripts are required:\n\n" + list + "\n\nThe game will continue to run, but the imported plugin may cause errors, malfunction, or   not operate.");
        }
        return undefined;
      }
    }
    Imported[key] = String(version);
    this._Imported[key] = {
      id: key,
      version: String(version),
      description: desc,
      author: typeof author === "object" ? author : Array(author),
      date: this.setDate(date),
      date_s: String(date)
    };
    return true;
  };

  /**
   * -----------------------------------------------------------------------
   *  PluginManager.setDate(string date)
   *    date: The string format of the date to use.
   *
   *  The give date string will be converted into a date object, and the
   *  time components will be set to 0.
   *
   * Returns:
   * This function returns a date object.
   *
   * -----------------------------------------------------------------------
   */
  $.setDate = function(date) {
    var d = new Date(date);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    return d;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.version(key, operation, version)
   *    key:       The key for a plugin's entry. If the given key was not
   *               registered with the PluginManager, the function fails.
   *
   *    operation: Optional. The operation to perform when comparing
   *               versions. A table of operations is listed below.
   *               The syntax is intended to be read,
   *               "Registered version is <operation> given version".
   *
   *    version:   Optional. The version to compare with that that is
   *               registered to the PluginManager.
   *
   *   Compares the version of the plugin with the given key with the given
   *    version. Version should be a string.
   *    operation may be any of the following:
   *      USE            MEANING
   *      >=      Greater than or equal to
   *      >       Greater than
   *      <=      Less than or equal to
   *      <       Less than
   *      ==      equal to
   *
   *  Returns:
   *  This function returns a string when a valid key is given and no
   *    optional arguments are used.
   *  This function returns the value of the comparison if the optional
   *    arguments are used.
   *  This function returns false on failure.
   *
   * -----------------------------------------------------------------------
   */
  $.version = function(key, operation, version) {
    if(this.imported(key)) {
      if(this._Imported[key].version) {
        if(!!operation && !!version){
          switch(operation){
            case ">=":
              return this._Imported[key].version >= version;
              break;
            case ">":
              return this._Imported[key].version >  version;
              break;
            case "<=":
              return this._Imported[key].version <=  version;
              break;
            case "<":
              return this._Imported[key].version <  version;
              break;
            case "==":
              return this._Imported[key].version ==  version;
              break;
            default:
              return false;
          }
        }
        return this._Imported[key].version;
      }
    }
    return false;
  };

  /**
   * -----------------------------------------------------------------------
   *
   *  PluginManager.getParamList(string partialPluginName)
   *   partialPluginName: Part of the name of the plugin that you want to
   *    get the params from
   *
   *   Loads all the params from all plugins where the name match the one specified
   *    in partialPluginName.
   *
   *  Returns:
   *  This function returns an array with one object for each plugin it finds
   *    The object will have a different property for each param
   *
   * -----------------------------------------------------------------------
   */
  $.getParamList = function(partialPluginName) {
    var list = [];
    for (var pluginName in PluginManager._parameters) {
      if (pluginName.search(partialPluginName.toLowerCase()) >= 0) {
        list.push(PluginManager._parameters[pluginName]);
      }
    }

    return list;
  };
})(PluginManager);

(function($){ // Number
  //============================================================================
  // Public functions
  //============================================================================

  /**
    * Drops anything after the 12th decimal place of the number, fixing javascript's issue with decimal operations.
    * Examples:
    *   Math.ceil((0.2 + 0.1) * 10) == 4
    *   Math.ceil((0.2 + 0.1).fix() * 10) == 3
    * @return the fixed number.
   */
  function fix(){
    return (parseFloat(this.toPrecision(12)));
  }

  /**
    * @return the largest integer less than or equal to the number.
   */
  function floor(){
    return Math.floor(this.fix());
  }

  /**
    * @return the smallest integer greater than or equal to the number.
   */
  function ceil(){
    return Math.ceil(this.fix());
  }

  /**
    * @return the value of the number rounded to the nearest integer.
   */
  function round(){
    return Math.round(this.fix());
  }

  /**
    * @return the absolute value
   */
  function abs(){
    return Math.abs(this);
  }
  //============================================================================
  // Export section
  //============================================================================

  $.prototype.fix = fix;
  $.prototype.floor = floor;
  $.prototype.ceil = ceil;
  $.prototype.round = round;
  $.prototype.abs = abs;
})(Number);

(function($){ // Bitmap.prototype
  $.copySection = function(x, y, w, h) {
    var ret = new Bitmap(w, h);
    ret.blt(this, x, y, w, h, 0, 0, w, h);
    return ret;
  };
})(Bitmap.prototype);

(function($){ // ImageManager
  $.loadImage = function(filePath, hue, smooth) {
    var folder = filePath.substring(0, filePath.lastIndexOf("/") + 1);
    var file = filePath.substring(folder.length);
    return this.loadBitmap(folder, file, hue, smooth);
  };

  $.loadIcon = function(index) {
    var icons = this.loadSystem("IconSet");
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = index % 16 * pw;
    var sy = Math.floor(index / 16) * ph;
    return icons.copySection(sx, sy, pw, ph);
  };
})(ImageManager);

(function($) { // StoreManager
  $.fileExists = function(filePath) {
    if(this.isLocalMode()) {
      var fs = require('fs');
      return fs.existsSync(this.localFileDirectoryPath() + "../" + filePath);
    } else {
      return !!localStorage.getItem(filePath);
    }
  }

  $.saveFile = function(filePath, json) {
    if(this.isLocalMode()) {
      var data = LZString.compressToBase64(json);
      var fs = require('fs');
      var dirPath = filePath.substring(0, filePath.lastIndexOf("/") + 1)
      if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      fs.writeFileSync(this.localFileDirectoryPath() + "../" + filePath, data);
    } else {
       var data = LZString.compressToBase64(data);
       localStorage.saveItem(filePath, data);
    }
  }

  $.loadFile = function(filePath) {
    if(this.isLocalMode()) {
      var fs = require('fs');
      if(fs.statsSync(this.localFileDirectoryPath() + "../" + filePath).isFile()){
        return LZString.decompressFromBase64(fs.readFileSync(this.localFileDirectoryPath() + "../" + filePath, {encoding: 'utf8'}));
      } else {
        return null;
      }
    } else {
      if(localStorage.getItem(filePath)){
        return LZString.decompressFromBase64(localStorage.getItem(filePath));
      } else {
        return null;
      }
    }
  }

  $.deleteFile = function(filePath) {
    if(this.isLocalMode()) {
      var fs = require('fs');
      if(fs.existsSync(this.localFileDirectoryPath() + "../" + filePath)) {
        fs.unlinkSync(this.localFileDirectoryPath() + "../" + filePath);
      }
    } else {
      if(localStorage.getItem(filePath)) {
        localStorage.removeItem(filePath);
      }
    }
  }
})(StorageManager);

// DataManager
(function($){
  $.ajaxLoadFile      = MVC.ajaxLoadFile;
  $.ajaxLoadFileAsync = MVC.ajaxLoadFileAsync;
  $.localContentPath  = StorageManager.localContentPath;
  $.storageFileExists = StorageManager.storageFileExists;
  $.directoryExists   = StorageManager.directoryExists;
  $.removeDirectory   = StorageManager.removeDirectory;
  $.storageSaveFile   = StorageManager.storageSaveFile;
  $.storageLoadFile   = StorageManager.storageLoadFile;
  $.storageRemoveFile = StorageManager.storageRemoveFile;
})(DataManager);


(function() {
  var authors = [{
    email: "dekita@dekyde.com",
    name: "David Bow (Dekita)",
    website: "http://www.dekyde.com"
  },{
    email: "plugins@hudell.com",
    name: "Hudell",
    website: "http://www.hudell.com"
  },{
    email: "ramiro.rojo.cretta@gmail.com",
    name: "Ramiro Rojo",
    website: "https://binarychest.wordpress.com"
  },{
    email: "zalerinian@razelon.com",
    name: "Drew Ritter (Zalerinian)",
    website: "http://www.razelon.com"
  }];
  PluginManager.register("PluginManagement", "1.0.0", Imported["PluginManagement"], authors, "2015-10-07");
  PluginManager.register("MVCommons", "1.0.5", "Great utility library to allow common usage", authors, "2015-10-23");
})();
