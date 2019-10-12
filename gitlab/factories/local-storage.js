class LocalStorageFactory {
  constructor() {
    this.localStorage = wx;
  }

  set(key, value) {
    try {
      this.localStorage.setStorageSync(key, value);
    } catch (e) { }
  }

  get(key) {
    try {
      var value = this.localStorage.getStorageSync(key);
      return value || undefined;
    } catch (e) {
      return undefined;
    }
  }

  delete(key) {
    try {
      wx.removeStorageSync(key)
    } catch (e) { }
  }
}

export default LocalStorageFactory
