import to from 'await-to-js';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  bindGetUserInfo(ev) {
    if (ev.detail && ev.detail.encryptedData) {
      wx.showLoading({
        title: '加载中',
        mask: true,
      });
      this.submit(ev.detail);
    }
  },

  async submit(detail) {
    const encryptedData = detail.encryptedData;
    const iv = detail.iv;
    const rawData = detail.rawData;
    const signature = detail.signature;

    let err = null,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `wxUserInfo`,
      method: 'post',
      body: {
        rawData,
        iv,
        signature,
        encryptedData
      }
    }));

    wx.hideLoading();

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
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

})