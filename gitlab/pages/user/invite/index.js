// pages/user/auth/index.js
const app = getApp();
import to from 'await-to-js';
var b64 = require("../../../utils/base64.js").Base64;
console.log(b64)
Page({

  /**
   * Page initial data
   */
  data: {
    listData: {},
    // 弹出层
    isWrap: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    wx.showNavigationBarLoading()
    this.init()
  },


  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    wx.updateShareMenu({
      withShareTicket: true
    });
  },
  // 初始化数据
  async init() {

    let err = null,
      self = this,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys/user/get_permission`,
      method: 'post',
    }));
    const data = res.data;

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      wx.hideNavigationBarLoading()
      return;
    }
    // console.log(res.data)
    self.setData({
      listData: data.module_list
    })
    wx.hideNavigationBarLoading()
  },
  // 打开关闭开关
  switch1Change(e) {
    let module = e.target.dataset.module ? e.target.dataset.module : 0,
      per = e.target.dataset.per ? e.target.dataset.per : 0,
      value = this.data.listData[module].permission[per].is_able ? false : true,
      curList = this.data.listData[module].permission,
      role = e.target.dataset.role ? e.target.dataset.role : "",
      self = this;
    if (role === 'manager' && value==true) {
      wx.showModal({
        title: '提示',
        content: '您已经勾选管理员权限，请谨慎操作！',
        success(res) {
          if (res.confirm) {
            // 列表下的选项都变成false，赋值时候根据当前点击的状态赋值，保证是单选且可以一个都不选
            curList.forEach((item, index) => {
              item.is_able = false
            })
            self.setData({
              ['listData[' + module + '].permission']: curList,
              ['listData[' + module + '].permission[' + per + '].is_able']: value,
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    // 列表下的选项都变成false，赋值时候根据当前点击的状态赋值，保证是单选且可以一个都不选
    curList.forEach((item, index) => {
      item.is_able = false
    })
    this.setData({
      ['listData[' + module + '].permission']: curList,
      ['listData[' + module + '].permission[' + per + '].is_able']: value,
    })

    // console.log(curList)


  },


  // 提交表单
  async confirm() {

    // 如果都没有选择的话,return
    let isSelect = 0;

    select: for (let i = 0; i < this.data.listData.length; i++) {

      for (let j = 0; j < this.data.listData[i].permission.length; j++) {
        if (this.data.listData[i].permission[j].is_able == true) {
          isSelect++;
          // console.log(isSelect)
          break select;
        }
      }
    }
    if (isSelect == 0) {
      wx.showToast({
        title: "至少选择一个权限哦~",
        icon: 'none',
        duration: 2000
      })

      return
    }
    let err = null,
      self = this,
      // payload ="123",
      payload = encodeURIComponent(JSON.stringify(this.data.listData)),
      res = {};


    // console.log(payload);
    [err, res] = await to(app.$request.send({
      uri: `sys_ivt/user/perm_invite?payload=${payload}`,
      method: 'post',

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
    self.setData({
      token: data.token,
      title: data.title,
      url: data.url,
      isWrap: true,
    })


  },
  close() {
    this.setData({
      isWrap: false,
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

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {
    const self = this;
    let sharePath = '/pages/user/welcome/index?token=' + self.data.token;
    let shareTitle = '邀请您使用小米参谋部小程序';
    let imageUrl = "https://i8.mifile.cn/webfile/h5/weixin/20190926/share_.pic.jpg"

    if (self.data.url) {
      console.log(self.data.shareData)
      return {
        title: self.data.title,
        path: sharePath,
        imageUrl: self.data.url
      }
    } else {
      return {
        title: shareTitle,
        path: sharePath,
        imageUrl: imageUrl
      }
    }
  }
})