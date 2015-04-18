// Copyright (c) 2014 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Monadic wrapper on Node's fs library
 *
 * @module io.filesystem
 * @summary FileSystem → IO.FileSystem
 */

var Future = require('data.future');
var curry  = require('core.lambda').curry;
var { filterM } = require('control.monads');
var { parallel } = require('control.async')(Future);
var adt    = require('adt-simple');
var path   = require('path');
var mv     = require('mv');


// -- Helpers ----------------------------------------------------------
var prepend = λ a b -> path.join(a, b);
var flatten = λ xs -> xs.reduce(λ[# +++ #], []);

// -- Implementation ---------------------------------------------------
module.exports = function(fs) {

  var exports = {};

  /**
   * @summary Directory | File | Junction
   */
  union LinkType {
    Directory,
    File,
    Junction
  } deriving (adt.Base);

  exports.LinkType = LinkType;

  
  /**
   * Tests if a path exists.
   *
   * @method
   * @summary Pathname → Future[Void, Boolean]
   */
  exports.exists = exists;
  function exists(p) {
    return new Future(function(reject, resolve) {
      fs.exists(p, function(a) {
        resolve(a)
      })
    })
  }
  
  
  /**
   * Renames a file.
   *
   * @method
   * @summary Pathname → Pathname → Future[Error, Void]
   */
  exports.rename = curry(2, rename);
  function rename(a, b) {
    return $liftF Future { fs.rename a, b }
  }
  
  
  /**
   * Changes the owner of an I-Node.
   *
   * @method
   * @summary Pathname → Number → Number → Future[Error, Void]
   */
  exports.changeOwner = curry(3, changeOwner);
  function changeOwner(p, owner, group) {
    return $liftF Future { fs.chown p, owner, group }
  }
  
  
  /**
   * Changes the mode of an I-Node.
   *
   * @method
   * @summary Pathname → Number → Future[Error, Void]
   */
  exports.changeMode = curry(2, changeMode);
  function changeMode(p, mode) {
    return $liftF Future { fs.chown p, mode }
  }
  
  
  /**
   * Creates a symbolic link.
   *
   * @method
   * @summary LinkType → Pathname → Pathname → Future[Error, Void]
   */
  exports.symlink = curry(3, symlink);
  function symlink(type, a, b) {
    return $liftF Future { fs.symlink a, b, renderType(type) };
  
    function renderType(a) {
      return match a {
        Directory => "dir",
        File      => "file",
        Junction  => "junction"
      }
    }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, α]
   */
  exports.readLink = readLink;
  function readLink(a) {
    return $liftF Future { fs.readlink a }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, Pathname]
   */
  exports.realPath = realPath;
  function realPath(a) {
    return $liftF Future { fs.realPath a }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, Stat]
   */
  exports.stat = stat;
  function stat(a) {
    return $liftF Future { fs.stat a }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, Boolean]
   */
  exports.isFile = isFile;
  function isFile(a) {
    return $do {
      stats <- stat(a);
      return stats.isFile()
    }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, Boolean]
   */
  exports.isDirectory = isDirectory;
  function isDirectory(a) {
    return $do {
      stats <- stat(a);
      return stats.isDirectory()
    }
  }
  
  
  /**
   * @method
   * @summary ReadOptions → Pathname → Future[Error, Buffer | String]
   */
  exports.read = curry(2, read);
  function read(options, a) {
    return $liftF Future { fs.readFile a, options }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, String]
   */
  exports.readAsText = exports.read({ encoding: 'utf8' });
  
  
  /**
   * @method
   * @summary Options → Pathname → String → Future[Error, Void]
   */
  exports.write = curry(3, write);
  function write(options, a, data) {
    return $liftF Future { fs.writeFile a, data, options }
  }
  
  
  /**
   * @method
   * @summary Pathname → String → Future[Error, Void]
   */
  exports.writeAsText = exports.write({ encoding: 'utf8' });
  
  
  /**
   * @method
   * @summary Options → Pathname → String → Future[Error, Void]
   */
  exports.append = curry(3, append);
  function append(options, a, data) {
    return $liftF Future { fs.appendFile a, data, options }
  }
  
  
  /**
   * @summary Pathname → Future[Error, Void]
   */
  function removeFile(a) {
    return $liftF Future { fs.unlink a }
  }
  
  /**
   * @summary Pathname → Future[Error, Void]
   */
  function removeDirectory(a) {
    return $liftF Future { fs.rmdir a }
  }
  
  /**
   * @method
   * @summary Pathname → Future[Error, Void]
   */
  exports.remove = remove
  function remove(a) {
    return $do {
      stats <- stat(a);
        stats.isFile()?       removeFile(a)
      : stats.isDirectory()?  removeDirectory(a)
      : /* otherwise */       Future.rejected(new Error("Can only remove files or directories"))
    }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Void, Error]
   */
  exports.makeDirectory = curry(2, makeDirectory);
  function makeDirectory(mode, a) {
    return $do {
      flag <- exists(path.join(a, '..'));
      if (flag) $do {
        mkdir(a)
      } else $do {
        makeDirectory(mode, path.join(a, '..'));
        makeDirectory(mode, a)
      }
    };

    function mkdir(a) {
      return $liftF Future { fs.mkdir a }
    }
  }
  
  
  /**
   * @method
   * @summary Pathname → Future[Error, Array[String]]
   */
  exports.listDirectory = listDirectory;
  function listDirectory(a) {
    return $liftF Future { fs.readdir a }
  }

  /**
   * @method
   * @summary Pathname → Future[Error, Array[String]]
   */
  exports.listDirectoryRecursively = listDirectoryRecursively;
  function listDirectoryRecursively(a) {
    return $do {
      contents <- listDirectory(a).map(λ[#.map(prepend(a))]);
      files <- filterM(Future, isFile, contents);
      dirs <- filterM(Future, isDirectory, contents);
      children <- parallel <| dirs.map(listDirectoryRecursively);
      return files.concat(flatten(children));
    }
  }


  /**
   * @method
   * @summary Pathname → Pathname → Future[Void, Error]
   */
  exports.move = curry(2, move);
  function move(a, b) {
    return $liftF Future { mv { clobber: true }, a, b }
  }


  return exports

}
