var html = "<title></title>\n<table><tbody></tbody><col></table><tag><img banana='yes'></img></tag><form action=''><fish></fish><fieldset><img><legend></legend><legend></legend><input><!--</html><!-- :D --></fieldset>\n</form><table>\n<col>\n<tr><td></tbody></table>\n<del><p>hallo</p></del>\n</body><img></html>";
var html = "<body><img><p><a></a></p><form><fieldset><input type checked disabled='blah'></fieldset></form></body>";
var spec = $.validateHtml({compute: true, spec: html_401_spec});
$.validateHtml({html: html, doctype: spec.transitional});