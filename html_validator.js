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
  for (var i = 0; i < array.length; i++) obj[array[i]] = i+1;
  return obj;
};

var draw = function(indent) {
  var text = "";
  if (this.name) {
   text += (indent||"")+"<"+this.name+">\n";
   if (this.children) text += this.children.call(map, function() { return this.call(draw, (indent||"")+"  "); }).join("");
   text += (indent||"")+"</"+this.name+">\n";
  }
  return text;
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
    var value = this;
    if (groups[name]) {
      delete map[name];
      map.call(merge, groups[name].call(expandList, groups).call(each, function(tag, group) { group[tag] = value; }));
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
          rule[type] = this.call(expandList, groups.tags, true);
        });
      });
    });
    var tags = this.tags = this.groups.tags.all.call(clone);
    tags.call(each, function(name) {
      tags[name] = {};
    });
    this.rulesets.call(each, function(ruleName) {
      this.call(map, function(i) {
        var innerTags = this.innerTags;
        this.tags.call(each, function(name) {
          tags[name][ruleName] = tags[name][ruleName] || {};
          innerTags.call(each, function(childName) {
            tags[name][ruleName][childName] = this;
            if (ruleName == "allowed_children" && tags[childName]) {
              tags[childName].allowed_parents = tags[childName].allowed_parents || {};
              tags[childName].allowed_parents[name] = true;
            }
          });
        });
      });
    });

    this.groups.tags.implicit.call(each, function(name) {
      if (tags[name].allowed_parents) {
        tags[name].allowed_parents.call(each, function(parentName) {
          tags[parentName].implicit_children = tags[parentName].implicit_children || {};
          tags[parentName].implicit_children[name] = true;
        });
      }
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
    ordered: {
      
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

  //need to allow for children from implicit tags
  var parseStartTag = function(tag, tagName, rest, selfClosed) {
    if (doctype.groups.tags.close_optional[stack.last()]) {
      if (!doctype.tags[stack.last()].allowed_children[tagName]) parseEndTag("", stack.last());
    }
    
    //abstract for xhtml
    var unary = doctype.groups.tags.unary[tagName] || selfClosed;
    if (!unary) stack.push(tagName);
    
    var attrs = [];
    rest.replace(attr, function(match, name) {
      var value = arguments[2] || arguments[3] || arguments[4] || (fillAttrs[name] ? name : "");
      attrs.push({ name: name, value: value, escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') });
    });
    handler.start(tag, tagName, attrs, unary);
  };

  var parseEndTag = function(tag, tagName) {
    if (tagName) { for (var pos = stack.length - 1; pos >= 0; pos--) if (stack[pos] == tagName) break; }
    else { var pos = 0; }
    if (pos >= 0) {
      for (var i = stack.length - 1; i >= pos; i--) handler.end(tag, tagName, i == pos, true);
      stack.length = pos;
    }
    else if (tagName) {
      handler.end(tag, tagName, true, false);
    }
  };
  
  while (html) {
    chars = true;
    if (stack.last() && doctype.groups.tags.cdata_elements[stack.last()]) {
      //check out end of this regex [^>]* ???
      html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
        //need more robust solution, and logging of whether cdata tag is used
        text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
        handler.chars(text);
        return "";
      });
      parseEndTag("", stack.last());
    } 
    else {
      if (html.indexOf("<!--") == 0 && (index = html.indexOf("-->")) >= 0) {
        handler.comment(html.substring(0, index+3), html.substring(4, index));
        html = html.substring(index + 3);
      } 
      else if (html.indexOf("</") == 0 && (match = html.match(endTag))) {
        html = html.substring(match[0].length);
        match[0].replace(endTag, parseEndTag);
      } 
      else if (html.indexOf("<") == 0 && (match = html.match(startTag))) {
        html = html.substring(match[0].length);
        match[0].replace(startTag, parseStartTag);
      }
      else {
        index = html.indexOf("<");
        handler.chars(index < 0 ? html : html.substring(0, index));
        html = index < 0 ? "" : html.substring(index);
      }
    }
    if (html == last) throw "Parse Error: " + html;
    last = html;
  }
  parseEndTag("");
};

var parse = function(html, doctype) {
  var document = {name: '#root', children: [], all: []};
  var current = document;
  var newlines = function() { return (this.match(/(\r\n|\n|\r)/g) || []).length; };
  var line = 1;
  var character = 1;
  
  htmlParser(html, doctype, {
    start: function(html, tag, attrs, unary) {
      var tag = {name: tag, attrs: attrs, parent: current};
      if (unary) tag.unary = true;
      else tag.children = [];
      tag.line = line;
      line += html.call(newlines);
      current.children.push(tag);
      document.all.push(tag);
      if (!unary) current = tag;
    },
    end: function(html, tag, real, started) {
      if (started) {
        if (real) current.closed = true;
        current = current.parent;
      }
      else {
        //console.log("unstarted "+tag);
      }
      line += html.call(newlines);
    },
    chars: function(text) {
      current.children.push({text: text, line: line});
      line += html.call(newlines);
    },
    comment: function(html, text) {
      current.children.push({comment: text, line: line});
      line += html.call(newlines);
    }
  });
  return document;
};

var html = "<html>\r\n"+
  "    <head>"+
  "    <title> Hi!</title>\r\n"+
  "    </head>"+
  "    <body>"+
  "    <table><tr><td><p>hi</tbody></table>"+
  "</html>";

var spec = new html_401_spec(doctype);
spec.compute();
console.log(spec);
var tree = parse(html, spec.transitional);
console.log(tree);
console.log(tree.call(draw));