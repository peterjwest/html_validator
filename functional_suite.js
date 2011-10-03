//Javascript Functional Suite by Peter West
//This suite relies on one protoypal change which allows functions be called as methods.
//http://www.extended-gameplay.com/#/title+Flipped_call()_method_in_Javascript/

var shifted = function(args) { return Array.prototype.slice.call(args, 1); };
Object.prototype.call = function(fn) { return fn.apply(this, shifted(arguments)); };

var values = function() { return this.call(each, function(item) { return item; }); };
var keys = function() { return this.call(each, function(item, key) { return key; }); };
var method = function(obj, key, fn) { return fn.apply(obj, Array.prototype.slice.call(arguments, 3)); };
var get = function(item, key, attr) { return item[attr] }; 
var numbered = function(item, i) {  return i + 1; };
var min = function() { return Math.min.apply({}, this); };
var max = function() { return Math.max.apply({}, this); };
var last = function() { return this[this.length - 1]; };
var is = function(findClass, obj) { return getClass(obj) === findClass; };

var getClass = function(obj) { 
  return obj !== undefined && obj !== null && Object.prototype.toString.call(obj).slice(8, -1); 
};

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

var sum = function() {
  var total = 0;
  this.call(map, function(item) { total += item; });
  return total;
};


