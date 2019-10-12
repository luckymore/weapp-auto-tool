var app = getApp();
import to from 'await-to-js';
// pages/user/welcome/index.js
Page({

  /**
   * Page initial data
   */
  data: {
    // 携带的token
    token: "",
    // 来源哪里
    souce: "",
    // 是否是群聊
    is_group: false,
    success: null,
    scene:0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    if (options.token) {
      this.setData({
        token: options.token,
        scene:app.scene
      })
    }
    console.log(app.scene)
    // 1008是群聊 1007是单聊
    if (app.scene == 1008) {
      this.setData({
        is_group: true
      })
    }
    wx.showNavigationBarLoading()
    this.init()
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    // 禁止分享
    wx.hideShareMenu()

  },
  // 初始化数据
  async init() {

    let err = null,
      self = this,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys_ivt/user/use_invite?token=${self.data.token}&is_group=${self.data.is_group}&scene=${self.data.scene}`,
      method: 'post',
    }));
    
    console.log(res)
    // 发起人不能消费邀请链接
    if (res.code == 20006) {
      self.setData({
        success: true,
      })
      wx.hideNavigationBarLoading()
      return;
      
    }
    const data = res.data;
    if (err || !data || res.code != 200) {
      self.setData({
        success: false,
      })
      wx.hideNavigationBarLoading()
      return;
    }
    // console.log(res.data)
    self.setData({
      success: true,
    })
    wx.hideNavigationBarLoading()
  },
  goIndex() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },


})