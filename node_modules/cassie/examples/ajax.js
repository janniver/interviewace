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
