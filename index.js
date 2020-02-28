'use strict'
/* eslint-disable no-undef */
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
const basicFn = cb => {
  return new Promise((resolve, reject) => {
    if (!cb) {
      reject("cb is needed");
    }
    if (!android) {
      reject("android is undefined");
    }
    let timer = null;
    let count = 10;
    let res = false;
    clearInterval(timer);
    timer = setInterval(() => {
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

// globalVariables
window.$subcbFn = {};
window.$taskList = [];
window.$isTaskRunning = false;

// js sub callback function
window.jssubcallback = (topic, msg) => {
  try {
    msg = JSON.parse(msg);
  } catch (e) {}
  if (typeof msg !== "object") {
    return false;
  }
  const callback = window.$subcbFn[toCamelCase(topic)];
  callback && callback(msg);
};

// android Sub
export const Sub = async (topic, cb) => {
  const subRes = await basicFn(() => android.NativeSub(topic));
  window.$subcbFn[toCamelCase(topic)] = cb;
  return subRes;
};
// android Pub
export const Pub = async (msg, topic = "ui.update") => {
  const pubRes = await basicFn(() => {
    if (msg && typeof msg !== "string") {
      msg = JSON.stringify(msg);
    }
    return android.NativePub(topic, msg);
  });
  return pubRes;
};
export const buryingPoint = async data => {
  const pubRes = await Pub(
    {
      type: "interaction:screen_touch",
      timestamp: Date.now(),
      data,
      protocol: "1"
    },
    "event.interaction.screen_touch"
  );
  return pubRes;
};
// android Get
export const Get = async key => {
  const getRes = await basicFn(() => android.NativeGet(key));
  return getRes;
};

// android GetJSON
export const GetJson = async (key, path = ".") => {
  const getRes = await basicFn(() => android.NativeGet(key, path));
  return getRes;
};
const defaultFn = a => {
  const { view, id, variables } = a;
  let url = "/" + view;
  if (id) {
    url += "/" + id;
  }
  return {
    path: url,
    query: variables
  };
};
/**
 * @Author: urcool
 * @Date: 2020-01-21 15:58:38
 * Install function
 */
const install = (Vue, options = {}) => {
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
              Object.entries(a.variables).forEach(([s, value]) => {
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
  Sub("ui.update", msg => {
    window.$taskList.push(msg);
  });
};
export default {
    install
};
