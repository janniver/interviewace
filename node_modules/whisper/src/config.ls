## Module config #######################################################
#
# Loads and manages `.whisper` configuration files.
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
fs         = require 'fs'
path       = require 'path'
log        = require './log'

### -- Interfaces ------------------------------------------------------

#### type Config
# The structure all configuration modules have to adhere to.
#
# :: Environment -> ()


### -- Helpers ---------------------------------------------------------

#### Data home
# The home directory for the current user.
#
# :: String
home = let env = process.env
       switch process.platform
       | \win32    => env.USERPROFILE or (env.HOMEDRIVE + env.HOMEPATH)
       | otherwise => env.HOME

#### λ read
# Reads the contents of a file as text.
#
# :: String -> String
read = (name) -> fs.read-file-sync name, 'utf-8'


#### λ read-json
# Reads the contents of a file as JSON.
#
# :: String -> a
read-json = JSON.parse . read


#### λ exists-p
# Checks if a file exists.
#
# :: String -> Bool
exists-p = fs.exists-sync


#### λ callable-p
# Checks if something is callable.
#
# :: a -> Bool
callable-p = -> typeof it is 'function'


#### λ root-p
# Checks if a given directory is the root directory.
#
# :: String -> Bool
root-p = (dir) -> (path.resolve dir) is (path.resolve '/')



### -- Finding configuration files -------------------------------------

#### λ find-local-config
# Finds the local `.whisper` configuration file for the project.
#
# :: String -> Maybe String
find-local-config = (dir, initial=dir) ->
  whisper-file = path.resolve dir, '.whisper'
  dir-above    = path.resolve dir, '..'

  switch
  | exists-p whisper-file => whisper-file
  | root-p dir-above      => null
  | otherwise             => find-local-config dir-above, initial


#### λ find-root-config
# Finds the root `.whisper` configuration file for the user.
#
# :: () -> Maybe String
find-root-config = ->
  whisper-dir  = path.resolve home, '.whisper.d', '.whisper'
  whisper-file = path.resolve home, '.whisper'

  switch
  | exists-p whisper-dir  => whisper-dir
  | exists-p whisper-file => whisper-file
  | otherwise             => null


#### λ find-config
# Returns a list of the configuration files to load.
#
# :: String -> [String]
find-config = (dir) ->
  [find-root-config!, find-local-config dir].filter Boolean


### -- Loading configuration files -------------------------------------

#### λ load-single-config
# Loads a single configuration file.
#
# :: String -> Config
load-single-config = (name) ->
  module = require name
  if not callable-p module
    log.fatal "The configuration file \"#name\" doesn\'t export the 
               expected configuration interface `Whisper -> ()`"
  module


#### λ load-config
# Loads all configuration files for the current directory.
#
# :: String -> [Config]
load-config = (dir) ->
  (find-config dir).map load-single-config


### -- Loading package configuration -----------------------------------

#### λ package-from-whisper
# Returns a `package.json` file for a `.whisper` file.
#
# :: String -> { String -> a }
package-from-whisper = (name) ->
  path.resolve name, '..', 'package.json'


#### λ find-root-package
# Returns the root `package.json` if it exists.
#
# :: String -> Maybe String
find-root-package = ->
  file = path.resolve home, '.whisper.d', 'package.json'
  switch
  | exists-p file => file
  | otherwise     => null


#### λ find-local-package
# Returns the local `package.json` if it exists.
#
# :: String -> Maybe String
find-local-package = (dir) ->
  local = find-local-config dir
  pkg   = package-from-whisper local
  switch
  | local                   => (exists-p pkg) and pkg
  | exists-p 'package.json' => path.resolve 'package.json'
  | otherwise               => null


#### λ find-packages
# Returns a list of `package.json` files.
#
# :: String -> [Maybe String]
find-packages = (dir) ->
  [find-root-package!, find-local-package dir].filter Boolean


#### λ load-single-package-config
# Tries to loads a single `package.json` file.
#
# :: String -> Maybe { String -> a }
load-single-package-config = (name) ->
  | exists-p name => read-json name
  | otherwise     => null


#### λ load-package-config
# Loads all `package.json` configuration for the .whisper files.
#
# :: String -> [{ String -> a }]
load-package-config = (dir) ->
  (find-packages dir).map load-single-package-config


#### λ whisper-config
# Extracts the whisper configuration from an object
#
# :: { String -> a } -> Maybe { String -> a }
whisper-config = (config) -> config.whisper or {}



### -- Exports ---------------------------------------------------------
module.exports = {
  home

  # Finding configuration files
  find-local-config, find-root-config, find-config

  # Loading configuration files
  load-single-config, load-config

  # Loading package.json files
  load-single-package-config, load-package-config, whisper-config
}
