const fs = require('fs')
const path = require('path')
const tar = require('tar-stream')
const TOKEN = 'zuJKXg-qwEcXBYXh6UY2'
const gitlabAPIPrefix = 'https://micode.be.xiaomi.com/api/v4'
const _ = {}

const _exists = fs.existsSync || path.existsSync

_.mkDirSyncRecursive = function (filePath) {
  const dirname = path.dirname(filePath)
  if (_exists(dirname)) {
    return dirname
  }
  _.mkDirSyncRecursive(dirname)
  fs.mkdirSync(dirname)
}
let a = 1
_.downloadRepo = async function (outputRepo, projectID, sha, useMemory = false) {
  const gunzip = require('gunzip-maybe')
  const https = require('https')
  const path = require('path')
  const extract = tar.extract()
  const pack = tar.pack()
  const shaPart = sha ? `sha=${encodeURI(sha)}&` : ''

  // https://micode.be.xiaomi.com/api/v4/projects/7663/repository/archive\?private_token\=zuJKXg-qwEcXBYXh6UY2
  const sourceUrl = `${gitlabAPIPrefix}/projects/${projectID}/repository/archive?${shaPart}private_token=${TOKEN}`
  const fileList = []

  return new Promise((resolve, reject) => {
    !useMemory && fs.mkdirSync(outputRepo)
    extract.on('entry', (header, stream, next) => {
      console.log(a++)
      if (a === 2) {
        console.log(header)
      }
      const tempBuffer = []
      let tempPrefix = ''
      stream.on('data', function (data) {
        tempBuffer.push(data)
        tempPrefix = tempPrefix || `${header.name.split('/')[0]}/`
        const wholeBuffer = Buffer.concat(tempBuffer)
        const dataSize = Buffer.byteLength(wholeBuffer)
        const fileName = header.name.replace(tempPrefix, '')
        if (dataSize === header.size && header.type === 'file') {
          // be careful of size
          if (useMemory) {
            return fileList.push({
              fileName,
              buffer: wholeBuffer
            })
          }
          const filePath = path.join(outputRepo, fileName)
          _.mkDirSyncRecursive(filePath)
          fs.writeFileSync(filePath, wholeBuffer)
          fileList.push(filePath)
          tempBuffer.length = 0
        }
      })
      stream.on('end', function () {
        next()
      })
      stream.resume()
    })
    extract.on('finish', () => {
      resolve(fileList)
    })

    https
      .get(sourceUrl, res => {
        res.pipe(gunzip()).pipe(extract)
      })
      .on('error', err => {
        reject(err)
      })
  })
}

module.exports = _
