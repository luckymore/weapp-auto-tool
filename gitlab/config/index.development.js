import LocalStorageFactory from '../factories/local-storage';

export default {
  host: 'localhost',
  protocol: 'http',
  version: 'v1',
  auth: {
    expires: 3600,
    uri: 'passport/miniprogram'
  },
  platform: 'miniprogram',
  appID: 'wx34638180be51f170',
  clientVersion: '0.0.1',
  clientID: '3znRi7kL8Max2GTB',
  storage: new LocalStorageFactory()
}