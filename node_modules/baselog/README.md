# Baselog [![Build Status](https://travis-ci.org/killdream/baselog.png)](https://travis-ci.org/killdream/baselog)

Core library for logging anything.


### Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :3

[![browser support](http://ci.testling.com/killdream/baselog.png)](http://ci.testling.com/killdream/baselog)


### Example

```js
var baselog = require('baselog')
var logger = baselog.Logbook.make(baselog.level.warning)

logger.info('foo')
// => 

logger.critical('bar')
// => [Tue Mar 19 2013 01:10:49 GMT-0300 (BRT)] CRITICAL: bar
```


### Installing

Just grab it from NPM:

    $ npm install baselog


### Documentation

A quick reference of the API can be built using [Calliope][]:

    $ npm install -g calliope
    $ calliope build


### Tests

You can run all tests using Mocha:

    $ npm test


### Licence

MIT/X11. ie.: do whatever you want.

[Calliope]: https://github.com/killdream/calliope
[es5-shim]: https://github.com/kriskowal/es5-shim
