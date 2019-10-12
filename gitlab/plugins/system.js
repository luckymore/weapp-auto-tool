const SYSTEM = '$system';
const getSystemInfo = wx.getSystemInfo;
const getSystemInfoSync = wx.getSystemInfoSync;


const Plugin = (App, params = {}) => {


  const _$system = (() => {

    try {
      // let startAt = new Date();
      let systemInfo = wx.getStorageSync(SYSTEM);
      // console.log(new Date() - startAt)

      if (!systemInfo) {
        // let startAt = new Date();
        systemInfo = getSystemInfoSync();
        // console.log(systemInfo)
        // console.log(new Date() - startAt);
        systemInfo._tabBarHeight = 0;
        systemInfo._windowHeight = systemInfo.windowHeight;
        wx.setStorage({
          key: SYSTEM,
          data: systemInfo
        });
      }
      return systemInfo
    } catch (e) {
      return {
        windowWidth: 375,
        _windowHeight: 0,
      }
    }
  })();

  App[SYSTEM] = _$system;

};


export default Plugin;