;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
(function() {
  var AutocompleteBox, Cache, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.$) == null) {
    window.$ = require("jquery-commonjs");
  }

  AutocompleteBox = (function() {
    var cache;

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
      var delay, inlineOptions,
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

      this.options = {
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
        placeholder: "Input search string...",
        title: null,
        autocompleteClass: 'reform-autocompletebox',
        itemClass: 'reform-autocompletebox-item',
        hoverClass: 'reform-autocompletebox-hover',
        listClass: 'reform-autocompletebox-list',
        optionsClass: 'reform-autocompletebox-options',
        fakeClass: 'reform-autocompletebox-fake',
        inputClass: 'reform-autocompletebox-input'
      };
      this.orig = $(this.select);
      if (this.orig.is(".reformed")) {
        return;
      }
      inlineOptions = this.orig.data();
      $.extend(this.options, options);
      $.extend(this.options, inlineOptions);
      this.cache = new Cache(this.options);
      this.body = $("body");
      if (!(this.options.url != null)) {
        this.options.delay = 0;
      }
      this.fake = $("<div/>");
      this.fake.attr("class", this.orig.attr("class"));
      this.orig.hide().attr("class", "reformed");
      this.fake.removeClass(this.options.autocompleteClass).addClass(this.options.fakeClass);
      if (this.orig.is(":disabled")) {
        this.fake.addClass("disabled");
      }
      this.input = $("<input/>");
      this.input.addClass(this.options.inputClass + " placeholder");
      if (this.options.placeholder != null) {
        this.input.val(this.options.placeholder);
      }
      if (this.options.title != null) {
        this.input.val(this.options.title);
        this.currentSelection = this.options.title;
        this.input.removeClass("placeholder");
      }
      this.fake.append(this.input);
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
      this.input.on("click", function(e) {
        if (_this.input.val() === _this.options.placeholder) {
          _this.input.val('');
          return _this.input.removeClass('placeholder');
        }
      });
      this.input.on("keydown.autocomplete", function(e) {
        e.stopPropagation();
        if (_this.orig.is(":disabled")) {
          return;
        }
        if (e.keyCode === _this.KEY.UP) {
          e.preventDefault();
        }
        switch (e.keyCode) {
          case _this.KEY.DOWN:
            if (_this.floater === null) {
              _this.onChange(function() {
                return _this.options.selected = 0;
              });
            } else {
              _this.setHover(_this.options.selected + 1);
              _this.scrollTo();
            }
            return;
          case _this.KEY.UP:
            _this.setHover(_this.options.selected - 1);
            _this.scrollTo();
            return;
          case _this.KEY.ESC:
            _this.close();
            return;
        }
        return delay(function() {
          _this.currentSelection = _this.input.val();
          _this.orig.attr('data-title', _this.currentSelection);
          switch (e.keyCode) {
            case _this.KEY.RETURN:
              return _this.selectCurrent();
            default:
              _this.options.selected = 0;
              return _this.onChange(function() {});
          }
        }, _this.options.delay);
      });
      this.input.on("blur", function(e) {
        return _this.close();
      });
      this.refresh();
      this.body.on("reform.open", function(e) {
        if (e.target !== _this.select) {
          return _this.close();
        }
      });
      this.orig.on("reform.sync change DOMSubtreeModified", function() {
        return setTimeout(_this.refresh, 0);
      });
      this.orig.on("reform.close", function(e) {
        return _this.close();
      });
      this.orig.on("reform.fill", function(e, data) {
        return _this.options.data = _this.parse(data, _this.currentSelection);
      });
      $('.' + this.options.optionsClass).remove();
    }

    AutocompleteBox.prototype.scrollTo = function() {
      var $container, $item, newScrollTop, scrollTop;
      $item = this.floater.find('.' + this.options.listClass).find(':nth-child(' + this.options.selected + ')');
      $container = $item.parent();
      newScrollTop = $item.offset().top - $container.offset().top + $container.scrollTop();
      if (newScrollTop > ($container.outerHeight() - $item.outerHeight())) {
        scrollTop = newScrollTop - $container.outerHeight() + $item.outerHeight();
        return $container.scrollTop(scrollTop);
      } else {
        return $container.scrollTop(0);
      }
    };

    AutocompleteBox.prototype.fillOptions = function() {
      var $list, isAny, num,
        _this = this;
      if (this.floater == null) {
        return;
      }
      this.floater.empty();
      $list = $("<div/>").appendTo(this.floater);
      $list.attr("class", this.options.listClass);
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
        $item.attr("class", _this.options.itemClass);
        $item.attr("title", item.title);
        $item.attr("value", item.value);
        $item.html(item.title);
        $item.appendTo($list);
        $item.on("mousedown", function(e) {
          return e.preventDefault();
        });
        $item.on("click", function(e) {
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
      } else if ((this.floater != null) && this.options.colorTitle) {
        return this.colorTitles();
      }
    };

    AutocompleteBox.prototype.setHover = function(newSelected) {
      var $list;
      if (!(this.floater != null)) {
        return;
      }
      $list = this.floater.find('.' + this.options.listClass);
      if (newSelected < 1) {
        return;
      }
      if (newSelected > $list.children().length) {
        return;
      }
      this.options.selected = newSelected;
      $list.children().removeClass(this.options.hoverClass);
      return $list.find(':nth-child(' + this.options.selected + ')').addClass(this.options.hoverClass);
    };

    AutocompleteBox.prototype.selectCurrent = function() {
      var $selected, title, value;
      if (!(this.floater != null) || this.options.selected === 0) {
        return;
      }
      $selected = this.floater.find('.' + this.options.listClass).find(':nth-child(' + this.options.selected + ')');
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
      this.floater.attr("class", this.options.optionsClass);
      this.floater.css("min-width", this.fake.outerWidth() - 2);
      this.floater.addClass(this.orig.data("options-class"));
      this.body.append(this.floater);
      this.body.on("click.autocomplete", function(e) {
        if (!$(e.target).hasClass(_this.options.inputClass)) {
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
      var _ref1;
      if ((_ref1 = this.floater) != null) {
        _ref1.remove();
      }
      return this.floater = null;
    };

    AutocompleteBox.prototype.refresh = function() {
      this.fake.toggleClass("disabled", this.orig.is(":disabled"));
      this.input.removeAttr('disabled');
      if (this.orig.is(":disabled")) {
        return this.input.attr("disabled", "disabled");
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
      return this.floater.find("." + this.options.itemClass).each(function(num, item) {
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
      data = this.cache.load(term);
      if (data) {
        return success();
      } else if (this.options.url != null) {
        extraParams = {
          timestamp: new Date()
        };
        if (this.options.extraParams != null) {
          $.each(this.options.extraParams, function(key, param) {
            return extraParams[key] = (typeof param === "function" ? param() : param);
          });
        }
        if (this.ajaxInProgress) {
          this.lastXHR.abort();
        }
        this.ajaxInProgress = true;
        return this.lastXHR = $.ajax({
          dataType: this.options.dataType,
          url: this.options.url,
          data: $.extend({
            q: term,
            matchCase: this.options.matchCase,
            limit: this.options.max
          }, extraParams),
          success: function(data) {
            var parsed, _base;
            _this.ajaxInProgress = false;
            parsed = (typeof (_base = _this.options).parse === "function" ? _base.parse(data, term) : void 0) || _this.parse(data, term);
            _this.options.data = parsed;
            _this.cache.add(term, parsed);
            return success();
          },
          error: function(data) {
            this.ajaxInProgress = false;
            return failure();
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
      successCallback = function() {
        if (_this.floater === null) {
          _this.open();
          _this.fillOptions();
        } else {
          _this.fillOptions();
        }
        _this.orig.trigger('ajaxRequestFinished');
        return callback();
      };
      failureCallback = function() {
        return _this.orig.trigger('ajaxRequestFinished');
      };
      if (this.options.url != null) {
        this.orig.trigger('ajaxRequestStarted');
        return this.request(this.currentSelection, successCallback, failureCallback);
      } else {
        return successCallback();
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
      $.extend(this.options, options);
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
      var c, csub, i, self;
      if (!this.options.cacheLength || !this.length) {
        return null;
      }
      if (this.data[q]) {
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

}).call(this);

},{"jquery-commonjs":6}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
(function() {
  var CheckBox, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.$) == null) {
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
      var _ref1;
      this.fake.toggleClass("disabled", this.orig.is(":disabled"));
      this.fake.removeClass("checked");
      if (this.orig.is(":checked")) {
        this.fake.addClass("checked");
      }
      return (_ref1 = this.siblings) != null ? _ref1.each(function() {
        return $(this).parent().removeClass("checked");
      }) : void 0;
    };

    return CheckBox;

  })();

  module.exports = CheckBox;

}).call(this);

},{"jquery-commonjs":6}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
(function() {
  var Reform, reform;

  Reform = require("./reform");

  reform = new Reform;

  reform.observe();

  window.Reform = reform;

}).call(this);

},{"./reform":4}],4:[function(require,module,exports){
(function(){// Generated by CoffeeScript 1.4.0
(function() {
  var AutocompleteBox, CheckBox, Reform, SelectBox, _ref;

  if ((_ref = window.$) == null) {
    window.$ = require("jquery-commonjs");
  }

  CheckBox = require("./checkbox");

  SelectBox = require("./selectbox");

  AutocompleteBox = require("./autocompletebox");

  Reform = (function() {

    function Reform() {}

    Reform.prototype.process = function(node) {
      var cls, control, n, _ref1, _results;
      _ref1 = Reform.controls;
      _results = [];
      for (cls in _ref1) {
        control = _ref1[cls];
        _results.push((function() {
          var _i, _len, _ref2, _results1;
          _ref2 = $(node).parent().find("." + cls);
          _results1 = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            n = _ref2[_i];
            _results1.push(new control(n));
          }
          return _results1;
        })());
      }
      return _results;
    };

    Reform.prototype.observe = function() {
      var _this = this;
      $(document).on("ready", function() {
        return _this.process("body");
      });
      return $(document).on("DOMNodeInserted", function(e) {
        return _this.process(e.target);
      });
    };

    Reform.prototype.register = function(controlName, controlObj) {
      return Reform.controls[controlName] = controlObj;
    };

    return Reform;

  })();

  Reform.controls = {
    "reform-checkbox": CheckBox,
    "reform-selectbox": SelectBox,
    "reform-autocompletebox": AutocompleteBox
  };

  module.exports = Reform;

}).call(this);

})()
},{"./autocompletebox":1,"./checkbox":2,"./selectbox":5,"jquery-commonjs":6}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
(function() {
  var SelectBox, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.$) == null) {
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
      this.fake.attr("tabindex", 0);
      this.fake.attr("class", this.orig.attr("class"));
      this.orig.hide().attr("class", "reformed");
      this.fake.removeClass("reform-selectbox").addClass("reform-selectbox-fake");
      if (this.orig.is(":disabled")) {
        this.fake.addClass("disabled");
      }
      this.refresh();
      this.orig.after(this.fake).appendTo(this.fake);
      this.fake.on("keyup", function(ev) {
        if (ev.keyCode === 27) {
          ev.preventDefault();
          return ev.stopPropagation();
        }
      });
      this.fake.on("keydown", function(ev) {
        var $current, $item, $nextItem, done, goDown, goUp, itemDoesNotExist, itemIsDisabled;
        ev.preventDefault();
        ev.stopPropagation();
        if (_this.orig.is("[multiple]")) {
          return;
        }
        _this.fake.focus();
        goUp = ev.keyCode === 38;
        goDown = ev.keyCode === 40;
        if (goUp || goDown) {
          if (!(_this.floater != null)) {
            return _this.open();
          } else {
            $current = $('.hover', _this.floater).length === 0 ? $('.selected', _this.floater) : $('.hover', _this.floater);
            if (goUp) {
              $nextItem = $current.prev().length === 0 ? $current.parent().children().last() : $current.prev();
            } else {
              $nextItem = $current.next().length === 0 ? $current.parent().children().first() : $current.next();
            }
            _this.hover($nextItem);
            return _this.scrollTo($nextItem);
          }
        } else if (ev.keyCode === 13) {
          $item = $(_this.floater).find('.hover');
          itemDoesNotExist = $item.length === 0;
          itemIsDisabled = $item.is(".disabled");
          if (itemDoesNotExist || itemIsDisabled) {
            return;
          }
          $item.siblings().andSelf().removeClass("selected");
          $item.addClass("selected");
          _this.orig.val(_this.value()).trigger("change");
          return _this.close();
        } else if (ev.keyCode === 27) {
          if (_this.floater != null) {
            return _this.close();
          }
        } else {
          done = false;
          return _this.$list.children().each(function(i, item) {
            if (!done) {
              if ($(item).text().charAt(0).toLowerCase() === String.fromCharCode(ev.keyCode).toLowerCase()) {
                done = true;
                _this.hover($(item));
                return _this.scrollTo($(item));
              }
            }
          });
        }
      });
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

    SelectBox.prototype.hover = function($item) {
      $item.siblings().andSelf().removeClass("hover");
      return $item.addClass("hover");
    };

    SelectBox.prototype.scrollTo = function($item) {
      var $container, newScrollTop, scrollTop,
        _this = this;
      $container = $item.parent();
      newScrollTop = $item.offset().top - $container.offset().top + $container.scrollTop();
      this.ignoreMouse = true;
      if (newScrollTop > ($container.outerHeight() - $item.outerHeight())) {
        scrollTop = newScrollTop - $container.outerHeight() + $item.outerHeight();
        $container.scrollTop(scrollTop);
      } else {
        $container.scrollTop(0);
      }
      if (this.to) {
        clearTimeout(this.to);
      }
      return this.to = setTimeout(function() {
        return _this.ignoreMouse = false;
      }, 500);
    };

    SelectBox.prototype.options = function() {
      var _this = this;
      if (this.floater == null) {
        return;
      }
      this.fake.focus();
      this.floater.empty();
      this.$list = $("<div/>").appendTo(this.floater);
      this.$list.attr("class", "reform-selectbox-list");
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
        $item.appendTo(_this.$list);
        $item.on("mousedown", function(e) {
          return e.preventDefault();
        });
        $item.hover(function() {
          if (!_this.ignoreMouse) {
            return _this.hover($item);
          }
        });
        return $item.on("click", function(e) {
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
          return _this.orig.val(_this.value()).trigger("change");
        });
      });
    };

    SelectBox.prototype.value = function() {
      return this.$list.find(".reform-selectbox-item.selected").map(function() {
        return $(this).val();
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
      var _ref1;
      if ((_ref1 = this.floater) != null) {
        _ref1.remove();
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

}).call(this);

},{"jquery-commonjs":6}],6:[function(require,module,exports){

},{}]},{},[3])
;