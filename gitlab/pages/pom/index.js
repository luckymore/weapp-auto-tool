const app = getApp();
import to from 'await-to-js';
import dayjs from 'dayjs';

const PAGE_SIZE = 20;

Page({

  /**
   * Page initial data
   */
  data: {
    lastTapTime: 0,

    hasManagementPermission: false,

    legends: [
      // {
      //   id: 'xxx',
      //   legend: '话题榜',
      //   description: '热度最高的话题'
      // },
      // {
      //   id: 'yyy',
      //   legend: '飙升榜',
      //   description: '增长最快的话题'
      // },
      // {
      //   id: 'ccc',
      //   legend: '口碑榜',
      //   description: '口碑 最佳/最坏 的话题'
      // },
    ],
    body: [
      // {
      //   id: 'xxx',
      //   stickies: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '话题Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      //   items: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '话题Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '话题Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      // },

      // {
      //   id: 'yyy',
      //   stickies: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '飙升Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '飙升Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      //   items: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '飙升Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '飙升Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      // },

      // {
      //   id: 'ccc',
      //   stickies: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '口碑Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '口碑Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      //   items: [
      //     {
      //       popularIndex: 10000,
      //       keywords: '口碑Redmi Note 8',
      //       id: 'xxx'
      //     },
      //     {
      //       popularIndex: 10001,
      //       keywords: '口碑Redmi Note 8 Pro',
      //       id: 'xxx'
      //     },
      //   ],
      // },
    ],
    periods: [],
    pickerIndex: 0,
    pickers: [],
    activeTab: {
      index: 0,
      // periodId: '24h',
      id: ''
    },
    isLoadingData: false,
    windowHeight: app.$system.windowHeight
  },

  hasBeenInitialized: false,
  isSubmitting: false,

  changeTab(ev) {
    const dataset = ev.currentTarget.dataset;
    const index = dataset.index;
    const id = dataset.id;
    const body = this.data.body;

    const curTime = ev.timeStamp;
    const lastTime = dataset.time;
    if (curTime - lastTime > 0) {
      if (curTime - lastTime < 300) {
        console.log("挺快的双击，用了：" + (curTime - lastTime))
        this.setData({
          ['body[' + index + '].scrollTop']: 0,
        });
      }
    }
    this.setData({
      lastTapTime: curTime
    });

    if (this.data.activeTab.id === id) {
      return
    }
    // if (body[index].scrollTop === undefined) {
      // this.setData({
      //   'activeTab.id': id,
      //   'activeTab.index': index,
        // 'activeTab.periodId': '24h',
        // ['body[' + index + '].noMoreData']: false,
        // ['body[' + index + '].scrollTop']: 0,
    //   });
    // } else {
      this.setData({
        'activeTab.id': id,
        'activeTab.index': index,
        // 'activeTab.periodId': '24h',
        ['body[' + index + '].noMoreData']: false,
      });
    // }

  },

  navigateToDetail(ev) {
    const topicId = ev.currentTarget.dataset.id;
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const periodId = body[activeTab.index].periodId;

    wx.navigateTo({
      url: `./detail/index?id=${topicId}&period=${periodId}`,
    })
  },

  bindPickerChange: function (e) {
    const indexOfTabs = this.data.activeTab.index;
    const indexOfCurrentPicker = e.detail.value - 0;
    const periods = this.data.periods;
    const pickers = this.data.pickers;
    pickers[indexOfTabs].index = indexOfCurrentPicker;
    this.setData({
      pickers,
      // 'activeTab.periodId': periods[indexOfTabs][indexOfCurrentPicker].id,
      ['body[' + indexOfTabs + '].periodId']: periods[indexOfTabs][indexOfCurrentPicker].id,
      ['body[' + indexOfTabs + '].index']: 0,
      ['body[' + indexOfTabs + '].noMoreData']: false,
      ['body[' + indexOfTabs + '].items']: []
    });
    this.getMoreData();
  },

  togglePopBubble(ev) {
    const hasManagementPermission = this.data.hasManagementPermission;
    if (!hasManagementPermission) {
      return
    }
    const dataset = ev.currentTarget.dataset;
    const index = dataset.index;
    const source = dataset.source;
    const activeTab = this.data.activeTab;
    let list = []; //this.data.list;
    const touches = ev.touches;
    const touch = touches[0] ? touches[0] : null;
    let itemIsVisible = '';
    let itemPageX = '';
    let itemPageY = '';
    let pageX = 0;
    let pageY = 0;
    let item = '';

    switch (source) {
      case 'stickies':
        list = this.data.body[activeTab.index].stickies;
      break;
      case 'items':
        list = this.data.body[activeTab.index].items;
    }

    if (touch) {
      pageX = touch.pageX;
      pageY = touch.pageY;
    }
    // console.log(this.windowWidth)

    itemIsVisible = 'body[' + activeTab.index + '].' + source + '[' + index + '].bubbleIsVisible';

    if (list[index].bubbleIsVisible) {
      this.setData({
        [itemIsVisible]: false
      })
    } else {
      // wx.vibrateShort();
      itemPageX = 'body[' + activeTab.index + '].' + source + '[' + index + '].left';
      itemPageY = 'body[' + activeTab.index + '].' + source + '[' + index + '].top';

      this.setData({
        [itemIsVisible]: true,
        [itemPageX]: app.$system.windowWidth - pageX > 170 ? pageX : app.$system.windowWidth - 170,
        // [itemPageY]: this.window.windowWidth - pageX > 170 ? pageX : this.window.windowWidth - 170
      });
    }

  },

  init() {
    this.hasBeenInitialized = false;
    this.initRemoteData();
  },

  initLocalData() {
    const activeTab = {
      index: 0,
      // periodId: '24h',
      id: ''
    };
    const legends = this.data.legends;
    const periods = new Array(legends.length).fill([
      {
        id: '24h',
        value: '24小时',
      },
      {
        id: '3d',
        value: '3天',
      },
      {
        id: '7d',
        value: '7天',
      },
      {
        id: '30d',
        value: '30天',
      },
    ]);
    let pickers = new Array(legends.length).fill(undefined);
    pickers = pickers.map(item => {
      return { index: 0, ...periods[0][0] }
    })

    // legends.forEach( (legend, index) => {
    // if (legend.isActive) {
    //   activeTab.index = index;
    //   activeTab.id = legend.id;
    // }
    // });
    if (!activeTab.id) {
      activeTab.id = legends[0].id;
    }
    this.setData({
      legends,
      periods,
      pickers,
      activeTab
    });
  },

  async initRemoteData() {
    let err = null,
      res = {};
      
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    let items = [];
    // let noMoreData = false;
    // const period = activeTab.periodId;
    const index = 0;
    let tabIsVisible = '';

    [err, res] = await to(app.$request.send({
      uri: `pom/tabs?index=${index}&size=${PAGE_SIZE}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    if (!res) return

    const data = res.data;

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    data.body.forEach(item => {
      item.index = 1;
      item.periodId = '24h';
      item.scrollTop = 0;
      if(item.legend === '口碑榜') {
        item.isFavorable = 1;
      }
    });
    

    // tabIsVisible = 'body[' + activeTab.index + '].items[' + index + '].noMoreData';
    // [itemIsVisible]: noMoreData,

    this.setData({ ...data });

    if(!this.hasBeenInitialized) {
      wx.hideNavigationBarLoading();
      this.hasBeenInitialized = true;
      this.initLocalData();
    }

    this.initPermissions();

    wx.stopPullDownRefresh();
  },

  async initPermissions() {

    let hasManagementPermission = this.data.hasManagementPermission;

    let err = null,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `sys/perm/pom`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    if (!res) return

    let permissions = res.data && res.data.permission ? res.data.permission : [];

    for (let i = 0; i < permissions.length; i++) {
      if (permissions[i].perm === 'write') {
        if (permissions[i].is_able !== hasManagementPermission) {
          this.setData({
            hasManagementPermission: permissions[i].is_able
          })
        }
        return
      }
    }
  },

  async getMoreData() {
    let err = null,
      res = {};
    let noMoreData = false;
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const tabId = body[activeTab.index].id;
    let indexOfItems = body[activeTab.index].index;
    const legend = body[activeTab.index].legend;
    const periodId = body[activeTab.index].periodId;
    const isFavorable = body[activeTab.index].isFavorable;
    let items = body && body[activeTab.index] ? body[activeTab.index].items : [];

    if (!this.data.isLoadingData) {
      this.setData({
        isLoadingData: true
      })
    }

    [err, res] = await to(app.$request.send({
      uri: `pom/tabs_list?id=${tabId}&index=${indexOfItems}&size=${PAGE_SIZE}&period=${periodId}&unlike=${legend === '口碑榜' && isFavorable === 0 ? 1 : 0}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    this.setData({
      isLoadingData: false
    });

    const data = res.data;
    let stickies = data.stickies || [];

    if (err || !data) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (data.items.length == 0 || data.items.length < PAGE_SIZE) {
      noMoreData = true;
    }

    indexOfItems += 1;

    items = items.concat(data.items);

    this.setData({
      ['body[' + activeTab.index + '].index']: indexOfItems,
      ['body[' + activeTab.index + '].noMoreData']: noMoreData,
      ['body[' + activeTab.index + '].stickies']: stickies,
      ['body[' + activeTab.index + '].items']: items
    });
  },

  editTopic(ev) {
    const dataset = ev.currentTarget.dataset;
    const id = dataset.id;
    this.togglePopBubble(ev);
    wx.navigateTo({
      url: `./addword/index?id=${id}`,
    })
  },

  async unstickTopic(ev) {
    const dataset = ev.currentTarget.dataset;
    const id = dataset.id;
    const index = dataset.index;
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const stickies = body[activeTab.index].stickies;
    const items = body[activeTab.index].items;
    const tabId = body[activeTab.index].id;

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let err = null, res = {};
    let item = null;

    [err, res] = await to(app.$request.send({
      uri: `pom/actions?id=${id}&stick=0`,
      method: 'post',
    }));
    this.isSubmitting = false;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.init();

    // item = stickies.splice(index, 1)[0];
    // item.bubbleIsVisible = false;
    // items.unshift(item);

    // this.setData({
    //   ['body[' + activeTab.index + '].id']: tabId,
    //   ['body[' + activeTab.index + '].stickies']: stickies,
    //   ['body[' + activeTab.index + '].items']: items,
    // });

  },

  async stickTopic(ev) {
    const dataset = ev.currentTarget.dataset;
    const id = dataset.id;
    const index = dataset.index;
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const stickies = body[activeTab.index].stickies;
    const items = body[activeTab.index].items;
    const tabId = body[activeTab.index].id;

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let err = null, res = {};
    let item = null;

    [err, res] = await to(app.$request.send({
      uri: `pom/actions?id=${id}&stick=1`,
      method: 'post',
    }));
    this.isSubmitting = false;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // item = items.splice(index, 1)[0];
    // item.bubbleIsVisible = false;
    // stickies.unshift(item);

    // this.setData({
    //   ['body[' + activeTab.index + '].id']: tabId,
    //   ['body[' + activeTab.index + '].stickies']: stickies,
    //   ['body[' + activeTab.index + '].items']: items,
    // });
    this.init();
  },

  async hideTopic(ev) {
    const dataset = ev.currentTarget.dataset;
    const id = dataset.id;
    const index = dataset.index;
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const source = dataset.source;
    const items = body[activeTab.index][source];

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let modifiedItems = '';
    let err = null, res = {};
    let item = null;

    [err, res] = await to(app.$request.send({
      uri: `pom/actions?id=${id}&show=0`,
      method: 'post',
    }));
    this.isSubmitting = false;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // items.splice(index, 1);

    // modifiedItems = 'body[' + activeTab.index + '].' + source;

    // this.setData({
    //   [modifiedItems]: items
    // });

    this.init();
  },

  async getListInOrderOfNegativeReputation() {
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const tabId = body[activeTab.index].id;
    const periodId = body[activeTab.index].periodId;

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let err = null, res = {};
    let items = null;

    [err, res] = await to(app.$request.send({
      uri: `pom/tabs_list?id=${tabId}&unlike=1&period=${periodId}`,
      method: 'post',
    }));
    this.isSubmitting = false;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    items = res.data.items;
    let stickies = res.data.stickies || [];

    this.setData({
      ['body[' + activeTab.index + '].isFavorable']: 0,
      ['body[' + activeTab.index + '].index']: 1,
      ['body[' + activeTab.index + '].noMoreData']: false,
      ['body[' + activeTab.index + '].stickies']: stickies,
      ['body[' + activeTab.index + '].items']: items
    });
  },

  async getListInOrderOfFavorableReputation() {
    const body = this.data.body;
    const activeTab = this.data.activeTab;
    const tabId = body[activeTab.index].id;
    const periodId = body[activeTab.index].periodId;

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    let err = null, res = {};
    let items = null;

    [err, res] = await to(app.$request.send({
      uri: `pom/tabs_list?id=${tabId}&period=${periodId}`,
      method: 'post',
    }));
    this.isSubmitting = false;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    items = res.data.items;
    let stickies = res.data.stickies || [];

    this.setData({
      ['body[' + activeTab.index + '].isFavorable']: 1,
      ['body[' + activeTab.index + '].index']: 1,
      ['body[' + activeTab.index + '].noMoreData']: false,
      ['body[' + activeTab.index + '].stickies']: stickies,
      ['body[' + activeTab.index + '].items']: items
    });
  },

  onLoad: function (options) {
    app.$event.on('inforceInit', this.init, this);
    wx.showNavigationBarLoading();
    this.init();
  },

  onPullDownRefresh() {
    this.init();
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    // const activeTab = this.data.activeTab;
    // if (this.data.body[activeTab.index].noMoreData) {
    //   return;
    // }
    // this.getMoreData();
  },

  scrollToBottom() {
    const activeTab = this.data.activeTab;
    if (this.data.body[activeTab.index].noMoreData) {
      return;
    }
    this.getMoreData();
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  cancel: function () {

  },
})