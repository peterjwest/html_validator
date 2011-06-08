//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

Object.prototype.call = function(fn) { 
  var args = Array.prototype.slice.call(arguments); 
  args.shift(); 
  return fn.apply(this, args); 
};

var each = function(fn) {
  for(var i in this)
    if (this.call(Object.hasOwnProperty, i))
      if (this[i] !== null && this[i] !== undefined) this[i].call(fn, i, this);
  return this;
};

var each2 = function(fn) {
  for(var i in this)
    if (this.call(Object.hasOwnProperty, i))
      if (this[i] !== null && this[i] !== undefined) this.call(fn, this[i], i, this);
  return this;
};

var map = function(fn, all) {
  if (typeof(fn) == 'string') var attrFn = function() { return this[fn]; };
  var array = [];
  for (var i = 0, obj; i < this.length; i++) {
    obj = this[i] !== undefined && this[i] !== null;
    if (obj || all) array.push((obj ? this[i] : false).call(attrFn || fn, i));
  }
  return array;
};

var get = function(key) { return function() { return this[key] }; };

var select = function(fn) {
  var array = [];
  this.call(map, function(i) { if (this.call(fn, i)) array.push(this); })
  return array;
};

var sum = function(){
  for (var i = 0, sum = 0; i < this.length; i++) sum += this[i];
  return sum;
};

var mapEach = function(fn) {
  var array = [];
  this.call(each, function(name) { array.push(this.call(fn, name)); });
  return array;
};

var values = function() { return this.call(mapEach, function() { return this; }); };
var keys = function() { return this.call(mapEach, function(key) { return key; }); };

var merge = function(b) {
  var a = this;
  b.call(each, function(name) { a[name] = this; });
  return this;
};

var clone = function() {
  var obj = {};
  this.call(each, function(name) { obj[name] = this; });
  return obj;
};

var makeMap = function() {
  var obj = {};
  this.call(map, function(i) { obj[this] = i+1 });
  return obj;
};

var draw = function(indent) {
  var text = "";
  if (this.unopened) text += (indent||"")+"</"+this.name+">\n";
  else {
    text += (indent||"")+(this.implicit ? "{<"+this.name+">}" : "<"+this.name+">")+"\n";
    if (this.children) text += this.children.call(map, function() { return this.call(draw, (indent||"")+"  "); }).join("");
    if (!this.unary && !this.selfClosed) text += (indent||"")+(this.closed ? "</"+this.name+">\n" : "{</"+this.name+">}\n");
  }
  return text;
};

