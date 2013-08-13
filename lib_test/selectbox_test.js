// Generated by CoffeeScript 1.4.0
(function() {
  var SelectBox, _ref;

  if ((_ref = window.$) == null) {
    window.$ = require("jquery-commonjs");
  }

  SelectBox = require("../lib/selectbox");

  module.exports = function() {
    var $fake, $orig, setup;
    QUnit.module("SelectBox");
    $orig = null;
    $fake = null;
    setup = function(options, attrs) {
      if (options == null) {
        options = [];
      }
      if (attrs == null) {
        attrs = "";
      }
      $orig = $("<select class=\"reform-selectbox\" " + attrs + ">" + (options.map(function(opt) {
        return "<option value=\"" + opt.value + "\">" + opt.text + "</option>";
      }).join("")) + "</select>");
      $orig.appendTo("#qunit-fixture");
      new SelectBox($orig.get(0));
      return $fake = $orig.parent();
    };
    test("The fake wraps the original", 1, function() {
      setup();
      return ok($fake.is(".reform-selectbox-fake"), "Parent should be the fake");
    });
    return test("Fake gets the 'disabled' class when disabled", 1, function() {
      setup([], "disabled");
      return ok($fake.is(".disabled"), "Fake should have class 'disabled'");
    });
  };

}).call(this);