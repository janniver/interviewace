## Module tasks ########################################################
#
# Defines and handles tasks.
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
{ Base }     = require 'boo'
{ Promise }  = require 'cassie'
make-error   = require 'flaw'
sequentially = require 'cassie/src/sequencing'


### -- Error handling --------------------------------------------------

#### λ task-exists-e
# Signals a task with the same name has been registered.
#
# :: Task -> Error
task-exists-e = (task) ->
  make-error '<task-exists-e>' \
           , """
             A task named \"#{task.name}\" has already been registered:

             #{task.name} (#{task.dependencies.join ', '})
                 #{task.description or ''}
             """

#### λ inexistent-task-e
# Signals a task with the given name wasn't found.
#
# :: String -> Error
inexistent-task-e = (name) ->
  make-error '<inexistent-task-e>' \
           , "The task \"#name\" has not been registered."


### -- Helpers ---------------------------------------------------------

#### λ resolve
# Resolves a task by name.
#
# :: String -> Task
resolve = (name) ->
  | name of all-tasks => all-tasks[name]
  | otherwise         => throw inexistent-task-e name


#### λ as-action
# Returns an wrapper on the task execution.
#
# :: Task -> a... -> Promise
as-action = (task) -> (...as) -> task.execute ...as
  


### -- Core implementation ---------------------------------------------

#### Data all-tasks
# Holds all tasks that have been registered.
#
# :: { String -> Task }
all-tasks = {}


#### {} Task
# Represents a task, and allows running it.
#
Task = Base.derive {

  ##### λ init
  # Initialises the Task instance.
  #
  # :: String, [String], String, (Environment -> ()) -> Task
  init: (@name, deps, @description, @fun) ->
    @_executed    = false
    @async        = false
    @promise      = Promise.make!
    @dependencies = deps.map resolve
    @register!
    this
   
 
  ##### λ execute
  # Executes the task instance and its dependencies.
  #
  # :: Environment -> Promise
  execute: (env, ...args) -> unless @_executed
    sequentially ...( (@dependencies.map as-action) \
                 ++ [~> do
                        @_executed = true
                        result = @fun env, ...args

                        process.next-tick ~> if not @async => @promise.bind result

                        @promise ])

  else => @promise


  ##### λ register
  # Registers the task.
  #
  # :: () -> ()
  register: ->
    | @name of all-tasks => throw task-exists-e this
    | otherwise          => all-tasks[@name] = this
}


#### λ
# A convenience for creating Task instances.
#
# :: String -> [String] -> String -> (Environment -> ()) -> Task
task = (name, deps, desc, fun) --> Task.make name, deps, desc, fun
  


### -- Exports ---------------------------------------------------------
module.exports = { Task, task, all-tasks, resolve }
