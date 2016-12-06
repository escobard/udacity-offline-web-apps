var Handlebars = require("handlebars/runtime");module.exports = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <div>\r\n          <label class=\"material-radio\">\r\n            <input type=\"radio\" name=\"connectionType\" value=\""
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.checked : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n            <span class=\"material-radio-btn\"></span>\r\n            <span class=\"material-radio-text\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\r\n          </label>\r\n        </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    return "checked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"scroller\">\r\n  <section class=\"card settings\">\r\n    <form class=\"settings-form\" action=\"/set\" method=\"POST\">\r\n      <h1>Connection to server</h1>\r\n      <div class=\"warning\">\r\n        <p>You browser doesn't support the fetch API, so this won't work. Try Chrome or Firefox.</p>\r\n      </div>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.connectionTypes : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </form>\r\n  </section>\r\n  <section class=\"card settings tester\">\r\n    <form class=\"test-form\">\r\n      <h1>Test results</h1>\r\n      <p>\r\n        During the course you'll be able to come here and run tests to verify everything\r\n        is working as expected.\r\n      </p>\r\n      <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label\">\r\n        <input class=\"mdl-textfield__input test-id\" type=\"text\" id=\"testId\" name=\"testId\" />\r\n        <label class=\"mdl-textfield__label\" for=\"testId\">Test ID</label>\r\n      </div>\r\n      <div class=\"feedback-text\"></div>\r\n      <div class=\"meme-container\"><div class=\"meme-img-container\"></div></div>\r\n    </form>\r\n  </section>\r\n</div>\r\n<script>\r\n  var config = {\r\n    appPort: "
    + this.escapeExpression(((helper = (helper = helpers.appPort || (depth0 != null ? depth0.appPort : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"appPort","hash":{},"data":data}) : helper)))
    + "\r\n  };\r\n</script>";
},"useData":true});