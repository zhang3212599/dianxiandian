const util = require('../../utils/util.js');
const api = require('../../config/api.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal: '',
    page: 0,
    painting_Id: 0,
    painting_Img: '',
    painting_Name: "",
    painting_CountStep: 0, //总步数数
    painting_StepCountNum: 0, //挑战总人数
    painting_StepNum: 0, //挑战成功人数

    user_Name: '',
    user_Img: '',

    theoryList: [], //评论数据
    focus: false,
    inputTxt: '',

    shareTitle: '',
    shareUrl: '',
    shareImg: '',

    scrollHeight: '100%'
  },

  /**
   * 获取挑战绘画数据
   */
  _initData: function(e){
    let that = this;
    util.request(api.worksDetails+"?id="+ that.data.painting_Id +"").then(function (res) {
      if (res.returnCode === 0) {

        that.setData({
          painting_Img: res.data.ptImg,
          painting_Name: res.data.ptName,
          painting_CountStep: res.data.ptCountStep,
          painting_StepCountNum: res.data.ptWar,
          painting_StepNum: res.data.ptWarSucc,
          user_Name: res.data.ptUserName,
          user_Img: res.data.ptUserImg
        })

        that._initTheory();

      }else if (res.returnCode === 202) {
        util.showErrorToast("此绘画不存在。");

      }else{
        util.showErrorToast(""+ res.returnMsg +"");

      }
      wx.hideLoading();
    });
  },

  /**
   * 获取挑战绘画评论
   */
  theoryScrollObj: function(e){
    this._initTheory();
  },
  _initTheory: function(e){
    let that = this;
    that.setData({
      page: this.data.page + 1
    });
    util.request(api.worksDetailsTheory+"?id="+ that.data.painting_Id +"&page="+ this.data.page +"").then(function (res) {
      if (res.returnCode === 0) {
        let dataList = that.data.theoryList;
        let data = res.data.data;
        let dataLen = data.length;
        for(let i=0; i<dataLen; i++){
          dataList.push(data[i])
        }
        that.setData({
          theoryList: dataList
        });

      }else{
        util.showErrorToast(""+ res.returnMsg +"");

      }
    });
  },

  /**
   * 更换挑战绘画
   */
  worksdetailsEventA: function (e) {
    let nexPainting = parseInt(this.data.painting_Id + 1);
    util.request(api.paintingShare+"?id="+ nexPainting +"").then(function (res) {
      if (res.returnCode === 0) {
        wx.redirectTo({
          url: "/pages/paintingcode/paintingcode?id="+ nexPainting +""
        })

      }else{
        util.showErrorToast("没有其它绘画了");

      }
    });

  },

  /**
   * 邀请好友挑战
   */
  worksdetailsEventB: function (e) {
    this.onShareAppMessage
  },

  /**
   * 开始挑战
   */
  worksdetailsEventC:function(e){
    wx.navigateTo({
      url: "/pages/paintingcode/paintingcode?id="+ this.data.painting_Id +""
    })

  },

  /**
   * input事情
  */
  bindKeyInput: function(e){
    this.setData({
      inputVal: e.detail.value
    });
  },
  worksdetailsForm: function(e){
    if (this.data.inputVal == ''){
      util.showOkToast("请输入你想说的");
      this.setData({
        focus: true
      })

    }else{
      let that = this;
      let dataList = that.data.theoryList;
      util.request(api.worksTheory, {ptid:''+ that.data.painting_Id +'', cotext:''+ this.data.inputVal +''}, "POST").then(function (res) {
        if (res.returnCode === 0) {
          let arrObj = { "coImg": ""+ res.data.user_img +"", "coName": ""+ res.data.user_name +"", "coText": "" + that.data.inputVal +"" }
          dataList.unshift(arrObj);
          that.setData({
            theoryList: dataList,
            inputTxt: '',
            inputVal: ''
          });
          util.showOkToast("评论成功");

        } else if (res.returnCode === 202) {
          that.setData({
            inputTxt: '',
            inputVal: ''
          });
          util.showOkToast("评论失败！ 一个人最多评论7次哦。", 2500);

        }else{
          util.showErrorToast(""+ res.returnMsg +"");

        }
      });

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    });

    let ptId = options.id;
    this.setData({
      painting_Id: ptId,
      shareUrl: 'pages/worksdetails/worksdetails?id='+ ptId +''
    });

    var that = this;
    //setTimeout(function(){
      that._initData();
    //},3000)

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
      title: this.data.shareTitle,
      desc: api.shareDesc,
      path: this.data.shareUrl,
      //imageUrl: this.data.shareImg,
    }
  }


});