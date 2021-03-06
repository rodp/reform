// Generated by CoffeeScript 1.6.3
(function() {
  var SelectBox;

  if (window.$ == null) {
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
    test("Fake gets the 'disabled' class when disabled", 1, function() {
      setup([], "disabled");
      return ok($fake.is(".disabled"), "Fake should have class 'disabled'");
    });
    return test("The selected value is shown as title", 1, function() {
      setup([
        {
          value: 1,
          text: 'apple'
        }, {
          value: 2,
          text: 'orange'
        }
      ]);
      $fake.click();
      $('.reform-selectbox-item[value=2]').click();
      return ok($fake.contents().filter(function() {
        return this.nodeType === Node.TEXT_NODE;
      })[0].textContent === 'orange', "Select and selected option labels should match");
    });
  };

}).call(this);
