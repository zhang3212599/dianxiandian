const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const app = getApp();

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {

      //console.log(e);

      //用户按了允许授权按钮
      let that = this;
      let code = app.globalData.code;
      let userInfo = e.detail;
      //插入登录的用户的相关信息到数据库

        console.log(code);
        console.log(userInfo);

        wx.request({
          url: api.loginByWeixin,
          data: {
            code: code,
            userInfo: userInfo
          },
          method: "POST",
          success: function (res) {
            let data = res.data;
            if (data.returnCode === 0) {

              wx.setStorageSync('token', ""+ data.data.token +"");
              wx.setStorageSync('userInfo', ""+ data.data.userInfo +"");

              util.showOkToast("登录成功");

              console.log(wx.getStorageSync('loginafterurl'));

              wx.reLaunch({
               url: '/'+ wx.getStorageSync('loginafterurl') +''
               });

            }else{
              util.showErrorToast(""+ data.returnMsg +"");

            }

          },
          fail: function(){
            util.showOkToast("服务器访问出问题了，请联系管理人员",5000);

          }
        });

      //授权成功后，跳转进入小程序首页


    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title:'警告',
        content:'您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel:false,
        confirmText:'返回授权',
        success:function(res){
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideShareMenu();

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
  }
});