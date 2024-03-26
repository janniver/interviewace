Cassie
======

Cassie (short for lil' Cassandra) is a deliciously short [Promise][]
library for JavaScript. It provides a simple `Promise` object that can
be used as the return value of any asynchronous call.

In short: **It helps you write readable code!**

The idea behind promises is that you can decide how to manipulate the
return value of an asynchronous function before the function has been
resolved. This allows you to write in a clear chaining DSL rather than
using a clusterfuck of callbacks.

Take an Ajax request, for example. The usual way::

    var req = ajax.get( 'data.json'
                      , function (resp) { /* success */
                          req.update('#data', JSON.parse(resp.responseText)) }
                      , function (resp) { /* fail */
                          req.show_error() })
    setTimeout(req.fail, 10000)

With promises, you could get this::

    var req = ajax.get('data.json')
                  .ok().update('#data')
                  .failed().show_error()
                  .timeout(10)

You can pass this ``req`` object around, and other functions can add
their own manipulations to the object as well::

    function log_it(req) {
      return req.ok(log('success'))
                 .failed(log('failed'))
                 .clear_timer() /* disables the timeout */
    }
    var req = log_it(ajax.get('data.json').timeout(10))

[Promise]: http://en.wikipedia.org/wiki/Futures_and_promises


Requirements and Supported Platforms
------------------------------------

Cassie depends on the following libraries:

 - [browserify][]
 - [boo][]
 
Additionally, there's a dependency on the set of safely shim-able
ECMAScript 5 features, which can be provided by a library like
[es5-shim][].

[browserify]: https://github.com/substack/node-browserify
[boo]: https://github.com/killdream/boo
[es5-shim]: https://github.com/kriskowal/es5-shim


Installing
----------

First, you'll need [node.js][] and [npm][]. As soon as you got your
hands on those beautiful thingies, you can just run:

    $ npm install cassie

At your project's directory.

For **Node.js**, just require things right away:

    var cassie = require('cassie')

For **Browsers**, you can either use the generated modules (which are in
the `build` folder):

    <script src="/path/to/browserify.js"></script>
    <script src="/path/to/boo.js"></script>
    <script src="/path/to/cassie.js"></script>
    <script>
      var cassie = require('cassie')
    </script>

Or generate a full browserify bundle for your modules:

    browserify yourmodule.js --require cassie -o all.js

Then reference that script in your webpage:

    <script src="/path/to/all.js"></script>


[node.js]: http://nodejs.org/
[npm]: http://npmjs.org/


Downloading
-----------

Cassie is nicely hosted (and developed) on [Github][]. You can
[download the lastest snapshot][snapshot] or clone the entire
repository:

    $ git clone git://github.com/killdream/cassie.git
    
[Github]:   https://github.com/killdream/cassie
[snapshot]: https://github.com/killdream/cassie/zipball/master


Getting support
---------------

- Use the [Github tracker][] to report bugs or request features. Like a
  boss!
  
- Fork, do your changes and send me a pull request if you want to~

- For general support, you can send me an e-mail on `quildreen@gmail.com`

[Github tracker]: https://github.com/killdream/cassie/issues



Licence
-------

Cassie is licensed under the delicious and permissive [MIT][]
licence. You can happily copy, share, modify, sell or whatever — refer
to the actual licence text for `less` information:

    $ less LICENCE.txt
    
[MIT]: https://github.com/killdream/cassie/raw/master/LICENCE.txt
