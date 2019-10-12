const app = getApp();
import to from 'await-to-js';
import dayjs from 'dayjs';


Page({

  /**
   * Page initial data
   */
  data: {
    like: '',
    unlike: '',
    upTo: 0,  // 上升到
    keywords: '',
    weiboPopularIndex: 0,
    baiduPopularIndex: 0,

    pickerIndex: 0,

    periods: [
      {
        id: '24h',
        value: '24小时',
      },
      {
        id: '3d',
        value: '3天',
      },
      {
        id: '7d',
        value: '7天',
      },
      {
        id: '30d',
        value: '30天',
      },
    ]
  },

  topicId: '',
  period: '24h',

  init() {
    wx.showNavigationBarLoading();
    this.initRemoteData();
  },

  async initRemoteData() {
    let err = null,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `pom/topics?period=${this.period}&id=${this.topicId}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    let data = res.data;

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData(data);


    err = null,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `pom/keyword_detail?id=${this.topicId}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    data = res.data;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData(data);

    wx.hideNavigationBarLoading();
  },

  bindPickerChange: function (e) {
    const index = e.detail.value - 0;
    const periods = this.data.periods;

    this.setData({
      pickerIndex: index,
    });
    this.period = periods[index].id;
    this.init();
  },

  navigateToComments(ev) {
    const platform = ev.currentTarget.dataset.platform;
    wx.navigateTo({
      url: `../platform/index?from=${platform}&id=${this.topicId}&period=${this.period}`, // &period=${this.period}
    });
  },

  showDetail() {
    const relations = this.data.relations;
    const keywords = this.data.keywords;

    wx.showModal({
      title: keywords,
      content: relations.join(','),
      showCancel: false,
      success(res) {
        // if (res.confirm) {
        //   console.log('用户点击确定')
        // } else if (res.cancel) {
        //   console.log('用户点击取消')
        // }
      }
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.topicId = options.id;

    const periods = this.data.periods;
    const periodId = options.period;

    if (periodId) {
      for (let i = 0; i < periods.length; i++) {
        if (periods[i].id === periodId) {
          this.setData({
            pickerIndex: i
          });
          this.period = periodId;
          break;
        }
      }
    }

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

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})