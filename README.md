io.filesystem
=============

[![Build Status](https://secure.travis-ci.org/folktale/io.filesystem.png?branch=master)](https://travis-ci.org/folktale/io.filesystem)
[![NPM version](https://badge.fury.io/js/io.filesystem.png)](http://badge.fury.io/js/io.filesystem)
[![Dependencies Status](https://david-dm.org/folktale/io.filesystem.png)](https://david-dm.org/folktale/io.filesystem)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


Monadic wrapper on Node's fs library


## Example

```js
( ... )
```


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install io.filesystem


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `io.filesystem.umd.js` file:

```js
var FileSystem = require('io.filesystem')
```


### Using with AMD

[Download the latest release][release], and require the `io.filesystem.umd.js`
file:

```js
require(['io.filesystem'], function(FileSystem) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `io.filesystem.umd.js`
file. The properties are exposed in the global `Folktale.IO.FileSystem` object:

```html
<script src="/path/to/io.filesystem.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/folktale/io.filesystem.git
    $ cd io.filesystem
    $ npm install
    $ make bundle
    
This will generate the `dist/io.filesystem.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/folktale/io.filesystem.git
    $ cd io.filesystem
    $ npm install
    $ make documentation

Then open the file `docs/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/folktale/io.filesystem/blob/master/LICENCE).

<!-- links -->
[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[Browserify]: http://browserify.org/
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://folktale.github.io/io.filesystem
<!-- [release: https://github.com/folktale/io.filesystem/releases/download/v$VERSION/io.filesystem-$VERSION.tar.gz] -->
[release]: https://github.com/folktale/io.filesystem/releases/download/v0.1.0/io.filesystem-0.1.0.tar.gz
<!-- [/release] -->
