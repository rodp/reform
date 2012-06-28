(function() {
  var $fake, $orig, CheckBox, setup;

  CheckBox = require("/checkbox.coffee");

  module("CheckBox");

  $orig = null;

  $fake = null;

  setup = function(attrs) {
    if (attrs == null) attrs = "";
    $orig = $("<input type=\"checkbox\" class=\"reform-checkbox\" " + attrs + ">");
    $orig.appendTo("#qunit-fixture");
    new CheckBox($orig.get(0));
    return $fake = $orig.parent();
  };

  test("The fake wraps the original", 1, function() {
    setup();
    return ok($fake.is(".reform-checkbox-fake"), "Parent should be the fake");
  });

  test("Fake gets the 'disabled' class when disabled", 1, function() {
    setup("disabled");
    return ok($fake.is(".disabled"), "Fake should have class 'disabled'");
  });

  asyncTest("Fake gets the 'checked' class", 1, function() {
    setup();
    $orig.attr("checked", true).trigger("change");
    return setTimeout((function() {
      ok($fake.is(".checked"), "Fake should have class 'checked'");
      return start();
    }), 0);
  });

  asyncTest("States must match before and after the fake is clicked", 2, function() {
    var match;
    setup();
    match = function() {
      ok($fake.is(".checked") === $orig.is(":checked"), "States should be the same");
      return start();
    };
    match();
    $orig.attr("checked", true).trigger("change");
    return setTimeout(match, 0);
  });

}).call(this);
