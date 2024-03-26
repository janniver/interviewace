var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports, __dirname, __filename) {
function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/node_modules/cassie/package.json", function (require, module, exports, __dirname, __filename) {
module.exports = {"main":"./src/cassie.js"}
});

require.define("/node_modules/cassie/src/cassie.js", function (require, module, exports, __dirname, __filename) {
/// cassie.js --- Simple future library for JS. Ready to be raped by Ajax!
//
// // Copyright (c) 2011 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/// Module cassie


//// -- Dependencies --------------------------------------------------------
var Base = require('boo').Base



//// -- Aliases -------------------------------------------------------------
var slice = [].slice



//// -- Helpers -------------------------------------------------------------

///// Function get_queue
// Returns a list of callbacks registered for the event.
//
// If callbacks ain't defined for the event yet, it's also *initialised*
// to an empty array.
//
// get_queue! :: Promise*, String -> [Fun]
function get_queue(promise, event) {
  return promise.callbacks[event]
  ||    (promise.callbacks[event] = []) }


///// Function register
// Creates a function that registers handlers for the given event.
//
// register! :: String -> @this:Promise*, Fun -> this
function register(event) { return function(fun) {
  return this.on(event, fun) }}



//// -- Public interface ----------------------------------------------------

///// Object Promise <| Base
// A placeholder for a value that can be computed asynchronously.
//
// The `Promise' allows any code to define how they'll handle the value
// before the value is actually computed, by adding listeners to the
// various events that can be triggered once a promise is fulfilled.
//
// Promise :: { "callbacks"     -> { String -> [Fun] }
//            , "flush_queue"   -> [Fun]
//            , "value"         -> [Any]
//            , "timer"         -> TimerID
//            , "default_event" -> String
//            }
var Promise = Base.derive({
  ///// Function init
  // Initialises an instance of a Promise.
  //
  // init! :: @this:Object* -> this
  init:
  function _init() {
    this.callbacks     = {}
    this.flush_queue   = []
    this.value         = null
    this.timer         = null
    this.default_event = 'done'
    return this }


  ///// Function on
  // Adds a callback to the given event.
  //
  // on! :: @this:Promise*, String, Fun -> this
, on:
  function _on(event, callback) {
    this.default_event = event

    if (this.value)  invoke_callback(this)
    else             add_callback(this)

    return this

    // Invokes all the callbacks for the event
    function invoke_callback(promise) {
      var queue = get_queue(promise, event)
      return callback && queue.flushed?  callback.apply(promise, promise.value)
      :      /* otherwise */             null }

    // Adds the callback to the event
    function add_callback(promise) {
      return callback?  get_queue(promise, event).push(callback)
      :                 null }}


  ///// Function then
  // Adds a callback to the active event queue.
  //
  // The active event queue is the one for which the last callback was
  // registered, usually. It is controlled by the internal
  // `default_event' property.
  //
  // then! :: @this:Promise*, Fun -> this
, then:
  function _then(callback) {
    return this.on(this.default_event, callback) }



  ///// Function flush
  // Fires all the callbacks for the event.
  //
  // If the promise hasn't been resolved yet, the callbacks are placed
  // in a queue to be flushed once the Promise is fulfilled.
  //
  // flush :: @this:Promise*, String -> this
, flush:
  function _flush(event) {
    var self = this

      !this.value?     queue_event(event)
    : event?           flush_queue(event)
    : /* otherwise */  flush_all()

    return this


    // Adds the event to the flush queue
    function queue_event(event) {
      if (event) self.flush_queue.push(event) }

    // Calls all of the callbacks related to a given event
    function flush_queue(event) {
      var callbacks = get_queue(self, event)

      callbacks.forEach(function(callback) {
                          callback.apply(self, self.value) })
      callbacks.length  = 0
      callbacks.flushed = true }

    // Calls the callbacks for all events that have been queued
    function flush_all() {
      self.flush_queue.forEach(flush_queue) }}


  ///// Function done
  // Fulfills the promise with the values given.
  //
  // done :: @this:Promise*, [Any] -> this
, done:
  function _done(values) {
    if (!this.value) {
      this.clear_timer()
      this.flush('done')
      this.value = slice.call(values)
      this.flush() }

    return this }


  ///// Function fail
  // Fails to fulfill the promise.
  //
  // fail :: @this:Promise*, Any... -> this
, fail:
  function _fail() {
    return this.flush('failed').done(arguments) }


  ///// Function bind
  // Successfully fulfills the promise.
  //
  // bind :: @this:Promise*, Any... -> this
, bind:
  function _bind() {
    return this.flush('ok').done(arguments) }


  ///// Function forget
  // Cancels the promise.
  //
  // forget :: @this:Promise* -> this
, forget:
  function _forget() {
    return this.flush('forgotten').fail('forgotten') }


  ///// Function timeout
  // Schedules the promise to fail after a given number of seconds.
  //
  // timeout :: @this:Promise*, Number -> this
, timeout:
  function _timeout(delay) {
    this.clear_timer()
    this.timer = setTimeout( function(){ this.flush('timeouted')
                                             .fail('timeouted')  }.bind(this)
                           , delay * 1000)

    return this }


  ///// Function clear_timer
  // Stop the timer for the promise, if one was previously set by
  // invoking `timeout'.
  //
  // clear_timer :: @this:Promise* -> this
, clear_timer:
  function _clear_timer() {
    clearTimeout(this.timer)
    this.timer = null
    return this }


  ///// Function ok
  // Registers a callback for when the promise is successfully
  // fulfilled.
  //
  // ok :: @this:Promise*, Fun -> this
, ok: register('ok')

  ///// Function failed
  // Registers a callback for when the promise fails to be fulfilled.
  //
  // failed :: @this:Promise*, Fun -> this
, failed: register('failed')

  ///// Function timeouted
  // Registers a callback for when the promise fails by timing out.
  //
  // timeouted :: @this:Promise*, Fun -> this
, timeouted: register('timeouted')

  ///// Function forgotten
  // Registers a callback for when the promise fails by being
  // cancelled.
  //
  // forgotten :: @this:Promise*, Fun -> this
, forgotten: register('forgotten')
})



//// -- Exports ---------------------------------------------------------------
module.exports = { Promise   : Promise
                 , register  : register

                 , internals : { get_queue: get_queue }}

});

