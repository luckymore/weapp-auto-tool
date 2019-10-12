import { parseJSON, objectToParams } from '../libs/util'
import { wxPromise } from '../libs/wxPromise'
import config from '../config/client'
import util from '../utils/util'

let theNumberOfAttemptsByTheClientToAuthenticate = 1

class Credentials {
  constructor(accessToken) {
    this.accessToken = accessToken
  }

  toObject() {
    return {
      // clientID: this.clientID,
      accessToken: this.accessToken,
    }
  }
}

class RequestFactory {
  constructor(config) {
    this.config = config
    this.storage = config.storage
  }

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            resolve(res.code)
          } else {
            wx.navigateTo({
              url: '/pages/errors/wxLoginFailure/index',
            })
          }
        },
        fail: () => {
          wx.navigateTo({
            url: '/pages/errors/wxLoginFailure/index',
          })
        },
      })
    })
  }

  authenticate() {
    const { config, storage } = this

    if (!config.host) {
      throw new Error('You have not specified an API host')
    }

    const login = code => {
      return new Promise((resolve, reject) => {
        wxPromise
          .request({
            url: `${config.protocol}://${config.host}/${config.auth.uri}`,
            method: 'POST',
            data: {
              clientId: config.clientID,
              code,
            },
            header: {
              'Content-Type': 'application/json',
              'X-CLIENT-VERSION': config.clientVersion,
            },
          })
          .then(parseJSON)
          .then(response => {
            if (response.json && response.json.data) {
              resolve(response.json)
              return
            }
            if (theNumberOfAttemptsByTheClientToAuthenticate < 3) {
              theNumberOfAttemptsByTheClientToAuthenticate++
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  this.authenticate()
                    .then(() => resolve())
                    .catch(error => reject(error))
                }, 100)
              })
            }
            reject(response.json)
          })
          .catch(error => reject(error))
      })
    }

    const getUserInfo = json => {
      return new Promise((resolve, reject) => {
        const headers = {
          'Content-Type': 'application/json',
          'X-CLIENT-VERSION': config.clientVersion,
        }
        // const { accessToken } = storage.get('credentials') || {}
        // console.log(storage.get('credentials'))
        const accessToken  = json.data || {}
        
        if (accessToken) {
          headers.Authorization = `${accessToken}`
        }
        wxPromise
          .request({
            url: `${config.protocol}://${config.host}/wxCheckAuth`,
            method: 'POST',
            header: headers,
            data: {},
          })
          .then(parseJSON)
          .then(response => {
            if (!response) {
              reject(null)
              return
            }
            if (response.status === 401) {
              response.data = json.data
            
              resolve(response)
            } else {
              resolve(json)
            }
          })
          .catch(error => reject(error))
      })
    }

    const promise = this.wxLogin()
      .then(login)
      .then(getUserInfo)

    promise
      .then(response => {
        const credentials = new Credentials(response.data)
        // storage.set('credentials', JSON.stringify(credentials))
        storage.set('credentials', credentials)
        if (response.status === 401) {
          wx.navigateTo({
            url: '/pages/errors/unauthorized/index',
          })
          return Promise.resolve(true)
        }
      })
      .catch(error => {
        wx.navigateTo({
          url: '/pages/errors/wxLoginFailure/index',
        })
      })

    return promise
  }

  send({ uri, method, body = {} }) {

    const { config, storage } = this;

    const promise = new Promise((resolve, reject) => {
      const credentials = storage.get('credentials') || {};
      const req = ({ accessToken = "" }, skip) => {
        if (skip === true) {
          return;
        }
        let headers = {
          'Content-Type': 'application/json',
          'X-CLIENT-VERSION': config.clientVersion,
        }

        if (accessToken) {
          headers.Authorization = `${accessToken}`
        }
        wxPromise.request(/^get$/i.test(method) ? {
          url: `${config.protocol}://${config.host}/${uri}${objectToParams(body)}`,
          method: method.toUpperCase(),
          header: headers
        } : {
            url: `${config.protocol}://${config.host}/${uri}`,
            method: method.toUpperCase(),
            data: body,
            header: headers
          }).then(response => {
            if (response.statusCode === 402) {
              wx.navigateTo({
                url: '/pages/errors/unauthorized/index',
              });
              return
            } else if (response.statusCode === 403) { // 禁止外网用户访问
              wx.navigateTo({
                url: '/pages/errors/forbidden/index',
              });
              return
            } else if (response.statusCode === 406) { // 禁止外网用户访问
              wx.navigateTo({
                url: '/pages/errors/notOnOurIntranet/index',
              });
              return
            } else if (response.statusCode === 401 && response.data && /failed/.test(response.data)) {
              return this.authenticate()
                .then(() => req())
                .catch(error => reject(error))
            }
            resolve(response.data);
          })
          .catch(error => {
            reject(error)
          });
      }

      if (
        !credentials
        || !credentials.accessToken
      ) {
        return this.authenticate()
          .then((skip) => req(storage.get('credentials'), skip))
          .catch(error => reject(error))
      }
      return req(credentials)
    })

    return promise
  }

  /**
   * 复制 send 改的
   *  TODO 周报相关的数据格式与其他不一样，而且send里reject逻辑，不利于使用await-to-js，临时新增一个post，后续统一
   * @param {string} uri weekly/reportInfo
   * @param {string} method post
   * @param {Object} body 参数拼接在url后面。。。
   */
  post({ uri, method, body = {} }) {
    const { config, storage } = this

    const promise = new Promise((resolve, reject) => {
      const credentials = storage.get('credentials') || {}
      const req = ({ accessToken = '' }, skip) => {
        if (skip) {
          return
        }
        let headers = {
          'Content-Type': 'application/json',
          'X-CLIENT-VERSION': config.clientVersion,
        }

        if (accessToken) {
          headers.Authorization = `${accessToken}`
        }
        
        const options = {
          url: `${config.protocol}://${config.host}/${uri}${objectToParams(body, true)}`,
          method: method.toUpperCase(),
          header: headers,
        }
        wxPromise
          .request(
            /^get$/i.test(method)
              ? options
              : options
          )
          .then(response => {
            const { statusCode, data: { code, data, desc } } = response
            switch (statusCode) {
              case 200:
                if (code === 200) resolve(data)
                else {
                  reject(response.data)
                  util.showToast(desc || '服务器异常，请重试')
                }
                break
              case 402:
                wx.navigateTo({
                  url: '/pages/errors/unauthorized/index',
                })
                break
              case 403:
                wx.navigateTo({
                  url: '/pages/errors/forbidden/index',
                })
                break
              case 406:
                wx.navigateTo({
                  url: '/pages/errors/notOnOurIntranet/index',
                })
                break
              case 401:
                if (response.data && /authorization failed/.test(response.data)) {
                  this.authenticate()
                    .then(() => req())
                    .catch(error => reject(error))
                }
                break
              default:
                reject(response.data)
            }
          })
          .catch(error => {
            reject(error)
          })
      }

      if (!credentials || !credentials.accessToken) {
        return this.authenticate()
          .then(skip => req(storage.get('credentials'), skip))
          .catch(error => reject(error))
      }
      return req(credentials)
    })

    return promise
  }
}

const Plugin = (App, params = {}) => {
  App.$request = new RequestFactory(config)
}

export default Plugin
