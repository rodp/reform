;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var AutocompleteBox, Cache,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

AutocompleteBox = (function() {
  var cache;

  AutocompleteBox.prototype.options = {
    data: [],
    url: null,
    dataType: 'json',
    max: 1000,
    selected: 0,
    minChars: 2,
    delay: 300,
    matchCase: false,
    colorTitle: true,
    matchAll: false,
    placeholder: "Input search string..."
  };

  AutocompleteBox.prototype.KEY = {
    UP: 38,
    DOWN: 40,
    DEL: 46,
    RETURN: 13,
    ESC: 27,
    PAGEUP: 33,
    PAGEDOWN: 34
  };

  cache = null;

  function AutocompleteBox(select, options) {
    var delay,
      _this = this;
    this.select = select;
    this.onChange = __bind(this.onChange, this);
    this.parse = __bind(this.parse, this);
    this.request = __bind(this.request, this);
    this.colorTitles = __bind(this.colorTitles, this);
    this.refresh = __bind(this.refresh, this);
    this.close = __bind(this.close, this);
    this.open = __bind(this.open, this);
    this.selectCurrent = __bind(this.selectCurrent, this);
    this.setHover = __bind(this.setHover, this);
    this.fillOptions = __bind(this.fillOptions, this);
    $.extend(true, this.options, options);
    this.cache = new Cache(this.options);
    this.orig = $(this.select);
    if (this.orig.is(".reformed")) {
      return;
    }
    this.body = $("body");
    if (this.options.url == null) {
      this.options.delay = 0;
    }
    this.fake = $("<div/>");
    this.fake.attr("class", this.orig.attr("class"));
    this.orig.hide().attr("class", "reformed");
    this.fake.removeClass("reform-autocompletebox").addClass("reform-autocompletebox-fake");
    if (this.orig.is(":disabled")) {
      this.fake.addClass("disabled");
    }
    this.input = $("<input/>");
    this.input.addClass("reform-autocompletebox-input placeholder");
    this.input.val(this.options.placeholder);
    this.fake.append(this.input);
    this.refresh();
    this.orig.after(this.fake).appendTo(this.fake);
    this.floater = null;
    delay = (function() {
      var timer;
      timer = 0;
      return function(callback, ms) {
        clearTimeout(timer);
        return timer = setTimeout(callback, ms);
      };
    })();
    this.input.on("focus", function(e) {
      if (_this.input.val() === _this.options.placeholder) {
        _this.input.val('');
        return _this.input.removeClass('placeholder');
      }
    });
    this.input.on("keyup.autocomplete", function(e) {
      if (_this.orig.is(":disabled")) {
        return;
      }
      e.stopPropagation();
      if (e.keyCode === _this.KEY.UP) {
        e.preventDefault();
      }
      switch (e.keyCode) {
        case _this.KEY.DOWN:
          if (_this.floater === null) {
            _this.onChange(function() {
              _this.options.selected = 0;
              _this.open();
              return _this.refresh();
            });
          } else {
            _this.setHover(_this.options.selected + 1);
          }
          return;
        case _this.KEY.UP:
          _this.setHover(_this.options.selected - 1);
          return;
        case _this.KEY.ESC:
          _this.close();
          return;
      }
      return delay(function() {
        _this.currentSelection = _this.input.val();
        switch (e.keyCode) {
          case _this.KEY.RETURN:
            return _this.onChange(function() {
              return _this.selectCurrent();
            });
          default:
            _this.options.selected = 0;
            return _this.onChange(function() {
              if (_this.floater === null) {
                _this.open();
                return _this.refresh();
              } else {
                return _this.refresh();
              }
            });
        }
      }, _this.options.delay);
    });
    this.input.on("blur", function(e) {
      return _this.close();
    });
    this.body.on("reform.open", function(e) {
      if (e.target !== _this.select) {
        return _this.close();
      }
    });
  }

  AutocompleteBox.prototype.fillOptions = function() {
    var $list, isAny, num,
      _this = this;
    if (this.floater == null) {
      return;
    }
    this.floater.empty();
    $list = $("<div/>").appendTo(this.floater);
    $list.attr("class", "reform-autocompletebox-list");
    isAny = false;
    num = 0;
    $.each(this.options.data, function(i, item) {
      var $item, currentSelection, title;
      if (_this.options.max <= num) {
        return false;
      }
      if (!_this.options.matchAll) {
        title = item.title;
        currentSelection = _this.currentSelection;
        if (!_this.options.matchCase) {
          title = title.toLowerCase();
          currentSelection = currentSelection.toLowerCase();
        }
        if (title.indexOf(currentSelection) === -1) {
          return;
        }
      }
      isAny = true;
      $item = $("<div/>");
      $item.attr("class", "reform-autocompletebox-item");
      $item.attr("title", item.title);
      $item.attr("value", item.value);
      $item.html(item.title);
      $item.appendTo($list);
      $item.on("mousedown", function(e) {
        return e.preventDefault();
      });
      $item.on("click", function(e) {
        if ($item.is('.disabled')) {
          return;
        }
        return _this.selectCurrent();
      });
      $item.on("mouseenter", function(e) {
        var elem;
        elem = e.target;
        return _this.setHover($(elem).index() + 1);
      });
      return num++;
    });
    if (!isAny) {
      return this.close();
    }
  };

  AutocompleteBox.prototype.setHover = function(newSelected) {
    var $list;
    if (this.floater == null) {
      return;
    }
    $list = this.floater.find('.reform-autocompletebox-list');
    if (newSelected < 1) {
      return;
    }
    if (newSelected > $list.children().length) {
      return;
    }
    this.options.selected = newSelected;
    $list.children().removeClass("reform-autocompletebox-hover");
    return $list.find(':nth-child(' + this.options.selected + ')').addClass("reform-autocompletebox-hover");
  };

  AutocompleteBox.prototype.selectCurrent = function() {
    var $selected, title, value;
    if ((this.floater == null) || this.options.selected === 0) {
      return;
    }
    $selected = this.floater.find('.reform-autocompletebox-list').find(':nth-child(' + this.options.selected + ')');
    $selected.addClass('selected');
    value = $selected.attr("value");
    title = $selected.attr("title");
    this.orig.val(value);
    this.input.val(title);
    this.orig.trigger("change");
    return this.close();
  };

  AutocompleteBox.prototype.open = function() {
    var $window, pos,
      _this = this;
    this.orig.trigger("reform.open");
    this.floater = $("<div/>");
    this.floater.attr("class", "reform-autocompletebox-options");
    this.floater.css("min-width", this.fake.outerWidth() - 10 - 2);
    this.floater.addClass(this.orig.data("options-class"));
    this.body.append(this.floater);
    this.body.on("click.autocomplete", function(e) {
      if (!$(e.target).hasClass('reform-autocompletebox-input')) {
        _this.body.off("click.autocomplete");
        return _this.close();
      }
    });
    pos = this.fake.offset();
    this.floater.show();
    $window = $(window);
    pos.top += this.fake.outerHeight();
    return this.floater.css(pos);
  };

  AutocompleteBox.prototype.close = function() {
    var _ref;
    if ((_ref = this.floater) != null) {
      _ref.remove();
    }
    return this.floater = null;
  };

  AutocompleteBox.prototype.refresh = function() {
    this.fake.toggleClass("disabled", this.orig.is(":disabled"));
    this.fillOptions();
    if ((this.floater != null) && this.options.colorTitle) {
      return this.colorTitles();
    }
  };

  AutocompleteBox.prototype.colorTitles = function() {
    var colorTitle,
      _this = this;
    colorTitle = function(title) {
      var coloredTitle, pos;
      coloredTitle = "";
      pos = title.toLowerCase().indexOf(_this.currentSelection.toLowerCase());
      if (pos !== -1) {
        coloredTitle += title.substr(0, pos);
        coloredTitle += "<strong>";
        coloredTitle += title.substr(pos, _this.currentSelection.length);
        coloredTitle += "</strong>";
        coloredTitle += title.substr(pos + _this.currentSelection.length, title.length);
      } else {
        coloredTitle = title;
      }
      return coloredTitle;
    };
    return this.floater.find(".reform-autocompletebox-item").each(function(num, item) {
      var $item, title;
      $item = $(item);
      title = $item.html();
      title = colorTitle(title);
      return $item.html(title);
    });
  };

  AutocompleteBox.prototype.request = function(term, success, failure) {
    var data, extraParams,
      _this = this;
    if (!this.options.matchCase) {
      term = term.toLowerCase();
    }
    data = this.cache.load(term);
    if (data) {
      if (data.length) {
        return success(data, term);
      }
    } else if (this.options.url != null) {
      extraParams = {
        timestamp: new Date()
      };
      if (this.options.extraParams != null) {
        $.each(this.options.extraParams, function(key, param) {
          return extraParams[key] = (typeof param === "function" ? param() : param);
        });
      }
      return $.ajax({
        dataType: this.options.dataType,
        url: this.options.url,
        data: $.extend({
          q: term,
          matchCase: this.options.matchCase,
          limit: this.options.max
        }, extraParams),
        success: function(data) {
          var parsed, _base;
          parsed = (typeof (_base = _this.options).parse === "function" ? _base.parse(data, term) : void 0) || _this.parse(data, term);
          _this.options.data = parsed;
          _this.cache.add(term, parsed);
          return success(parsed, term);
        },
        error: function(data) {
          return failure(data, term);
        }
      });
    } else {
      return failure('Set options.url', term);
    }
  };

  AutocompleteBox.prototype.parse = function(data, term) {
    var parsed,
      _this = this;
    parsed = [];
    $.each(data, function(num, item) {
      return parsed.push({
        value: item.value,
        title: _this.options.formatResult && _this.options.formatResult(item) || item.title
      });
    });
    return parsed;
  };

  AutocompleteBox.prototype.onChange = function(callback) {
    var failureCallback, successCallback,
      _this = this;
    if (this.options.minChars >= this.currentSelection.length) {
      this.close();
      return;
    }
    successCallback = function(data) {
      _this.refresh();
      return callback();
    };
    failureCallback = function(data) {};
    if (this.options.url != null) {
      return this.request(this.currentSelection, successCallback, failureCallback);
    } else {
      this.refresh();
      return callback();
    }
  };

  return AutocompleteBox;

})();

