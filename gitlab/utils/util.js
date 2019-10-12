const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function addZero(num) {
  num = parseInt(num)
  if (num < 10) {
    return '0' + num
  }
  return num
}

function formatRelativeTime(date) {
  let date1 = new Date(date * 1000)
  let nowDate = new Date()
  let nowTime = Date.parse(nowDate) / 1000
  let nowYear = nowDate.getFullYear()
  let length = (nowTime - date) / 60
  if (length * 60 <= 60) {
    date = parseInt(length * 60) + '秒前'
  } else if (length <= 60) {
    date = parseInt(length) + '分钟前'
  } else if (length <= 60 * 24) {
    date = parseInt(length / 60) + '小时前'
  } else if (length <= 60 * 24 * 7) {
    date = parseInt(length / 60 / 24) + '天前'
  } else if (nowYear == date1.getFullYear()) {
    date =
      addZero(date1.getMonth() + 1) +
      '月' +
      addZero(date1.getDate()) +
      '日 ' +
      addZero(date1.getHours()) +
      ':' +
      addZero(date1.getMinutes())
  } else if (nowYear > date1.getFullYear()) {
    date =
      date1.getFullYear() +
      '年' +
      addZero(date1.getMonth() + 1) +
      '月' +
      addZero(date1.getDate()) +
      '日 ' +
      addZero(date1.getHours()) +
      ':' +
      addZero(date1.getMinutes())
  }
  return date
}

function getExtension(path) {
  const basename = path.split(/[\\/]/).pop(),
    pos = basename.lastIndexOf('.'),
    namePos = basename.lastIndexOf('.', pos - 1)

  if (basename === '' || pos < 1) return {}
  return {
    name: basename.slice(namePos + 1),
    ext: basename.slice(pos + 1)
  }
}

function showToast(options) {
  options = typeof options === 'string' ?
    { title: options, icon: 'none' }
    :
    {
      title: '操作失败，请稍后再试',
      icon: 'none',
      ...options
    }
  wx.showToast(options)
}

module.exports = {
  formatTime: formatTime,
  formatRelativeTime,
  getExtension,
  showToast
}
