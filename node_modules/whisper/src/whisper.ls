# whisper --- A task-based automation app. Leiningen style!
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


# -- Usage -------------------------------------------------------------
doc = '''
      Whisper --- A task-based automation app. Leiningen style!

      Usage:
        whisper <task> [<args>...] [options]
      '''

opts = '''
       Options:
         -v, --version           Displays the version and exits.
         -h, --help              Displays this screen and exits.
         -d, --directory=<dir>   Directory containing the .whisper to load.
         -e, --env=<kind>        Defines the configuration environment [default: *].
       '''

# -- Dependencies ------------------------------------------------------
path    = require 'path'
whisper = require './'
log     = require './log'

{ all-tasks, resolve } = require './tasks'
{ load-config, find-local-config, find-config, home \
, load-package-config, whisper-config } = require './config'
{ environment-for, default-environment, configure } = require './environment'


# -- Helpers -----------------------------------------------------------
try-require = (module) ->
  try
    require (path.resolve project-root, 'node_modules', module)
  catch e
    require (path.resolve home, '.whisper.d', 'node_modules', module)

show-version = (version) ->
  console.log "whisper #version"

show-help = ->
  console.log (doc + '\n\n' + opts)

show-usage = (env) ->
  console.log (doc + '\n')
  (resolve 'list').execute env, []

show-alternatives = (task) ->
  log.fatal "The task \"#task\" has not been registered."

run-task = (task, env, task-args) ->
  try
    (resolve task).execute env, ...task-args
  catch e
    switch e.name
    | '<inexistent-task-e>' => show-alternatives task
    | otherwise             => throw e


# -- Main --------------------------------------------------------------
args     = (require 'optimist')
             .options \v, { alias: \version   }
             .options \h, { alias: \help      }
             .options \d, { alias: \directory }
             .options \e, { alias: \env, default: '*' }
             .boolean \v
             .boolean \h
             .string \f
             .string \e
             .argv

pkg-meta = require '../package'


# Parse options
task      = args._.shift!
task-args = args._
dir       = args.directory or '.'


# Configuration
project-root   = find-local-config dir
current-config = (load-package-config dir).map whisper-config
                                          .reduce (<<<), {}

configure { whisper: { command: args, root: project-root } <<< current-config }


# Change to the root of the project (if local)
if project-root => process.chdir (path.dirname project-root)


# Prepare the `whisper` object
whisper <<< { log: log.derive { prefix: task } }

# Load plugins
current-config.plugins?.for-each -> (try-require it) whisper

# Load .whisper configuration
(require './core') whisper
(load-config dir).for-each (config) -> config whisper


# Grabs the correct environment
env = if args.env => environment-for args.env
      else        => default-environment!


# Execute task
switch
| args.version => show-version pkg-meta.version
| args.help    => show-help!
| task         => run-task task, env, task-args
| otherwise    => show-usage env
