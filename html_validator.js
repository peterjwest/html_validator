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
  if (typeof(fn)=='string') { 
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
};


var strict = doctype.extend({
  tags: {
    inline: 'a,abbr,acronym,br,button,cite,code,del,dfn,em,i,img,input,ins,kbd,label,map,object,q,samp,script,select,small,span,strong,sub,sup,textarea,tt,var',
    block: 'address,area,b,base,bdo,big,blockquote,body,caption,col,colgroup,dd,div,dl,dt,fieldset,form,h1,h2,h3,h4,h5,h6,head,hr,html,legend,li,link,meta,noscript,ol,optgroup,option,p,param,pre,style,table,tbody,td,tfoot,th,thead,title,tr,ul',
    unary: 'area,base,br,col,hr,img,input,link,meta,param',
    unstartable: {
      body: {parent: 'html,root', below: 'head,base,link,meta,title,style'},
      head: {parent: 'html,root', below: ''},
      html: {parent: 'root', below: ''},
      tbody: {parent: 'table', below: 'thead,tfoot'}
    },
    unclosable: 'colgroup,dd,dt,li,option,p,tbody,td,tfoot,th,thead,tr',
    cdata: 'script,style,xmp'
  },
  attrs: {
    tag: {
      required: {
        area: 'alt',
        bdo: 'dir',
        form: 'action',
        img: 'alt,src',
        map: 'name',
        meta: 'content',
        optgroup: 'label',
        param: 'name',
        script: 'type',
        style: 'type',
        textarea: 'cols,rows'
      },
      optional: {
        a: 'charset,coords,href,hreflang,name,rel,rev,shape',
        area: 'coords,href,nohref,shape,target',
        base: 'href',
        button: 'name,type,value',
        del: 'datetime',
        form: 'accept,accept-charset,enctype,method',
        head: 'profile',
        html: 'xmlns',
        img: 'height,ismap,longdesc,usemap,width',
        input: 'accept,alt,checked,maxlength,name,readonly,size,src,type,value',
        ins: 'datetime',
        label: 'for',
        link: 'charset,href,hreflang,media,rel,rev,type',
        meta: 'http-equiv,name,scheme',
        object: 'archive,classid,codebase,codetype,data,declare,height,name,standby,type,usemap,width',
        option: 'label,selected,value',
        param: 'type,value,valuetype',
        script: 'charset,defer,src,xml:space',
        select: 'multiple,name,size',
        style: 'media',
        table: 'border,cellpadding,cellspacing,frame,rules,summary,width',
        td: 'headers',
        textarea: 'name,readonly',
      }
    },
    filters: [
      { attrs: 'id', except: 'base,head,html,meta,script,style,title' },
      { attrs: 'class,style,title', except: 'base,head,html,meta,param,script,style,title' },
      { attrs: 'dir,lang,xml:lang', except: 'applet,base,br,frame,frameset,hr,iframe,param,script' },
      { attrs: 'tabindex', only: 'a,area,button,input,object,select,textarea' },
      { attrs: 'accesskey', only: 'a,area,button,input,label,legend,textarea' },
      { attrs: 'cite', only: 'blockquote,del,ins,q' },
      { attrs: 'align,char,charoff,valign', only: 'col,colgroup,tbody,td,tfoot,th,thead,tr' },
      { attrs: 'span,width', only: 'col,colgroup' },
      { attrs: 'abbr,axis,scope,colspan,rowspan', only: 'td,th' },
      { attrs: 'disabled', only: 'button,input,optgroup,option,select,textarea' },
      { attrs: 'onload,onunload', only: 'body,frameset' },
      { attrs: 'onblur,onfocus', only: 'a,area,button,input,label,select,textarea' },
      { attrs: 'onreset,onsubmit', only: 'form' },
      { attrs: 'onchange', only: 'input,select,textarea' },
      { attrs: 'onselect', only: 'input,textarea' },
      { attrs: 'onabort', only: 'img' },
      {
        attrs: 'onclick,ondbclick,onmousedown,onmousemove,onmouseout,onmouseover,onmouseup,onkeydown,onkeypress,onkeyup', 
        except: 'applet,base,basefont,bdo,br,font,frame,frameset,head,html,iframe,meta,param,script,style,title' 
      }
    ]
  },
  rules: {
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
    sets: {
      unique: [{tags: "html,head,title,body,base"}],
      not_empty: [{tags: "body,table,tr,thead,tfoot,tbody"}],
      has_parent: [
        {tags: "html", parents: "root"},
        {tags: "body,head,frameset", parents: "html,root"},
        {tags: "base,link,meta,title,style", parents: "head,html,root"},
        {tags: "legend", parents: "fieldset"},
        {tags: "frameset", parents: "frameset,html, root"},
        {tags: "frame,noframes", parents: "frameset"},
        {tags: "param", parents: "object,applet"},
        {tags: "tr", parents: "table,tbody,tfoot,thead"},
        {tags: "td,th", parents: "tr"},
        {tags: "col", parents: "table,colgroup"},
        {tags: "option", parents: "select,optgroup"},
        {tags: "optgroup", parents: "select"},
        {tags: "li", parents: "dir,menu,ol,ul"},
        {tags: "dt,dd", parents: "dl"},
        {tags: "area", parents: "map"}
      ],
      has_only_children: [],
      has_exact_children: [],
      has_first_child: []
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
});

var transitional = strict.extend({
  tags: {
    inline: 'basefont,font,iframe,s,strike,u',
    block: 'applet,center,dir,isindex,menu,noframes',
    unary: 'basefont,isindex',
    unclosable: '',
    cdata: ''
  },
  attrs: {
    tag: {
      required: {
        applet: 'code,object'
      },
      optional: {
        applet: 'alt,archive,codebase,height,hspace,name,vspace',
        basefont: 'color,face,size',
        body: 'alink,background,link,text,vlink',
        font: 'color,face,size',
        form: 'name',
        hr: 'noshade,size',
        iframe: 'frameborder,height,longdesc,marginheight,marginwidth,name,scrolling,src',
        li: 'type,value',
        ol: 'start,type',
        ul: 'type'
      }
    },
    filters: [
      { attrs: 'align', only: 'applet,caption,div,h1,h2,h3,h4,h5,h6,hr,iframe,input,legend,object,p,table' },
      { attrs: 'bgcolor', only: 'body,table,td,th,tr' },
      { attrs: 'width', only: 'applet,hr,iframe,pre,td,th' },
      { attrs: 'height,nowrap', only: 'td,th' },
      { attrs: 'compact', only: 'dir,menu,ol,ul' },
      { attrs: 'target', only: 'a,base,form,link' },
      { attrs: 'border,hspace,vspace', only: 'img,object' }
    ]
  }
});

var frameset = transitional.extend({
  tags: {
    inline: '',
    block: 'frame,frameset',
    unary: 'frame',
    unclosable: '',
    cdata: ''
  },
  attrs: {
    tag: {
      optional: {
        frame: 'frameborder,longdesc,marginheight,marginwidth,name,noresize,scrolling,src',
        frameset: 'cols,rows'
      }
    }
  }
});



var fillAttrs = {
  empty: 'checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected'
};

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
var strict = {
  tags: 'a,abbr,acronym,address,area,b,base,bdo,big,blockquote,body,br,button,caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,fieldset,form,h1,h2,h3,h4,h5,h6,head,hr,html,i,img,input,ins,kbd,label,legend,li,link,map,meta,noscript,object,ol,optgroup,option,p,param,pre,q,samp,script,select,small,span,strong,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,title,tr,tt,ul,var',
  groups: {
    form_controls: 'input,select,textarea,label,button',
    fontstyle: 'tt,i,b,big,small',
    phrase: 'em,strong,dfn,code,samp,kbd,var,cite,abbr,acronym',
    special: 'a,img,object,br,script,map,q,sub,sup,span,bdo',
    heading: 'h1,h2,h3,h4,h5,h6',
    inline: '#pcdata,fontstyle,phrase,special,form_controls',
    list: 'ul,ol',
    block: 'heading,pre,p,dl,div,noscript,blockquote,form,hr,table,fieldset,address',
    flow: 'inline,block',
    pre_excluded: 'img,object,big,small,sub,sup',
    document_body: 'body'
  },
  implicit: 'body,head,html,tbody',
  close_optional: 'body,colgroup,dd,dt,head,html,li,option,p,tbody,td,tfoot,th,thead,tr',
  unary: [{tags: 'area,base,br,col,hr,img,input,link,meta,param'}],
  not_empty: [{tags: 'blockquote,b,dl,fieldset,form,ul,ol,map,optgroup,select,thead,tfoot,tbody,tr'}]
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
    {'a,address,bdo,caption,dd,fontstyle,heading,legend,phrase,p,pre,q,span,sub,sup', children: 'inline'},
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
};

var transitional = {
  tags: '+applet,basefont,center,dir,font,iframe,isindex,menu,s,strike,u,noframes',
  groups: {
    fontstyle: '+s,strike,u',
    list: '+dir,menu',
    pre_excluded: '+applet,font,basefont',
    special: '+applet,font,basefont,iframe',
    block: '+center,noframes,isindex',
    noframes_content: 'flow'
  },
  not_empty: [{tags: 'dir,menu'}],
  unary: [{tags: 'basefont,isindex'}],
  banned_descendents: [
    {tags: 'dir,menu', banned: 'block'}
  ],
  allowed_children: [
    {tags: 'applet', children: 'param,flow'},
    {tags: 'center,iframe', children: 'flow'},
    {tags: 'noframes', children: 'noframes_content'}
    {tags: 'font', children: 'inline'}
  ]
};

var frameset = {
  tags: 'frame,frameset',
  groups: {
    document_body: 'frameset'
    noframes_content: 'body'
  },
  unary: [{tags: 'frame'}],
  exact_children: [
    {tags: 'noframes', children: 'noframes_content'}
  ],
  banned_descendents: [
    {tags: 'noframes', banned: 'noframes'}
  ],
  requires_one_child_from: [{
    {tags: 'frameset', child: 'frameset,frame'}
  }],
  allowed_children: [
    {tags: 'frameset', children: 'frame,frameset,noframes'}
  ]
};

//html must have xmlns=http://www.w3.org/1999/xhtml
*/