// pages/user/detail/index.js
const app = getApp();
import to from 'await-to-js';
var aes = require('../../../utils/aes.js');
var aesdecode = require('../../../utils/aesdecode.js');
Page({

  /**
   * Page initial data
   */
  data: {
    // 用户的id
    id: ""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
    }
    this.init()
  },

  // 初始化数据
  async init() {

    let err = null,
      self = this,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys/user/info?user_id=${self.data.id}`,
      method: 'post',
      // body: {
      //   user_id: self.data.id
      // }
    }));

    const data = res.data ? res.data : "";
    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    self.setData({
      data: data,
    })
    // console.log(aes)
    let openId = aesdecode.aesDecrypt(data.open_id)
    // let jm = aes.aes("mistaff_sysuser1", "oKhDz5HoQ4wv3MzuRII1D_phZsKU")
    console.log(openId, data.open_id)
    self.setData({
      openId: openId
    })
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },


})