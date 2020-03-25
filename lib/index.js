'use strict';
/* eslint-disable no-undef */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.GetJson = exports.Get = exports.buryingPoint = exports.Pub = exports.Sub = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.object.to-string");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const toCamelCase = function (str) {
  const s = str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(function (x) {
    return x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase();
  }).join("");
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

const basicFn = function (cb) {
  return new Promise(function (resolve, reject) {
    if (!cb) {
      reject("cb is needed");
    }

    if (!window.android) {
      require('eventecandroid');
    }

    let timer = null;
    let count = 10;
    let res = false;
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

window.jssubcallback = function (topic, msg) {
  try {
    msg = JSON.parse(msg);
  } catch (e) {}

  if (typeof msg !== "object") {
    return false;
  }

  const callback = window.$subcbFn[toCamelCase(topic)];
  callback && callback(msg);
};

const Sub = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (topic, cb) {
    const subRes = yield basicFn(function () {
      return android.NativeSub(topic);
    });
    console.log('android sub: ' + topic);
    window.$subcbFn[toCamelCase(topic)] = cb;
    return subRes;
  });

  return function Sub(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.Sub = Sub;

const Pub = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (msg, topic = "ui.update") {
    const pubRes = yield basicFn(function () {
      if (msg && typeof msg !== "string") {
        msg = JSON.stringify(msg);
      }

      console.log('android pub: ' + topic, msg);
      return android.NativePub(topic, msg);
    });
    return pubRes;
  });

  return function Pub(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.Pub = Pub;

const buryingPoint = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (data) {
    const pubRes = yield Pub({
      type: "interaction:screen_touch",
      timestamp: Date.now(),
      data,
      protocol: "1"
    }, "event.interaction.screen_touch");
    return pubRes;
  });

  return function buryingPoint(_x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.buryingPoint = buryingPoint;

const Get = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (key) {
    const getRes = yield basicFn(function () {
      return android.NativeGet(key);
    });
    console.log('android get: ' + key, getRes);
    return getRes;
  });

  return function Get(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

exports.Get = Get;

const GetJson = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (key, path = ".") {
    const getRes = yield basicFn(function () {
      return android.NativeGet(key, path);
    });
    console.log('android get json: ' + key + ' ' + path, getRes);
    return getRes;
  });

  return function GetJson(_x6) {
    return _ref5.apply(this, arguments);
  };
}();

exports.GetJson = GetJson;

const defaultFn = function (a) {
  const {
    view,
    id,
    variables
  } = a;
  let url = "/" + view;

  if (id) {
    url += "/" + id;
  }

  return {
    path: url,
    query: variables
  };
};

const install = function (Vue, options = {}) {
  window.$taskList = [];
  window.$isTaskRunning = false;
  const taskExecSpeed = options.taskExecSpeed || 500;
  const fn = options.fn || defaultFn;
  Vue.mixin({
    mounted() {
      this.ExecuteTask();
    },

    methods: {
      ExecuteTask() {
        if (window.$isTaskRunning) {
          return false;
        }

        window.$isTaskRunning = true;
        let FreezingTime = taskExecSpeed;
        const that = this;
        setTimeout(function aaa() {
          const a = window.$taskList.shift();
          FreezingTime = taskExecSpeed;

          if (a) {
            that.$router.push(fn(a));

            if (a.variables && that.$store) {
              Object.keys(a.variables).forEach(function (s) {
                const value = a.variables[s];
                const key = "set" + s.slice(0, 1).toUpperCase() + s.slice(1);
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
  install
};
exports.default = _default;