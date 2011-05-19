//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

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
var combineLists = function(a,b) { return b ? (b.slice(0,1) == "+" ? a+","+b.slice(1) : b) : a; };
var combineArrays = function(a,b) { return (a || []).concat(b || []); }

var doctype = {
  groups: {},
  attrs: {},
  rules: {},

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
    spec.rules = spec.rules || {};
    this.rules.call(each, function(name) {
      spec.rules[name] = combineArrays(this, spec.rules[name]);
    });
    spec.extend = this.extend;
    spec.compute = this.compute;
    spec.validate = this.validate;
    return spec;
  },
  
  compute: function() {
    if (!this.computed) {
      var doctype = this;
      doctype.tags.call(each, function(type) {
        doctype.tags[type] = this.call(makeMap);
      });
      
      doctype.attrs.filters.call(map, function() {
        var filter = this;
        var optional = doctype.attrs.tag.optional;
        if (filter.only) filter.only = filter.only.call(makeMap);
        if (filter.except) filter.except = filter.except.call(makeMap);
        optional.call(each, function(name) {
          if ((!filter.only || filter.only[name]) && (!filter.except || !filter.except[name])) optional[name] = this ? this+","+filter.attrs : filter.attrs;
        });
      });
      delete doctype.attrs.filters;
      doctype.attrs.tag.call(each, function(type) {
        this.call(each, function(name) {
          doctype.attrs.tag[type][name] = doctype.attrs.tag[type][name].call(makeMap);
        });
      });
      doctype.rules.sets.call(each, function() {
        this.call(map, function(index) {
          var item = this;
          this.call(each, function(name) {
            item[name] = this.call(makeMap);
          });
        });
      });
      doctype.computed = true;
    }
  },
  
  validate: function(doc) {
    var doctype = this;
    errors = [];
    console.log(doctype.rules);
    doctype.rules.rules.call(each, function(name) {
      var rule = this;
      doctype.rules.sets[name].call(map, function() {
        var set = this;
        errors = errors.concat(doctype.call(rule, set, doc).call(map, function() { return this.call(doctype.rules.messages[name], set); }));
      });
    });
    return errors;
  },
  
  ruleCode: {
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

var HTMLParser = function(html, handler, doctype) {
  var startTag = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /^<\/(\w+)[^>]*>/;
  var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var index, chars, match, stack = [], last = html;
  stack.last = function() { return this[this.length - 1]; };

  var parseStartTag = function(tag, tagName, rest, unary) {
    if (doctype.tags.block[tagName]) {
      while (stack.last() && doctype.tags.inline[stack.last()]) parseEndTag("", stack.last());
    }
    if (doctype.tags.unclosable[tagName] && stack.last() == tagName) parseEndTag("", tagName);
    unary = doctype.tags.unary[tagName] || !!unary;
    if (!unary) stack.push(tagName);
    if (handler.start) {
      var attrs = [];
      rest.replace(attr, function(match, name) {
        var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : "";
        attrs.push({
          name: name,
          value: value,
          escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') 
        });
      });
      if (handler.start) handler.start(tag, tagName, attrs, unary);
    }
  }

  var parseEndTag = function(tag, tagName) {
    // If no tag name is provided, clean shop
    if (!tagName) var pos = 0;
    // Find the closest opened tag of the same type
    else 
      for (var pos = stack.length - 1; pos >= 0; pos--) 
        if (stack[pos] == tagName) break;
    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if (handler.end) handler.end("", stack[i], i == pos);
      }
      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
  
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

/*
var doc = {name: 'root', children: [], all: []};
var line = 1;
var character = 1;
var current = doc;

HTMLParser(
  "<html>\r\n"+
  "  <head>\r\n"+
  "    <title> Hi!</title>\r\n"+
  "  </head>\r\n"+
  "  <body class='foo' id=\"bar\">\n"+
  "    <table><tr><td></td></tr></table>\n"+
  "    <select><optgroup><option></optgroup><option></option></select>\n"+
  "    <!--<p>Banana &</p>-->\n"+
  "    <div><img src='a' alt='a'></div>\n"+
  "  </body>\n"+
  "</html>", {
  start: function(html, tag, attrs, unary) {
    var newCurrent = {name: tag, attrs: attrs, parent: current};
    if (unary) newCurrent.unary = true;
    else newCurrent.children = [];
    newCurrent.line = line;
    line += (html.match(/(\r\n|\n|\r)/g) || []).length;
    current.children.push(newCurrent);
    doc.all.push(newCurrent);
    if (!unary) current = newCurrent;
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
}, strict);
*/

var spec = new html_401_spec(doctype);
console.log(spec);

//strict.compute();
//console.log(strict(doctype));
//console.log(strict.validate(doc));
//console.log(doc);

/*
//html must have xmlns=http://www.w3.org/1999/xhtml
*/