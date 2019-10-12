
/**
 * E.g.
 * 
 * app.$router.goTo({
 *   url: '/pages/demo/index',
 *   params: {
 *     a: 1,
 *     b: 2,
 *   },
 *   success() {
 *     // console.log('success');
 *   },
 *   fail(e) {
 *     // console.log(e);
 *   }
 * });
 */

const Plugin = (App, params = {}) => {

  const CONFIG = Object.assign({}, params);

  App.$router = {
    /**
     * 保留当前页面，跳转到应用内的某个页面
     * @param {Object} options 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    navigateTo(options, needToEncodeURI) {
      this._openInterceptor('navigateTo', options, needToEncodeURI);
    },

    /**
     * navigateTo + switchTab的总和
     * @param {Object} options 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    goTo(options, needToEncodeURI) {
      const tabBarUrls = CONFIG.tabBarUrls;
      let url = '';

      if (typeof options === 'string') {
        url = options;
      } else if (this._isObject(options)) {
        url = options.url;
      }

      if (tabBarUrls && Array.isArray(tabBarUrls)) {
        for (let i = 0; i < tabBarUrls.length; i++) {
          if (new RegExp(tabBarUrls[i]).test(url)) {
            this.switchTab(options, needToEncodeURI);
            return;
          }
        }
      }
      this.navigateTo(options, needToEncodeURI);
    },


    /**
     * 关闭当前页面，跳转到应用内的某个页面
     * @param {Object} options 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    redirectTo(options, needToEncodeURI) {
      this._openInterceptor('redirectTo', options, needToEncodeURI);
    },
    /**
     * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
     * @param {Object} params 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    switchTab(options, needToEncodeURI) {
      this._openInterceptor('switchTab', options, needToEncodeURI);
    },
    /**
     * 关闭所有页面，打开到应用内的某个页面
     * @param {Object} options 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    reLaunch(options, needToEncodeURI) {
      this._openInterceptor('reLaunch', options, needToEncodeURI);
    },
    /**
     * 页面跳转封装
     * @param {String} method 微信JS方法
     * @param {Object} options 页面参数
     * @param {Boolean} needToEncodeURI 使用编码
     */
    _openInterceptor(method, options, needToEncodeURI) {
      if (this.IsPageNavigating) return;

      // let paramsObj = null;
      let paramsFromUrl = null;
      let url = '';
      let params = null;
      this.IsPageNavigating = true;

      if (typeof options === 'string') {
        url = options;
      } else if (this._isObject(options)) {
        url = options.url;
      }

      if (!url) {
        console.error(`[Warn]: argument url cannot be null or empty`);
      }

      if (/^pages\//.test(url)) {
        url = '/' + url;
      }

      if (/^http/.test(url)) {
        url = '/pages/webview/index?url=' + encodeURIComponent(url);
      }

      paramsFromUrl = this._unparam(url);

      if (paramsFromUrl && options.params) {
        url = url.replace(/\?.*/, '');
        params = this._param(Object.assign({}, paramsFromUrl, options.params), true);
      } else if (options.params) {
        params = this._param(options.params, needToEncodeURI);
      } else {
        params = '';
      }

      // wx.switchTab: url 不支持 queryString
      if (method === 'switchTab' && params !== '') {
        params = '';
      }

      wx[method]({
        url: url + params,
        complete: () => {
          this.IsPageNavigating = false;
        },
        success: (e) => {
          options.success && options.success();
        },
        fail: (err) => {
          this.IsPageNavigating = false;

          if (options.fail) {
            options.fail(err);
            return;
          }
          // 微信规定页面跳转History是有限制的，这里用 redirectTo 做兼容
          if (method === 'navigateTo' && (/count limit/i.test(err.errMsg) || /page limit/.test(err.errMsg))) {
            this._openInterceptor('redirectTo', options);
          } else {
            wx.showModal({
              title: '温馨提示',
              content: '操作失败，请稍后再试',
              showCancel: false
            });
          }
        }
      });
    },

    /**
     * 将对象解析成url字符串
     * @param  {Object} obj 参数对象
     * @param  {Boolean} needToEncodeURI 使用编码
     * @return {String} 转换之后的url参数
     */
    _param(obj = {}, needToEncodeURI) {
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

    /**
     * 将url字符串解析成对象
     * @param  {String} str 带url参数的地址
     * @param  {Boolean} unDecodeURI 不使用解码
     * @return {Object} 转换之后的url参数
     */
    _unparam(str = '', unDecodeURI) {
      let result = {};

      let query = str.split('?')[1];

      if (!query) return null;

      let arr = query.split('&');

      arr.forEach((item, idx) => {
        let param = item.split('=');
        let name = param[0];
        let value = param[1] || '';

        if (name) {
          result[name] = unDecodeURI ? value : decodeURIComponent(value);
        }
      });

      return result;
    },

    _isObject(arg) {
      return Object.prototype.toString.call(arg).indexOf('Object') !== -1;
    }

  };


};


export default Plugin;