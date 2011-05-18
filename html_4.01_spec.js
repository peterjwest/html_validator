var html_401_spec = function(doctype) {
  this.strict = doctype.extend({
    groups: {
      tags: {
        all: 'a,abbr,acronym,address,area,b,base,bdo,big,blockquote,body,br,button,caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,fieldset,form,h1,h2,h3,h4,h5,h6,head,hr,html,i,img,input,ins,kbd,label,legend,li,link,map,meta,noscript,object,ol,optgroup,option,p,param,pre,q,samp,script,select,small,span,strong,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,title,tr,tt,ul,var',
        block: 'heading,pre,p,dl,div,noscript,blockquote,form,hr,table,fieldset,address',
        close_optional: 'body,colgroup,dd,dt,head,html,li,option,p,tbody,td,tfoot,th,thead,tr',
        document_body: 'body',
        flow: 'inline,block',
        form_controls: 'input,select,textarea,label,button',
        font_style: 'tt,i,b,big,small',
        phrase: 'abbr,acronym,cite,code,dfn,em,kbd,strong,samp,var',
        special: 'a,img,object,br,script,map,q,sub,sup,span,bdo',
        heading: 'h1,h2,h3,h4,h5,h6',
        implicit: 'body,head,html,tbody',
        inline: '#pcdata,font_style,phrase,special,form_controls',
        list: 'ul,ol',
        not_empty: 'blockquote,b,dl,fieldset,form,ul,ol,map,optgroup,select,thead,tfoot,tbody,tr',
        pre_excluded: 'img,object,big,small,sub,sup',
        unary: 'area,base,br,col,hr,img,input,link,meta,param',
        without_lang: 'base,br,param,script',
        without_title: 'base,head,html,meta,param,script,title'
      },
      attrs: {
        standard_events: 'onclick,ondblclick,onkeydown,onkeypress,onkeyup,onmousedown,onmousemove,onmouseout,onmouseover,onmouseup'
      }
    },
    attrs: {
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
        {attrs: 'class', include: 'all', values: '#cdata'},
        {attrs: 'class', exclude: 'style,without_title'},
        {attrs: 'colspan,rowspan', include: 'td,th', values: '#number'},
        {attrs: 'coords', include: 'area', values: '#cdata'},
        {attrs: 'coords,name', include: 'a', values: '#cdata'},
        {attrs: 'declare', include: 'object', values: '#self'},
        {attrs: 'defer', include: 'script', values: '#self'},
        {attrs: 'dir', include: 'all', values: 'ltr,rtl'},
        {attrs: 'dir', exclude: 'bdo,frame,without_lang'},      
        {attrs: 'disabled', include: 'button,input,optgroup,option,select,textarea', values: '#self'},
        {attrs: 'for', include: 'label', values: '#name'},
        {attrs: 'frame', include: 'table', values: 'void,above,below,hsides,lhs,rhs,vsides,box,border'},
        {attrs: 'headers', include: 'td,th', values: '#names'},
        {attrs: 'height,width', include: 'img,object', values: '#length'},
        {attrs: 'href', include: 'a,area,base,link', values: '#cdata'},
        {attrs: 'hreflang', include: 'a,link', values: '#name'},
        {attrs: 'http-equiv,name', include: 'meta', values: '#self'},
        {attrs: 'id', include: 'all', values: '#name'},
        {attrs: 'id', exclude: 'base,head,html,meta,script,style,title'},
        {attrs: 'ismap', include: 'img,input', values: '#self'},
        {attrs: 'label,value', include: 'option', values: '#cdata'},
        {attrs: 'lang', include: 'all', values: '#name'},
        {attrs: 'lang', exclude: 'without_lang'},
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
        {attrs: 'standard_events', include: 'all', values: '#cdata'},
        {attrs: 'standard_events', exclude: 'bdo,head,html,meta,style,title,without_lang'},
        {attrs: 'onload,onunload', include: 'body', values: '#cdata'},
        {attrs: 'onselect', include: 'input,textarea', values: '#cdata'},
        {attrs: 'profile', include: 'head', values: '#cdata'},
        {attrs: 'readonly', include: 'input,textarea', values: '#self'},
        {attrs: 'rel,rev,type', include: 'a,link', values: '#cdata'},
        {attrs: 'rules', include: 'table', values: 'none,groups,rows,cols,all'},
        {attrs: 'scheme', include: 'meta', values: '#cdata'},
        {attrs: 'scope', include: 'td,th', values: 'row,col,rowgroup,colgroup'},
        {attrs: 'selected', include: 'option', values: '#self'},
        {attrs: 'shape', include: 'a,area', values: 'rect,circle,poly,default'},
        {attrs: 'size', include: 'select', values: '#number'},
        {attrs: 'span', include: 'col,colgroup', values: '#number'},
        {attrs: 'src', include: 'script', values: '#cdata'},
        {attrs: 'style', include: 'all', values: '#cdata'},
        {attrs: 'style', exclude: 'style,without_title'},
        {attrs: 'summary', include: 'table', values: '#cdata'},
        {attrs: 'tabindex', include: 'a,area,button,input,object,select,textarea', values: '#number'},
        {attrs: 'title', include: 'all', values: '#cdata'},
        {attrs: 'title', exclude: 'without_title'},
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
        {tags: 'pre', banned: 'pre_excluded'}
      ],
      requires_one_child_from: [
        {tags: 'head', child: 'title'},
        {tags: 'table', child: 'tbody'}
      ],
      exact_children: [
        {tags: 'root', children: 'html'},
        {tags: 'html', children: 'head,document_body'}
      ],
      unique_children: [
        {tags: 'head', unique: 'title,base'},
        {tags: 'fieldset', unique: 'legend'}
      ],
      allowed_children: [
        {tags: 'a,address,bdo,caption,dd,font_style,heading,legend,phrase,p,pre,q,span,sub,sup', children: 'inline'},
        {tags: 'b,blockquote,body,form', children: 'block,script'},
        {tags: 'button,dt,del,ins,div,li,th,td', children: 'flow'},
        {tags: 'colgroup', children: 'col'},
        {tags: 'dl', children: 'dt,dd'},
        {tags: 'fieldset', children: 'flow,legend'},
        {tags: 'head', children: 'title,base,script,style,meta,link,object'},
        {tags: 'option,textarea,title', children: '#pcdata'},
        {tags: 'list', children: 'li'},
        {tags: 'map', children: 'block,area'},
        {tags: 'noscript', children: 'block'},
        {tags: 'object', children: 'param,flow'},
        {tags: 'optgroup', children: 'option'},
        {tags: 'script,style', children: '#cdata'},
        {tags: 'select', children: 'optgroup,option'},
        {tags: 'table', children: 'caption,col,colgroup,thead,tfoot,tbody'},
        {tags: 'thead,tfoot,tbody', children: 'tr'},
        {tags: 'tr', children: 'td,th'}
      ]
    } 
  });

  this.transitional = this.strict.extend({
    groups: {
      tags: {
        all: '+applet,basefont,center,dir,font,iframe,isindex,menu,s,strike,u,noframes',
        block: '+center,noframes,isindex',
        font_style: '+s,strike,u',
        frame_elements: 'iframe',
        list: '+dir,menu',
        noframes_content: 'flow',
        not_empty: '+dir,menu',
        pre_excluded: '+applet,font,basefont',
        special: '+applet,font,basefont,iframe',
        unary: '+basefont,isindex',
        without_lang: '+basefont,applet,frame_elements',
        without_title: '+basefont'
      }
    },
    attrs: {
      required: [
        {attrs: 'size', include: 'basefont', values: '#cdata'},
        {attrs: 'height,width', include: 'applet,iframe,td,th', values: '#length'}
      ],
      optional: [
        {attrs: 'align', include: 'hr,table', values: 'left,center,right'},
        {attrs: 'align', include: 'div,heading,p', values: 'left,center,right,justify'},
        {attrs: 'align', include: 'caption,legend', values: 'top,bottom,left,right'},
        {attrs: 'align', include: 'applet,iframe,img,input,object', values: 'top,middle,bottom,left,right'},
        {attrs: 'alink,link,text,vlink', include: 'body', values: '#color'},
        {attrs: 'alt,arhive,code,codebase,name,object', include: 'applet', values: '#cdata'},
        {attrs: 'background', include: 'body', values: '#cdata'},
        {attrs: 'bgcolor', include: 'table,td,th,tr,body', values: '#color'},
        {attrs: 'border', include: 'img,object', values: '#number'},
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

  this.frameset = this.transitional.extend({
    groups: {
      tags: {
        all: '+frame,frameset',
        document_body: 'frameset',
        frame_elements: '+frame',
        noframes_content: 'body',
        unary: '+frame'
      }
    },
    attrs: {
      optional: [
        {attrs: 'cols,onload,onunload,rows', include: 'frameset', values: '#cdata'},
        {attrs: 'noresize', include: 'frame', values: '#self'}
      ]
    },
    rules: {
      exact_children: [{tags: 'noframes', children: 'noframes_content'}],
      banned_descendents: [{tags: 'noframes', banned: 'noframes'}],
      requires_one_child_from: [{tags: 'frameset', child: 'frameset,frame'}],
      allowed_children: [{tags: 'frameset', children: 'frame,frameset,noframes'}]
    }
  });
};