describe('λ cassie.sequencing', function() {
  var ensure = require('noire').ensure
  var sinon = require('sinon')
  var Promise = require('../src/cassie').Promise
  var sequentially = require('../src/sequencing')

  function delay(time, f) { return function() {
    var p = Promise.make().ok(f || function(){})
    setTimeout( function() { p.bind(time) }
              , time )
    return p }}

  function fail(time) { return function() {
    var p = Promise.make()
    setTimeout( function() { p.fail(new Error(time)) }
              , time )
    return p }}


  it('Given no tasks, should succeed immediately.', function(done) {
    var spy = sinon.spy()
    sequentially().ok(done)
                  .failed(function(){ throw Error("Failed.") })
  })

  it('Should do each task in order.', function(done) {
    var spy = sinon.spy()
    sequentially( delay(200, spy)
                , delay(100, spy)
                , delay(50, spy))
      .on('done', function() {
        ensure(spy.getCall(0).args).equals([200])
        ensure(spy.getCall(1).args).equals([100])
        ensure(spy.getCall(2).args).equals([50])
        done() })
  })

  it('Should pass the results of each task as arguments.', function(done) {
    sequentially( delay(200)
                , delay(100)
                , delay(50) )
      .on('done', function(a, b, c) {
        ensure(a).equals([200])
        ensure(b).equals([100])
        ensure(c).equals([50])
        done() })
  })

  it('Should fail as soon as any tasks fail.', function(done) {
    var s1 = sinon.spy()
    var s2 = sinon.spy()
    var s3 = sinon.spy()
    sequentially( delay(200, s1)
                , fail(100)
                , delay(50, s3))
      .failed(s2)
      .on('done', function(e) {
        ensure(e).type('Error')
        ensure(e).property('message').equals('100')
        ensure(s1).invoke('calledWithExactly', 200).ok()
        ensure(s3).property('called').not().ok()
        done() })

  })
})