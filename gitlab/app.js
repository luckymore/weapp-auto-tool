import requestPlugin from './plugins/request.js';
import eventPlugin from './plugins/event.js';
import systemPlugin from './plugins/system.js';
import routerPlugin from './plugins/router.js';

App({
  scene: 0,
  onLaunch: async function (option) {
    this._use(eventPlugin);
    this._use(requestPlugin);
    this._use(systemPlugin);
    this._use(routerPlugin);
    // console.log(option)
    if (option) {
      this.scene = option.scene || 0;
    }
  },
  onShow: function (option) {
      // console.log('App Show')
  
  },
  onHide: function () {
      // console.log('App Hide')
  },
  globalData: {
      hasLogin: false
  },

  // 已经注册过的插件
  _installedPlugins: [],
  _use(plugin) {
    const installedPlugins = this._installedPlugins;
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    const _toArray = function (list, start) {
      start = start || 0
      let i = list.length - start
      const ret = new Array(i)
      while (i--) {
        ret[i] = list[i + start]
      }
      return ret
    };

    // additional parameters
    const args = _toArray(arguments, 1);
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  },
});