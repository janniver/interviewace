var ensure = require('noire').ensure
var sinon = require('sinon')
var _ = require('../src/')

describe('{} Event', function() {
  describe('λ init', function() {
    it('Should initialise the object with the Event interface.', function() {
      var ev = _.Event.make('type', _)
      ensure(ev.type).type('String')
      ensure(ev.current).same(_)
      ensure(ev.target).same(_)
      ensure(ev.halted).type('Boolean')
      ensure(ev.handled).type('Boolean')
    })
  })

  describe('λ halt', function() {
    it('Should halt the event.', function() {
      var ev = _.Event.make()
      ensure(ev).property('halted').same(false)
      ev.halt()
      ensure(ev).property('halted').same(true)
    })
    it('Should handle the event.', function() {
      var ev = _.Event.make()
      ensure(ev).property('handled').same(false)
      ev.halt()
      ensure(ev).property('handled').same(true)
    })
  })

  describe('λ handle', function() {
    it('Should handle the event.', function() {
      var ev = _.Event.make()
      ensure(ev).property('handled').same(false)
      ev.handle()
      ensure(ev).property('handled').same(true)
    })
  })

  describe('λ bubble', function() {
    it('Given the context has a parent, should trigger the event on the event\'s parent.', function() {
      var top = { parent: null, trigger: function(){ }}
      var ctx = { parent: top,  trigger: function(){ }}
      var mock = sinon.mock(top).expects('trigger')
                                .once()
                                .withExactArgs(1, 2, 3)
                                .on(top)

      var ev = _.Event.make('', ctx)
      ev.bubble([1, 2, 3])
      mock.verify()
    })
    it('Otherwise, should do nothing.', function() {
      var ctx = { parent: null, trigger: function() {}}
      var mock = sinon.mock(ctx).expects('trigger').never()
      var ev = _.Event.make('', ctx)
      ev.bubble([1, 2, 3])
      mock.verify()
    })
  })
})

describe('{} Handler', function() {
  describe('λ can_exec_p', function() {
    it('Given no filter, should always succeed.', function() {
      var hd = _.Handler.make()
      ensure(hd.can_exec_p(hd)).ok()
    })
    it('Given a filter predicate, should succeed if the predicate succeeds.', function() {
      var hd = _.Handler.make(null, function(x){ return x === hd })
      ensure(hd.can_exec_p({})).not().ok()
      ensure(hd.can_exec_p(hd)).ok()
    })
    it('Given a filter sequence, should succeed if the filter includes the origin.', function() {
      var hd = _.Handler.make(null, [_, 1])
      ensure(hd.can_exec_p(1)).ok()
      ensure(hd.can_exec_p(_)).ok()
      ensure(hd.can_exec_p({})).not().ok()
      ensure(hd.can_exec_p(true)).not().ok()
    })
    it('Given a filter object, should succeed if the filter is the origin.', function() {
      var hd = _.Handler.make(null, _)
      ensure(hd.can_exec_p(_)).ok()
      ensure(hd.can_exec_p({})).not().ok()
    })
  })

  describe('λ exec', function() {
    it('Given an allowed target, should return the result of applying the handler.', function() {
      var hd = _.Handler.make(function(ev, x){ return x + 1 }, [1])
      ensure(hd.exec({ target: 1 }, 2)).same(3)
    })
    it('Given a disallowed target, should do nothing.', function() {
      var hd = _.Handler.make(function(x){ return x + 1 }, [1])
      ensure(hd.exec({ target: '1' }, 2)).same(null)
    })
  })
})

