const app = getApp();
import to from 'await-to-js';
import dayjs from 'dayjs';

const PAGE_SIZE = 20;

Page({

  /**
   * Page initial data
   */
  data: {
    items: [
    ],
    noMoreData: false,
  },

  hasModified: false,
  indexOfItems: 0,

  togglePopBubble(ev) {
    const dataset = ev.currentTarget.dataset;
    const index = dataset.index;
    let items = this.data.items;
    const touches = ev.touches;
    const touch = touches[0] ? touches[0] : null;
    let itemIsVisible = '';
    let itemPageX = '';
    let itemPageY = '';
    let pageX = 0;
    let pageY = 0;
    let item = '';

    if (touch) {
      pageX = touch.pageX;
      pageY = touch.pageY;
    }
    // console.log(this.windowWidth)

    itemIsVisible = 'items[' + index + '].bubbleIsVisible';

    if (items[index].bubbleIsVisible) {
      this.setData({
        [itemIsVisible]: false
      })
    } else {
      // wx.vibrateShort();
      itemPageX = 'items[' + index + '].left';
      itemPageY = 'items[' + index + '].top';

      this.setData({
        [itemIsVisible]: true,
        [itemPageX]: app.$system.windowWidth - pageX > 170 ? pageX : app.$system.windowWidth - 170,
        // [itemPageY]: this.window.windowWidth - pageX > 170 ? pageX : this.window.windowWidth - 170
      })
    }

  },

  async toggleStatus(ev) {
    const dataset = ev.currentTarget.dataset;
    const id = dataset.id;
    const isHidden = dataset.isHidden;
    const index = dataset.index;
    const source = dataset.source;

    let err = null,
      res = {};
    const items = this.data.items;
    const stickies = this.data.stickies;

    [err, res] = await to(app.$request.send({
      uri: `pom/actions?id=${id}&show=${isHidden}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    const data = res.data;

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.hasModified = true;

    if (source === 'items') {
      items[index].isHidden = isHidden ? 0 : 1;

      if (items.every(item => {
        return item.isHidden === 0
      })) {
        this.setData({
          items: []
        });
        return
      }

      this.setData({
        ['items[' + index + ']']: items[index]
      });
    } else {
      stickies[index].isHidden = isHidden ? 0 : 1;

      if (stickies.every(item => {
        return item.isHidden === 0
      })) {
        this.setData({
          stickies: []
        });
        return
      }

      this.setData({
        ['stickies[' + index + ']']: stickies[index]
      });
    }

  },

  init() {
    this.initRemoteData();
  },

  async initRemoteData() {
    let err = null,
      res = {};
    let noMoreData = false;
    const items = this.data.items;

    [err, res] = await to(app.$request.send({
      uri: `pom/tabs_list?index=${this.indexOfItems}&size=${PAGE_SIZE}&isHidden=1`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    const data = res.data;

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (data.items.length == 0 || data.items.length < PAGE_SIZE) {
      noMoreData = true;
    }

    this.indexOfItems += 1;

    data.stickies = data.stickies;
    data.items = items.concat(data.items);

    this.setData({ noMoreData, ...data });

    wx.hideNavigationBarLoading();

  },

  onLoad: function (options) {
    // this.id = options.id;
    wx.showNavigationBarLoading();
    this.init();
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
    if (this.hasModified) {
      app.$event.emit('inforceInit', null);
      this.hasModified = false;
    }
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    const activeTab = this.data.activeTab;
    if (this.data.noMoreData) {
      return;
    }
    this.initRemoteData();
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  cancel: function () {

  },
})