## Module environment ##################################################
#
# Handles environment configuration for modules.
#
# 
# Copyright (c) 2013 Quildreen "Sorella" Motta <quildreen@gmail.com>
# 
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation files
# (the "Software"), to deal in the Software without restriction,
# including without limitation the rights to use, copy, modify, merge,
# publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### -- Dependencies ----------------------------------------------------
{ extend, merge } = require 'boo'


### -- Global configuration --------------------------------------------

#### {} environment
# Holds the environment configuration, as a `Kind -> { String -> a }`
# map. We use `*` as the default configuration environment.
#
# :: { String -> Maybe { String -> a } }
environment = { }


### -- Handling kinds of environments ----------------------------------

#### λ configure
# Adds configurations for a given environment kind.
#
# :: { String -> a } -> { String -> a }
# :: String, { String -> a } -> { String -> a }
configure = (kind, data) -> switch arguments.length
  | 1 => configure '*', kind
  | _ => do
         environment[kind] or= {}
         extend environment[kind], (data or {})


#### λ environment-for
# Returns the environment configuration for a given environment kind.
#
# :: String -> { String -> a }
environment-for = (kind) ->
  merge (environment['*'] or {}), (environment[kind] or {})


#### λ default-environment
# Returns the default environment configuration.
#
# :: () -> { String -> a }
default-environment = -> extend {}, (environment['*'] or {})



### -- Exports ---------------------------------------------------------
module.exports = {
  configure, environment-for, default-environment
}