describe('{} Eventful', function() {
  describe('λ init', function() {
    it('Should initialise the object with the Eventful interface.', function() {
      var ev = _.Eventful.make(_)
      ensure(ev.listeners).type('Object')
      ensure(ev.parent).same(_)
    })
  })

  describe('λ on', function() {
    it('Given a Handler, should push the handler to the list of events.', function() {
      var hd = _.Handler.make()
      var ev = _.Eventful.make()
      ev.on('data', hd)
      ensure(ev.listeners.data).contains(hd)
    })
    it('Given a function, should push a Handler wraper to the list of events.', function() {
      var f = function(){}
      var ev = _.Eventful.make()
      var hd = ev.on('data', f)
      ensure(ev.listeners.data).contains(hd)
      ensure(ev.listeners.data[0]).property('fun').same(f)
    })
  })

  describe('λ once', function() {
    it('Should create a Handler that always returns DROP.', function() {
      var ev = _.Eventful.make()
      var hd = ev.once('data', function(){ return true })
      ensure(hd.fun()).same(_.DROP)
    })
  })

  describe('λ remove', function() {
    it('Given an event, should remove all handlers for that event.', function() {
      var ev = _.Eventful.make()
      ev.on('data', function(){})
      ev.on('data', function(){})
      ev.remove('data')

      ensure(ev.listeners.data).empty()
    })
    it('Given a handler, should remove the handler (by identity) from all events.', function() {
      var ev = _.Eventful.make()
      var hd = ev.on('data', function(){})
      ev.on('lol', hd)
      ev.remove(hd)

      ensure(ev.listeners.data).not().contains(hd)
      ensure(ev.listeners.lol).not().contains(hd)
    })
    it('Given an event and a handler, should remove the handler (by identity) from the event.', function() {
      var ev = _.Eventful.make()
      var hd = ev.on('data', function(){})
      ev.on('lol', hd)
      ev.remove('data', hd)

      ensure(ev.listeners.data).not().contains(hd)
      ensure(ev.listeners.lol).contains(hd)
    })
  })

  describe('λ trigger', function() {
    it('Given an event name and arguments, should initialise a new event with the arguments.', function() {
      var ev = _.Eventful.make(), x
      ev.on('data', x = sinon.spy(function(e, a, b){ ensure(e.type).same('data')
                                                     ensure(a).same(1)
                                                     ensure(b).same(2)
                                                     ensure(e.current).same(ev) }))
      ev.trigger('data', 1, 2)

      ensure(x).property('callCount').same(1)
    })
    it('Given an Event object, should reissue the event.', function() {
      var ev = _.Eventful.make(), x
      var e  = _.Event.make('data', ev)
      ev.on('data', x = sinon.spy(function(e2, a, b){ ensure(e2.type).same('data')
                                                      ensure(e).same(e2)
                                                      ensure(a).same(1)
                                                      ensure(b).same(2)
                                                      ensure(e2.current).same(ev) }))
      ev.trigger(e, 1, 2)

      ensure(x).property('callCount').same(1)
    })
    it('Should call all event handlers associated for the given event type with the provided arguments.', function() {
      var ev = _.Eventful.make()
      var f = sinon.stub()
      ev.on('data', f)
      ev.on('data', f)
      ev.on('data', f)
      ev.trigger('data')

      ensure(f).property('callCount').same(3)
    })
    it('Should remove all handlers that yield DROP.', function() {
      var ev = _.Eventful.make()
      var f = sinon.stub()
      var g = sinon.stub().returns(_.DROP)
      var hd = ev.on('data', g)
      var hd2 = ev.on('data', g)
      var hd3 = ev.on('data', f)
      ev.trigger('data')

      ensure(ev.listeners.data).not().contains(hd)
      ensure(ev.listeners.data).not().contains(hd2)
      ensure(ev.listeners.data).contains(hd3)
    })
    it('Should stop if the event is halted.', function() {
      var ev = _.Eventful.make(), x, y
      ev.on('data', y = sinon.spy(function(ev){ ev.halt() }))
      ev.on('data', x = sinon.stub())
      ev.trigger('data')

      ensure(x).property('callCount').same(0)
      ensure(y).property('callCount').same(1)
    })
    it('Shouldn\'t bubble if it\'s handled.', function() {
      var top = _.Eventful.make()
      var ev = _.Eventful.make(top), x, y
      top.on('data', x = sinon.stub())
      ev.on('data', y = sinon.spy(function(ev){ ev.handle() }))
      ev.trigger('data')

      ensure(x).property('callCount').same(0)
      ensure(y).property('callCount').same(1)
    })
    it('Should bubble if it\'s not handled.', function() {
      var top = _.Eventful.make()
      var ev = _.Eventful.make(top)
      var x = sinon.stub()
      top.on('data', x)
      ev.on('data', x)
      ev.trigger('data')

      ensure(x).property('callCount').same(2)
    })
    it('Should not trigger any notification if there\'s a muteness.', function() {
      var x = _.Eventful.make()
      var stub = sinon.stub()
      x.on('data', stub)
      x.mute()
      x.trigger('data')

      ensure(stub).property('callCount').same(0)
    })
  })

  describe('λ mute', function() {
    it('Should prevent notifications from being fired at all.', function() {
      var x = _.Eventful.make()
      var stub = sinon.stub()
      x.on('data', stub)
      x.mute()
      x.trigger('data')

      ensure(stub).property('callCount').same(0)
    })

    it('Should return an unique muteness ID.', function() {
      var x = _.Eventful.make()
      ensure(x.mute()).not().same(x.mute())
    })
  })

  describe('λ unmute', function() {
    it('Should remove the given muteness, if it exists.', function() {
      var x = _.Eventful.make()
      var stub = sinon.stub()
      x.on('data', stub)
      var id = x.mute()
      x.trigger('data', 1)
      x.unmute(id)
      x.trigger('data', 2)

      ensure(stub).property('callCount').same(1)
      ensure(stub.args[0].slice(1)).equals([2])
    })

    it('Should do nothing if the object has no such muteness.', function() {
      var x = _.Eventful.make()
      var stub = sinon.stub()
      x.on('data', stub)
      x.mute()
      x.trigger('data', 1)
      x.unmute({})
      x.trigger('data', 2)

      ensure(stub).property('callCount').same(0)
    })
  })
})

describe('λ with-silence', function() {
  it('Should mutate the eventful inside the callback.', function() {
    var x = _.Eventful.make()
    var stub = sinon.stub()
    x.on('data', stub)
    _.with_silence(x, function() {
      x.trigger('data')
    })

    ensure(stub).property('callCount').same(0)
  })
  it('Should remove the muteness after the callback is executed.', function() {
    var x = _.Eventful.make()
    var stub = sinon.stub()
    x.on('data', stub)
    _.with_silence(x, function() {
      x.trigger('data', 1)
    })
    x.trigger('data', 2)

    ensure(stub).property('callCount').same(1)
    ensure(stub.args[0].slice(1)).equals([2])
  })
})