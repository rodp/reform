// Generated by CoffeeScript 1.4.0
(function() {
  var AutocompleteBox, Cache, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = window.$) == null) {
    window.$ = require("jquery-commonjs");
  }

  AutocompleteBox = (function() {
    var cache;

    AutocompleteBox.prototype.options = {
      data: [],
      url: 'http://localhost:1111/demo/locations.json',
      dataType: 'json',
      max: 1000,
      selected: 0,
      minType: 2,
      formatter: null,
      callback: null,
      noRecord: 'No records.',
      matchCase: false,
      colorTitle: true
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
      var _this = this;
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

      this.cache = new Cache(options);
      this["default"] = $.extend(this["default"], options);
      this.orig = $(this.select);
      if (this.orig.is(".reformed")) {
        return;
      }
      this.body = $("body");
      this.fake = $("<div/>");
      this.fake.attr("class", this.orig.attr("class"));
      this.orig.hide().attr("class", "reformed");
      this.fake.removeClass("reform-autocompletebox").addClass("reform-autocompletebox-fake");
      if (this.orig.is(":disabled")) {
        this.fake.addClass("disabled");
      }
      this.input = $("<input/>");
      this.input.addClass("reform-autocompletebox-input");
      this.fake.append(this.input);
      this.refresh();
      this.orig.after(this.fake).appendTo(this.fake);
      this.floater = null;
      this.input.on("keydown.autocomplete", function(e) {
        if (_this.orig.is(":disabled")) {
          return;
        }
        e.stopPropagation();
        if (e.keyCode === _this.KEY.UP) {
          e.preventDefault();
        }
        return setTimeout(function() {
          _this.currentSelection = _this.input.val();
          switch (e.keyCode) {
            case _this.KEY.DOWN:
              return _this.setHover(_this.options.selected + 1);
            case _this.KEY.UP:
              return _this.setHover(_this.options.selected - 1);
            case _this.KEY.RETURN:
              return _this.onChange(function() {
                return _this.selectCurrent();
              });
            case _this.KEY.ESC:
              return _this.close();
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
        }, 0);
      });
      this.body.on("reform.open", function(e) {
        if (e.target !== _this.select) {
          return _this.close();
        }
      });
    }

    AutocompleteBox.prototype.fillOptions = function() {
      var $list, isAny,
        _this = this;
      if (this.floater == null) {
        return;
      }
      this.floater.empty();
      $list = $("<div/>").appendTo(this.floater);
      $list.attr("class", "reform-autocompletebox-list");
      isAny = false;
      $.each(this.options.data, function(i, item) {
        var $item;
        if (item.title.indexOf(_this.currentSelection) !== -1) {
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
          return $item.on("mouseenter", function(e) {
            var elem;
            if ($item.is('.disabled')) {
              return;
            }
            elem = e.target;
            return _this.setHover($(elem).index() + 1);
          });
        }
      });
      if (!isAny) {
        return this.close();
      }
    };

    AutocompleteBox.prototype.setHover = function(newSelected) {
      var $list;
      if (!(this.floater != null)) {
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
      if (!(this.floater != null) || this.options.selected === 0) {
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
      var _ref1;
      if ((_ref1 = this.floater) != null) {
        _ref1.remove();
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
        pos = title.indexOf(_this.currentSelection);
        if (pos !== -1) {
          coloredTitle += title.substr(0, pos);
          coloredTitle += "<strong>";
          coloredTitle += title.substr(pos, _this.currentSelection.length);
          coloredTitle += "</strong>";
          coloredTitle += title.substr(pos + _this.currentSelection.length, title.length);
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
      var data, extraParams, parsed,
        _this = this;
      if (!this.options.matchCase) {
        term = term.toLowerCase();
      }
      data = this.cache.load(term);
      if (data) {
        if (data.length) {
          return success(term, data);
        } else {
          parsed = options.parse && options.parse(options.noRecord) || parse(options.noRecord);
          return success(term, parsed);
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
            limit: this.options.max
          }, extraParams),
          success: function(data) {
            var _base;
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
      if (this.options.minType >= this.input.val().length) {
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
      matchCase: true,
      matchContains: false
    };

    function Cache(options) {
      this.options = $.extend(this.options, options);
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
      var c, csub, i, k;
      if (!this.options.cacheLength || !this.length) {
        return null;
      }
      if (!this.options.url && this.options.matchContains) {
        csub = [];
        for (k in this.data) {
          if (k.length > 0) {
            c = data[k];
            $.each(c, function(i, x) {
              if (matchSubset(x.value, q)) {
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
            $.each(c, function(i, x) {
              if (matchSubset(x.value, q)) {
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