$(document).ready(function() {
  var html = [
    "<title></title>",
    "<table><tbody></tbody><col></table>",
    "<tag><img apple=\"no\" banana='yes'></img></tag>",
    "<form action=''>",
    "  <fish></fish>",
    "  <fieldset>",
    "    <img>",
    "    <legend></legend>",
    "    <legend></legend>",
    "    <input>",
    "    <!--</html><!-- :D -->",
    "  </fieldset>",
    "</form>",
    "<table>",
    "    <col>",
    "    <tr>",
    "      <td>",
    "  </tbody>",
    "</table>",
    "<del><p>hallo</p></del>",
    "</body>",
    "<img>",
    "<img>",
    "<p><a></a></p>",
    "<form><fieldset><input type checked disabled='blah'></fieldset></form>",
    "</html>"
  ].join("\n");

  $.htmlValidator.doctypes;
  $.htmlValidator.doctype("HTML 4.01 Strict");
  $.htmlValidator.parseSettings();
  $.htmlValidator.parseSettings({});
  $.htmlValidator.parseSettings({url: ""});
  $.htmlValidator.parseSettings({html: html});
  $.htmlValidator.parseSettings({fragment: $("div")});
  $.htmlValidator.parse({doctype: "HTML 4.01 Frameset", html: html});
  console.log($.htmlValidator.parse({doctype: "HTML 4.01 Transitional", html: html}).call($.htmlValidator.fn.draw));
  console.log($.htmlValidator.validate({doctype: "HTML 4.01 Transitional", html: html}));
  
  //$.htmlValidator.parse({doctype: "HTML 4.01 Transitional"}); //Parses current page by AJAX with GET
  //$.htmlValidator.parse({doctype: "HTML 4.01 Transitional", type: 'post', data: {foo: 'bar'}); //Default loads current page by AJAX with POST
  //$.htmlValidator.parse({doctype: validator.doctype("HTML 4.01 Transitional"), html: html}); 
  //$.htmlValidator.validate();
  //$.htmlValidator.validate({fragment: $("#section").html()});
  //$.htmlValidator.validate({url: "/foo/bar"});
  //$.htmlValidator.validate({formatted: true});
  //$.htmlValidator.validate({formatted: false});
});