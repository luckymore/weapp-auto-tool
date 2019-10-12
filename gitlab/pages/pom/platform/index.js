const app = getApp();
import to from 'await-to-js';
import dayjs from 'dayjs';
import { formatRelativeTime } from '../../../utils/util.js';
const PAGE_SIZE = 10;


Page({

  /**
   * Page initial data
   */
  data: {
    keywords: '',
    like: '',
    unlike: '',
    upTo: 0,  // 上升到
    popularIndex: 0,
    items: [
      // {
      //   userName: 'xxxx',
      //   content: 'xxxxx',
      //   timestamp: 123131
      // }
    ],

    timePickerIndex: 0,
    satisfactionPickerIndex: 0,

    periods: [
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
    ],

    satisfactions: [
      {
        id: 'all',
        value: '全部',
      },
      {
        id: 'positivity',
        value: '好评',
      },
      {
        id: 'neutrality',
        value: '中评',
      },
      {
        id: 'negativity',
        value: '差评',
      },
    ],

    noMoreData: false,

    isLoadingData: false,

    multiPickers: [
      [
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
      ], 
      [
        {
          id: 'all',
          value: '全部评论',
        },
        {
          id: 'positivity',
          value: '好评',
        },
        {
          id: 'neutrality',
          value: '中评',
        },
        {
          id: 'negativity',
          value: '差评',
        },
      ], 
    ],

    multiIndex: [0, 0],

  },

  topicId: '',
  from: '',
  period: '24h',
  satisfaction: 'all',

  indexOfComments: 0,

  init() {
    wx.showNavigationBarLoading();
    this.getRemoteData();
  },

  async getRemoteData() {
    let noMoreData = false;
    let items = this.data.items;

    let err = null,
      res = {};

    if (!this.data.isLoadingData) {
      this.setData({
        isLoadingData: true
      })
    }

    [err, res] = await to(app.$request.send({
      uri: `pom/comments?from=${this.from}&${this.satisfaction}=1&id=${this.topicId}&period=${this.period}&index=${this.indexOfComments}&size=${PAGE_SIZE}`,
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

    this.indexOfComments += 1;

    data.items.forEach( item => {
      item.time = formatRelativeTime(item.timestamp);
    });

    data.items = items.concat(data.items);

    this.setData({ noMoreData, ...data});

    wx.hideNavigationBarLoading();

  },

  bindTimePickerChange: function (e) {
    const index = e.detail.value - 0;
    const periods = this.data.periods;

    this.setData({
      timePickerIndex: index,
      items: [],
      noMoreData: false
    });
    this.period = periods[index].id;
    this.indexOfComments = 0;
    this.init();
  },

  bindSatisfactionPickerChange(e) {
    const index = e.detail.value - 0;
    const satisfactions = this.data.satisfactions;

    this.setData({
      satisfactionPickerIndex: index,
      items: [],
      noMoreData: false
    });
    this.satisfaction = satisfactions[index].id;
    this.indexOfComments = 0;
    this.init();
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    const periods = this.data.periods;

    const periodId = options.period;

    this.from = options.from;
    // this.period = options.period;
    this.topicId = options.id;

    for (let i = 0; i < periods.length;i ++) {
      if (periods[i].id === periodId) {
        this.setData({
          multiIndex: [i, 0]
        });
        this.period = periodId;
        break;
      }
    }

    this.init();
    
  },

  bindMultiPickerChange: function (e) {
    const changesOfIndex = e.detail.value;
    const multiIndex = this.data.multiIndex;
    const multiPickers = this.data.multiPickers;
    
    if (multiIndex[0] !== changesOfIndex[0]) {
      this.period = multiPickers[0][changesOfIndex[0]].id;
    }

    if (multiIndex[1] !== changesOfIndex[1]) {
      this.satisfaction = multiPickers[1][changesOfIndex[1]].id;
    }

    this.setData({
      multiIndex: changesOfIndex,
      items: [],
      noMoreData: false
    });

    this.indexOfComments = 0;
    this.init();
  },
  // bindMultiPickerColumnChange: function (e) {
  //   console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
  //   var data = {
  //     multiArray: this.data.multiArray,
  //     multiIndex: this.data.multiIndex
  //   };
  //   data.multiIndex[e.detail.column] = e.detail.value;
  //   switch (e.detail.column) {
  //     case 0:
  //       switch (data.multiIndex[0]) {
  //         case 0:
  //           data.multiArray[1] = ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'];
  //           data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
  //           break;
  //         case 1:
  //           data.multiArray[1] = ['鱼', '两栖动物', '爬行动物'];
  //           data.multiArray[2] = ['鲫鱼', '带鱼'];
  //           break;
  //       }
  //       data.multiIndex[1] = 0;
  //       data.multiIndex[2] = 0;
  //       break;
  //     case 1:
  //       switch (data.multiIndex[0]) {
  //         case 0:
  //           switch (data.multiIndex[1]) {
  //             case 0:
  //               data.multiArray[2] = ['猪肉绦虫', '吸血虫'];
  //               break;
  //             case 1:
  //               data.multiArray[2] = ['蛔虫'];
  //               break;
  //             case 2:
  //               data.multiArray[2] = ['蚂蚁', '蚂蟥'];
  //               break;
  //             case 3:
  //               data.multiArray[2] = ['河蚌', '蜗牛', '蛞蝓'];
  //               break;
  //             case 4:
  //               data.multiArray[2] = ['昆虫', '甲壳动物', '蛛形动物', '多足动物'];
  //               break;
  //           }
  //           break;
  //         case 1:
  //           switch (data.multiIndex[1]) {
  //             case 0:
  //               data.multiArray[2] = ['鲫鱼', '带鱼'];
  //               break;
  //             case 1:
  //               data.multiArray[2] = ['青蛙', '娃娃鱼'];
  //               break;
  //             case 2:
  //               data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
  //               break;
  //           }
  //           break;
  //       }
  //       data.multiIndex[2] = 0;
  //       break;
  //   }
  //   console.log(data.multiIndex);
  //   this.setData(data);
  // },

  onReachBottom() {
    if (this.data.noMoreData) {
      return;
    }
    this.getRemoteData();
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})