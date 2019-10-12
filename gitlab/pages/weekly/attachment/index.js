/*
 * @Author: znn
 * @Date: 2019-09-23 14:32:07
 * @Last Modified by: znn
 * @Last Modified time: 2019-10-11 11:06:17
 */
import { wxPromise } from '../../../libs/wxPromise'
import utils from '../../../utils/util'
import config from '../../../config/client'
import { objectToParams } from '../../../libs/util'
import to from 'await-to-js'

const canPreviewDocs = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'] // 可预览的类型
const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'] // 可显示对应icon
const imgExts = ['png', 'jpg', 'jpeg', 'gif']
const otherAllowExt = ['zip', 'rar', 'pages', 'numbers', 'key'] // 显示未知icon
const allowExts = docExts.concat(imgExts, otherAllowExt) // 允许上传的类型
const MB10 = 1024 * 1024 * 10
const app = getApp()
const header = {
  'X-CLIENT-VERSION': config.clientVersion,
}

Page({
  data: {
    isPreview: '',
    files: [],
    dialog: '',
    uploading: false,
  },
  _fileNum: 9, // 最多传九个文件
  _attach_id: '',
  _index: 0, // 保存 第几个 文件到本地

  onLoad({ reportId, isPreview }) {
    this._reportId = reportId

    const pages = getCurrentPages() //获取加载的页面
    const {
      data: { attachs },
    } = pages[pages.length - 2]

    if (attachs.length === 0) return
    const files = this.mapFiles(attachs)
    this.setData({
      isPreview,
      files,
    })
    this._fileNum = 9 - files.length
    this.downloadAll(files)
  },

  downloadAll(files) {
    const { accessToken } = config.storage.get('credentials') || {}
    if (accessToken) {
      header.Authorization = accessToken
    }
    console.log('accessToken', accessToken)
    files.forEach((file, index) => {
      let formData = { attach_id: file.attach_id }
      wx.downloadFile({
        url: `${config.protocol}://${config.host}/weekly/attachDownload${objectToParams(formData)}`,
        header,
        success: res => {
          if (res.statusCode === 200) {
            console.log(res.tempFilePath)
            const propPath = `files[${index}]`
            this.setData({
              [`${propPath}.path`]: res.tempFilePath,
              [`${propPath}.loading`]: false,
            })
          }
        },
      })
    })
  },

  // 关闭 - dialog
  handleCloseDialog() {
    this.setData({ dialog: '' })
  },

  // 显示 - dialog
  handleShowDialog(e) {
    const { id, dialog, index } = e.currentTarget.dataset
    this._attach_id = id
    this._index = index
    if (this.data.uploading) return
    this.setData({ dialog })
  },

  /**
   * 选择 - 图片
   */
  chooseImage() {
    console.log('fileNum', this._fileNum)
    if (this._fileNum <= 0) return wx.showToast({ title: '最多上传九个文件' })
    wx.chooseImage({
      count: this._fileNum,
      success: res => {
        const files = this.mapFiles(res.tempFiles)
        if (files.length === 0) return
        this.setData({ files: this.data.files.concat(files) })
        this.uploadFile(files)
        this._fileNum -= files.length
      },
    })
  },

  /**
   * 选择 - 文件
   */
  chooseMessageFile() {
    if (this._fileNum <= 0) return wx.showToast({ title: '最多上传九个文件' })
    wx.chooseMessageFile({
      count: this._fileNum,
      type: 'file',
      success: ({ tempFiles }) => {

        // 超过10MB，都不传
        const largeFileNames = (
          tempFiles.reduce((acc, file) => file.size > MB10 ? acc.concat(file.name) : acc, []) || []
        ).join(' ')
        if (largeFileNames) {
          return wx.showModal({
            title: '提示',
            content: `${largeFileNames} 大于10MB了，请重新选择~`,
            showCancel: false,
          })
        }

        const files = this.mapFiles(tempFiles)
        if (files.length === 0) return

        // 文件后缀不在 allowExts 范围，都不传
        const notAllowFileNames = (
          files.reduce((acc, file) => (!allowExts.includes(file.ext) ? acc.concat(file.name) : acc), []) || []
        ).join(' ')

        if (notAllowFileNames) {
          return wx.showModal({
            title: '提示',
            content: `不允许 ${notAllowFileNames} 后缀的文件，请重新选择~`,
            showCancel: false,
          })
        }

        this.setData({ files: this.data.files.concat(files) })
        this.uploadFile(files)
        this._fileNum -= files.length
        console.log(tempFiles)
      },
    })
  },

  /**
   * 1、设置文件类型 ext
   * 2、去掉超出 this._fileNum 数量的文件
   *
   * @param {*} list 文件列表
   * @returns 格式化后的 files
   */
  mapFiles(files) {
    return files
      .slice(0, this._fileNum)
      .map(file => {
        file.name = file.file_name || file.name || utils.getExtension(file.path).name
        const { ext } = utils.getExtension(file.name)
        file.type = imgExts.includes(ext) ? 'img' : docExts.includes(ext) ? ext : 'unknow'
        file.ext = ext
        file.loading = true
        return file
      })
  },

  // 上传 - 文件
  async uploadFile(files) {
    const { accessToken } = config.storage.get('credentials') || {}
    if (accessToken) {
      header.Authorization = accessToken
    }
    console.log('accessToken', accessToken)
    this.setData({ uploading: true })
    let count = files.length // 任务数
    const fails = []  // 上传失败的文件

    files.forEach(async ({ path, name }, index) => {
      const formData = {
        report_id: this._reportId,
        file_name: name,
      }
      wxPromise.uploadFile({
        url: `${config.protocol}://${config.host}/weekly/attachUpload${objectToParams(formData, true)}`,
        filePath: path,
        name: 'file_body',
        header,
        complete: res => {
          console.log('complete', JSON.stringify(res))
          const { code, data, description } = res.data ? JSON.parse(res.data) : {}
          const failed = code !== 200
          const newIndex = this.data.files.length - files.length + index
          this.setData({
            [`files[${newIndex}].loading`]: failed,
            [`files[${newIndex}].attach_id`]: data && data.attach_id,
            uploading: --count,
          })
          failed && fails.push({ index: newIndex, name }) && console.log(++this._fileNum) // 记录失败的是：第几个，文件名

          // 全部传完后 - 有失败的则提示”重新上传“
          count === 0 && fails.length > 0 && wx.showModal({
              title: '提示',
              content: `${fails.reduce((acc, f) => acc + f.name + ' ', '')}上传失败，请重新上传~`,
              showCancel: false,
              success: res => {
                const indexes = fails.map(v => v.index).sort(),
                  files = this.data.files

                for (var i = indexes.length - 1; i >= 0; i--) {
                  files.splice(indexes[i], 1)
                }
                // console.log(fails, indexes, files)

                this.setData({ files })
              },
            })
        },
      })
    })
  },

  async download(index) {
    wx.showLoading({
      title: '下载中...',
      mask: true
    })
    const file = this.data.files[index]
    const { accessToken } = config.storage.get('credentials') || {}
    if (accessToken) {
      header.Authorization = accessToken
    }
    let formData = { attach_id: file.attach_id }

    const [err, res] = await to(wxPromise.downloadFile({
      url: `${config.protocol}://${config.host}/weekly/attachDownload${objectToParams(formData)}`,
      header,
    }))
    console.log(err, res)

    if (err) return utils.showToast(err.errMsg)
    
    if (res.statusCode === 200) {
      const propPath = `files[${index}]`
      this.setData({
        [`${propPath}.path`]: res.tempFilePath,
      })
    }
    wx.hideLoading()
  },

  /**
   * 预览 - 文件、图片
   * @param {Object} e 事件对象
   */
  async handlePreview(e) {
    const { index } = e.currentTarget.dataset
    
    // todo: 优化，累计10mb再清空缓存
    // const saved = await wxPromise.getSavedFileList()
    // console.log('saved', saved)
    // if (saved.fileList.length > 0) {
    //   const removed = await wxPromise.removeSavedFile({
    //     filePath: saved.fileList[0].filePath,
    //   })
    //   console.log('removeSavedFile', removed)
    // }
    let { type, path, ext } = this.data.files[index]

    if (type === 'img') this.previewImage(path)
    else if (canPreviewDocs.includes(ext)) this.previewFile(path, ext)
    else utils.showToast(`无法预览 .${ext}`)
  },

  previewImage(path) {
    const urls = this.data.files
      .filter(file => file.type === 'img')
      .map(file => file.path)

    wx.previewImage({
      current: path, // 当前显示图片的http链接
      urls,
    })
  },

  async previewFile(path, ext) {
    wx.openDocument({
      filePath: path,
      fileType: ext,
      success: function(res) {
        console.log('打开文档成功', res)
      },
    })
  },

  handleBack() {
    wx.navigateBack()
  },

  async handleDelAttach() {
    const [err, data] = await to(
      app.$request.post({
        uri: `weekly/attachDelete`,
        method: 'post',
        body: {
          attach_id: this._attach_id,
          report_id: this._reportId,
        },
      })
    )
    if (err) return console.log(err)
    const files = this.data.files
    files.splice(this._index, 1)
    this.setData({ files })
    ++this._fileNum
    wx.showToast({ title: '删除成功', icon: 'none' })
  },

  // 保存文件 - 到本地
  async handleSaveFile() {
    let { path, type, ext } = this.data.files[this._index]
    let err, res
    console.log(this._index, ext, path)
    // if (!path) {
    //   await this.download(this._index)
    //   path = this.data.files[this._index].path
    // }
    if (type === 'img') {
      [err, res] = await to(wxPromise.saveImageToPhotosAlbum({ filePath: path }))
    } else {
      // [err, res] = await to(wxPromise.saveFile({ tempFilePath: path }))
      return utils.showToast('暂不支持文件下载~')
    }

    if (err) {
      utils.showToast('下载失败')
    } else {
      utils.showToast('下载成功')
    }
    console.log(err, res)
  },
})
