const app = getApp();
import to from 'await-to-js';

let timer = 0;
const FORBIDDEN_WORDS = ['undefind'];

Page({

  /**
   * Page initial data
   */
  data: {
    isFocusedOnTheInputKeywords: true,
    relations: [],
    keywords: '',
    hasTopic: false,

    topicId: '',
  },

  isSubmitting: false,

  addRelation() {
    const relations = this.data.relations;
    // relations.push();
    this.setData({
      ['relations[' + relations.length + ']']: {
        id: 'r' + Math.random(),
        value: '',
        focus: true
      }
    });
  },

  deleteRelation(ev) {
    const relations = this.data.relations;
    const dataset = ev.currentTarget.dataset;
    const index = dataset.index;
    relations.splice(index, 1);
    this.setData({
      relations
    })
  },

  onKeywordsInput(ev) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(_ => {
      this.setData({
        keywords: ev.detail.value
      });
      timer = 0;
    }, 150)
  },

  onRelationInput(ev) {
    const relations = this.data.relations;
    const dataset = ev.currentTarget.dataset;
    const index = dataset.index;

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(_ => {
      relations[index].value = ev.detail.value;

      this.setData({
        relations
      });
      timer = 0;
    }, 150)
  },

//   onRelationBlur(ev) {
//     const relations = this.data.relations;
//     const dataset = ev.currentTarget.dataset;
//     const index = dataset.index;
// console.log('blur')
//     this.setData({
//       ['relations[' + index + '].focus']: false
//     }); 
//   },

  // onRelationFocus(ev) {
  //   const relations = this.data.relations;
  //   const dataset = ev.currentTarget.dataset;
  //   const index = dataset.index;



  //   this.setData({
  //     ['relations[' + index + '].focus']: {
  //       focus: false
  //     }
  //   });
  // },

  verifyFileds() {
    const keywords = this.data.keywords;
    const relations = this.data.relations;

    if (!keywords) {
      wx.showToast({
        title: '请输入话题关键词',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isFocusedOnTheInputKeywords: true
      });
      return false;
    } else if (keywords.length < 2 || keywords.length > 15) {
      wx.showToast({
        title: '抱歉，话题关键词不能多于15个字  最少2个',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isFocusedOnTheInputKeywords: true
      });
      return false;
    } else if (keywords.length < 2 || keywords.length > 15) {
      wx.showToast({
        title: '抱歉，话题关键词不能多于15个字  最少2个',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        isFocusedOnTheInputKeywords: true
      });
      return false;
    }

    for (let i = 0; i < relations.length; i++) {
      if (!relations[i].value) {
        wx.showToast({
          title: '请输入话题关联词',
          icon: 'none',
          duration: 2000
        });
        return false;
      } else if (keywords.length < 2 || keywords.length > 15) {
        wx.showToast({
          title: '抱歉，话题关键词不能多于15个字  最少2个',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
    }

    return true;
  },

  async save(event) {
    
    const keywords = this.data.keywords;
    const relations = this.data.relations;

    if (this.isSubmitting) {
      return;
    }

    if (!this.verifyFileds()) {
      return;
    }

    this.isSubmitting = true;
    let err = null, res = {};

    [err, res] = await to(app.$request.send({
      uri: `pom/${this.data.topicId ? "modify?id=" + this.data.topicId : "create"}${this.data.topicId ? '&' :'?'}keywords=${keywords}&relations=[${relations.length === 1 ? relations[0].value : (relations.length>1 ? relations.reduce((a, c) => {
        return { value: a.value + ',' + c.value }
      }).value: '')}]`,
      method: 'post',
      // body: {
      //   name: employeeName,
      //   join_year: onBoardingYear,
      //   status: pageIndex.split('.')[1]
      // }
    }));
    setTimeout(_ => {
      this.isSubmitting = false;
    }, 300);

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (res.header && res.header.code == 20001) {
      wx.showToast({
        title: res.header.desc,
        icon: 'none',
        duration: 2000
      });
      return
    }

    app.$event.emit('inforceInit', null)

    wx.navigateBack({
      
    })

  },

  init() {
    if (this.data.topicId) {
      this.initRemoteData();
    }
  },

  async initRemoteData() {
    let err = null,
      res = {};

    [err, res] = await to(app.$request.send({
      uri: `pom/keyword_detail?id=${this.data.topicId}`,
      method: 'post',
      // body: {
      //   period: '24h',
      //   index: 0,
      //   size: PAGE_SIZE
      // }
    }));

    const data = res.data;

    if (err) {
      console.error(err);
      wx.showToast({
        title: '服务器开小差了，请稍后再试！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (data.relations) {
      data.relations = data.relations.map(item => {
        return {
          id: 'r' + Math.random(),
          value: item,
          focus: false
        }
      });
    }

    if (data) {
      if(data.keywords) {
        data.hasTopic = true;
      }
      this.setData(data);
    }

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      topicId: options.id
    })
    this.init();
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})