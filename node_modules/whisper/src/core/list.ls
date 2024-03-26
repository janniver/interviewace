## Module list #########################################################
#
# Lists available tasks.
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

module.exports = (whisper) ->

  ### Data re-newline
  # The regular expression for EOL.
  # :: RegExp
  re-newline = /\r\n|\r|\n/

  ### λ summary
  # Returns a summary for a Task's description.
  # :: String -> String
  summary = (text) -> text.split re-newline .0

  ### λ largest
  # Returns the largest string on the list.
  # :: [String] -> String
  largest = (xs) -> xs.reduce ((a,b) ->
                                     | a.length > b.length => a
                                     | _                   => b), ''

  ### λ names
  # Returns just the names in the list.
  # :: [Task] -> [String]
  names = (xs) -> xs.map (.name)

  ### λ pad-right
  # Adds padding to the right of a text.
  # :: Number -> String -> String
  pad-right = (n, text) --> "#{text}#{repeat (n - text.length), ' '}"

  ### λ repeat
  # Repeats a String `n` times.
  # :: Number -> String
  repeat = (n, text) -->
    | n <= 0 => ''
    | _      => (Array n).join text

  ### λ task-item
  # Returns a display for the task description.
  # :: Number -> Task -> String
  task-item = (padding, task) -->
    "  #{pad-right padding, task.name} #{summary task.description}"

  ### λ list-tasks
  # Returns a list of line descriptions for all tasks.
  # :: [Task] -> [String]
  list-tasks = (xs) ->
    tasks   = [x for _, x of xs]
    padding = (largest (names tasks)).length + 5
    tasks.map (task-item padding) .sort!
                                     

  ### -- Tasks ---------------------------------------------------------
  whisper.task 'list'
             , []
             , """Lists available tasks."""
             , (env) ->
                 console.log "Registered tasks:\n"
                 console.log (list-tasks whisper.all-tasks).join '\n'
