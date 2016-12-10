var Handlebars = require("handlebars/runtime");module.exports = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "<!DOCTYPE html>\r\n<html>\r\n<head>\r\n  <meta charset=\"utf-8\">\r\n  <meta name=\"viewport\" content=\"width=device-width\">\r\n  <meta name=\"theme-color\" content=\"#388E3C\">\r\n  <link rel=\"icon\" href=\"/imgs/icon.png\">\r\n  <link rel=\"manifest\" href=\"/manifest.json\">\r\n  <link rel=\"stylesheet\" href=\"/css/main.css\">\r\n  "
    + ((stack1 = ((helper = (helper = helpers.extraCss || (depth0 != null ? depth0.extraCss : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"extraCss","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n  "
    + ((stack1 = ((helper = (helper = helpers.scripts || (depth0 != null ? depth0.scripts : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"scripts","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n  <title>Wittr</title>\r\n</head>\r\n<body>\r\n  <div class=\"layout\">\r\n    <header class=\"toolbar\">\r\n      <h1 class=\"site-title\">Wittr</h1>\r\n    </header>\r\n    <main class=\"main\">\r\n      "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n    </main>\r\n  </div>\r\n</body>\r\n</html>";
},"useData":true});