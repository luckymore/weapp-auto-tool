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
    // 是否发送push
    is_push: false,
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
    let title = options.name ? "给" + options.name + "分配权限" : "分配权限"
    wx.setNavigationBarTitle({
      title: title
    })
    wx.showNavigationBarLoading()
    this.init()
  },


  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },
  // 初始化数据
  async init() {

    let err = null,
      self = this,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys/user/get_permission?user_id=${self.data.id}`,
      method: 'post',
      // body: {
      //   user_id:1
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
      curList = this.data.listData[module].permission;
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

  submit() {
    let self = this
    wx.showModal({
      title: '提示',
      content: '是否通知此用户，您已经修改了他的权限？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          self.setData({
            is_push: true
          })
        } else if (res.cancel) {
          self.setData({
            is_push: false
          })
        }
        self.confirm()
      }
    })

  },
  // 上报formid
  async getFormId(event) {
    let err = null,
      self = this,
      formId = event.detail.formId,
      res = {};


    if (!formId) return;

    [err, res] = await to(app.$request.send({
      uri: `sys/user/collect_form?form_id=${formId}&origin=sys_user`,
      method: 'post',
      // body: {
      //   user_id:1
      // }
    }));
    const data = res.data;

    if (err || !data) {
      return;
    }
  },
  // 提交表单
  async confirm() {
    let err = null,
      self = this,
      // payload ="123",
      payload = encodeURIComponent(JSON.stringify(this.data.listData)),
      res = {};


    // console.log(payload);
    [err, res] = await to(app.$request.send({
      uri: `sys/user/set_permission?is_push=${self.data.is_push}&user_id=${self.data.id}&payload=${payload}`,
      method: 'post',
      // body: {
      //   user_id:1
      // }
    }));
    const data = res.data ? res.data:"";

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showToast({
      title: '修改成功',
      icon: 'success',
      duration: 2000
    });
    setTimeout(() => {
      wx.navigateBack({
        delta: 2
      })
    }, 200)


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

  }
})