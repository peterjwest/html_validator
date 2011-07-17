var html = "<title></title>\n<table><tbody></tbody><col></table><tag><img banana='yes'></img></tag><form action=''><fish></fish><fieldset><img><legend></legend><legend></legend><input><!--</html><!-- :D --></fieldset>\n</form><table>\n<col>\n<tr><td></tbody></table>\n<del><p>hallo</p></del>\n</body><img></html>";
var html = "<body><img><p><a></a></p><form><fieldset><input type checked disabled='blah'></fieldset></form></body>";
//console.log($.htmlValidator().doctypes);
console.log($.htmlValidator().validate({doctype: "HTML 4.01 Transitional"}));

console.log($.htmlValidator().doctype("HTML 4.01 Strict"));
// $.htmlValidator().validate();
// $.htmlValidator().validate({string: $("html").html()});
// $.htmlValidator().validate({string: $("#section").html()});
// $.htmlValidator().validate({url: "http://www.google.com"});
// $.htmlValidator().validate({string: "<html></html>"});
// $.htmlValidator().validate({doctype: "html 5", render: false});
// $.htmlValidator()