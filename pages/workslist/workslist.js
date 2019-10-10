const util = require('../../utils/util.js');
const api = require('../../config/api.js');

var scrollNavheight = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageA: 0,
    pageB: 0,
    navClass: true,
    scrollHeight: 0,
    scrollDataA: [],
    scrollDataB: []
  },

  onNavTab: function(e){
    let that = this;
    let classBool = that.data.navClass;
    if(classBool && that.data.pageB == 0){ that.getIndexDataB(); }
    that.setData({
      navClass: !classBool
    })
  },


  workslistUlScrollA: function(e) {
    this.getIndexDataA();

  },
  workslistUlScrollB: function (e) {
    this.getIndexDataB();
  },

  getIndexDataA: function(e) {
    let that = this;
    that.setData({
      pageA: that.data.pageA + 1
    });

    util.request(api.workslistHot+"?page="+ that.data.pageA +"").then(function (res) {
      if (res.returnCode === 0) {

        let dataList = that.data.scrollDataA;
        let data = res.data;
        let dataLen = data.length;
        for(var i=0; i<dataLen; i++){
          dataList.push(data[i])
        }
        that.setData({
          scrollDataA: dataList
        });
        wx.hideLoading();

      }else{
        util.showErrorToast(""+ res.returnMsg +"");
        wx.hideLoading();
      }
    });

  },

  getIndexDataB: function(e) {
    let that = this;
    that.setData({
      pageB: that.data.pageB + 1
    });
    util.request(api.workslistNew+"?page="+ that.data.pageB +"").then(function (res) {
      if (res.returnCode === 0) {

        let dataList = that.data.scrollDataB;
        let data = res.data;
        let dataLen = data.length;
        for(var i=0; i<dataLen; i++){
          dataList.push(data[i])
        }
        that.setData({
          scrollDataB: dataList
        });

      }else{
        util.showErrorToast(""+ res.returnMsg +"");

      }
      wx.hideLoading();
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    });

    wx.createSelectorQuery().select('.workslistH3').boundingClientRect(function (rect) {
      //console.log(rect.height);
      scrollNavheight = rect.height + 20;
    }).exec();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var scrollheight = 0;

    wx.getSystemInfo({
      success: function (res) {
        //console.log(res.windowHeight);
        //console.log(scrollNavheight)
        scrollheight = res.windowHeight - scrollNavheight;        
      }
    });
 
    this.setData({
      scrollHeight: scrollheight
    });

    var that = this;
    //setTimeout(function(){
      that.getIndexDataA();
    //},3000)


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    let that = this;
    that.setData({
      pageA: 0,
      pageB: 0,
      navClass: true,
      scrollDataA: [],
      scrollDataB: []
    });
    that.getIndexDataA();
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我画点，你画线',
      desc: '画了很多"点",等待你来解密哈。',
      path: '/pages/workslist/workslist'
    }
  }
})