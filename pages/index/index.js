const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_Id: 0
  },


  _initData: function () {
    let that = this;
    util.request(api.adminIndex).then(function (res) {
      if (res.returnCode === 0) {
        that.setData({
          user_Id: res.data.id,
        });

      }else if (res.returnCode === 401) {
        var pages = getCurrentPages(); //获取加载的页面
        var currentPage = pages[pages.length-1]; //获取当前页面的对象
        var url = currentPage.route; //当前页面url
        //console.log(url);
        util.showOkToast("无此用户，重新打开小程序登录",5000);
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('token');
        app.globalData.userInfo = "";
        app.globalData.token = "";
        app.appUserPost(url);

      }else{
        util.showOkToast(""+ res.returnMsg +"",5000);

      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
});