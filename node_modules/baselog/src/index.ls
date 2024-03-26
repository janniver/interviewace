## Module baselog
#
# Core library for logging anything.
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
{ print } = require 'util'
{ Base }  = require 'boo'



### -- Log entries -----------------------------------------------------

#### {} log-level
# Mappings from log-level strings to priorities.
#
# :: { String -> Number }
log-level = do
            fatal    : 0
            critical : 1
            error    : 2
            warning  : 3
            notice   : 4
            info     : 5
            debug    : 6
  

#### {} Entry
# Represents an entry in a `Logbook`.
#
# This allows Logbooks to decide how they want to handle each entry
# data, when writing specialised loggers (for example, you might want to
# format data differently in a log file and in the terminal).
#
# :: { "level" :: Number
#    , "name"  :: String
#    , "date"  :: Date
#    , "data"  :: { String -> a }
#    }
Entry = Base.derive {

  ##### λ init
  # Initialises an instance of an Entry.
  #
  # :: @Entry => String -> String -> { String -> a } -> Entry
  init: (@name, @message, @data or {}) ->
    @level = log-level[@name]
    @date  = new Date
    this

}


#### λ simple-entry
# Creates a new Entry object for simple log messages.
#
# :: String -> String -> Entry
simple-entry = (name, message) --> Entry.make name, message


#### λ fatal
# The system is at an unusable state. We can't recover from failure.
#
# :: String -> Entry
fatal = simple-entry \fatal

#### λ critical
# Some huge shit happened, but there might be a work around. Immediate
# action is required.
#
# :: String -> Entry
critical = simple-entry \critical

#### λ error
# Some shit happened. It does require attention, but might not be
# immediate.
#
# :: String -> Entry
error = simple-entry \error

#### λ warning
# Some shit is about to happen.
#
# :: String -> Entry
warning = simple-entry \warning

#### λ notice
# Something important is happening.
#
# :: String -> Entry
notice = simple-entry \notice

#### λ info
# Something that might be important is happening.
#
# :: String -> Entry
info = simple-entry \info

#### λ debug
# Information that might be useful for debugging purposes, but useless
# otherwise.
#
# :: String -> Entry
debug = simple-entry \debug

  

### -- Loggers ---------------------------------------------------------

#### {} Logbook
# The base logging object, which just writes over to STDOUT.
#
# :: { "level" :: Number }
Logbook = Base.derive {

  ##### λ init
  # Initialises an instance of a Logbook for a given log level. Entries
  # that are less important (less) than the log level are filtered out.
  #
  # :: @Logbook => Number -> Logbook
  init: (@level or 0) ->
    this

  ##### λ write
  # Writes an entry to the log.
  #
  # :: Entry -> this
  write: (x) ->
    print "[#{x.date}] #{x.name.to-upper-case!}: #{x.message}\n"
    this

  ##### λ log
  # Writes an entry to the log, given it's more important than the log
  # level threshold.
  #
  # :: Entry -> this
  log: (entry) -> do
                  unless entry.level > @level
                    @write entry
                  this

  ##### λ fatal
  # Logs a FATAL event.
  #
  # :: String -> this
  fatal: (message) -> @log (fatal message)

  ##### λ critical
  # Logs a CRITICAL event.
  #
  # :: String -> this
  critical: (message) -> @log (critical message)

  ##### λ error
  # Logs an ERROR event.
  #
  # :: String -> this
  error: (message) -> @log (error message)

  ##### λ warning
  # Logs a WARNING event.
  #
  # :: String -> this
  warning: (message) -> @log (warning message)

  ##### λ notice
  # Logs a NOTICE event.
  #
  # :: String -> this
  notice: (message) -> @log (notice message)

  ##### λ info
  # Logs an INFO event.
  #
  # :: String -> this
  info: (message) -> @log (info message)

  ##### λ debug
  # Logs a DEBUG event.
  #
  # :: String -> this
  debug: (message) -> @log (debug message)

}



### -- Exports ---------------------------------------------------------
module.exports = {
  fatal, critical, error, warning, notice, info, debug, level:log-level

  Entry, Logbook
}
