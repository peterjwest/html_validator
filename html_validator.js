//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

(function($){
  $.fn.outerHtml = function() {
    console.log(this.length);
    if (this.length == 0) return false;
    var elem = this[0], name = elem.tagName.toLowerCase();
    var attrs = $.map(elem.attributes, function(i) { return i.name+'="'+i.value+'"'; }); 
    return "<"+name+(attrs.length > 0 ? " "+attrs.join(" ") : "")+">"+elem.innerHTML+"</"+name+">";
  };

  var each = function(fn) {
    for(var i in this) if (this.call(Object.hasOwnProperty, i)) this.call(fn, this[i], i, this);
    return this;
  };

  var map = function(fn) {
    var array = [];
    for (var i = 0, obj; i < this.length; i++) {
      array.push(fn.apply(this, [this[i], i].concat(Array.prototype.slice.call(arguments).slice(1))));
    }
    return array;
  };

  var get = function(item, key, attr) { return item[attr] };
  var method = function(obj, key, fn) { return fn.apply(obj, Array.prototype.slice.call(arguments, 3)); };
  var sum = function(){ for (var i = 0, sum = 0; i < this.length; i++) sum += this[i]; return sum; };
  var values = function() { return this.call(mapEach, function(item) { return item; }); };
  var keys = function() { return this.call(mapEach, function(item, key) { return key; }); };
  var isString = function(item) { return item !== undefined && item !== null && item.substr; };

  var select = function(fn) {
    var array = [];
    this.call(map, function(item, i) { if (fn.apply(item, arguments)) array.push(item); })
    return array;
  };

  var mapEach = function(fn) {
    var array = [];
    this.call(each, function(item, name) { array.push({}.call(fn, item, name)); });
    return array;
  };

  var merge = function(b) {
    var a = this;
    b.call(each, function(item, name) { a[name] = item; });
    return this;
  };

  var clone = function() {
    var obj = {};
    this.call(each, function(item, name) { obj[name] = item; });
    return obj;
  };

  var groupUnique = function() {
    var last, different;
    return this.call(select, function(item) { different = last != item; last = item; return different; });
  };

  var makeMap = function() {
    var obj = {};
    this.call(map, function(item, i) { obj[item] = i + 1; });
    return obj;
  };

  var draw = function(indent) {
    var text = "";
    if (this.unopened) text += (indent||"")+"</"+this.name+">\n";
    else {
      text += (indent||"")+(this.implicit ? "{<"+this.name+">}" : "<"+this.name+">")+"\n";
      if (this.children) {
        text += this.children.call(map, function(child) { return child.call(draw, (indent||"")+"  "); }).join("");
      }
      if (!this.unary && !this.selfClosed) {
        text += (indent||"")+(this.closed ? "</"+this.name+">\n" : "{</"+this.name+">}\n");
      }
    }
    return text;
  };

  var reassemble = function() {
    var html = "";
    if (this.html) html += this.html;
    if (this.children) html += this.children.call(map, function(child) { return child.call(reassemble); }).join("");
    if (this.endHtml) html += this.endHtml;
    return html;
  };

  var englishList = function(separator) {
    return [
      this.slice(0, this.length -1).join(", "),
      this.length > 1 ? (separator || " and ") : "",
      this[this.length - 1] || ""
    ].join("")
  };

  var stack = function() { return this.parent ? this.parent.call(stack).concat([this]) : [this]; };
  var inTag = function() { return "<"+this+">"; };
  var inQuote = function() { return "'"+this+"'"; };
  var combineLists = function(a,b) { return b ? (b.slice(0,1) == "+" ? a+","+b.slice(1) : b) : a.slice(0); };
  var combineArrays = function(a,b) { return (a || []).concat(b || []); }

  var addAttributes = function(array, b) { 
    var a = this;
    array.call(map, function(item) { a[item] = b[item]; }); 
  }

  var htmlTags = function() { 
    return this.call(select, function(tag) { return tag.name != "#text" && tag.name != "#comment"; }); 
  };

  var computedDescendents = function(doctype) {
    var allowed = {}, banned = {};
    this.call(stack).call(map, function(element) {
      if (doctype.tags[element.name]) {
        allowed.call(merge, doctype.tags[element.name].allowed_descendents || {});
        banned.call(merge, doctype.tags[element.name].banned_descendents || {});  
      }
    });
    if (doctype.tags[this.name]) {
      allowed = allowed.call(merge, doctype.tags[this.name].allowed_children || {});
    }
    banned.call(each, function(item, name) { if (allowed[name]) delete allowed[name]; });
    return allowed;
  };

  var expandList = function(groups) {
    if (!this.indexOf) return this;
    var map = this.split(",").call(makeMap);
    map.call(each, function(value, name) {
      if (groups[name]) {
        delete map[name];
        map.call(
          merge, 
          groups[name].call(expandList, groups).call(
            each, 
            function(item, tag, group) { group[tag] = value; }
          )
        );
      }
    });
    return map;
  };

  var baseDoctype = {
    groups: {},
    attrs: {},
    rulesets: {},
    
    extend: function(spec) {
      this.groups.call(each, function(groups, type) {
        spec.groups[type] = spec.groups[type] || {};
        groups.call(each, function(group, name) {
          spec.groups[type][name] = combineLists(group, spec.groups[type][name]);
        });
      });
      spec.attrs = spec.attrs || {};
      this.attrs.call(each, function(attrs, type) {
        spec.attrs[type] = combineArrays(attrs, spec.attrs[type]);
      });
      spec.rulesets = spec.rulesets || {};
      this.rulesets.call(each, function(rulesets, name) {
        spec.rulesets[name] = combineArrays(rulesets.call(map, method, clone), spec.rulesets[name]);
      });
      spec.call(addAttributes, ['extend','compute','validate','rules'], this);
      return spec;
    },
    
    compute: function() {
      if (this.computed) return;
      this.computed = true;
      this.groups.call(each, function(groupType, type) {
        groupType.call(each, function(group, name) {
          groupType[name] = group.call(expandList, groupType);
        });
      });
      var groups = this.groups;
      this.attrs.call(each, function(attrs) {
        attrs.call(map, function(rule) {
          rule.attrs = rule.attrs.call(expandList, groups.attrs);
          rule.attrs.call(each, function(attr, name) {
            rule.attrs[name] = rule.values;
          });
          if (rule.include) rule.include = rule.include.call(expandList, groups.tags);
          if (rule.exclude) rule.exclude = rule.exclude.call(expandList, groups.tags);
        });
      });
      this.rulesets.call(each, function(ruleset, name) {
        ruleset.call(map, function(rules) {
          rules.call(each, function(rule, type, rules) {
            rules[type] = rule.call(expandList, groups.tags, true);
          });
        });
      });
      var tags = this.tags = groups.tags.all.call(clone);
      tags.call(each, function(tag, name) {
        tags[name] = {};
      });
      this.rulesets.call(each, function(rules, ruleName) {
        rules.call(map, function(rule, i) {
          rule.tags.call(each, function(tag, name) {
            tags[name][ruleName] = tags[name][ruleName] || {};
            rule.innerTags.call(each, function(child, childName) {
              tags[name][ruleName][childName] = child;
              if (ruleName == "allowed_children" && tags[childName]) {
                tags[childName].allowed_parents = tags[childName].allowed_parents || {};
                tags[childName].allowed_parents[name] = true;
              }
            });
          });
        });
      });
      var attrGroups = this.attrs;
      this.tags.call(each, function(tag, name) {
        attrGroups.call(each, function(attrs, type) {
          tag.attrs = tag.attrs || {};
          tag.attrs[type] = tag.attrs[type] || {};
          attrs.call(map, function(attr) {
            if ((attr.include && attr.include[name]) || (attr.exclude && !attr.exclude[name])) {
              tag.attrs[type] = tag.attrs[type].call(merge, attr.attrs);
            }
          });
        });
        tag.attrs["all"] = tag.attrs["optional"].call(merge, tag.attrs["required"]);
      });

      groups.tags.implicit.call(each, function(tag, name) {
        if (tags[name].allowed_parents) {
          tags[name].allowed_parents.call(each, function(parent, parentName) {
            tags[parentName].implicit_children = tags[parentName].implicit_children || {};
            var implicit_child = (tags[parentName].exact_children || tags[parentName].ordered_children)[name];
            tags[parentName].implicit_children[implicit_child] = name;
          });
        }
      });
      return this
    },
    
    validate: function(doc) {
      var doctype = this, errors = [], current;
      var matchTag = /(<)(([^<>\s]+)[^<>]*)>/g, matchAttr = /(\[)(([^\[\]\s]+)[^\[\]]*)\]/g;
      var insertItem = function(match, type, options, name, position, string) {
        if (current[name] === undefined) return match;
        var list = current[name].join;
        var separator = (options.match(/\s+\S+\s+/) || [" and "])[0];
        if (type == "<") {
          return list ? current[name].call(map, method, inTag).call(englishList, separator) : current[name].call(inTag);
        }
        if (type == "[") {
          return list ? current[name].call(englishList, separator) : current[name];
        }
      };
      doctype.rules.rules.call(each, function(rule, name) {
        doc.all.call(map, function(tag) {
          errors = errors.concat(tag.call(rule, doctype, doc, doctype.rulesets[name] || []).call(map, function(error) { 
            current = error;
            error.message = doctype.rules.messages[name].replace(matchTag, insertItem).replace(matchAttr, insertItem);
            return error;
          }));
        });
      });
      return errors.sort(function(a, b) { return a.line - b.line; }).call(map, function(error) { return error.message+" on line "+error.line; }).join("\n");
    },
    
    rules: {
      attribute_values: {
        formats: {
          cdata: /^[\s\S]*$/,
          number: /^\s*[0-9]+\s*$/,
          length: /^\s*[0-9]+%?\s*/,
          multi_length: /^\s*[0-9]+[%*]?\s*/,
          name: /^\s*[a-z][a-z0-9-_:.]*\s*$/i,
          names: /^\s*(([a-z][a-z0-9-_:.]*)|\s+)+$/i
        },
        messages: {
          number: "an integer number",
          length: "an integer number or percentage",
          multi_length: "an integer number, percentage or relative length (e.g. 3*)",
          name: "an start with a letter and can contain only letters, numbers and the following: .-_:",
          names:
            "a list of items separated with spaces. Each item must start with a letter and can contain only letters,"+
            "numbers and the following: .-_:"
        }
      },
      rules: {
        allowed_attributes: function(doctype, doc) {
          var tag = this, attrs = [];
          var all = ((doctype.tags[tag.name] && doctype.tags[tag.name].attrs.all) || {});
          (tag.attrs || []).call(map, function(attr) {
            if (!all[attr.name]) attrs.push(attr.name);
          });
          if (attrs.length > 0) return [{tag: tag.name, attr: attrs, s: attrs.length > 1 ? "s" : "", line: tag.line}];
          return [];
        },
        allowed_attribute_values: function(doctype, doc) {
          var tag = this, errors = [], format, message, formatName;
          (this.attrs || []).call(map, function(attr) {
            if (!doctype.tags[tag.name]) return;
            var values = (doctype.tags[tag.name].attrs.all[attr.name] || "");
            if (values == "#self") {
              format = attr.name;
              message = attr.name.call(inQuote);
            }
            else if (values.match("#")) {
              formatName = values.replace("#", "");
              format = doctype.rules.attribute_values.formats[formatName];
              message = doctype.rules.attribute_values.messages[formatName];
            }
            else if (values.match(/\S/)) {
              values = values.split(",");
              format = new RegExp("^("+values.join("|")+")$");
              message = (values.length > 2 ? "one of " : "")+values.call(map, method, inQuote).call(englishList, " or ");
            }
            if (format && !(attr.value || "").match(format)) {
              errors.push({tag: tag.name, attr: attr.name, format: message, line: tag.line});
            }
          });
          return errors;
        },
        allowed_tags: function(doctype, doc) {
          if (doctype.groups.tags.all[this.name] || doctype.groups.tags.pseudo[this.name]) return [];
          return [{ tag: this.name, line: this.line }];
        },
        allowed_children: function(doctype, doc) {
          var tag = this, errors = [];
          var allowedDescendents = tag.call(computedDescendents, doctype);
          (tag.children || []).call(htmlTags).call(map, function(child) {
            if (!allowedDescendents[child.name]) errors.push({parent: tag.name, child: child.name, line: child.line});
          });
          return errors;
        },
        exact_children: function(doctype, doc, sets) {
          var tag = this, errors = [], children = (tag.children || []).call(htmlTags);
          sets.call(map, function(set) {
            if (set.tags[tag.name]) {
              if (children.call(select, function(child, i) { return i != set.innerTags[child.name] - 1; }).length > 0) {
                errors.push({
                  parent: tag.name, line: tag.line,
                  required: set.innerTags.call(keys), 
                  child: tag.children.call(map, get, "name"), 
                });
              }
            }
          });
          return errors;
        },
        exclusive_children: function(doctype, doc, sets) {
          var tag = this, errors = [], children = (tag.children || []).call(htmlTags);
          sets.call(map, function(set) {
            if (set.tags[tag.name])
              if (children.call(select, function(child) { return set.innerTags[child.name]; }).call(map, function(item) { return item.name; }).call(makeMap).call(keys).length > 1)
                errors.push({parent: tag.name, child: set.innerTags.call(map, get, "name"), line: tag.line });
          });
          return errors;
        },
        not_empty: function(doctype, doc) {
          return (doctype.groups.tags.not_empty[this.name] && (this.children || []).call(htmlTags).length == 0) ? [{tag: this.name, line: this.line}] : [];
        },
        not_opened: function(doctype, doc) {
          return (this.unopened) ? [{tag: this.name, line: this.line}] : [];
        },
        not_optionally_closed: function(doctype, doc) {
          return (!doctype.groups.tags.close_optional[this.name] && !doctype.groups.tags.unary[this.name] && !this.closed) ? [{tag: this.name, line: this.line}] : [];
        },
        ordered_children: function(doctype, doc, sets) {
          var tag = this, errors = [], position, error;
          sets.call(map, function(set) {
            if (set.tags[tag.name]) {
              error = false;
              position = 1;
              (tag.children || []).call(htmlTags).call(map, function(child, i) {
                if (set.innerTags[child.name] >= position) position = set.innerTags[child.name];
                else { error = true; }
              });
              if (error) errors.push({
                tag: tag.name, 
                ordered: set.innerTags.call(keys), 
                child: tag.children.call(map, get, "name").call(groupUnique), 
                line: tag.line
              });
            }
          });
          return errors;
        },
        required_attributes: function(doctype, doc) {
          var tag = this, attrs = [];
          ((doctype.tags[tag.name] && doctype.tags[tag.name].attrs.required) || {}).call(each, function(required, name) {
            if (!tag.attrs || !tag.attrs.call(map, function(item) { return item.name; }).call(makeMap)[name]) { attrs.push(name); }
          });
          if (attrs.length > 0) return [{
            tag: tag.name, 
            attr: attrs.call(values), 
            s: attrs.call(values).length > 1 ? "s" : "",
            line: tag.line
          }];
          return [];
        },
        required_first_child: function(doctype, doc, sets) {
          var tag = this, errors = [];
          sets.call(map, function(set) {
            if (set.tags[tag.name]) {
              if ((tag.children || []).call(htmlTags).length > 0) {
                tag.children.call(htmlTags).call(map, function(child, i) {
                  if (i == 0 && !set.innerTags[child.name]) 
                    errors.push({tag: tag.name, child: set.innerTags.call(keys)[0], line: tag.line});
                });
              }
              else errors.push({tag: tag.name, child: set.innerTags.call(keys)[0], line: tag.line});
            } 
          });
          return errors;
        },
        required_at_least_one_child: function(doctype, doc, sets) {
          var tag = this, errors = [];
          sets.call(map, function(set) {
            if (set.tags[tag.name])
              if ((tag.children || []).call(select, function(child) { return set.innerTags[child.name]; }).call(map, get, "name").call(makeMap).call(keys).length < 1)
                errors.push({parent: tag, child: set.innerTags, line: tag.line});
          });
          return errors;
        },
        required_children: function(doctype, doc, sets) {
          var tag = this, errors = [];
          sets.call(map, function(set) {
            if (set.tags[tag.name]) {
              set.innerTags.call(each, function(innerTag, name) {
                var count = 0;
                (tag.children || []).call(map, function(child) {
                  if (child.name == name) count++;
                });
                if (count < 1) errors.push({parent: tag.name, child: name, count: count, line: tag.line});
              });
            }
          });
          return errors;
        },
        unary: function(doctype, doc) {
          return (doctype.groups.tags.unary[this.name] && this.closed) ? [{tag: this.name, line: this.line}] : [];
        },
        unique_children: function(doctype, doc, sets) {
          var tag = this, errors = [];
          sets.call(map, function(set) {
            if (set.tags[tag.name]) {
              set.innerTags.call(each, function(innerTag, name) {
                var count = 0;
                (tag.children || []).call(map, function(child) {
                  if (child.name == name) count++;
                });
                if (count > 1) errors.push({parent: tag.name, child: name, count: count, line: tag.line});
              });
            }
          });
          return errors;
        }
      },
      messages: {
        allowed_attributes: "<tag> can't have attribute[s] [attr or attr]",
        allowed_attribute_values: "<tag> element's attribute [attr] must be [format]",
        allowed_tags: "<tag> isn't a valid element",
        allowed_children: "<parent> can't contain <child>", //make this collect all invalid children
        exact_children: "<parent> must contain exactly <required and required> but currently contains <child and child>",
        exclusive_children: "<parent> can't contain both <child and child>",
        not_empty: "<tag> can't be empty",
        not_opened: "<tag> must have an opening tag",
        not_optionally_closed: "<tag> must have a closing tag",
        ordered_children: "The contents of <tag> must be ordered <ordered then ordered> but are currently ordered <child then child>",
        required_attributes: "<tag> must have attribute[s] [attr and attr]",
        required_first_child: "The contents of <tag> must start with <child>",
        required_at_least_one_child: "<tag> must contain at least one of <child or child>",
        required_children: "<parent> must contain <child>",
        unary: "<tag> must not have a closing tag",
        unique_children: "<parent> can't contain more than one <child>" //add count
      }
    }
  };
  
  var parse = function(settings) {
    var startTag = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
    var endTag = /<\/(\w+)[^>]*>/;
    var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
    var doc = { name: '#root', children: [], all: [], closed: true };
    var html = settings.html, doctype = settings.doctype;
    var index, match, endedTag, lastHtml = html, current = doc;
    var depth = function(tag) { return current.call(stack).call(map, get, "name").call(makeMap)[tag] - 1; };
    var min = function() { return Math.min.apply({}, this); };
    var last = function() { return this[this.length - 1]; };
    doc.all.push(doc);
    
    //Computes allowed child elements based on allowed_children and allowed_descendents rules
    var allowedChildren = function() {
      var obj = {};
      this.call(stack).call(map, function(tag) { 
        obj.call(merge, doctype.tags[tag.name].allowed_descendents || {}); 
      });
      obj.call(merge, doctype.tags[this.name].allowed_children || {});
      return obj;
    };
    
    var parseStartTag = function(html, tag, rest, selfClosed) {
      var prev = current.children.call(htmlTags).call(last);
      //Checks for implicit child elements
      if (doctype.tags[current.name] && doctype.tags[current.name].implicit_children) {
        var implicit = false;
        doctype.tags[current.name].implicit_children.call(each, function(implicitChild, position) {
          if (implicit) return;
          //Looks for an implied child element with an exact position
          if (doctype.tags[current.name].exact_children) {
            if (implicitChild != tag && current.children.call(htmlTags).length + 1 == position) {
              implicit = implicitChild;
            }
          }
          //Looks for an implied child element within a specific order
          else if (doctype.tags[current.name].ordered_children) {
            var orderedChildren = doctype.tags[current.name].ordered_children;
            var children = current.children.call(htmlTags);
            var invalidBeforeTags = children.call(select, function(child) { return orderedChildren[child] > position; }).length;
            if (invalidBeforeTags == 0 && (!orderedChildren[tag] || orderedChildren[tag] > position)) {
              implicit = implicitChild;
            }
          }
        });
        //Adds the implied element if one has been found, restarts the parseStartTag process for this element
        if (implicit && (!prev || prev.name+"" != implicit || !prev.implicit)) {
          var element = {name: implicit, implicit: true, attrs: [], parent: current, unary: false, children: [], html: ''};
          current.children.push(element);
          doc.all.push(element);
          current = element;
          return parseStartTag(html, tag, rest, selfClosed);
        }
      }
      
      //Closes the current element if it is optionally closed and the new element doesn't belong inside it,
      //restarts the parseStartTag process for this element
      if (doctype.groups.tags.close_optional[current.name]) {
        if (!current.call(allowedChildren)[tag] && !doctype.groups.tags.last_child[current.name]) {
          parseEndTag("", current.name);
          return parseStartTag(html, tag, rest, selfClosed);
        }
      }

      var unary = doctype.groups.tags.unary[tag] || !!selfClosed;
      var attrs = [], values = [];
      var value = "";
      //Parse attributes and their values
      rest.replace(attr, function(match, name) {
        values = arguments.call([].slice, 2, 5).concat([doctype.tags[tag].attrs.all[name] ? name : ""]);
        value = values.call(select, isString)[0];
        attrs.push({ name: name, value: value, escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') });
      });
      var element = {
        name: tag, implicit: !html, attrs: attrs, parent: current,
        unary: unary, selfClosed: !!selfClosed, children: [], html: html
      };
      current.children.push(element);
      doc.all.push(element);
      if (!unary) current = element;
    };
    
    var parseEndTag = function(html, tag) {
      var index = tag ? current.call(depth, tag) : 0;
      var endedTags = index >= 0 ? current.call(stack).slice(index) : [];
      //Deals with a number of existing elements being closed
      if (endedTags.length > 0) {
        endedTags.call(each, function(tag) {
          var start = current;
          //Checks for implicit elements which have not been added because they don't have any content
          while (current !== start.parent) {
            if (doctype.tags[current.name] && doctype.tags[current.name].implicit_children) {
              var element = false;
              doctype.tags[current.name].implicit_children.call(each, function(implicit) {
                if (!element && current.children.call(select, function(c) { return c.name+"" == implicit; }).length == 0) {
                  element = { name: implicit, implicit: true, children: [], parent: current, html: '' };
                  current.children.push(element);
                  doc.all.push(element);
                  current = element;
                }
              });
              if (!element) current = current.parent;
            }
            else current = current.parent;
          }
          current = start;
        });
        var endedTag = endedTags[0];
        if (html) { 
          endedTag.closed = true;
          endedTag.endHtml = html;
        }
        current = endedTag.parent;
      }
      //Deals with an unopened element being closed
      else {
        var element = {name: tag, unopened: true, closed: true, endHtml: html};
        current.children.push(element);
        doc.all.push(element);
      }
    };
   
    while (html) {
      if (current && doctype.groups.tags.cdata_elements[current.name]) {
        //removed "[^>]*" from regex end, need to check with John Resig
        html = html.replace(new RegExp("(.*)<\/"+current.name+">"), function(all, text) {
          //need more robust solution, and logging of whether cdata tag is used
          text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
          current.children.push({name: '#text', value: text, unary: true, html: all});
          return "";
        });
        parseEndTag("", current.name);
      } 
      else if (html.indexOf("<!--") == 0) {
        var end = html.indexOf("-->");
        current.children.push({ name: "#comment", value: html.substring(4, end), html: html.substring(0, end + 3), closed: end != -1 });
        html = end == -1 ? "" : html.substring(end + 3);
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
        index = (matches.call(select, function(match) { return match >= 0; }) || []).call(min);
        var text = index < 0 ? html : html.substring(0, index);
        current.children.push({name: '#text', value: text, html: text, unary: true});
        html = index < 0 ? "" : html.substring(index);
      }
      if (html == lastHtml) throw "Parse Error: " + html;
      lastHtml = html;
    }
    parseEndTag("");
    var newlines = function() { return (this.match(/(\r\n|\n|\r)/g) || []).length; };
    var line = 1;
    var findLines = function() {
      this.line = line; 
      if (this.html) line += this.html.call(newlines);
      if (this.children) this.children.call(map, function(child) { child.call(findLines); });
      if (this.endHtml) line += this.endHtml.call(newlines);
    };
    doc.call(findLines);
    return doc;
  }
  
  var validator = {
    doctypes: [],
    
    callable: function(fn) {
      var call = Object.prototype.call;
      Object.prototype.call = function(fn) { return fn.apply(this, Array.prototype.slice.call(arguments, 1)); };
      var response = this.call(fn);
      Object.prototype.call = call;
      return response;
    },
    
    doctype: function(name) {
      return this.callable(function() {
        return this.doctypes.call(select, function(doctype) { 
          return doctype.name == name;
        })[0];
      });
    },
    
    addSpec: function(spec) {
      var doctypes = [];
      this.callable(function() {
        (new spec(baseDoctype)).call(each, function(doctype) {
          doctypes.push(doctype.compute());
        });
      });
      this.doctypes = this.doctypes.concat(doctypes);
    },
    
    parseSettings: function(settings) {
      this.callable(function() {
        settings = settings || {};
        if (!settings.doctype || !settings.doctype.validate) settings.doctype = (this.doctype(settings.doctype) || this.doctypes[0]);
        if (!settings.html || settings.html.jquery) settings.html = (settings.html || $("html")).outerHtml();
      });
      return settings;
    },
    
    parse: function(settings) {
      settings = this.parseSettings(settings);
      return this.callable(function() {
        return parse(settings);
      });
    },
    
    validate: function(settings) {
      settings = this.parseSettings(settings);
      return this.callable(function() {
        return settings.doctype.validate(this.parse(settings));
      });
    }
  };
  
  $.htmlValidator = function() {
    return validator;
  };
})(jQuery);