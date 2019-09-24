const jssubcbMethods = {}
const counts = 20
const toCamelCase = (str) => {
    const s =
      str &&
      str
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )
        .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
        .join('')
    return s.slice(0, 1).toLowerCase() + s.slice(1)
}
window.jssubcallback = (topic, msg) => {
  try {
    msg = JSON.parse(msg)
  } catch (e) {
    console.log(e.message)
  }
  if (typeof msg !== 'object') {
    return false
  }
  console.log('android msg:', msg)
  const callback = jssubcbMethods[toCamelCase(topic)]
  callback && callback(msg)
}
// android pub
exports.Pub = (msg, topic) => {
  return new Promise((resolve, reject) => {
    if (!android) {
      reject(new Error('android is undefined'))
    }
    if (msg === undefined) {
      reject(new Error('param msg is required'))
    }
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg)
    }
    let pubRes = false
    let timer = null
    let count = counts
    clearInterval(timer)
    timer = setInterval(() => {
      pubRes = android.NativePub(topic, msg)
      count--
      if (pubRes) {
        console.log('android pub', topic)
        clearInterval(timer)
        resolve(pubRes)
      }
      if (count <= 0) {
        clearInterval(timer)
        reject(new Error('redis conn error'))
      }
    }, 100)
  })
}
// android Get
exports.Get = (key) => {
  return new Promise((resolve, reject) => {
    if (!android) {
      reject(new Error('android is undefined'))
    }
    if (!key || typeof key !== 'string') {
      reject(new Error('argument key[string] is required'))
    }
    let getRes = false
    let timer = null
    let count = counts
    clearInterval(timer)
    timer = setInterval(() => {
      getRes = android.NativeGet(key)
      count--
      console.log('android get:', getRes)
      if (getRes !== undefined) {
        clearInterval(timer)
        try {
          getRes = JSON.parse(getRes)
        } catch (e) {
          console.log(e.message)
        }
        resolve(getRes)
      }
      if (count <= 0) {
        clearInterval(timer)
        reject(new Error('redis conn error'))
      }
    }, 100)
  })
}
// android Get
exports.GetJson = (key, path = '.') => {
  return new Promise((resolve, reject) => {
    if (!android) {
      reject(new Error('android is undefined'))
    }
    if (!key || typeof key !== 'string') {
      reject(new Error('argument key[string] is required'))
    }
    let getRes = false
    let timer = null
    let count = counts
    clearInterval(timer)
    timer = setInterval(() => {
      getRes = android.NativeGet(key, path)
      count--
      console.log('android getJson:', getRes)
      if (getRes !== undefined) {
        clearInterval(timer)
        try {
          getRes = JSON.parse(getRes)
        } catch (e) {
          console.log(e.message)
        }
        resolve(getRes)
      }
      if (count <= 0) {
        clearInterval(timer)
        reject(new Error('redis conn error'))
      }
    }, 100)
  })
}
// android sub
exports.Sub = (topic, callback) => {
  return new Promise((resolve, reject) => {
    if (!android) {
      reject(new Error('android is undefined'))
    }
    let subRes = false
    let timer = null
    let count = counts
    clearInterval(timer)
    timer = setInterval(() => {
      subRes = android.NativeSub(topic)
      count--
      if (subRes) {
        jssubcbMethods[toCamelCase(topic)] = callback
        console.log('android sub:', topic)
        clearInterval(timer)
        resolve(subRes)
      }
      if (count <= 0) {
        clearInterval(timer)
        reject(new Error('redis conn error'))
      }
    }, 100)
  })
}
