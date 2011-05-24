//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

function Clone() { }
function clone(obj) {
    Clone.prototype = obj;
    return new Clone();
}

Object.prototype.call = function(fn) { 
  var args = Array.prototype.slice.call(arguments); 
  args.shift(); 
  return fn.apply(this, args); 
};

var each = function(fn) {
  for(var i in this) {
    if (this.call(Object.hasOwnProperty, i)) {
      if (this[i] !== null && this[i] !== undefined) this[i].call(fn, i, this);
    }
  }
  return this;
};

var map = function(fn) {
  if (typeof(fn) == 'string') { 
    var attribute = fn;
    fn = function() {
      return this[attribute];
    }
  }
  var array = [];
  for (var i = 0; i < this.length; i++) {
    if (this[i]) array.push(this[i].call(fn, i));
  }
  return array;
};

var select = function(fn) {
  var array = [];
  for (var i = 0; i < this.length; i++) {
    if (this[i].call(fn, i)) array.push(this[i]);
  }
  return array;
};

var sum = function(){
  for (var i = 0, sum = 0; i < this.length; i++) sum += this[i];
  return sum;
}

var values = function() {
  var array = [];
  this.call(each, function() {
    array.push(this);
  });
  return array;
}

var keys = function() {
  var array = [];
  this.call(each, function(key) {
    array.push(key);
  });
  return array;
}

var merge = function(b) {
  var a = this;
  b.call(each, function(name) {
    a[name] = this;
  });
  return this;
};

var clone = function() {
  var obj = {};
  this.call(each, function(name) {
    obj[name] = this;
  });
  return obj;
};

var makeMap = function() {
  var array = this.split(",");
  var obj = {};
  for (var i = 0; i < array.length; i++) obj[array[i]] = true;
  return obj;
};

var englishList = function(separator) {
  return this.slice(0, this.length -1).join(", ")+(this.length > 1 ? (separator || " and ") : "")+(this[this.length - 1] || "");
};

var descendents = function(fn) { if (this.children) this.children.call(map, fn); };
var prepend = function(string) { return string + this; };
var inTag = function() { return "<"+this+">"; };
var combineLists = function(a,b) { return b ? (b.slice(0,1) == "+" ? a+","+b.slice(1) : b) : a.slice(0); };
var combineArrays = function(a,b) { return (a || []).concat(b || []); }
var addAttributes = function(array, b) { 
  var a = this;
  array.call(map, function() { a[this] = b[this]; }); 
}

var expandList = function(groups) {
  if (!this.indexOf) return this;
  var map = this.call(makeMap);
  map.call(each, function(name) {
    if (groups[name]) {
      delete map[name];
      map.call(merge, groups[name].call(expandList, groups));
    }
  });
  return map;
};

var doctype = {
  groups: {},
  attrs: {},
  rulesets: {},
  
  extend: function(spec) {
    this.groups.call(each, function(type) {
      spec.groups[type] = spec.groups[type] || {};
      this.call(each, function(group) {
        spec.groups[type][group] = combineLists(this, spec.groups[type][group]);
      });
    });
    spec.attrs = spec.attrs || {};
    this.attrs.call(each, function(type) {
      spec.attrs[type] = combineArrays(this, spec.attrs[type]);
    });
    spec.rulesets = spec.rulesets || {};
    this.rulesets.call(each, function(name) {
      spec.rulesets[name] = combineArrays(this.call(map, clone), spec.rulesets[name]);
    });
    spec.call(addAttributes, ['extend','compute','validate','rules'], this);
    return spec;
  },
  
  compute: function() {
    if (this.computed) return;
    this.computed = true;
    this.groups.call(each, function(type) {
      var groupType = this;
      this.call(each, function(group) {
        groupType[group] = this.call(expandList, groupType);
      });
    });
    var groups = this.groups;
    this.attrs.call(each, function() {
      this.call(map, function() {
        this.attrs = this.attrs.call(expandList, groups.attrs);
        if (this.include) this.include = this.include.call(expandList, groups.tags);
        if (this.exclude) this.exclude = this.exclude.call(expandList, groups.tags);
      });
    });
    this.rulesets.call(each, function(name) {
      this.call(map, function() {
        this.call(each, function(type, rule) {
          rule[type] = this.call(expandList, groups.tags);
        });
      });
    });
    var tags = this.groups.tags.all;
    tags.call(each, function(name) {
      tags[name] = {allowed_children: {}, allowed_parents: {}};
    });
    this.rulesets.allowed_children.call(map, function(i) {
      var children = this.children;
      this.tags.call(each, function(name) {
        children.call(each, function(childName) {
          tags[name].allowed_children[childName] = true;
          if (tags[childName]) tags[childName].allowed_parents[name] = true;
        });
      });
    });
  },
  
  validate: function(doc) {
    var doctype = this;
    errors = [];
    console.log(doctype.rules);
    doctype.rule_logic.rules.call(each, function(name) {
      var rule = this;
      doctype.rule_logic.rules.sets[name].call(map, function() {
        var set = this;
        errors = errors.concat(doctype.call(rule, set, doc).call(map, function() { return this.call(doctype.rule_logic.messages[name], set); }));
      });
    });
    return errors;
  },
  
  rule_logic: {
    attributes: {
      number: /^\s*[0-9]+\s*$/,
      length: /^\s*[0-9]+%?\s*/,
      multi_length: /^\s*[0-9]+[%*]?\s*/,
      name: /^\s*[a-z][a-z0-9-_:.]*\s*$/i,
      names: /^\s*(([a-z][a-z0-9-_:.]*)|\s+)+$/i
    },
    rules: {
      unique: function(set, document) {
        var matches = {};
        document.all.call(map, function() {
          var tag = this;
          set.tags.call(each, function(name) {
            matches[name] = matches[name] || {name: name, tags: []};
            if (tag.name == name) { matches[name].tags.push(tag); }
          });
        });
        return matches.call(values).call(select, function() { return this.tags.length > 1; });
      },
      
      not_empty: function(set, document) { 
        var matches = [];
        document.all.call(map, function() {
          if (set.tags[this.name] && (this.unary || this.children.call(select, function() { return this.name; }).length == 0))
            matches.push(this);
        });
        return matches;
      },
      
      has_parent: function(set, document) {
        var matches = [];
        document.all.call(map, function() {
          if (set.tags[this.name] && (!this.parent || !set.parents[this.parent.name])) matches.push(this);
        });
        return matches;
      },
      
      has_only_children: function() {},
      has_exact_children: function() {},
      has_first_child: function() {}
    },
    messages: {
      unique: function(set) { return this.name.call(inTag)+" tag must be unique, "+this.tags.length+" instances at "+this.tags.call(map, function() { return "line "+this.line; }).call(englishList); },
      not_empty: function(set) { return this.name.call(inTag)+" tag must not be empty, on line "+this.line; },
      has_parent: function(set) { return this.name.call(inTag)+" be a child of "+set.parents.call(keys).call(map, inTag).call(englishList, " or "); },
      has_only_children: function(set) {},
      has_exact_children: function(set) {},
      has_first_child: function(set) {}
    }
  }
};

