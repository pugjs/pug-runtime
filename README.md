# jade-runtime

The runtime components for the jade templating language

[![Build Status](https://img.shields.io/travis/jadejs/jade-runtime/master.svg)](https://travis-ci.org/jadejs/jade-runtime)
[![Dependency Status](https://img.shields.io/gemnasium/jadejs/jade-runtime.svg)](https://gemnasium.com/jadejs/jade-runtime)
[![NPM version](https://img.shields.io/npm/v/jade-runtime.svg)](https://www.npmjs.org/package/jade-runtime)

## Installation

    npm install jade-runtime

## Usage


You can call runtime methods directly using `runtime.method`.  This is particularly useful when compiling to deal with things that are already known at compile time.

```js
var runtime = require('jade-runtime');

assert(runtime.attr('foo', 'bar', true, true) === ' foo="bar"');
```

You can also build a string with a given list of functions available as `jade_method` by calling `build(arrayOfMethods)`.  This is useful for inlining runtime functions within the compiled templates.

```js
var build = require('jade-runtime/build');
var src = build(['attr']);

var attr = Function('', src + ';return jade_attr;')();
assert(attr('foo', 'bar', true, true) === ' foo="bar"');
```


## License

  MIT
