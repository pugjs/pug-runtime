'use strict';

var fs = require('fs');
var uglify = require('uglify-js');

var source = fs.readFileSync(__dirname + '/index.js', 'utf8');
var ast = uglify.parse(source);

var dependencies = {};
ast.body.forEach(function (node) {
  if (node.TYPE === 'Defun') {
    var name = node.name.name;
    if (!/^jade\_/.test(name)) return;
    name = name.replace(/^jade\_/, '');
    var src = uglify.minify(source.substring(node.start.pos, node.end.endpos), {fromString: true}).code;
    var ast = uglify.parse(src);
    ast.figure_out_scope();
    console.dir(name);
    var globals = ast.globals.map(function (val, key) {
      return key;
    });
    dependencies[name] = globals.filter(function (key) { return /^jade\_/.test(key); })
                                .map(function (key) { return key.replace(/^jade\_/, ''); });
    fs.writeFileSync(__dirname + '/lib/' + name + '.js', src);
  } else if (node.TYPE === 'Var') {
    var name = node.definitions[0].name.name;
    if (!/^jade\_/.test(name)) return;
    name = name.replace(/^jade\_/, '');
    var src = uglify.minify(source.substring(node.start.pos, node.end.endpos), {fromString: true}).code;
    dependencies[name] = [];
    fs.writeFileSync(__dirname + '/lib/' + name + '.js', src);
  }
});

fs.writeFileSync(__dirname + '/lib/dependencies.js', 'module.exports = ' + JSON.stringify(dependencies));
