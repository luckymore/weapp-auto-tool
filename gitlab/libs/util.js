// import regeneratorRuntime from './regenerator-runtime.js';

const wxRequest = async (url, params = {}) => {

  return await new Promise((resolve, reject) => {
    resolve(1);
  });

  Object.assign(params, {
    token: wx.getStorageSync('token')
  })
  // 所有的请求，header默认携带token
  let header = params.header || {
    'Content-Type': 'application/json',
    'token': params.token || ''
  }
  let data = params.data || {}
  let method = params.method || 'GET'
  // hideLoading可以控制是否显示加载状态
  if (!params.hideLoading) {
    wx.showLoading({
      title: '加载中...',
    })
  }
  let res = await new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res && res.statusCode == 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      },
      complete: (e) => {
        wx.hideLoading()
      }
    })
  })
  return res
}

function changeKeysToSnakeCase(target) {
  let convertedTarget;
  if (Object.prototype.toString.call(target) === "[object Object]") {
    convertedTarget = {};
    for (let x in target) {
      if (target.hasOwnProperty(x)) {
        if (Object.prototype.toString.call(target[x]) === "[object Object]") {
          convertedTarget[x.replace(/([A-Z])/g, "_$1").toLowerCase()] = changeKeysToSnakeCase(target[x]);
        }
        convertedTarget[x.replace(/([A-Z])/g, "_$1").toLowerCase()] = target[x];
      }
    }
  } else {
    return new TypeError('只支持字符串或对象字面量');
  }
  return convertedTarget;
}

module.exports = {
  $isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },

  $isEqual(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // A strict comparison is necessary because `null == undefined`.
    if (!a || !b) return a === b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b !== 'object') return false;
    return this.$isDeepEqual(a, b, aStack, bStack);
  },

  $isDeepEqual(a, b, aStack, bStack) {
    let self = this;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a !== 'object' || typeof b !== 'object') return a === b;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(typeof aCtor === 'function' && aCtor instanceof aCtor &&
        typeof bCtor === 'function' && bCtor instanceof bCtor)
        && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!self.$isEqual(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = Object.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (Object.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(self.$has(b, key) && self.$isEqual(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  },

  $has(obj, path) {
    if (toString.call(path) !== '[object Array]') {
      return obj && hasOwnProperty.call(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (!obj || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  },
  
  /**
   * get url params
   * @param  {String} url index?a=1&b=2
   * @return {Object}     {a:1,b:2}
   */
  $getParams(url) {
    let rst = {};
    let quoteIndex = url.indexOf('?');

    if (quoteIndex !== -1) {
      let str = url.substr(quoteIndex + 1);
      let tmp;
      str.split('&').forEach(v => {
        tmp = v.split('=');
        rst[tmp[0]] = decodeURIComponent(tmp[1]);
      });
    }
    return rst;
  },

  objectToParams(obj = {}, needToEncodeURI) {
    let result = [];

    for (let name of Object.keys(obj)) {
      let value = obj[name];

      result.push(name + '=' + (needToEncodeURI ? encodeURIComponent(value) : value));
    }

    if (result.length) {
      return '?' + result.join('&');
    } else {
      return '';
    }
  },

  getCurrentPageUrl() {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    return url
  },

  getCurrentPageUrlWithArgs() {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options

    //拼接url的参数
    var urlWithArgs = url + '?'
    for (var key in options) {
      var value = options[key]
      urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

    return urlWithArgs
  },

  addQueryStringArg(url, name, value) {
    if (url.indexOf("?") == -1) {
      url += "?";
    } else {
      url += "&";
    }
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    return url;
  },

  /**
   * ''                            ''
   * 'filename'                    ''
   * 'filename.txt'                'txt'
   * '.hiddenfile'                 ''
   * 'filename.with.many.dots.ext' 'ext'
   */
   getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  },
  wxRequest,

  parseJSON(response) {
    return new Promise(resolve =>
      resolve({
        status: response.statusCode,
        json: response.data || null
      })
    )
  },

  changeKeysToSnakeCase,

  convertToWxml(data) {
    if(!data || !Array.isArray(data)) {
      return '';
    }
    return data.map(item => {
      if(item.text) {
        return `<view>${item.text}</view>`;
      } else if (item.img && item.img.url) {
        return `<image mode="widthFix" src="${item.img.url}"></image>`;
      }
    }).join('');
  }

}
