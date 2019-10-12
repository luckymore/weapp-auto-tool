import LocalStorageFactory from '../factories/local-storage';

const ENV = 'production'; // 'production || development'

export default ENV === 'production' ? {
  host: 'mistaff.m.mi.com',
  protocol: 'https',
  version: 'v1',
  auth: {
    expires: 3600,
    uri: 'wxLogin'
  },
  clientVersion: '0.0.1',
  clientID: '3znRi7kL8Max2GTB',
  storage: new LocalStorageFactory()
} : {
    host: '10.40.254.140:11356',
  protocol: 'http',
  version: 'v1',
  auth: {
    expires: 3600,
    uri: 'wxLogin'
  },
  clientVersion: '0.0.1',
  clientID: '3znRi7kL8Max2GTB',
  storage: new LocalStorageFactory()
}