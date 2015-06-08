'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = jade_merge;
function jade_merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = jade_merge(attrs, a[i]);
    }
    return attrs;
  }

  for (var key in b) {
    if (key === 'class') {
      var ac = a[key] || [];
      a[key] = (Array.isArray(ac) ? ac : [ac]).concat(b[key] || []);
    } else if (key === 'style') {
      a[key] = jade_style(a[key]);
      b[key] = jade_style(b[key]);
      a[key] = a[key] + (a[key] && b[key] && ';') + b[key];
    } else {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.classes = jade_classes;
function jade_classes(val, escaping) {
  if (Array.isArray(val) && Array.isArray(escaping)) {
    return jade_classes(val.map(jade_classes).map(function (cls, i) {
      return escaping[i] ? jade_escape(cls) : cls;
    }));
  }
  return (Array.isArray(val) ? val.map(jade_classes) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(Boolean).join(' ');
}

exports.style = jade_style;
function jade_style(val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return ('' + (val || '')).replace(/\;$/, '');
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = jade_attr;
function jade_attr(key, val, escaped, terse) {
  if ((key === 'class' || key === 'style') && !val) return '';
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  }
  if (val && typeof val.toISOString === 'function') {
    val = val.toISOString();
  } else if (typeof val !== 'string') {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return ' ' + key + '=\'' + val.replace(/'/g, '&apos;') + '\'';
    }
  }
  if (escaped) {
    return ' ' + key + '="' + jade_escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = jade_attrs;
function jade_attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i]
      , val = obj[key];

    if ('class' == key) {
      val = jade_classes(val);
    }
    if ('style' === key) {
      val = jade_style(val);
    }
    buf.push(jade_attr(key, val, false, terse));
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var ENCODE_HTML_RULES = {
    '&': '&amp;'
  , '<': '&lt;'
  , '>': '&gt;'
  , '"': '&quot;'
  }
, MATCH_HTML = /[&<>"]/g;

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(MATCH_HTML, function(m) {
    return ENCODE_HTML_RULES[m] || m;
  });
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = jade_rethrow;
function jade_rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    jade_rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};
