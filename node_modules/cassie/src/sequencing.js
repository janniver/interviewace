/// sequencing.js --- Handles asynchronous tasks sequentially
//
// Copyright (c) 2012 Quildreen Motta
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

/// Module cassie.sequencing

var cassie   = require('./cassie')

var to_array = Function.call.bind([].slice)
var uncurried = cassie.uncurried
var as_value = cassie.as_value
var Promise = cassie.Promise


module.exports = function sequencing() {
  var actions      = to_array(arguments)
  var promise      = Promise.make()
  var dependencies = []
  var error


  promise.on('dependency-failed', function(){ error = arguments })
  var result = promise.then(function() {
                              return error?           uncurried(error)
                              :      /* otherwise */  uncurried(dependencies.map(as_value)) })


  return actions.length?  ( do_next()
                          , result
                          )
  :      /* otherwise */  result.bind()


  function do_next() {
    var action = actions.shift()
    if (!action)  return

    var p = action()
    p.ok(do_next).ok(promise.bind.bind(promise))

    dependencies.push(p)
    promise.wait(p) }}