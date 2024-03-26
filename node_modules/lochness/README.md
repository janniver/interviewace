# Lōchness [![Build Status](https://travis-ci.org/killdream/lochness.png)](https://travis-ci.org/killdream/lochness)

Awesome logging for Node CLI apps.


### Example

```js
var loch = require('lochness')

loch.heading('Lochness')
loch.info('Awesome logging for Node CLI apps.')
loch.warn('Seriously.')
```


### Installing

Just grab it from NPM:

    $ npm install lochness


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
