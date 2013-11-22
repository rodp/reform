window.$ ?= require "jquery-commonjs"
SelectBox = require "../lib/selectbox"

module.exports = ->
    
    QUnit.module "SelectBox"

    # Preparation
    $orig = null
    $fake = null
    setup = (options = [], attrs = "") ->
        $orig = $ "<select class=\"reform-selectbox\" #{attrs}>#{options.map((opt) -> "<option value=\"#{opt.value}\">#{opt.text}</option>").join("")}</select>"
        $orig.appendTo "#qunit-fixture"
        new SelectBox $orig.get(0)
        $fake = $orig.parent()

    test "The fake wraps the original", 1, ->
        setup()
        ok $fake.is(".reform-selectbox-fake"), "Parent should be the fake"

    test "Fake gets the 'disabled' class when disabled", 1, ->
        setup [], "disabled"
        ok $fake.is(".disabled"), "Fake should have class 'disabled'"

    test "The selected value is shown as title", 1, ->
        setup [{ value: 1, text: 'apple' }, { value: 2, text: 'orange' }]
        $fake.click()
        $('.reform-selectbox-item[value=2]').click();
        ok $fake.contents().filter(-> @nodeType is Node.TEXT_NODE)[0].textContent == 'orange', "Select and selected option labels should match"
