$(document).ready(function() {
  var html = "<title></title>\n<table><tbody></tbody><col></table><tag><img banana='yes'></img></tag><form action=''><fish></fish><fieldset><img><legend></legend><legend></legend><input><!--</html><!-- :D --></fieldset>\n</form><table>\n<col>\n<tr><td></tbody></table>\n<del><p>hallo</p></del>\n</body><img><img><p><a></a></p><form><fieldset><input type checked disabled='blah'></fieldset></form></html>";
  var validator = $.htmlValidator();
  console.log(validator.doctypes);
  console.log(validator.parseSettings());
  console.log(validator.parseSettings({}));
  console.log(validator.parseSettings({html: $("div")}));
  console.log(validator.parseSettings({html: html}));
  /*console.log(validator.parse({doctype: "HTML 4.01 Transitional"}));
  console.log(validator.parse({doctype: "HTML 4.01 Transitional", html: html}));
  console.log(validator.parse({doctype: validator.doctype("HTML 4.01 Transitional"), html: html}));
  console.log(validator.validate({doctype: "HTML 4.01 Transitional", html: html}));
  console.log(validator.doctype("HTML 4.01 Transitional"));*/
  // $.htmlValidator().validate();
  // $.htmlValidator().validate({string: $("html").html()});
  // $.htmlValidator().validate({string: $("#section").html()});
  // $.htmlValidator().validate({url: "http://www.google.com"});
  // $.htmlValidator().validate({string: "<html></html>"});
  // $.htmlValidator().validate({doctype: "html 5"});
  // $.htmlValidator().validate({format: 'html'});
  // $.htmlValidator().validate({format: 'list'});
  // $.htmlValidator().validate({format: 'data'});
});