require.define("/node_modules/cassie/node_modules/boo/package.json", function (require, module, exports, __dirname, __filename) {
module.exports = {"main":"./src/boo.js"}
});

require.define("/node_modules/cassie/node_modules/boo/src/boo.js", function (require, module, exports, __dirname, __filename) {
/// boo.js --- Prototypical utilities
//
// Copyright (c) 2011 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/// Module boo
void function(root, exports) {
  var slice   = [].slice
    , keys    = Object.keys
    , inherit = Object.create


  
  //// - Interfaces -----------------------------------------------------------

  ///// Interface DataObject
  // :: { "to_data" -> () -> Object }


  
  //// - Helpers --------------------------------------------------------------

  ///// Function data_obj_p
  // :internal:
  // Checks if the given subject matches the DataObject interface
  //
  // data_obj_p :: Any -> Bool
  function data_obj_p(subject) {
    return subject != null
    &&     typeof subject.to_data == 'function' }


  ///// Function resolve_mixins
  // :internal:
  // Returns the proper mixin for the given object.
  //
  // resolve_mixin :: Object -> Object
  function resolve_mixin(object) {
    return data_obj_p(object)?  object.to_data()
    :                           object }


  ///// Function fast_extend
  // :internal:
  // Extends the target object with the provided mixins, using a
  // right-most precedence rule — when a there's a property conflict, the
  // property defined in the last object wins.
  //
  // `DataObject's are properly handled by the `resolve_mixin'
  // function.
  //
  // :warning: low-level
  //    This function is not meant to be called directly from end-user
  //    code, use the `extend' function instead.
  //
  // fast_extend :: Object, [Object | DataObject] -> Object
  function fast_extend(object, mixins) {
    var i, j, len, mixin, props, key
    for (i = 0, len = mixins.length; i < len; ++i) {
      mixin = resolve_mixin(mixins[i])
      props = keys(mixin)
      for (j = props.length; j--;) {
        key         = props[j]
        object[key] = mixin[key] }}

    return object }


  
  //// - Basic primitives -----------------------------------------------------

  ///// Function extend
  // Extends the target object with the provided mixins, using a
  // right-most precedence rule.
  //
  // :see-also:
  //   - `fast_extend' — lower level function.
  //   - `merge'       — pure version.
  //
  // extend :: Object, (Object | DataObject)... -> Object
  function extend(target) {
    return fast_extend(target, slice.call(arguments, 1)) }


  ///// Function merge
  // Creates a new object that merges the provided mixins, using a
  // right-most precedence rule.
  //
  // :see-also:
  //   - `extend' — impure version.
  //
  // merge :: (Object | DataObject)... -> Object
  function merge() {
    return fast_extend({}, arguments) }

  ///// Function derive
  // Creates a new object inheriting from the given prototype and extends
  // the new instance with the provided mixins.
  //
  // derive :: Object, (Object | DataObject)... -> Object
  function derive(proto) {
    return fast_extend(inherit(proto), slice.call(arguments, 1)) }


  
  //// - Root object ----------------------------------------------------------

  ///// Object Base
  // The root object for basing all the OOP code. Provides the previous
  // primitive combinators in an easy and OOP-way.
  var Base = {

    ////// Function make
    // Constructs new instances of the object the function is being
    // applied to.
    //
    // If the object provides an ``init`` function, that function is
    // invoked to do initialisation on the new instance.
    //
    // make :: Any... -> Object
    make:
    function _make() {
      var result = inherit(this)
      if (typeof result.init == 'function')
        result.init.apply(result, arguments)

      return result }

    ////// Function derive
    // Constructs a new object that inherits from the object this function
    // is being applied to, and extends it with the provided mixins.
    //
    // derive :: (Object | DataObject)... -> Object
  , derive:
    function _derive() {
      return fast_extend(inherit(this), arguments) }}


  
  //// - Exports --------------------------------------------------------------
  exports.extend   = extend
  exports.merge    = merge
  exports.derive   = derive
  exports.Base     = Base
  exports.internal = { data_obj_p    : data_obj_p
                     , fast_extend   : fast_extend
                     , resolve_mixin : resolve_mixin
                     }

}
( this
, typeof exports == 'undefined'? this.boo = this.boo || {}
  /* otherwise, yay modules! */: exports
)
});