Cache = (function() {
  Cache.prototype.data = {};

  Cache.prototype.length = 0;

  Cache.prototype.options = {
    cacheLength: 100,
    matchContains: false,
    matchSubset: true
  };

  function Cache(options) {
    this.load = __bind(this.load, this);
    $.extend(true, this.options, options);
  }

  Cache.prototype.matchSubset = function(s, sub) {
    var i;
    if (!this.options.matchCase) {
      s = s.toLowerCase();
    }
    i = s.indexOf(sub);
    if (this.options.matchContains === "word") {
      i = s.toLowerCase().search("\\b" + sub.toLowerCase());
    }
    if (i === -1) {
      return false;
    }
    return i === 0 || this.options.matchContains;
  };

  Cache.prototype.add = function(q, value) {
    if (this.length > this.options.cacheLength) {
      flush();
    }
    if (!this.data[q]) {
      this.length++;
    }
    return this.data[q] = value;
  };

  Cache.prototype.flush = function() {
    this.data = {};
    return this.length = 0;
  };

  Cache.prototype.load = function(q) {
    var c, csub, i, k, self;
    if (!this.options.cacheLength || !this.length) {
      return null;
    }
    if (!this.options.url && this.options.matchContains) {
      csub = [];
      for (k in this.data) {
        if (k.length > 0) {
          c = data[k];
          $.each(c, function(i, x) {
            if (this.matchSubset(x.title, q)) {
              return csub.push(x);
            }
          });
        }
      }
      return csub;
    } else if (this.data[q]) {
      return this.data[q];
    } else if (this.options.matchSubset) {
      i = q.length - 1;
      while (i >= this.options.minChars) {
        c = this.data[q.substr(0, i)];
        if (c) {
          csub = [];
          self = this;
          $.each(c, function(i, x) {
            if (self.matchSubset(x.title, q)) {
              return csub[csub.length] = x;
            }
          });
          return csub;
        }
        i--;
      }
    }
    return null;
  };

  return Cache;

})();

