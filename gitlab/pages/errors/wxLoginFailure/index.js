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

  reLogin() {
    app.$request.authenticate()
      .then(response => {
        app.$router.goTo('/pages/index/index');
      }).catch(error => {
        wx.showToast({
          title: '服务器又开小差了，稍后再试吧',
          icon: 'none',
        });
      })
  }

})