var htmlParser = function(html, doctype, handler) {
  var startTag = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /^<\/(\w+)[^>]*>/;
  var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var index, chars, match, stack = [], last = html;
  stack.last = function() { return this[this.length - 1]; };

  var parseStartTag = function(tag, tagName, rest, unary) {
  //if block close all tags which are inline
    if (doctype.tags.block[tagName])
      while (stack.last() && doctype.tags.inline[stack.last()]) 
    parseEndTag("", stack.last());
    if (doctype.tags.unclosable[tagName] && stack.last() == tagName) parseEndTag("", tagName);
    unary = doctype.tags.unary[tagName] || !!unary;
    if (!unary) stack.push(tagName);
    if (handler.start) {
      var attrs = [];
      rest.replace(attr, function(match, name) {
        var value = arguments[2] || arguments[3] || arguments[4] || (fillAttrs[name] ? name : "");
        attrs.push({
          name: name,
          value: value,
          escaped: value.replace(/(^|[^\\])"/g, '$1\\\"')
        });
      });
      handler.start(tag, tagName, attrs, unary);
    }
  };

  var parseEndTag = function(tag, tagName) {
    if (!tagName) var pos = 0;
    else 
      for (var pos = stack.length - 1; pos >= 0; pos--)
        if (stack[pos] == tagName) break;
    if (pos >= 0) {
      for (var i = stack.length - 1; i >= pos; i--)
        if (handler.end) handler.end("", stack[i], i == pos);
      stack.length = pos;
    }
  };
  
  while (html) {
    chars = true;
    // Make sure we're not in a script or style element
    if (!stack.last() || !doctype.tags.cdata[stack.last()]) {
      if (html.indexOf("<!--") == 0) {
        index = html.indexOf("-->");
        if (index >= 0) {
          if (handler.comment) handler.comment(html.substring(0, index+3), html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }
      } else if (html.indexOf("</") == 0) {
        match = html.match(endTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(endTag, parseEndTag);
          chars = false;
        }
      } else if (html.indexOf("<") == 0) {
        match = html.match(startTag);
        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(startTag, parseStartTag);
          chars = false;
        }
      }
      if (chars) {
        index = html.indexOf("<");
        var text = index < 0 ? html : html.substring(0, index);
        html = index < 0 ? "" : html.substring(index);
        if (handler.chars) handler.chars(text);
      }
    } else {
      html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
        text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
        if (handler.chars) handler.chars(text);
        return "";
      });
      parseEndTag("", stack.last());
    }
    if (html == last) throw "Parse Error: " + html;
    last = html;
  }
  parseEndTag();
};

var parse = function(html, doctype) {
  var document = {name: '#root', children: [], all: []};
  var current = document;
  var line = 1;
  var character = 1;
  htmlParser(html, doctype, {
    start: function(html, tag, attrs, unary) {
      var tag = {name: tag, attrs: attrs, parent: current};
      if (unary) tag.unary = true;
      else tag.children = [];
      tag.line = line;
      line += (html.match(/(\r\n|\n|\r)/g) || []).length;
      current.children.push(tag);
      document.all.push(tag);
      if (!unary) current = tag;
    },
    end: function(html, tag, real) {
      if (real) current.closed = true;
      current = current.parent;
      line += (html.match(/(\r\n|\n|\r)/g) || []).length;
    },
    chars: function(text) {
      current.children.push({text: text, line: line});
      line += (text.match(/(\r\n|\n|\r)/g) || []).length;
    },
    comment: function(html, text) {
      current.children.push({comment: text, line: line});
      line += (html.match(/(\r\n|\n|\r)/g) || []).length;
    }
  });
  return document;
};

var html = "<html>\r\n"+
  "  <head>\r\n"+
  "    <title> Hi!</title>\r\n"+
  "  </head>\r\n"+
  "  <body class='foo' id=\"bar\">\n"+
  "    <table><tr><td></td></tr></table>\n"+
  "    <select><optgroup><option></optgroup><option></option></select>\n"+
  "    <!--<p>Banana &</p>-->\n"+
  "    <div><img src='a' alt='a'></div>\n"+
  "  </body>\n"+
  "</html>";

var spec = new html_401_spec(doctype);
spec.compute();
console.log(spec);
//console.log(parse(html, spec.transitional));

/*
//html must have xmlns=http://www.w3.org/1999/xhtml
*/