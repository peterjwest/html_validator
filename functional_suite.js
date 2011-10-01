//Javascript Functional Suite by Peter West
//This suite relies on one protoypal change which allows functions be called as methods.
//http://www.extended-gameplay.com/#/title+Flipped_call()_method_in_Javascript/

Object.prototype.call = function(fn) { return fn.apply(this, Array.prototype.slice.call(arguments, 1)); };

var shifted = function(args) { return Array.prototype.slice.call(args, 1); };
var values = function() { return this.call(each, function(item) { return item; }); };
var keys = function() { return this.call(each, function(item, key) { return key; }); };
var method = function(obj, key, fn) { return fn.apply(obj, Array.prototype.slice.call(arguments, 3)); };
var get = function(item, key, attr) { return item[attr] }; 
var numbered = function(item, i) {  return i + 1; };

var each = function(fn) {
  var array = [];
  for (var i in this) if (this.call(Object.hasOwnProperty, i))
    array.push(fn.apply(this, [this[i], i].concat(shifted(arguments))));
  return array;
};

var map = function(fn) {
  var array = [];
  for (var i = 0, obj; i < this.length; i++)
    array.push(fn.apply(this, [this[i], i].concat(shifted(arguments))));
  return array;
};

var select = function(fn) {
  var array = [];
  var mapping = function(item, i) { if (fn.apply(this, arguments)) array.push(item); };
  map.apply(this, [mapping].concat(shifted(arguments)));
  return array;
};

var merge = function(b) {
  var a = this;
  b.call(each, function(item, name) { a[name] = item; });
  return this;
};

var clone = function(attrs) {
  attrs = attrs || this.call(keys);
  var clone = {};
  var original = this;
  attrs.call(map, function(attr) { clone[attr] = original[attr]; });
  return clone;
};

var hash = function(fn) {
  var obj = {};
  this.call(map, function(item, i) { obj[item] = fn ? fn(item, i) : true; });
  return obj;
};