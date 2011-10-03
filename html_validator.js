//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

(function($) {
  $.fn.outerHtml = function() {
    if (this.length == 0) return false;
    var elem = this[0], name = elem.tagName.toLowerCase();
    if (elem.outerHTML) return elem.outerHTML;
    var attrs = $.map(elem.attributes, function(i) { return i.name+'="'+i.value+'"'; }); 
    return "<"+name+(attrs.length > 0 ? " "+attrs.join(" ") : "")+">"+elem.innerHTML+"</"+name+">";
  };
})(jQuery);

(function($) {
  var fn = {
    englishList: function(conjunction) {
      var last = this.length - 1;
      return this.slice(0, last).join(", ")+(last > 0 ? (conjunction || " and ") : "")+(this[last] || "");
    },

    groupUnique: function() {
      var last, different;
      return this.call(select, function(item) { different = last != item; last = item; return different; });
    },
    
    draw: function(indent) {
      var text = "";
      if (this.unopened) text += (indent||"") + "</"+this.name+">\n";
      else {
        text += (indent||"")+(this.implicit ? "{<"+this.name+">}" : "<"+this.name+">")+"\n";
        if (this.children) {
          text += this.children.call(map, function(child) { return child.call(fn.draw, (indent||"")+"  "); }).join("");
        }
        if (!this.unary && !this.selfClosed) {
          text += (indent||"")+(this.closed ? "</"+this.name+">\n" : "{</"+this.name+">}\n");
        }
      }
      return text;
    },

    reassemble: function() {
      var innerHtml = (this.children || []).call(map, method, fn.reassemble).join("");
      return (this.html || "")+innerHtml+(this.endHtml || "");
    },
    
    stack: function() { return this.parent ? this.parent.call(fn.stack).concat([this]) : [this]; },
    combineLists: function(a,b) { return b ? (b.slice(0,1) == "+" ? a+","+b.slice(1) : b) : a.slice(0); },
    countNewlines: function() { return (this.match(/(\r\n|\n|\r)/g) || []).length; },

    htmlTags: function() {
      return this.call(select, function(tag) { return tag.name != "#text" && tag.name != "#comment"; });
    },

    computedDescendents: function(tags) {
      var allowed = {}, banned = {};
      this.call(fn.stack).call(map, function(element) {
        if (tags[element.name]) {
          allowed.call(merge, tags[element.name].allowed_descendents || {});
          banned.call(merge, tags[element.name].banned_descendents || {});
        }
      });
      if (tags[this.name]) {
        allowed = allowed.call(merge, tags[this.name].allowed_children || {});
      }
      banned.call(each, function(item, name) { if (allowed[name]) delete allowed[name]; });
      return allowed;
    },
    
    expandList: function(groups) {
      if (!is("String", this)) return this;
      var list = this.split(",").call(hash, numbered);
      list.call(each, function(value, name) {
        if (groups[name]) {
          delete list[name];
          var group = groups[name].call(fn.expandList, groups);
          group.call(each, function(item, tag) { this[tag] = value; });
          list.call(merge, group);
        }
      });
      return list;
    },
    
    formatMessage: function(data) {
      var matchTag = /(<)(([^<>\s]+)[^<>]*)>/g;
      var matchAttr = /(\[)(([^\[\]\s]+)[^\[\]]*)\]/g;
      var inTag = function() { return "<"+this+">"; };
      var insertItem = function(match, type, options, name, position, string) {
        if (data[name] === undefined) return match;
        var list = data[name].join;
        var separator = (options.match(/\s+\S+\s+/) || [" and "])[0];
        if (type == "<") {
          return list ? data[name].call(map, method, inTag).call(fn.englishList, separator) : data[name].call(inTag);
        }
        if (type == "[") {
          return list ? data[name].call(fn.englishList, separator) : data[name];
        }
      };
      return this.replace(matchTag, insertItem).replace(matchAttr, insertItem);
    },
    
    contextualiseMessages: function() {
      var messages = this.sort(function(a, b) { return a.line - b.line; });
      return messages.call(map, function(message) { return message.message+" on line "+message.line; }).join("\n");
    },
    
    findLines: function(currentLine) {
      this.line = currentLine;
      if (this.html) { currentLine += this.html.call(fn.countNewlines); }
      if (this.children) this.children.call(map, function(child) { currentLine = child.call(fn.findLines, currentLine); });
      if (this.endHtml) currentLine += this.endHtml.call(fn.countNewlines);
      return currentLine;
    }
  };

  $.htmlValidator = {
    fn: fn,
    doctypes: [],
    
    doctype: function(name) {
      return this.doctypes.call(select, function(doctype) { 
        return doctype.name == name;
      })[0];
    },
    
    addSpec: function(spec) {
      var doctypes = [];
      (new spec(this.baseDoctype)).call(each, function(doctype) {
        doctypes.push(doctype.compute());
      });
      this.doctypes = this.doctypes.concat(doctypes);
    },
    
    parseSettings: function(settings) {
      settings = settings || {};
      if (!settings.doctype || !settings.doctype.validate) settings.doctype = (this.doctype(settings.doctype) || this.doctypes[0]);
      if (!settings.html || settings.html.jquery) settings.html = (settings.html || $("html")).outerHtml();
      return settings;
    },
    
    parse: function(settings) {
      settings = this.parseSettings(settings);
      return this.parser(settings);
    },
    
    validate: function(settings) {
      settings = this.parseSettings(settings);
      return settings.doctype.validate(this.parse(settings));
    },
    
    baseDoctype: {
      groups: {},
      attrs: {},
      rulesets: {},
      
      extend: function(spec) {
        this.extendGroups(spec);
        this.extendAttrs(spec);
        this.extendRulesets(spec);
        return this.copyMethods(spec);
      },
      
      resetHashes: function() {
        this.groups = {};
        this.attrs = {};
        this.rulesets = {};
      },
      
      extendGroups: function(spec) {
        this.groups.call(each, function(groups, type) {
          spec.groups[type] = spec.groups[type] || {};
          groups.call(each, function(group, name) {
            spec.groups[type][name] = fn.combineLists(group, spec.groups[type][name]);
          });
        });
      },
      
      extendAttrs: function(spec) {
        spec.attrs = spec.attrs || {};
        this.attrs.call(each, function(attrs, type) {
          spec.attrs[type] = (attrs || []).concat(spec.attrs[type] || []);
        });
      },
      
      extendRulesets: function(spec) {
        spec.rulesets = spec.rulesets || {};
        this.rulesets.call(each, function(rulesets, name) {
          spec.rulesets[name] = (rulesets.call(map, method, clone) || []).concat(spec.rulesets[name] || []);
        });
      },
      
      copyMethods: function(spec) {
        return this.call(clone).call(merge, spec);
      },
      
      compute: function() {
        if (this.computed) return;
        this.computed = true;
        //Expand groups
        this.groups.call(each, function(groupType, type) {
          groupType.call(each, function(group, name) {
            groupType[name] = group.call(fn.expandList, groupType);
          });
        });
        var groups = this.groups;
        //Expand attrs
        this.attrs.call(each, function(attrs) {
          attrs.call(map, function(rule) {
            rule.attrs = rule.attrs.call(fn.expandList, groups.attrs);
            rule.attrs.call(each, function(attr, name) {
              rule.attrs[name] = rule.values;
            });
            if (rule.include) rule.include = rule.include.call(fn.expandList, groups.tags);
            if (rule.exclude) rule.exclude = rule.exclude.call(fn.expandList, groups.tags);
          });
        });
        //Expand rulesets
        this.rulesets.call(each, function(ruleset, name) {
          ruleset.call(map, function(rules) {
            rules.call(each, function(rule, type) {
              rules[type] = rule.call(fn.expandList, groups.tags, true);
            });
          });
        });
        //Initialise tags
        var tags = this.tags = groups.tags.all.call(clone);
        tags.call(each, function(tag, name) {
          tags[name] = {};
        });
        //Populate rules into tags, special case for allowed_children
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
        //Populate all, allowed and required attributes into tags
        var attrGroups = this.attrs;
        tags.call(each, function(tag, name) {
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
        //Calculate implicit children
        groups.tags.implicit.call(each, function(tag, name) {
          if (tags[name].allowed_parents) {
            tags[name].allowed_parents.call(each, function(parent, parentName) {
              tags[parentName].implicit_children = tags[parentName].implicit_children || {};
              var position = (tags[parentName].exact_children || tags[parentName].ordered_children)[name];
              tags[parentName].implicit_children[position] = name;
            });
          }
        });
        return this
      },
      
      validate: function(doc) {
        var doctype = this, errors = [];
        doctype.rules.rules.call(each, function(rule, name) {
          doc.all.call(map, function(tag) {
            errors = errors.concat(tag.call(rule, doctype, doc, doctype.rulesets[name] || []));
            errors.call(map, function(error, i) {
              errors[i].message = doctype.rules.messages[name].call(fn.formatMessage, error);
            });
          });
        });
        return errors.call(fn.contextualiseMessages);
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
            var inQuote = function() { return "'"+this+"'"; };
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
                message = (values.length > 2 ? "one of " : "")+values.call(map, method, inQuote).call(fn.englishList, " or ");
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
            var allowedDescendents = tag.call(fn.computedDescendents, doctype.tags);
            (tag.children || []).call(fn.htmlTags).call(map, function(child) {
              if (!allowedDescendents[child.name]) errors.push({parent: tag.name, child: child.name, line: child.line});
            });
            return errors;
          },
          exact_children: function(doctype, doc, sets) {
            var tag = this, errors = [], children = (tag.children || []).call(fn.htmlTags);
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
            var tag = this, errors = [], children = (tag.children || []).call(fn.htmlTags);
            sets.call(map, function(set) {
              if (set.tags[tag.name])
                if (children.call(select, function(child) { return set.innerTags[child.name]; }).call(map, function(item) { return item.name; }).call(hash, numbered).call(keys).length > 1)
                  errors.push({parent: tag.name, child: set.innerTags.call(map, get, "name"), line: tag.line });
            });
            return errors;
          },
          not_empty: function(doctype, doc) {
            return (doctype.groups.tags.not_empty[this.name] && (this.children || []).call(fn.htmlTags).length == 0) ? [{tag: this.name, line: this.line}] : [];
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
                (tag.children || []).call(fn.htmlTags).call(map, function(child, i) {
                  if (set.innerTags[child.name] >= position) position = set.innerTags[child.name];
                  else { error = true; }
                });
                if (error) errors.push({
                  tag: tag.name, 
                  ordered: set.innerTags.call(keys), 
                  child: tag.children.call(map, get, "name").call(fn.groupUnique), 
                  line: tag.line
                });
              }
            });
            return errors;
          },
          required_attributes: function(doctype, doc) {
            var tag = this, attrs = [];
            ((doctype.tags[tag.name] && doctype.tags[tag.name].attrs.required) || {}).call(each, function(required, name) {
              if (!tag.attrs || !tag.attrs.call(map, function(item) { return item.name; }).call(hash, numbered)[name]) { attrs.push(name); }
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
                if ((tag.children || []).call(fn.htmlTags).length > 0) {
                  tag.children.call(fn.htmlTags).call(map, function(child, i) {
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
                if ((tag.children || []).call(select, function(child) { return set.innerTags[child.name]; }).call(map, get, "name").call(hash, numbered).call(keys).length < 1)
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
    },
    
    parser: function(settings) {
      var startTagRegex = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
      //Removed "[^>]*" from regex end, need to check with John Resig
      var endTagRegex = /<\/(\w+)>/;
      var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
      var doctype = settings.doctype;
      var lastHtml = html = settings.html;
      var current = doc = { name: '#root', children: [], all: [], closed: true };
      doc.all.push(doc);
      
      //Computes allowed child elements based on allowed_children and allowed_descendents rules
      //Ignores banned descendents for validating flexibility
      var allowedChildren = function() {
        var obj = {};
        this.call(fn.stack).call(map, function(tag) { 
          obj.call(merge, doctype.tags[tag.name].allowed_descendents || {}); 
        });
        obj.call(merge, doctype.tags[this.name].allowed_children || {});
        return obj;
      };
      
      var parseStartTag = function(html, tag, rest, selfClosed) {
        var prev = current.children.call(fn.htmlTags).call(last);
        //Checks for implicit child elements
        if (doctype.tags[current.name] && doctype.tags[current.name].implicit_children) {
          var implicit = false;
          doctype.tags[current.name].implicit_children.call(each, function(implicitChild, position) {
            if (implicit) return;
            //Looks for an implied child element with an exact position
            if (doctype.tags[current.name].exact_children) {
              if (implicitChild != tag && current.children.call(fn.htmlTags).length + 1 == position) {
                implicit = implicitChild;
              }
            }
            //Looks for an implied child element within a specific order
            else if (doctype.tags[current.name].ordered_children) {
              var orderedChildren = doctype.tags[current.name].ordered_children;
              var children = current.children.call(fn.htmlTags);
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
          value = values.call(select, function(value) { return value != null; })[0];
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
        var index = tag ? (current.call(fn.stack).call(map, get, "name").call(hash, numbered)[tag] - 1) : 0;
        var endedTags = index >= 0 ? current.call(fn.stack).slice(index) : [];
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
          //Removed "[^>]*" from regex end, need to check with John Resig
          html = html.replace(new RegExp("(.*)<\/"+current.name+">"), function(all, text) {
            //Need more robust solution, and logging of whether cdata tag is used
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
        else if (html.search(endTagRegex) == 0) {
          var match = html.match(endTagRegex);
          html = html.substring(match[0].length);
          match[0].replace(endTagRegex, parseEndTag);
        }
        else if (html.search(startTagRegex) == 0) {
          var match = html.match(startTagRegex);
          html = html.substring(match[0].length);
          match[0].replace(startTagRegex, parseStartTag);
        }
        //If no tag is immediately found, find the distance to the nearest tag
        else {
          var matches = [html.search(startTagRegex), html.search(endTagRegex), html.indexOf("<!--")];
          var index = (matches.call(select, function(match) { return match >= 0; }) || []).call(min);
          var text = index < 0 ? html : html.substring(0, index);
          current.children.push({name: '#text', value: text, html: text, unary: true});
          html = index < 0 ? "" : html.substring(index);
        }
        if (html == lastHtml) throw "Parse Error: " + html;
        lastHtml = html;
      }
      parseEndTag("");
      doc.call(fn.findLines, 1);
      return doc;
    }
  };
})(jQuery);