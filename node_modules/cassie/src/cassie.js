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
var boo = require('boo')



//// -- Aliases -------------------------------------------------------------
var derived_p = Object.isPrototypeOf
var slice     = [].slice
var Base      = boo.Base
var derive    = boo.derive



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


///// Function resolved_p
// Checks if a given promise is resolved.
//
// resolved? :: Promise -> Bool
function resolved_p(promise) {
  return !!promise.value
  &&     ( !promise.dependencies.length
        ||  promise.binding_state == 'failed' )}


///// Function remove
// Removes an item from an array
//
// remove! :: list:[a]*, a -> list
function remove(xs, x) {
  var pos = xs.indexOf(x)
  if (pos != -1)  xs.splice(pos, 1)
  return xs }


///// Function as_value
// Returns the value of a promise.
//
// as-value :: Promise -> a
function as_value(promise) {
  return promise.value }


///// Function uncurried
// Returns a special value, that lets promise transformations pass
// transformation results as variadic arguments.
//
// uncurried :: a -> Uncurried a
function uncurried(a) {
  return derive(uncurried, { value: a })}


///// Function uncurried_p
// Checks if an object is an uncurried form of a value.
//
// uncurried_p :: a -> Bool
function uncurried_p(a) {
  return derived_p.call(uncurried, a) }



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
    this.flush_queue   = { ok: [], failed: [], any: [] }
    this.dependencies  = []
    this.value         = null
    this.timer         = null
    this.binding_state = ''
    return this }


  ///// Function on
  // Adds a callback to the given event.
  //
  // on! :: @this:Promise*, String, Fun -> this
, on:
  function _on(event, callback) {
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
  // Creates a new promise that transforms the bound value of the
  // original promise by the given functor.
  //
  // The new promise has its own callback mappings but share the flush
  // queue with the original promise. That is, calling `flush' in the
  // new promise will flush the event queue in the original promise.
  //
  // then! :: @this:Promise*, Fun -> Promise
, then:
  function _then(callback) {
    var origin  = this
    var promise = this.make()
    promise.flush_queue = origin.flush_queue

    this.ok(    function(){ call(promise, 'bind', transform(arguments)) })
        .failed(function(){ call(promise, 'fail', transform(arguments)) })

    return promise

    function call(subject, method, arguments) {
      uncurried_p(arguments)?  subject[method].apply(subject, arguments.value)
      : /* otherwise */        subject[method](arguments) }

    function transform(xs) {
      return callback.apply(promise, xs) }}


  ///// Function wait
  // Assigns one or more promises as dependencies of this one, such that
  // this promise will only be resolved after all its dependencies are.
  //
  // wait! :: @this:Promise*, Promise... -> this
, wait:
  function _wait() {
    var self = this
    slice.call(arguments).forEach(make_dependency.bind(this))
    return this

    function make_dependency(promise) {
      this.dependencies.push(promise)
      promise.ok(remove_dependency)
      promise.failed(reject) }

    function remove_dependency() {
      remove(self.dependencies, this)
      self.flush(self.binding_state) }

    function reject() {
      self.value         = null
      self.binding_state = 'failed'

      self.flush('dependency-failed', 'failed')
          .fail.apply(self, this.value) }}


  ///// Function flush
  // Fires all the callbacks for the event.
  //
  // If the promise hasn't been resolved yet, the callbacks are placed
  // in a queue to be flushed once the Promise is fulfilled.
  //
  // flush :: @this:Promise*, String -> this
, flush:
  function _flush(event, state) {
    var self = this
    state    = state || 'any'

      !resolved_p(this)?  queue_event(event, state)
    : event?              flush_queue(event, state)
    : /* otherwise */     flush_all(state)

    return this


    // Adds the event to the flush queue
    function queue_event(event, state) {
      if (event) self.flush_queue[state].push(event) }

    // Calls all of the callbacks related to a given event
    function flush_queue(event) {
      var callbacks = get_queue(self, event)

      callbacks.forEach(function(callback) {
                          callback.apply(self, self.value) })
      callbacks.length  = 0
      callbacks.flushed = true }

    // Calls the callbacks for all events that have been queued
    function flush_all(state) {
      self.flush_queue[state].forEach(flush_queue)
      self.flush_queue['any'].forEach(flush_queue) }}


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
      this.flush(null, this.binding_state) }

    return this }


  ///// Function fail
  // Fails to fulfill the promise.
  //
  // fail :: @this:Promise*, Any... -> this
, fail:
  function _fail() {
    this.binding_state = 'failed'
    return this.flush('failed', 'failed').done(arguments) }


  ///// Function bind
  // Successfully fulfills the promise.
  //
  // bind :: @this:Promise*, Any... -> this
, bind:
  function _bind() {
    this.binding_state = 'ok'
    return this.flush('ok', 'ok').done(arguments) }


  ///// Function forget
  // Cancels the promise.
  //
  // forget :: @this:Promise* -> this
, forget:
  function _forget() {
    return this.flush('forgotten', 'failed').fail('forgotten') }


  ///// Function timeout
  // Schedules the promise to fail after a given number of seconds.
  //
  // timeout :: @this:Promise*, Number -> this
, timeout:
  function _timeout(delay) {
    this.clear_timer()
    this.timer = setTimeout( function(){ this.flush('timeouted', 'failed')
                                             .fail('timeouted')  }.bind(this)
                           , delay * 1000)

    return this }


  ///// Function clear_timer
  // Stop the timer for the promise, if one was previously set by
  // invoking `timeout'.
  //
  // clear_timer :: @this:Promise* -> this
, clearTimer:
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
Promise.clear_timer = Promise.clearTimer


///// Function merge
// Combines several promises into one.
//
// merge :: Promise... -> Promise
function merge() {
  var dependencies = slice.call(arguments)
  var promise      = Promise.make()
  var error        = null

  promise.wait.apply(promise, arguments)
         .on('dependency-failed', function(){ error = arguments })

  dependencies.forEach(function(dep) {
                         dep.ok(promise.bind.bind(promise)) })


  return promise.then(function() {
                        return error?           uncurried(error)
                        :      /* otherwise */  uncurried(dependencies.map(as_value)) })}



//// -- Exports ---------------------------------------------------------------
module.exports = { Promise    : Promise
                 , register   : register
                 , merge      : merge
                 , uncurried  : uncurried
                 , resolved_p : resolved_p
                 , resolvedP  : resolved_p
                 , as_value   : as_value
                 , asValue    : as_value

                 , internals : { get_queue: get_queue }}
