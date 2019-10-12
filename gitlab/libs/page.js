import util from './util'; 
// const app = getApp();

function inject(source, injectedObject) {
  for (let p in injectedObject) {
    if (injectedObject.hasOwnProperty(p)) {
      if (!source[p]) {
        source[p] = function () { };
      }
      let injectedFunctionNames = [];

      let str = injectedObject[p].toString();
      let reg = /([^(\s);]+)\(/img;
      let matched = null;
      let index = 0;
      let repeatingItemsLength = 0;

      while ((matched = reg.exec(str)) != null) {
        if (index == 0) {
          index++;
          continue;
        }
        if (matched && matched.length >= 2) {
          if (source[p].toString().match(new RegExp(matched[1], 'i'))) {
            repeatingItemsLength++;
          }
        }
      }

      if (!repeatingItemsLength) {
        const tempFunc = source[p];
        source[p] = function (options) {
          injectedObject[p].call(this, options);
          tempFunc.call(this, options);
        }
      }
    }
  }
  return source;
}

function extendFunction(context, method, newFunction) {
  let oriFunc = context[method];
  context[method] = function (options) {
    newFunction();
    oriFunc.call(this, options)
  };
}

function defineMethod(context, method, originalMethod) {
  context[method] = function (options) {

    let data = this.data;
    let readyToSet = {};

    for (let k in options) {
      if (options.hasOwnProperty(k)) {
        if (!util.$isEqual(options[k], data[k])) {
          readyToSet[k] = options[k];
        }
      }
    }

    if (Object.keys(readyToSet).length) {
      this[originalMethod](readyToSet);
    }

  }
}

export default function (options = {}) {
  let o = {
    onShareAppMessage() {
      return {
        title: '神秘地带 | 基于兴趣推荐的内容分享社区',
      };
    },
    ...options
  };
  // const originalFunc = o.onLoad;
  // o.onLoad = function(options) {
  //   if (!wx.cloud) {
  //     wx.redirectTo({
  //       url: '../errors/wxCloudIsNotSupported/index',
  //     })
  //     return
  //   }
  //   originalFunc.call(this, options);
  // }

  extendFunction(o, 'onLoad', function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../errors/wxCloudIsNotSupported/index',
      })
      return
    }
  });

  defineMethod(o, 'setState', 'setData');
  return Page(o);
}