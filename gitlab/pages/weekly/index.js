/*
 * @Author: znn
 * @Date: 2019-09-20 20:55:38
 * @Last Modified by: znn
 * @Last Modified time: 2019-10-10 15:55:16
 */
import { wxPromise } from '../../libs/wxPromise'
import util from '../../utils/util'
import aesdecode from '../../utils/aesdecode'
import to from 'await-to-js'

const app = getApp()

Page({
  data: {
    reports: ['', '', ''],
    btnText: '提交周报',
    report_id: '',
    isPreview: '',
  },
  _firstIn: true, // 提示 - 应用缓存周报内容

  onLoad({ reportId = '', isPreview }) {
    reportId && this.setData({
      isPreview,  // 预览：不能编辑，删除上传附件
      report_id: reportId,
    })
    wx.setNavigationBarTitle({
      title: isPreview ? '往期周报' : '提交周报'
    })
  },
  onShow() {
    this.fetchReports()
  },

  async fetchReports() {
    wx.showLoading({ title: '加载中', mask: true })
    const [err, data] = await to(
      app.$request.post({
        uri: 'weekly/reportInfo',
        method: 'post',
        body: {
          report_id: this.data.report_id || ''
        }
      })
    )

    if (err) return console.log(err)

    const cc = wx.getStorageSync('cacheContent')

    if (data.post_content) {
      data.btnText = '编辑周报'
      try {
        data.reports = JSON.parse(decodeURIComponent(aesdecode.aesDecrypt(data.post_content)))
      } catch(err) {
        console.error('解密报错：', err)
        wx.showModal({ title: '提示', content: '解密失败, 请联系管理员', showCancel: false })
        data.reports = ['', '', '']
      }
    } else if (!this.data.isPreview && this._firstIn && cc) {
      this._firstIn = false
      wx.hideLoading()
      const res2 = await wxPromise.showModal({
        title: '提示',
        content: '有上次填写的未提交内容，是否应用？',
      })
      if (res2.confirm) data.reports = cc
    } else {
      data.reports = ['', '', '']
    }
    this.setData(data, () => {
      wx.hideLoading()
    })
  },

  handleAdd() {
    const reports = this.data.reports
    if (reports.length >= 10) return wx.showToast('最多添加十项工作')
    this.setData({
      [`reports[${reports.length}]`]: '',
    })
  },

  handleRemove(e) {
    const index = e.currentTarget.dataset.index
    const reports = this.data.reports
    reports.splice(index, 1)
    this.setData({
      reports,
    })
    this.cacheContent()
  },
  
  // blur 时，表单数据同步到 data
  handleBlur(e) {
    const val = e.detail.value
    const index = e.currentTarget.dataset.index
    this.setData({
      [`reports[${index}]`]: val,
    })
    this.cacheContent()
  },

  /**
   * 缓存 - 多个文本框内容 cacheContent
   */
  cacheContent() {
    wx.setStorage({
      key: 'cacheContent',
      data: this.data.reports
    })
  },

  handleGoAttach() {
    const { report_id, isPreview } = this.data
    wx.navigateTo({
      url: `/pages/weekly/attachment/index?reportId=${report_id}&isPreview=${isPreview}`
    })
  },

  async handleSumit(e) {
    // 表单对象 - 转为数组
    let formData = e.detail.value
    formData.length = Object.keys(formData).length
    formData = Array.from(formData)

    // if (!formData.length) return util.showToast('请填写周报内容')
    // console.log(JSON.stringify(formData))
    // console.time('encrypt')
    // 加密 - 中文需要 encodeURIComponent 编码
    const encrypted = aesdecode.aes("mistaff_sysuser1", encodeURIComponent(JSON.stringify(formData)))
    // console.log(encrypted)
    const [err, data] = await to(
      app.$request.post({
        uri: 'weekly/reportSave',
        method: 'post',
        body: {
          report_id: this.data.report_id,
          content: encrypted
          // content: ''
        },
      })
    )

    if (err || !data) return console.log(err)
    if (data.success) {
      wx.showToast({ title: '提交成功' })
      this.setData({ btnText: '编辑周报' })
      wx.removeStorageSync('cacheContent')
    }
    // const decrypted = JSON.parse(decodeURIComponent(aesdecode.aesDecrypt(encrypted)))
    // console.log(decrypted)
    // console.timeEnd('encrypt')
  },
})
