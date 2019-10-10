const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listPage: 0,
    scrollHeight: "100%",
    scrollData: []
  },

  workslistUlScroll: function(e) {
    console.log("加载更多");
    this._initData();

  },

  _initData: function(e){
    let that = this;
    that.setData({
      listPage: this.data.listPage + 1
    });
    util.request(api.adminWorksHe+"?&page="+ this.data.listPage +"").then(function (res) {
      if (res.returnCode === 0) {

        let dataList = that.data.scrollData;
        let data = res.data.data;
        let dataLen = data.length;
        for(var i=0; i<dataLen; i++){
          dataList.push(data[i])
        }
        that.setData({
          scrollData: dataList
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
    this._initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var scrollheight = 0;

    wx.getSystemInfo({
      success: function (res) {
        //console.log(res.windowHeight);
        scrollheight = res.windowHeight - 20;
      }
    })

    this.setData({
      scrollHeight: scrollheight
    })



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
      listPage: 0,
      scrollData: []
    });

    that._initData();
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
      title: api.shareTitle,
      desc: api.shareDesc,
      path: api.sharePath,
      imageUrl: api.shareImage,
    }
  }
})