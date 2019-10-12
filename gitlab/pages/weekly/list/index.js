/*
 * @Author: znn
 * @Date: 2019-09-24 10:59:47
 * @Last Modified by: znn
 * @Last Modified time: 2019-09-25 20:21:18
 */
import to from 'await-to-js'
const app = getApp()

Page({
  data: {
    list: [],
    size: 9999999
  },

  onLoad(options) {
    this.fetchList()
  },

  async fetchList() {
    const { size } = this.data
    const [err, res] = await to(app.$request.send({
      uri: 'weekly/reportList',
      method: 'post',
      body: {
        index: 0,
        size
      }
    }))
    if (err) return console.log(err)
    this.setData({
      list: res.data || []
    })
  },

  handleGo(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/weekly/index?reportId=${id}&isPreview=1`
    })
  }
})
