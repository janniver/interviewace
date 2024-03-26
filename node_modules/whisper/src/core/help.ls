## Module help #########################################################
#
# Displays help for registered tasks.
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

  ### -- Tasks ---------------------------------------------------------
  whisper.task 'help'
             , []
             , """Displays usage information for a given task.

               Usage: whisper help [task]
               """
             , (env, name) -> 
                 | not name  => whisper.log.fatal "`help` expects a task name, none was given."
                 | otherwise => do
                                try
                                  task = whisper.resolve name
                                  console.log """
                                              \# #{name}

                                              #{task.description}
                                              """
                                catch e
                                  switch e.name
                                  | '<inexistent-task-e>' => whisper.log.fatal "The task \"#{name}\" is not registered." 
