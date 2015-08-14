'use strict';

var fs = require('fs');
var dependencies = require('./lib/dependencies.js');
var internals = require('./lib/internals.js');
var source = {};
fs.readdirSync(__dirname + '/lib').forEach(function (filename) {
  if (filename !== 'dependencies.js' && filename !== 'internals.js') {
    source[filename.replace(/\.js$/, '')] = fs.readFileSync(__dirname + '/lib/' + filename, 'utf8');
  }
});

module.exports = build;

function build(functions) {
  var fns = [];
  functions = functions.filter(function (fn) {
    return !internals[fn];
  });
  for (var i = 0; i < functions.length; i++) {
    if (fns.indexOf(functions[i]) === -1) {
      fns.push(functions[i]);
      functions.push.apply(functions, dependencies[functions[i]]);
    }
  }
  return fns.sort().map(function (name) {
    return source[name];
  }).join('\n');
}
