## Module lochness
#
# Awesome logging for Node CLI apps.
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
colours            = require 'cli-color'
moment             = require 'moment'
{ puts }           = require 'util'
{ Logbook, level } = require 'baselog'


### -- Colour scheme ---------------------------------------------------

#### {} scheme
# An object mapping log-levels to colour transformation functions.
#
# :: { String -> (String -> String) }
scheme = do
         fatal    : colours.red-bright.bold
         critical : colours.red
         error    : colours.magenta-bright
         warning  : colours.yellow
         notice   : colours.blue
         info     : colours.cyan



### -- Helpers ---------------------------------------------------------

#### λ id
# Identity function.
#
# :: a -> a
id = (a) -> a


#### λ pad-with
# Pads some text with a certain character, such that the resulting text
# fits the given size.
#
# :: String -> Number -> String -> String
pad-with = (char, size, text) -->
  n = size - text.length
  switch
  | n <= 0     => text
  | otherwise  => text + (Array n).join char


#### λ pad
# Pads a log level with spaces for alignment.
#
# :: String -> String
pad = pad-with ' ', ('critical'.length + 2)


#### λ colour-for
# Returns a colour transformation function for a given log-level.
#
# :: String -> (String -> String)
colour-for = (level) ->
  | level of scheme => scheme[level]
  | otherwise       => id


#### λ display
# Displays the given list of strings separated by spaces.
#
# :: [Maybe String] -> ()
display = (xs) --> puts (xs.filter Boolean .join ' ')


### -- Core logger -----------------------------------------------------

#### {} Logger
# The command line logging object, which writes over to STDOUT with
# colours.
#
# :: { "level"  : Number
# .. , "prefix" : Maybe String
# .. }
Logger = Logbook.derive {

  ##### λ init
  # Initialises an instance of a Logger with the given options.
  #
  # :: @Logger => { String -> a } -> Logger
  init: (options or {}) ->
    @level  = options.level ? level.info
    @prefix = options.prefix
    this


  ##### λ write
  # Writes an entry to the log.
  # 
  # :: Entry -> this
  write: (x) ->
    display [(@show-prefix x), (@show-level x), (@show x)]
    this


  ##### λ show-date
  # A helper for displaying the entry date in the log.
  #
  # :: Entry -> String
  show-date: (x) ->
    colours.green "[#{moment x.date .format 'DD/MM/YYYY hh:mm:ss ZZ'}]"


  ##### λ show-prefix
  # A helper for displaying the logger prefix in the log.
  #
  # :: Entry -> String
  show-prefix: (x) ->
    if @prefix => (colours.magenta "[#{@prefix}]")


  ##### λ show-level
  # A helper for displaying the entry level in the log.
  #
  # :: Entry -> String
  show-level: (x) ->
    (colour-for x.name) (colours.bold "#{pad x.name.to-upper-case!}")


  ##### λ show
  # A helper for displaying the entry in the log.
  #
  # :: Entry -> string
  show: (x) -> 
    (colour-for x.name) x.message


  ##### λ heading
  # Displays the given text as a heading in the log.
  #
  # :: String -> ()
  heading: (text) ->
    puts ''
    puts (colours.green-bright.bold (pad-with '-', 79, "-- #text "))
  
}


### -- Exports ---------------------------------------------------------
module.exports = { scheme, Logger }