module.exports = AutocompleteBox;


},{"jquery-commonjs":8}],2:[function(require,module,exports){
var CheckBox,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

CheckBox = (function() {
  function CheckBox(input) {
    this.refresh = __bind(this.refresh, this);
    var _this = this;
    this.orig = $(input);
    if (this.orig.is(".reformed")) {
      return;
    }
    if (this.orig.is(":radio")) {
      this.siblings = $("[name='" + (this.orig.attr("name")) + "']").not(this.orig);
    }
    this.fake = $("<label/>");
    this.fake.attr("class", this.orig.attr("class"));
    this.orig.hide().attr("class", "reformed");
    this.fake.removeClass("reform-checkbox").addClass("reform-checkbox-fake");
    if (this.orig.is(":checked")) {
      this.fake.addClass("checked");
    }
    if (this.orig.is(":disabled")) {
      this.fake.addClass("disabled");
    }
    if (this.orig.is(":radio")) {
      this.fake.addClass("radio");
    }
    this.orig.after(this.fake).appendTo(this.fake);
    this.fake.on("mousedown", function(e) {
      return e.preventDefault();
    });
    this.orig.on("reform.sync change DOMSubtreeModified", function() {
      return setTimeout(_this.refresh, 0);
    });
  }

  CheckBox.prototype.refresh = function() {
    var _ref;
    this.fake.toggleClass("disabled", this.orig.is(":disabled"));
    this.fake.removeClass("checked");
    if (this.orig.is(":checked")) {
      this.fake.addClass("checked");
    }
    return (_ref = this.siblings) != null ? _ref.each(function() {
      return $(this).parent().removeClass("checked");
    }) : void 0;
  };

  return CheckBox;

})();

module.exports = CheckBox;


},{"jquery-commonjs":8}],3:[function(require,module,exports){
var SelectBox,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

SelectBox = (function() {
  function SelectBox(select) {
    var _this = this;
    this.select = select;
    this.refresh = __bind(this.refresh, this);
    this.close = __bind(this.close, this);
    this.open = __bind(this.open, this);
    this.options = __bind(this.options, this);
    this.orig = $(this.select);
    if (this.orig.is(".reformed")) {
      return;
    }
    this.body = $("body");
    this.fake = $("<div/>");
    this.fake.attr("class", this.orig.attr("class"));
    this.orig.hide().attr("class", "reformed");
    this.fake.removeClass("reform-selectbox").addClass("reform-selectbox-fake");
    if (this.orig.is(":disabled")) {
      this.fake.addClass("disabled");
    }
    this.refresh();
    this.orig.after(this.fake).appendTo(this.fake);
    this.floater = null;
    this.fake.on("click", function(e) {
      if (_this.orig.is(":disabled")) {
        return;
      }
      e.stopPropagation();
      if (_this.floater === null) {
        return _this.open();
      } else {
        return _this.close();
      }
    });
    this.fake.on("mousedown", function(e) {
      return e.preventDefault();
    });
    this.orig.on("reform.sync change DOMSubtreeModified", this.refresh);
    this.body.on("reform.open", function(e) {
      if (e.target !== _this.select) {
        return _this.close();
      }
    });
    $('.reform-selectbox-options').remove();
  }

  SelectBox.prototype.options = function() {
    var $list,
      _this = this;
    if (this.floater == null) {
      return;
    }
    this.floater.empty();
    $list = $("<div/>").appendTo(this.floater);
    $list.attr("class", "reform-selectbox-list");
    return this.orig.find("option").each(function(i, option) {
      var $item, $option;
      $option = $(option);
      $item = $("<div/>");
      $item.attr("class", "reform-selectbox-item");
      if ($option.is(":selected")) {
        $item.addClass("selected");
      }
      if ($option.is(":disabled")) {
        $item.addClass("disabled");
      }
      $item.attr("title", $option.attr("title"));
      $item.attr("value", $option.val());
      $item.text($option.text());
      $item.appendTo($list);
      $item.on("mousedown", function(e) {
        return e.preventDefault();
      });
      return $item.on("click", function(e) {
        var values;
        if ($item.is('.disabled')) {
          return;
        }
        if (_this.orig.is("[multiple]")) {
          $item.toggleClass("selected");
          e.stopPropagation();
        } else {
          $item.siblings().andSelf().removeClass("selected");
          $item.addClass("selected");
        }
        values = $item.parent().find(".reform-selectbox-item.selected").map(function() {
          return $(this).val();
        });
        return _this.orig.val(values).trigger("change");
      });
    });
  };

  SelectBox.prototype.open = function() {
    var $window, pos;
    this.orig.trigger("reform.open");
    this.floater = $("<div/>");
    this.floater.attr("class", "reform-selectbox-options");
    this.floater.css("min-width", this.fake.outerWidth());
    this.floater.addClass(this.orig.data("options-class"));
    this.body.append(this.floater);
    this.options();
    this.body.one("click", this.close);
    pos = this.fake.offset();
    this.floater.show();
    $window = $(window);
    if (pos.top + this.floater.outerHeight() > $window.height()) {
      pos.top = pos.top - this.floater.outerHeight() + this.fake.outerHeight();
    }
    if (pos.left + this.floater.outerWidth() > $window.width()) {
      pos.left = pos.left - this.floater.outerWidth() + this.fake.outerWidth();
    }
    return this.floater.css(pos);
  };

  SelectBox.prototype.close = function() {
    var _ref;
    if ((_ref = this.floater) != null) {
      _ref.remove();
    }
    return this.floater = null;
  };

  SelectBox.prototype.refresh = function() {
    var plural, selected, title;
    this.fake.toggleClass("disabled", this.orig.is(":disabled"));
    title = this.orig.data('title');
    if (!title) {
      selected = this.orig.find("option").filter(function() {
        return this.selected && $(this).data("count-option") !== "no";
      });
      plural = this.orig.data("plural");
      title = (plural != null) && selected.length > 1 ? "" + selected.length + " " + plural : selected.map(function() {
        return $(this).text();
      }).get().join(", ");
      if (!title) {
        title = this.orig.attr("title");
      }
      if (title == null) {
        title = "Select";
      }
    }
    this.fake.contents().filter(function() {
      return this.nodeType === Node.TEXT_NODE;
    }).remove();
    this.fake.append(document.createTextNode(title));
    return this.options();
  };

  return SelectBox;

})();

module.exports = SelectBox;


},{"jquery-commonjs":8}],4:[function(require,module,exports){
var AutocompleteBox;

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

AutocompleteBox = require("../src/autocompletebox.coffee");

module.exports = function() {
  var $fake, $orig, setup;
  QUnit.module("AutocompleteBox");
  $orig = null;
  $fake = null;
  setup = function(options, attrs) {
    if (options == null) {
      options = [];
    }
    if (attrs == null) {
      attrs = "";
    }
    $orig = $("<select class=\"reform-autocompletebox\" " + attrs + ">" + (options.map(function(opt) {
      return "<option value=\"" + opt.value + "\">" + opt.text + "</option>";
    }).join("")) + "</select>");
    $orig.appendTo("#qunit-fixture");
    new AutocompleteBox($orig.get(0));
    return $fake = $orig.parent();
  };
  test("The fake wraps the original", 1, function() {
    setup();
    return ok($fake.is(".reform-autocompletebox-fake"), "Parent should be the fake");
  });
  return test("Title input created", 1, function() {
    setup();
    return ok($fake.find(':first-child').hasClass("reform-autocompletebox-input"), "Fake should have title input");
  });
};


},{"../src/autocompletebox.coffee":1,"jquery-commonjs":8}],5:[function(require,module,exports){
var CheckBox;

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

CheckBox = require("../src/checkbox.coffee");

module.exports = function() {
  var $fake, $orig, setup;
  QUnit.module("CheckBox");
  $orig = null;
  $fake = null;
  setup = function(attrs) {
    if (attrs == null) {
      attrs = "";
    }
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
  return asyncTest("States must match before and after the fake is clicked", 2, function() {
    var match;
    setup();
    match = function() {
      ok($fake.is(".checked") === $orig.is(":checked"), "States should be the same");
      return start();
    };
    match();
    stop();
    $orig.attr("checked", true).trigger("change");
    return setTimeout(match, 0);
  });
};


},{"../src/checkbox.coffee":2,"jquery-commonjs":8}],6:[function(require,module,exports){
var SelectBox;

if (window.$ == null) {
  window.$ = require("jquery-commonjs");
}

SelectBox = require("../src/selectbox.coffee");

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


},{"../src/selectbox.coffee":3,"jquery-commonjs":8}],7:[function(require,module,exports){
require("./checkbox_test.coffee")();

require("./selectbox_test.coffee")();

require("./autocompletebox_test.coffee")();


},{"./autocompletebox_test.coffee":4,"./checkbox_test.coffee":5,"./selectbox_test.coffee":6}],8:[function(require,module,exports){

},{}]},{},[7])
;