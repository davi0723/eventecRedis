'use strict';
/* eslint-disable no-undef */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GetJson = exports.Get = exports.buryingPoint = exports.Pub = exports.Sub = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var toCamelCase = function toCamelCase(str) {
  var s = str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(function (x) {
    return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
  }).join("");
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

var basicFn = function basicFn(cb) {
  return new Promise(function (resolve, reject) {
    if (!cb) {
      reject("cb is needed");
    }

    if (!android) {
      reject("android is undefined");
    }

    var timer = null;
    var count = 10;
    var res = false;
    clearInterval(timer);
    timer = setInterval(function () {
      count--;
      res = cb();

      if (res) {
        clearInterval(timer);

        try {
          res = JSON.parse(res);
        } catch (e) {}

        resolve(res);
      }

      if (count < 1) {
        clearInterval(timer);
        reject("redis conn error");
      }
    }, 100);
  });
};

window.$subcbFn = {};
window.$taskList = [];
window.$isTaskRunning = false;

window.jssubcallback = function (topic, msg) {
  try {
    msg = JSON.parse(msg);
  } catch (e) {}

  if (_typeof(msg) !== "object") {
    return false;
  }

  var callback = window.$subcbFn[toCamelCase(topic)];
  callback && callback(msg);
};

var Sub = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(topic, cb) {
    var subRes;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return basicFn(function () {
              return android.NativeSub(topic);
            });

          case 2:
            subRes = _context.sent;
            window.$subcbFn[toCamelCase(topic)] = cb;
            return _context.abrupt("return", subRes);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function Sub(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.Sub = Sub;

var Pub = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(msg) {
    var topic,
        pubRes,
        _args2 = arguments;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            topic = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : "ui.update";
            _context2.next = 3;
            return basicFn(function () {
              if (msg && typeof msg !== "string") {
                msg = JSON.stringify(msg);
              }

              return android.NativePub(topic, msg);
            });

          case 3:
            pubRes = _context2.sent;
            return _context2.abrupt("return", pubRes);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function Pub(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.Pub = Pub;

var buryingPoint = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
    var pubRes;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Pub({
              type: "interaction:screen_touch",
              timestamp: Date.now(),
              data: data,
              protocol: "1"
            }, "event.interaction.screen_touch");

          case 2:
            pubRes = _context3.sent;
            return _context3.abrupt("return", pubRes);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function buryingPoint(_x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.buryingPoint = buryingPoint;

var Get = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(key) {
    var getRes;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return basicFn(function () {
              return android.NativeGet(key);
            });

          case 2:
            getRes = _context4.sent;
            return _context4.abrupt("return", getRes);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function Get(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

exports.Get = Get;

var GetJson = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(key) {
    var path,
        getRes,
        _args5 = arguments;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            path = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : ".";
            _context5.next = 3;
            return basicFn(function () {
              return android.NativeGet(key, path);
            });

          case 3:
            getRes = _context5.sent;
            return _context5.abrupt("return", getRes);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function GetJson(_x6) {
    return _ref5.apply(this, arguments);
  };
}();

exports.GetJson = GetJson;

var defaultFn = function defaultFn(a) {
  var view = a.view,
      id = a.id,
      variables = a.variables;
  var url = "/" + view;

  if (id) {
    url += "/" + id;
  }

  return {
    path: url,
    query: variables
  };
};

var install = function install(Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var taskExecSpeed = options.taskExecSpeed || 500;
  var fn = options.fn || defaultFn;
  Vue.mixin({
    mounted: function mounted() {
      this.ExecuteTask();
    },
    methods: {
      ExecuteTask: function ExecuteTask() {
        if (window.$isTaskRunning) {
          return false;
        }

        window.$isTaskRunning = true;
        var FreezingTime = taskExecSpeed;
        var that = this;
        setTimeout(function aaa() {
          var a = window.$taskList.shift();
          FreezingTime = taskExecSpeed;

          if (a) {
            that.$router.push(fn(a));

            if (a.variables && that.$store) {
              Object.entries(a.variables).forEach(function (_ref6) {
                var _ref7 = _slicedToArray(_ref6, 2),
                    s = _ref7[0],
                    value = _ref7[1];

                var key = "set" + s.slice(0, 1).toUpperCase() + s.slice(1);
                that.$store.commit(key, value);
              });
            }

            FreezingTime = a.freezing_time || taskExecSpeed;
          }

          this.timer = setTimeout(aaa, FreezingTime);
        }, FreezingTime);
      }
    }
  });
  Sub("ui.update", function (msg) {
    window.$taskList.push(msg);
  });
};

var _default = {
  install: install
};
exports.default = _default;