// pages/user/index.js
const app = getApp();
import to from 'await-to-js';


Page({

  /**
   * Page initial data
   */
  data: {
    // 用户信息
    user_list: null,
    // 访客信息
    visitor_list: null,
    canVisitorBeUpdate: true,
    wHeight: 375,
  },
  user_page: 0,
  visitor_page: 0,
  size: 10,
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    wx.showNavigationBarLoading()
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
    let self = this
    // 获取屏幕宽高，并且减去两个题目的高度64
    wx.getSystemInfo({
      success(res) {
        self.setData({
          wHeight: res.windowHeight,
          visitorHeight: (res.windowHeight - 64) / 2
        })
      }
    })
    this.init()
  },
  // 初始化数据
  async init() {

    let err = null,
      self = this,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys/user/list?user_type=0&page=0&size=${self.size}`,
      method: 'post',
      // body: {
      //   user_type: 0,
      //   page: 0,
      //   size: self.size
      // }
    }));
    const data = res.data;

    if (err || !data) {
      // console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      wx.hideNavigationBarLoading()
      return;
    }
    // console.log(res.data)
    // 计算列表滚动区域
    // 用户列表每行高54,；两个题目的高度64
    const lineHeight = 54,
      titleHeight = 64;
    // 375px的一半
    let userHeight = 187;
    if ((data.visitor_list.length * lineHeight >= (this.data.wHeight - titleHeight) / 2)) {
      userHeight = (this.data.wHeight - titleHeight) / 2
    } else {
      userHeight = this.data.wHeight - (data.user_list.length * lineHeight) - titleHeight
    }
    // 判断是否有下一页
    if (data.visitor_list.length == self.size) {
      this.visitor_page++
    } else {
      this.setData({
        canVisitorBeUpdate: false
      })
    }
    if (data.user_list.length == self.size) {
      this.user_page++
    } else {
      this.setData({
        canUserBeUpdate: false
      })
    }

    this.setData({
      user_list: data.user_list,
      // 访客信息
      visitor_list: data.visitor_list,
      userHeight,
    })
    wx.hideNavigationBarLoading()
  },
  // 访客数据下拉增加
  async addVisitor() {

    let err = null,
      self = this,
      res = {};
    // console.log("111", self.data.canVisitorBeUpdate)
    if (!self.data.canVisitorBeUpdate) {
      return
    }
    [err, res] = await to(app.$request.send({
      uri: `sys/user/list?user_type=1&page=${self.visitor_page}&size=${self.size}`,
      method: 'post',
      // body: {
      //   user_type: 1,
      //   page: self.visitor_page,
      //   size: self.size
      // }
    }));
    let data = res.data;

    if (err || !data) {
      // console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // console.log(res.data)
    // let data = res.data
    if (data.visitor_list.length == self.size) {
      self.visitor_page++
    } else {
      self.setData({
        canVisitorBeUpdate: false
      })
    }

    let visitor_list = self.data.visitor_list.concat(data.visitor_list)
    self.setData({
      visitor_list
    })

  },
  // 用户数据下拉增加
  async addUser() {

    let err = null,
      self = this,
      res = {};
    if (!self.data.canUserBeUpdate) {
      return
    }

    [err, res] = await to(app.$request.send({
      uri: `mistaff/tabs_list?index=${this.indexOfItems}&size=${PAGE_SIZE}&isHidden=1`,
      uri: `sys/user/list?user_type=2&page=${self.user_page}&size=${self.size}`,
      method: 'post',
      // body: {
      //   user_type: 1,
      //   page: self.user_page,
      //   size: self.size
      // }
    }));
    let data = res.data

    if (err || !data) {
      // console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (data.user_list.length == self.size) {
      self.user_page++
    } else {
      self.setData({
        canUserBeUpdate: false
      })
    }

    let user_list = self.data.user_list.concat(data.user_list)
    self.setData({
      user_list
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