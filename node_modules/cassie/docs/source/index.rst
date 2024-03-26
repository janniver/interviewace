####################
Cassie —at a glance—
####################

Cassie (short for lil' Cassandra) is a deliciously short `Future`_ library for
JavaScript. It provides a simple ``Promise`` object that can be used as a
placeholder for the return value of any asynchronous call.

In short: **It helps you write readable code!**


.. rst-class:: overview-list

Guides
======

.. hlist::
   :columns: 2

   * :doc:`Learning Cassie <user/index>`
       A tour through Cassie's concepts and how you can leverage them to
       structure better your code-base.

   * :doc:`API Reference <api/index>`
       A quick reference on the minimal Cassie's API, including plenty of usage
       examples and cross-references.


.. toctree::
   :hidden:

   user/index
   api/index


.. index:: installing, downloading
.. _installing:

Installing
==========

If you're using `Node.js`_ (or `Browserify`_ to manage your scripts
dependencies — which I highly recommend), you'll want to grab **Cassie** from
the `NPM`_ registry:

.. code-block:: sh

   $ npm install cassie


Otherwise, if you're suffering in the **Browser** without a module packaging
system, you can include the whole **Cassie + Browserify** bundle — this
contains Browserify, Cassie and all other dependencies — minus es5-shim, you'll
need to include that if you're supporting older browsers:

.. code-block:: html

   <script src="/path/to/cassie.bundle.js"></script>
   <script>
     var cassie = require('cassie')
   </script>

If you're running `Node.js`_ or `Browserify`_, you can just require it away on
your scripts, all dependencies are managed for you:

.. code-block:: js

   var cassie = require('cassie')



.. index:: platform support
.. _platform_support:

Platform Support
================

Cassie should support all ECMAScript 5-compliant platforms. It's been
successfully tested in the following ones:

.. raw:: html  

   <ul class="platform-support">
     <li class="ie">8.0</li>
     <li class="safari">5.1</li>
     <li class="firefox">11.0</li>
     <li class="opera">11.62</li>
     <li class="chrome">18.0</li>
     <li class="nodejs">0.6.x</li>
   </ul>


For the legacy platforms (like IE's JScript), you'll have to provide
support for the following methods:

 * Object.keys
 * Object.create
 * Object.getPrototypeOf
 * Array.prototype.forEach
 * Array.prototype.filter
 * Array.prototype.indexOf

The nice `es5-shim`_ library takes care of handling all of those for
you.




.. index:: support, tracker, issues
.. _support:

Support
=======

Cassie uses the `Github tracker`_ for tracking bugs and new features.




.. index:: licence, license
.. _licence:

Licence
=======

Cassie is licensed under the delicious and premissive `MIT`_ licence. You
can happily copy, share, modify, sell or whatever — refer to the actual
licence text for ``less`` information:

.. code-block:: bash

   $ less LICENCE.txt

   # The MIT License
   # 
   # Copyright (c) 2011 Quildreen Motta <http://killdream.github.com/>
   # 
   # Permission is hereby granted, free of charge, to any person obtaining a copy
   # of this software and associated documentation files (the "Software"), to deal
   # in the Software without restriction, including without limitation the rights
   # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   # copies of the Software, and to permit persons to whom the Software is
   # furnished to do so, subject to the following conditions:
   # 
   # The above copyright notice and this permission notice shall be included in
   # all copies or substantial portions of the Software.
   # 
   # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   # THE SOFTWARE.

   (END)


.. _Future: http://en.wikipedia.org/wiki/Futures_and_promises
.. _Node.js: http://nodejs.org/
.. _NPM: http://npmjs.org/
.. _Browserify: https://github.com/substack/node-browserify
.. _MIT: https://github.com/killdream/cassie/raw/master/LICENCE.txt
.. _es5-shim: https://github.com/kriskowal/es5-shim
.. _Github tracker: https://github.com/killdream/cassie/issues
