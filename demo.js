$(document).ready(function() {
  var html = "<title></title>\n<table><tbody></tbody><col></table><tag><img banana='yes'></img></tag><form action=''><fish></fish><fieldset><img><legend></legend><legend></legend><input><!--</html><!-- :D --></fieldset>\n</form><table>\n<col>\n<tr><td></tbody></table>\n<del><p>hallo</p></del>\n</body><img><img><p><a></a></p><form><fieldset><input type checked disabled='blah'></fieldset></form></html>";
  var validator = $.htmlValidator();
  console.log(validator.doctypes);
  console.log(validator.parseSettings());
  console.log(validator.parseSettings({}));
  console.log(validator.parseSettings({url: ""}));
  console.log(validator.parseSettings({html: html}));
  console.log(validator.parseSettings({fragment: $("div")}));
  /*
  validator.parse({doctype: "HTML 4.01 Transitional"});
  validator.parse({doctype: "HTML 4.01 Transitional", html: html});
  validator.parse({doctype: validator.doctype("HTML 4.01 Transitional"), html: html});
  validator.validate({doctype: "HTML 4.01 Transitional", html: html});
  validator.doctype("HTML 4.01 Transitional");
  validator.validate();
  validator.validate({string: $("html").html()});
  validator.validate({string: $("#section").html()});
  validator.validate({url: "http://www.google.com"});
  validator.validate({string: "<html></html>"});
  validator.validate({doctype: "html 5"});
  validator.validate({format: 'html'});
  validator.validate({format: 'list'});
  validator.validate({format: 'data'});
  */
});