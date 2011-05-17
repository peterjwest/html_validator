//HTML Validator By Peter West
//Original parser By John Resig (ejohn.org) http://ejohn.org/blog/pure-javascript-html-parser/
//and Erik Arvidsson (Mozilla Public License) http://erik.eae.net/simplehtmlparser/simplehtmlparser.js

Object.prototype.call = function(fn) { 
  var args = Array.prototype.slice.call(arguments); 
  args.shift(); 
  return fn.apply(this, args); 
};

var each = function(fn) {
  var temp = {};
  for(var i in this) {
    if (this.call(temp.hasOwnProperty, i)) {
      this.call(fn, this[i], i);
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
  this.call(each, function(item) {
    array.push(item);
  });
  return array;
}

var keys = function() {
  var array = [];
  this.call(each, function(item, key) {
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

var descendents = function(fn) {
  if (this.children) this.children.call(map, fn);
};

var englishList = function(separator) {
  return this.slice(0, this.length -1).join(", ")+(this.length > 1 ? (separator || " and ") : "")+(this[this.length - 1] || "");
};

var prepend = function(string) {
  return string+this;
};

var inTag = function() {
  return "<"+this+">";
};

var doctype = {
  tags: {},
  attrs: {tag: {}, filters: []},
  rules: {rules: {}, sets: {}, messages: {}},
  
  extend: function(doctype) {
    var original = this;
    original.tags.call(each, function(tags, type) {
      if (doctype.tags[type]) doctype.tags[type] = [original.tags[type], doctype.tags[type]].join(",");
      else doctype.tags[type] = original.tags[type];
    });
    original.attrs.tag.call(each, function(attrType, type) {
      if (doctype.attrs.tag[type]) {
        attrType.call(each, function(tag, name) {
            if (doctype.attrs.tag[type][name]) doctype.attrs.tag[type][name] = [original.attrs.tag[type][name], doctype.attrs.tag[type][name]].join(",");
            else doctype.attrs.tag[type][name] = original.attrs.tag[type][name];
        });
      }
      else doctype.attrs.tag[type] = original.attrs.tag[type];
    });
    doctype.attrs.filters = doctype.attrs.filter ? doctype.attrs.filters : original.attrs.filters.concat(doctype.attrs.filters);
    doctype.extend = original.extend;
    doctype.compute = original.compute;
    doctype.validate = original.validate;
    return doctype;
  },
  
  compute: function() {
    if (!this.computed) {
      var doctype = this;
      doctype.tags.call(each, function(tags, type) {
        doctype.tags[type] = tags.call(makeMap);
      });
      
      doctype.attrs.filters.call(map, function() {
        var filter = this;
        var optional = doctype.attrs.tag.optional;
        if (filter.only) filter.only = filter.only.call(makeMap);
        if (filter.except) filter.except = filter.except.call(makeMap);
        optional.call(each, function(attrs, name) {
          if ((!filter.only || filter.only[name]) && (!filter.except || !filter.except[name])) optional[name] = attrs ? attrs+","+filter.attrs : filter.attrs;
        });
      });
      delete doctype.attrs.filters;
      doctype.attrs.tag.call(each, function(attrType, type) {
        attrType.call(each, function(tag, name) {
          doctype.attrs.tag[type][name] = doctype.attrs.tag[type][name].call(makeMap);
        });
      });
      doctype.rules.sets.call(each, function(set) {
        set.call(map, function(index) {
          var item = this;
          this.call(each, function(property, name) {
            item[name] = property.call(makeMap);
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
    doctype.rules.rules.call(each, function(rule, name) {
      doctype.rules.sets[name].call(map, function() {
        var set = this;
        errors = errors.concat(doctype.call(rule, set, doc).call(map, function() { return this.call(doctype.rules.messages[name], set); }));
      });
    });
    return errors;
  }
  
  rules: {
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
          set.tags.call(each, function(nil, name) {
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


var strict = doctype.extend({
  tags: {
    tags: 'a,abbr,acronym,address,area,b,base,bdo,big,blockquote,body,br,button,caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,fieldset,form,h1,h2,h3,h4,h5,h6,head,hr,html,i,img,input,ins,kbd,label,legend,li,link,map,meta,noscript,object,ol,optgroup,option,p,param,pre,q,samp,script,select,small,span,strong,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,title,tr,tt,ul,var',
    groups: {
      form_controls: 'input,select,textarea,label,button',
      font_style: 'tt,i,b,big,small',
      phrase: 'em,strong,dfn,code,samp,kbd,var,cite,abbr,acronym',
      special: 'a,img,object,br,script,map,q,sub,sup,span,bdo',
      heading: 'h1,h2,h3,h4,h5,h6',
      inline: '#pcdata,font_style,phrase,special,form_controls',
      list: 'ul,ol',
      block: 'heading,pre,p,dl,div,noscript,blockquote,form,hr,table,fieldset,address',
      flow: 'inline,block',
      pre_excluded: 'img,object,big,small,sub,sup',
      document_body: 'body',
      without_lang: 'base,br,param,script',
      without_title: 'base,head,html,meta,param,script,title'
    },
    implicit: 'body,head,html,tbody',
    close_optional: 'body,colgroup,dd,dt,head,html,li,option,p,tbody,td,tfoot,th,thead,tr',
    unary: 'area,base,br,col,hr,img,input,link,meta,param',
    not_empty: 'blockquote,b,dl,fieldset,form,ul,ol,map,optgroup,select,thead,tfoot,tbody,tr',
  },
  
  attrs: {
    groups: {
      standard_events: 'onclick,ondblclick,onkeydown,onkeypress,onkeyup,onmousedown,onmousemove,onmouseout,onmouseover,onmouseup'
    },
    required: [
      {attrs: 'action', include: 'form', values: '#cdata'},
      {attrs: 'alt', include: 'area,img', values: '#cdata'},
      {attrs: 'cols,rows', include: 'textarea', values: '#number'},
      {attrs: 'content', include: 'meta', values: '#cdata'},
      {attrs: 'dir', include: 'bdo', values: 'ltr,rtl'},
      {attrs: 'label', include: 'optgroup', values: '#cdata'},
      {attrs: 'name', include: 'map,param', values: '#cdata'},
      {attrs: 'src', include: 'img', values: '#cdata'},
      {attrs: 'type', include: 'script,style', values: '#cdata'}
    ],
    optional: [
      {attrs: 'abbr,axis', include: 'td,th', values: '#cdata'},
      {attrs: 'accept', include: 'form,input', values: '#cdata'},
      {attrs: 'accept-charset,enctype,name,onreset,onsubmit', include: 'form', values: '#cdata'},
      {attrs: 'accesskey', include: 'a,area,button,input,label,legend,textarea', values: '#cdata'},
      {attrs: 'align', include: 'col,colgroup,tbody,td,tfoot,th,thead,tr', values: 'left,center,right,justify,char'},
      {attrs: 'alt,size,src', include: 'input', values: '#cdata'},
      {attrs: 'archive,classid,codebase,codetype,data,standby,type', include: 'object', values: '#cdata'},
      {attrs: 'border', include: 'table', values: '#number'},
      {attrs: 'cellpadding,cellspacing,width', include: 'table', values: '#length'},
      {attrs: 'char', include: 'col,colgroup,tbody,td,tfoot,th,thead,tr', values: '#cdata'},
      {attrs: 'charoff', include: 'col,colgroup,tbody,td,tfoot,th,thead,tr', values: '#length'},
      {attrs: 'charset', include: 'a,link,script', values: '#cdata'},
      {attrs: 'checked', include: 'input', values: '#self'},
      {attrs: 'cite', include: 'blockquote,q', values: '#cdata'},
      {attrs: 'cite,datetime', include: 'del,ins', values: '#cdata'},
      {attrs: 'class', include: 'all', exclude: 'style,without_title', values: '#cdata'},
      {attrs: 'colspan,rowspan', include: 'td,th', values: '#number'},
      {attrs: 'coords', include: 'area', values: '#cdata'},
      {attrs: 'coords,name', include: 'a', values: '#cdata'},
      {attrs: 'declare', include: 'object', values: '#self'},
      {attrs: 'defer', include: 'script', values: '#self'},
      {attrs: 'dir', include: 'all', exclude: 'bdo,frame,without_lang', values: 'ltr,rtl'},      
      {attrs: 'disabled', include: 'button,input,optgroup,option,select,textarea', values: '#self'},
      {attrs: 'for', include: 'label', values: '#name'},
      {attrs: 'frame', include: 'table', values: 'void,above,below,hsides,lhs,rhs,vsides,box,border'},
      {attrs: 'headers', include: 'td,th', values: '#names'},
      {attrs: 'height,width', include: 'img,object', values: '#length'},
      {attrs: 'href', include: 'a,area,base,link', values: '#cdata'},
      {attrs: 'hreflang', include: 'a,link', values: '#name'},
      {attrs: 'http-equiv,name', include: 'meta', values: '#self'},
      {attrs: 'id', include: 'all', exclude: 'base,head,html,meta,script,style,title', values: '#name'},
      {attrs: 'ismap', include: 'img,input', values: '#self'},
      {attrs: 'label,value', include: 'option', values: '#cdata'},
      {attrs: 'lang', include: 'all', exclude: 'without_lang', values: '#name'},
      {attrs: 'longdesc,name', include: 'img', values: '#cdata'},
      {attrs: 'maxlength', include: 'input', values: '#number'},
      {attrs: 'media', include: 'link,style', values: '#cdata'},
      {attrs: 'type', include: 'style', values: '#cdata'},
      {attrs: 'method', include: 'form', values: 'get,post'},
      {attrs: 'multiple', include: 'select', values: '#self'},
      {attrs: 'name', include: 'button,textarea,input,select', values: '#cdata'},
      {attrs: 'nohref', include: 'area', values: '#self'},
      {attrs: 'onblur,onfocus', include: 'a,area,button,input,label,select,textarea', values: '#cdata'},
      {attrs: 'onchange', include: 'input,select,textarea', values: '#cdata'},
      {attrs: 'standard_events', include: 'all', exclude: 'bdo,head,html,meta,style,title,without_lang', values: '#cdata'},
      {attrs: 'onload,onunload', include: 'body', values: '#cdata'},
      {attrs: 'onselect', include: 'input,textarea', values: '#cdata'},
      {attrs: 'profile', include: 'head', values: '#cdata'},
      {attrs: 'readonly', include: 'input,textarea', values: '#self'},
      {attrs: 'rel,rev,type', include: 'a,link', values: '#cdata'},
      {attrs: 'rules', include: 'table', values: 'none,groups,rows,cols,all'},
      {attrs: 'scheme', include: 'meta', values: '#cdata'},
      {attrs: 'scope', include: 'td,th', values: 'row,col,rowgroup,colgroup'},
      {attrs: 'selected', include: 'option', values: '#self'},
      {attrs: 'shape', include: 'a,area','rect,circle,poly,default'},
      {attrs: 'size', include: 'select','#number'},
      {attrs: 'span', include: 'col,colgroup','#number'},
      {attrs: 'src', include: 'script','#cdata'},
      {attrs: 'style', include: 'all', exclude: 'style,without_title', values: '#cdata'},
      {attrs: 'summary', include: 'table', values: '#cdata'},
      {attrs: 'tabindex', include: 'a,area,button,input,object,select,textarea', values: '#number'},
      {attrs: 'title', include: 'all', exclude: 'without_title', values: '#cdata'},
      {attrs: 'type', include: 'button', values: 'button,submit,reset'},
      {attrs: 'type', include: 'input', values: 'text,password,checkbox,radio,submit,reset,file,hidden,image,button'},
      {attrs: 'type', include: 'param', values: '#cdata'},
      {attrs: 'usemap', include: 'img,input,object', values: '#cdata'},
      {attrs: 'valign', include: 'col,colgroup,tbody,td,tfoot,th,thead,tr', values: 'top,middle,bottom,baseline'},
      {attrs: 'value', include: 'button,input,param', values: '#cdata'},
      {attrs: 'valuetype', include: 'param', values: 'data,ref,object'},
      {attrs: 'width', include: 'col,colgroup', values: '#multi_length'}
    ]
  },
  
  rules: {
    required_first_child: [{tags: 'fieldset', child: 'legend'}],
    exclusive_children: [{tags: 'table', children: 'col,colgroup'}],
    ordered_children: [{tags: 'table', children: 'caption,col,colgroup,thead,tfoot,tbody'}],
    allowed_descendents: [{tags: 'body', allowed: 'ins,del'}],
    banned_descendents: [
      {tags: 'a', banned: 'a'},
      {tags: 'button', banned: 'form_controls,a,form,fieldset'},
      {tags: 'form', banned: 'form'},
      {tags: 'label', banned: 'label'},
      {tags: 'pre', banned: pre_excluded}
    ],
    requires_one_child_from: [{
      {tags: 'head', child: 'title'},
      {tags: 'table', child: 'tbody'}
    }],
    exact_children: [
      {tags: 'root', children: 'html'},
      {tags: 'html', children: 'head,document_body'}
    ],
    unique_children: [
      {tags: 'head', unique: 'title,base'},
      {tags: 'fieldset', unique: 'legend'}
    ]
    allowed_children: [
      {'a,address,bdo,caption,dd,font_style,heading,legend,phrase,p,pre,q,span,sub,sup', children: 'inline'},
      {'b,blockquote,body,form', children: 'block,script'},
      {'button,dt,del,ins,div,li,th,td', children: 'flow'},
      {'colgroup', children: 'col'},
      {'dl', children: 'dt,dd'},
      {'fieldset', children: 'flow,legend'},
      {'head', children: 'title,base,script,style,meta,link,object'},
      {'option,textarea,title', children: '#pcdata'},
      {'list', children: 'li'},
      {'map', children: 'block,area'},
      {'noscript', children: 'block'},
      {'object', children: 'param,flow'},
      {'optgroup', children: 'option'},
      {'script,style', children: '#cdata'}
      {'select', children: 'optgroup,option'},
      {'table', children: 'caption,col,colgroup,thead,tfoot,tbody'},
      {'thead,tfoot,tbody', children: 'tr'},
      {'tr', children: 'td,th'}
    ]
  } 
});

var transitional = strict.extend({
  tags: {
    tags: '+applet,basefont,center,dir,font,iframe,isindex,menu,s,strike,u,noframes',
    groups: {
      font_style: '+s,strike,u',
      list: '+dir,menu',
      pre_excluded: '+applet,font,basefont',
      special: '+applet,font,basefont,iframe',
      block: '+center,noframes,isindex',
      noframes_content: 'flow',
      frame_elements: 'iframe',
      without_lang: '+basefont,applet,frame_elements',
      without_title: '+basefont'
    },
    unary: '+basefont,isindex',
    not_empty: '+dir,menu'
  },
  attrs: {
    required: [
      {attrs: 'size', include: 'basefont', values: '#cdata'},
      {attrs: 'height,width', include: 'applet,iframe,td,th', values: '#length'}
    ],
    optional: [
      {attrs: 'align', include: 'hr,table', values: 'left,center,right'},
      {attrs: 'align', include: 'div,h1,h2,h3,h4,h5,h6,p', values: 'left,center,right,justify'},
      {attrs: 'align', include: 'caption,legend', values: 'top,bottom,left,right'},values
      {attrs: 'align', include: 'applet,iframe,img,input,object', values: 'top,middle,bottom,left,right'},
      {attrs: 'alink,link,text,vlink', include: 'body', values: '#color'},
      {attrs: 'alt,arhive,code,codebase,name,object', include: 'applet', values: '#cdata'},
      {attrs: 'background', include: 'body', values: '#cdata'},
      {attrs: 'bgcolor', include: 'table,td,th,tr,body', : '#color'},
      {attrs: 'border', include: 'img,object',' values: #number'},
      {attrs: 'clear', include: 'br', values: 'left,all,right,none'},
      {attrs: 'color', include: 'basefont,font', values: '#color'},
      {attrs: 'compact', include: 'dir,dl,menu,ol,ul', values: '#self'},
      {attrs: 'face', include: 'basefont,font', values: '#cdata'},
      {attrs: 'frameborder', include: 'frame_elements', values: '1,0'},
      {attrs: 'hspace,vspace', include: 'applet,img,object', values: '#number'},
      {attrs: 'language', include: 'script', values: '#cdata'},
      {attrs: 'longdesc,marginheight,marginwidth', include: 'frame_elements', values: '#number'},
      {attrs: 'name,src', include: 'frame_elements', values: '#cdata'},
      {attrs: 'noshade', include: 'hr', values: '#self'},
      {attrs: 'nowrap', include: 'td,th', values: '#self'},
      {attrs: 'standard_events', exclude: 'font,isindex'},
      {attrs: 'prompt', include: 'isindex', values: '#cdata'},
      {attrs: 'scrolling', include: 'frame_elements', values: 'yes,no,auto'},
      {attrs: 'size', include: 'font', values: '#cdata'},
      {attrs: 'size', include: 'hr', values: '#number'},
      {attrs: 'start', include: 'ol', values: '#number'},
      {attrs: 'target', include: 'a,area,base,form,link', values: '#cdata'},
      {attrs: 'type', include: 'ol', values: '1,a,a,i,i'},
      {attrs: 'type', include: 'li', values: '1,a,a,i,i,disc,square,circle'},
      {attrs: 'type', include: 'ul', values: 'disc,square,circle'},
      {attrs: 'value', include: 'li', values: '#number'},
      {attrs: 'version', include: 'html', values: '#cdata'},
      {attrs: 'width', include: 'pre', values: '#integer'},
      {attrs: 'width', include: 'hr', values: '#length'}
    ]
  }
});

var frameset = transitional.extend({
  tags: {
    tags: '+frame,frameset',
    groups: {
      document_body: 'frameset',
      noframes_content: 'body',
      frame_elements: 'frame,iframe'
    },
    unary: '+frame'
  },
  attrs: {
    optional: [
      {attrs: 'cols,onload,onunload,rows', include: 'frameset', values: '#cdata'},
      {attrs: 'noresize', include: 'frame', values: '#self'}
    ]
  }
  rules: {
    exact_children: [{tags: 'noframes', children: 'noframes_content'}],
    banned_descendents: [{tags: 'noframes', banned: 'noframes'}],
    requires_one_child_from: [{tags: 'frameset', child: 'frameset,frame'}],
    allowed_children: [{tags: 'frameset', children: 'frame,frameset,noframes'}]
  }
});

var startTag = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
var endTag = /^<\/(\w+)[^>]*>/;
var attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

var HTMLParser = function(html, handler, doctype) {
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
      // html comment
      if (html.indexOf("<!--") == 0) {
        index = html.indexOf("-->");
        if (index >= 0) {
          if (handler.comment) handler.comment(html.substring(0, index+3), html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }
      // end tag
      } else if (html.indexOf("</") == 0) {
        match = html.match(endTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(endTag, parseEndTag);
          chars = false;
        }
      // start tag
      } else if (html.indexOf("<") == 0) {
        match = html.match(startTag);
        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(startTag, parseStartTag);
          chars = false;
        }
      }
      // text
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
  
  // Clean up any remaining tags
  parseEndTag();
};

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

strict.compute();
console.log(strict);
console.log(strict.validate(doc));
console.log(doc);

/*
//html must have xmlns=http://www.w3.org/1999/xhtml
*/