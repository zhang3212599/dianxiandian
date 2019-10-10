const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pStaId: 0,
    ptId: 0,
    shareDes: '我画点，你画线',

    shareImg: '',
    shareName: '',
    shareUrl: '',
    shareTitle:  ''
  },

  onSharebuttonB: function(e) {
    this.onShareAppMessage
  },

  /*onSharebuttonB: function(e) {
    wx.downloadFile({
      url: this.data.shareUrl, //仅为示例，并非真实的资源
      success: function (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          let tempFilePath = res.tempFilePath
          wx.saveFile({
            tempFilePath: tempFilePath[0],
            success: function (res) {
              let savedFilePath = res.savedFilePath
              console.log("图片本地下载成功。")
            }
          })
        }
      }
    })
  },*/

  _initData: function(e){
    let that = this;
    util.request(api.paintingShare+"?id="+ this.data.ptId +"").then(function (res) {
      if (res.returnCode === 0) {
        let shaTit = that.data.pStaId > 0 ? '简单画线，轻轻松松搞定了。你来试试？_提示('+ res.data.painting_name +')' :  '我画的点，看的懂伐？_提示('+ res.data.painting_name +')';
        that.setData({
          shareImg: res.data.painting_spotimg,
          shareName: res.data.painting_name,
          shareTitle: shaTit
        })

      }else{
        util.showErrorToast(""+ res.returnMsg +"");

      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let shareId = options.id;
    let sharePid = options.pid || 0;
    let sharePidDes = sharePid > 0 ? '很简单，我已轻轻松松搞定了' : '我画点，你画线';
    this.setData({
      pStaId: sharePid,
      ptId: shareId,
      shareDes: sharePidDes,
      shareUrl: 'pages/worksdetails/worksdetails?id='+ shareId +''
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this._initData();
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
      title: this.data.shareTitle,
      desc: api.shareDesc,
      path: this.data.shareUrl,
      //imageUrl: this.data.shareImg,
    }
  }
});