var reassemble = function() {
  var html = "";
  if (this.html) html += this.html;
  if (this.children) html += this.children.call(map, function() { return this.call(reassemble); }).join("");
  if (this.endHtml) html += this.endHtml;
  return html;
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
  var map = this.split(",").call(makeMap);
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
          tags[parentName].implicit_children[(tags[parentName].exact_children || tags[parentName].ordered_children)[name]] = name;
        });
      }
    });
  },
  
  validate: function(doc) {
    var doctype = this;
    errors = [];
    doctype.rules.rules.call(each2, function(rule, name) {
      if (doctype.rulesets[name]) {
        doctype.rulesets[name].call(map, function() {
          var set = this;
          errors = errors.concat(doctype.call(rule, set, doc).call(map, function() { return this.call(doctype.rules.messages[name], set); }));
        });
      }
    });
    return errors;
  },
  
  rules: {
    attributes: {
      number: /^\s*[0-9]+\s*$/,
      length: /^\s*[0-9]+%?\s*/,
      multi_length: /^\s*[0-9]+[%*]?\s*/,
      name: /^\s*[a-z][a-z0-9-_:.]*\s*$/i,
      names: /^\s*(([a-z][a-z0-9-_:.]*)|\s+)+$/i
    },
    rules: {
      allowed_children: function(set, doc) {
        var errors = [];
        doc.all.call(map, function() {
          var tag = this;
          if (set.tags[tag.name]) {
            tag.children.call(map, function() {
              if (!set.innerTags[this.name]) errors.push({parent: tag, child: this});
            });
          }
        });
        return errors;
      },
      /*allowed_descendents: function() {},
      banned_descendents: function() {},
      exact_children: function() {},
      exclusive_children: function() {},
      ordered_children: function() {},
      required_first_child: function() {},
      required_either_child: function() {},*/
      required_children: function(set, doc) {
        var errors = [];
        doc.all.call(map, function() {
          var tag = this;
          if (set.tags[tag.name]) {
            set.innerTags.call(each, function(innerTag) {
              var count = 0;
              tag.children.call(map, function() {
                if (this.name == innerTag) count++;
              });
              if (count < 1) errors.push({parent: tag, child: innerTag, count: count});
            });
          }
        });
        return errors;
      },
      unique_children: function(set, doc) {
        var errors = [];
        doc.all.call(map, function() {
          var tag = this;
          if (set.tags[tag.name]) {
            set.innerTags.call(each, function(innerTag) {
              var count = 0;
              tag.children.call(map, function() {
                if (this.name == innerTag) count++;
              });
              if (count > 1) errors.push({parent: tag, child: innerTag, count: count});
            });
          }
        });
        return errors;
      }
    },
    messages: {
      allowed_children: function(set) {
        return this.parent.name.call(inTag)+" can't contain "+this.child.name.call(inTag);
      },
      /*allowed_descendents: function() {},
      banned_descendents: function() {},
      exact_children: function() {},
      exclusive_children: function() {},
      ordered_children: function() {},
      required_first_child: function() {},
      required_either_child: function() {},*/
      required_children: function(set) {
        return this.parent.name.call(inTag)+" must contain "+this.child.call(inTag);
      },
      unique_children: function(set) {
        return this.parent.name.call(inTag)+" can't contain more than one "+this.child.call(inTag)+", found "+this.count;
      }
    }
  }
};

var i = 0;

