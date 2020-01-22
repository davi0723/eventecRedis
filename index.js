/* eslint-disable no-undef */
/**
 * @Author: urcool
 * @Date: 2020-01-21 15:25:58
 * Basic methods
 */
const toCamelCase = str => {
  const s =
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join("");
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};
const basicFn = (action, topic, msg = null, cb = null) =>
  new Promise((resolve, reject) => {
    if (!android) {
      reject(new Error("android is undefined"));
    }
    if (msg && typeof msg !== "string") {
      msg = JSON.stringify(msg);
    }
    let res = false;
    let timer = null;
    let count = 10;
    clearInterval(timer);
    timer = setInterval(() => {
      res = android[`Native${action}`](topic, msg);
      count--;
      if (res) {
        cb && cb();
        clearInterval(timer);
        try {
          res = JSON.parse(res);
        } catch (e) {}
        resolve(res);
      }
      if (count <= 0) {
        clearInterval(timer);
        reject(new Error("redis conn error"));
      }
    }, 100);
  });

/**
 * @Author: urcool
 * @Date: 2020-01-21 15:26:09
 * Global variables
 */
const jssubcbMethods = {};
const taskList = [];
const taskExecSpeed = 500;
const jssubcallback = (topic, msg) => {
  try {
    msg = JSON.parse(msg);
  } catch (e) {
    console.log(e.message);
  }
  if (typeof msg !== "object") {
    return false;
  }
  const callback = jssubcbMethods[toCamelCase(topic)];
  callback && callback(msg);
};
/**
 * @Author: urcool
 * @Date: 2020-01-21 15:58:38
 * Install function
 */
const install = (Vue, options) => {
  if (window) {
    window.jssubcallback = jssubcallback;
  }
  const bus = new Vue();
  if (!bus.$bus) {
    Vue.prototype.$bus = bus;
  }

  let taskTimer = null;
  let FreezingTime = taskExecSpeed;

  clearTimeout(taskTimer);
  taskTimer = setTimeout(function aaa() {
    const a = taskList.shift();
    FreezingTime = taskExecSpeed;
    if (a) {
      bus.$bus.$emit(options.event || "redisEvent", a);
      FreezingTime = a.freezing_time || taskExecSpeed;
    }
    this.timer = setTimeout(aaa, FreezingTime);
  }, FreezingTime);
};
// android Sub
const Sub = (topic, callback) =>
  basicFn(
    "Sub",
    topic,
    null,
    () => (jssubcallback[toCamelCase(topic)] = callback)
  );

Sub("ui.update", msg => {
  taskList.push(msg);
});

// android Pub
const Pub = (topic, msg) => basicFn("Pub", topic, msg);
// android Get
const Get = key => basicFn("Get", key);
// android GetJSON
const GetJson = (key, path = ".") => basicFn("Get", key, path);

export default {
  install,
  Get,
  GetJson,
  Pub,
  Sub
};