require.define("/ajax.js", function (require, module, exports, __dirname, __filename) {
    /// ajax.js --- Promises for Ajax example
//
// Copyright (c) 2011 Quildreen Motta
//
// Licensed under the MIT/X11 licence.


/// Code
void function (root, cassie) {
  // Aliases for some JavaLongPropertyNames.Within.Java.Long.Objects
  var has   = Object.prototype.hasOwnProperty
  , cls     = Object.prototype.toString
  , slice   = Array.prototype.slice
  , keys    = Object.keys
  , Promise = cassie.Promise

  , state_map = [ 'setup'
                , 'loading'
                , 'loaded'
                , 'interactive' ]

  //// HELPER FUNCTIONS
  // Return the element with the given `id' (not sanitised for IE)
  function el(elm) {
    return class_of(elm) == 'String'?  document.getElementById(elm)
         :                             elm
  }

  // Return the internall [[Class]] of the given `obj'
  function class_of(obj) {
    return cls.call(obj).slice(8, -1)
  }

  // Creates a new element
  function tag(name) {
    return document.createElement(name)
  }

  // Returns a short date representation
  function date(d) {
    return (d || new Date).toDateString()
  }

  // Simple templating function, like Python's str.format
  function format(str, data) {
    return str.replace(/{(.+?)}/g, function(m, id) {
      return data[id] })
  }

  // Inserts the returned data at the top of the element
  function insert(promise, req, data, elm, cls) { var c
    c           = tag('li')
    elm         = el(elm)
    c.className = cls || ""
    c.innerHTML = format('[{date}] {method} "{uri}" {status}: {data}'
                        , { date:   date()
                        , method: promise.method
                        , uri:    promise.uri
                        , status: req.status
                        , data:   data })

    elm.insertBefore(c, elm.firstChild)
  }



  //// SPECIALISED PROMISE FOR AJAX
  var AjaxVow = Promise.derive({
    // Replaces the content of an element with the returned data
    update:
    function update(elm) {
      function insert_response(req, data) { el(elm).innerHTML = data }

      return this.then(insert_response)
    },

    // Logs a general information on the log stack
    log:
    function log(elm) {
      return this.then(function(req, data){
        insert(this, req, data, elm) })
    },

    // Logs an error message on the log stack
    error:
    function error(elm) {
      return this.then(function(req, data){
        insert(this, req, data, elm, 'error') })
    },

    // Calls a callback after some delay
    delay:
    function delay(time, fn) {
      function call() { setTimeout(fn, time * 1000) }

      return this.then(call)
    },

    // Callbacks for Ajax's states                               readyState
    setup:
    function setup(f)      { return this.on('setup',       f) }, // 0

    loading:
    function loading(f)    { return this.on('loading',     f) }, // 1

    loaded:
    function loaded(f)     { return this.on('loaded',      f) }, // 2

    interactive:
    function interactive(f){ return this.on('interactive', f) }  // 3
  })

  //// AJAX REQUEST WRAPPER
  function ajax(method, uri, data) {
    var req   = new XMLHttpRequest
    , promise = AjaxVow.make()
    , success = /0|2\d{2}/

    // Remember which method and uri we used, so we can use them on
    // the log
    promise.method = method
    promise.uri    = uri

    // Open an URL asynchronously and listen to each change on its
    // state
    req.open(method, uri, true)
    req.onreadystatechange = function() {
      var res  = req.responseText
      , state  = req.readyState
      , status = req.status

      // Flushes the curent readyState's queue of callbacks
      promise.flush(state_map[state])

      // If the request has been completed, either resolve the
      // promise successfully (status == 2xx), or resolve the
      // promise with an error.
      if (state == 4)
        success.test(status)?  promise.bind(req, res)
                            :  promise.fail(Error('Ooops, something went wrong.')) }

    // Send the request to the server
    req.send(data)
    return promise
  }

  // Just a wrapper for the general ajax request that assumes a GET
  function get(uri) {
    return ajax('GET', uri, null)
  }


  //// APPLICATION CODE //////////////////////////////////////////////////////
  // Requests the url `hello.txt'. After the request has been
  // successfully completed, the data should be logged in the
  // log-stack, and the function should be called again in 2 seconds.
  //
  // If the request was successfull, we also update the #world div
  // with the returned data.
  function hello() {
    get('hello.txt').log('log-stack')
                    .delay(2, hello)
                    .ok().update('world')
  }
  hello()

  // Requests the url `nu-uh', and if shit happens, logs the error
  // message in the log-stack
  get('nu-uh').failed().error('log-stack')

  // Requests `hello.txt' and updates the log-stack with the data, if
  // the request was successful.
  //
  // Though it'll never be as we forget about the promise before
  // sending the request...
  get('hello.txt').ok().update('log-stack')
                  .forget()

}(this, require('cassie'))

});
require("/ajax.js");