var htmlParser = function(html, doctype) {
  var startTag = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
  var endTag = /<\/(\w+)[^>]*>/;
  var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var doc = {name: '#root', children: [], all: []};
  var index, match, endedTag, lastHtml = html, current = doc;
  var newlines = function() { return (this.match(/(\r\n|\n|\r)/g) || []).length; };
  var stack = function() { return this.parent ? this.parent.call(stack).concat([this]) : [this]; };
  var depth = function(tag) { return current.call(stack).call(map, "name").call(makeMap)[tag] - 1; };
  var min = function() { return Math.min.apply({}, this); }
  var last = function() { return this[this.length - 1]; };
  
  var htmlChildren = function() { 
    return this.children.call(select, function() { return this.name != "#text" && this.name != "#comment"; }); 
  };
  
  var allowedDescendents = function() {
    var obj = {}, descendents;
    this.call(stack).call(map, function() { 
      if (descendents = doctype.tags[this.name].allowedDescendents) obj.call(merge, descendents);  });
    return obj;
  };
  
  var parseStartTag = function(html, tag, rest, selfClosed) {
    var prev = current.call(htmlChildren).call(last);
    if (doctype.tags[current.name] && doctype.tags[current.name].implicit_children) {
      var implicit = false;
      doctype.tags[current.name].implicit_children.call(each, function(position) {
        if (implicit) return;
        if (doctype.tags[current.name].exact_children) {
          if (this != tag && current.call(htmlChildren).length + 1 == position) {
            implicit = this;
          }
        }
        else if (doctype.tags[current.name].ordered_children) {
          var orderedChildren = doctype.tags[current.name].ordered_children;
          var children = current.call(htmlChildren);
          var invalidBeforeTags = children.call(select, function() { return orderedChildren[this] > position; }).length;
          if (invalidBeforeTags == 0 && (!orderedChildren[tag] || orderedChildren[tag] > position)) {
            implicit = this;
          }
        }
      });
      if (implicit && (!prev || prev.name+"" != implicit || !prev.implicit)) {
        var element = {name: implicit, implicit: true, attrs: [], parent: current, unary: false, children: [], html: ''};
        current.children.push(element);
        doc.all.push(element);
        current = element;
        return parseStartTag(html, tag, rest, selfClosed);
      }
    }
    
    if (doctype.groups.tags.close_optional[current.name]) {
      if (!doctype.tags[current.name].allowed_children[tag] && !current.call(allowedDescendents)[tag]) {
        parseEndTag("", current.name);
        return parseStartTag(html, tag, rest, selfClosed);
      }
    }

    //abstract for xhtml
    var unary = doctype.groups.tags.unary[tag];
    
    var attrs = [];
    rest.replace(attr, function(match, name) {
      //replace self_value with element's computed attributes which can have no value
      var value = arguments[2] || arguments[3] || arguments[4] || (doctype.groups.attrs.self_value[name] ? name : "");
      attrs.push({ name: name, value: value, escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') });
    });
    var element = { name: tag, implicit: !html, attrs: attrs, parent: current, unary: unary, selfClosed: !!selfClosed, children: [], html: html };
    current.children.push(element);
    doc.all.push(element);
    if (!unary) current = element;
  };
  
  var parseEndTag = function(html, tag) {
    var index = tag ? current.call(depth, tag) : 0;
    var endedTags = index >= 0 ? current.call(stack).slice(index) : [];
    if (endedTags.length > 0) {
      endedTags.call(each, function() {
        var tag = this;
        if (doctype.tags[tag.name].implicit_children) {
          doctype.tags[tag.name].implicit_children.call(each, function() {
            var implicit = this;
            if (tag.children.call(select, function() { return this.name+"" == implicit; }).length == 0)
              tag.children.push({ name: implicit, implicit: true, children: [], parent: tag, html: '' });
          });
        }
      });
      var endedTag = endedTags[0];
      if (html) { 
        endedTag.closed = true;
        endedTag.endHtml = html;
      }
      current = endedTag.parent;
    }
    else if (doctype.tags[current.name].implicit_children.call(values).call(makeMap)[tag]) {
      parseStartTag("", tag, "", false);
      return parseEndTag(html, tag);
    }
    else { 
      var element = {name: tag, unopened: true, endHtml: html};
      current.children.push(element);
      doc.all.push(element);
    }
  };
 
  while (html) {
    if (current && doctype.groups.tags.cdata_elements[current.name]) {
      //removed "[^>]*" from regex end, need to check
      html = html.replace(new RegExp("(.*)<\/"+current.name+">"), function(all, text) {
        //need more robust solution, and logging of whether cdata tag is used
        text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
        current.children.push({name: '#text', value: text, unary: true, html: all});
        return "";
      });
      parseEndTag("", current.name);
    } 
    else if (html.indexOf("<!--") == 0) {
      //parse end of comment
      //add html to tag
      current.children.push({name: "#comment", value: html.substring(4, index), html: ''});
      html = html.substring(index + 3);
    }
    else if (html.search(endTag) == 0) {
      match = html.match(endTag);
      html = html.substring(match[0].length);
      match[0].replace(endTag, parseEndTag);
    }
    else if (html.search(startTag) == 0) {
      match = html.match(startTag);
      html = html.substring(match[0].length);
      match[0].replace(startTag, parseStartTag);
    }
    else {
      var matches = [html.search(startTag), html.search(endTag), html.indexOf("<!--")];
      index = (matches.call(select, function() { return this >= 0; }) || []).call(min);
      var text = index < 0 ? html : html.substring(0, index);
      current.children.push({name: '#text', value: text, html: text, unary: true});
      html = index < 0 ? "" : html.substring(index);
    }
    if (html == lastHtml) throw "Parse Error: " + html;
    lastHtml = html;
  }
  parseEndTag("");
  return doc;
};

var html = "<meta/><title> Hi!\n</title><title> Hi!\n</title>\n</head>\n<form><fieldset><legend></legend><legend></legend></fieldset></form><table>\n<col>\n<tfoot><tr><td></tfoot>\n<img>\n</tbody></table><table></table>\n</html>";
var html = "<head></head>\n<form><fieldset></fieldset><fieldset><legend></legend><legend></legend></fieldset></form><table>\n<col>\n<tfoot><tr><td></tfoot>\n<img>\n</tbody></table><table></table>\n</html>";
var spec = new html_401_spec(doctype);
spec.compute();
var doc = htmlParser(html, spec.transitional);
console.log(spec);
console.log(doc);
console.log(doc.call(draw));
console.log(spec.transitional.validate(doc));