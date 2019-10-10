const util = require('../../utils/util.js');
const api = require('../../config/api.js');

let bodyWidth = 0, bodyHeight = 0;
let contextB = null; //画布上下文


Page({

  /**
   * 页面的初始数据
   */
  data: {
    spotPx: [], //记录描点坐标
    spotPostList: [],
    spotindexarrar: [], //画了几次
    spotindex: 0, //一次画了多少根线
    fixedStart: { "fixedMarX": "0", "fixedMarY": "0" },//起点

    painting_Id: 0,
    painting_Uid: 0,
    painting_Name: "",
    painting_CountNum: 0,
    painting_StepNum: 0,

    shareTitle: '',
    shareUrl: '',
    shareImg: ''


  },
  
  /**
   * 画线 重新再来
  */
  onResetCanvasB: function(index){
    this.setData({
      spotPostList: [],
      spotindexarrar: []
    });
    this.creatSpan();
    contextB.draw();

    this.stepNumObj();
    if(!index){
      util.showOkToast("重新开始");
    }

  },

  /**
   * 画线 后退一步
  */
  onEndCanvasB: function (e) {
    let spotPostListArr = this.data.spotPostList;
    let spotindexarrarArr = this.data.spotindexarrar;
    let spotindexsize = spotindexarrarArr.length;
    if (spotindexsize > 0) {
      for (let s = 0; s < parseInt(spotindexarrarArr[spotindexsize - 1]); s++) {
        spotPostListArr.pop();
      }
      spotindexarrarArr.pop();
      this.setData({
        spotindexarrar: spotindexarrarArr,
        spotPostList: spotPostListArr
      });
      this.creatSpan();
      contextB.draw();
      this.stepNumObj();//重新计算步数

    }else{
      util.showOkToast("没有线可退哦");

    }
  },

  /**
   * 画线 提交绘画
  */
  onLineCanvasB: function (e) {
    let that = this;
    if (this.data.spotPostList.length <= 0){
      util.showOkToast('请以"点"连"线"后,再提交');

    }else{
      wx.showLoading({
        title: '提交绘画中',
      });

      let postData = {ptId:''+ this.data.painting_Id +'', ptUid:''+ this.data.painting_Uid +'', ptLineStep:''+ JSON.stringify(this.data.spotPostList) +''};
      //console.log(postData);
      util.request(api.paintingWar, postData, 'POST').then(function (res) {
        wx.hideLoading();

        if (res.returnCode === 0) {
          util.showOkToast("太厉害了，这么难的绘画都知道",2000);
          wx.redirectTo({
            url: "/pages/share/share?id=" + that.data.painting_Id + "&pid=1"
          })

        }else if (res.returnCode === 202) {
          util.showOkToast('遗憾，挑战失败，再接再厉。',2500);
          that.onResetCanvasB(1);

        }else{
          util.showErrorToast(""+ res.returnMsg +"");

        }

      });

    }
  },

  /**
   * 画线 开始绘画
  */
  onStartCanvasBStart: function (e) {
    let spotPxArr = this.data.spotPx;
    let canMarX = e.touches[0].x;
    let canMarY = e.touches[0].y;
    let spotpxlen = spotPxArr.length;
    for (let i = 0; i < spotpxlen; i++) {
      contextB.beginPath();
      let widthLeft = parseInt(spotPxArr[i].spotWidth * bodyWidth);
      let widthTop = parseInt(spotPxArr[i].spotHeight * bodyHeight);
      contextB.arc(widthLeft, widthTop, 8, 0, 360, false);
      contextB.lineWidth = 1;
      contextB.strokeStyle = "red";
      if ((widthLeft < (canMarX + 16) && widthLeft > (canMarX - 16)) && (widthTop < (canMarY + 16) && widthTop > (canMarY - 16))) {
        contextB.stroke();
        contextB.closePath();
        let staFixed = { "fixedMarX": "0", "fixedMarY": "0" };
        staFixed.fixedMarX = spotPxArr[i].spotWidth;
        staFixed.fixedMarY = spotPxArr[i].spotHeight;
        this.setData({
          fixedStart: staFixed
        });
        //console.log("开启起点-X轴：" + canMarX + "； Y轴：" + canMarY + "; 开始点："+fixedStart.fixedMarX+" && "+fixedStart.fixedMarY+"");
      }
    }
  },

  onStartCanvasBEnd: function (e) {
    this.creatSpan();
    contextB.draw();
    let spotindexarrarArr = this.data.spotindexarrar;
    if (this.data.spotindex > 0) {
      spotindexarrarArr.push(this.data.spotindex);
    }
    this.setData({
      spotindexarrar: spotindexarrarArr,
      fixedStart: { "fixedMarX": "0", "fixedMarY": "0" },
      spotindex: 0
    });

    this.stepNumObj();//计算划线步数

    //console.log(spotPostList); //每根线的交点
    //console.log(spotindexarrar); //一次操作的交点
  },

  onStartCanvasBMove: function (e) {

    this.creatSpan();
    let canMarX = e.touches[0].x;
    let canMarY = e.touches[0].y;
    let spotPxArr = this.data.spotPx;
    let spotpxlen = spotPxArr.length;

    if (this.data.fixedStart.fixedMarX != 0) {

      let widthLeft = parseInt(this.data.fixedStart.fixedMarX * bodyWidth);
      let widthTop = parseInt(this.data.fixedStart.fixedMarY * bodyHeight);
      //console.log(fixedStart.fixedMarX +","+ fixedStart.fixedMarY)
      contextB.beginPath();
      contextB.arc(widthLeft, widthTop, 8, 0, 360, false);
      contextB.lineWidth = 1;
      contextB.strokeStyle = "red";
      contextB.stroke();
      contextB.closePath();

      contextB.beginPath();
      contextB.lineWidth = 3;
      contextB.strokeStyle = "red";
      contextB.moveTo(widthLeft, widthTop);
      contextB.lineTo(canMarX, canMarY);
      contextB.stroke();
      contextB.closePath();

      //判断相交点
      let xjLeftwidth = parseInt(canMarX);
      let xjLeftheight = parseInt(canMarY);
      for (let i = 0; i < spotpxlen; i++) {
        let spotwidth = parseInt(spotPxArr[i].spotWidth * bodyWidth);
        let spotheight = parseInt(spotPxArr[i].spotHeight * bodyHeight);
        if (((((widthLeft + 10) > xjLeftwidth && xjLeftwidth > (widthLeft - 10)) && ((widthTop + 10) > xjLeftheight && xjLeftheight > (widthTop - 10))) != true) && ((spotwidth + 10) > xjLeftwidth && xjLeftwidth > (spotwidth - 10)) && ((spotheight + 10) > xjLeftheight && xjLeftheight > (spotheight - 10))) {

          //spotPostList
          let spotPostListArr = this.data.spotPostList;
          let spotPostListSize = spotPostListArr.length;
          let spotOver = {};
          let spotsize = 0;
          let fixedMarXLet = this.data.fixedStart.fixedMarX;
          let fixedMarYLet = this.data.fixedStart.fixedMarY;
          for (let x = 0; x < spotPostListSize; x++) {
            if ((spotPostListArr[x].moveLeft == fixedMarXLet && spotPostListArr[x].moveTop == fixedMarYLet && spotPostListArr[x].lineLeft == spotPxArr[i].spotWidth && spotPostListArr[x].lineTop == spotPxArr[i].spotHeight) || (spotPostListArr[x].lineLeft == fixedMarXLet && spotPostListArr[x].lineTop == fixedMarYLet && spotPostListArr[x].moveLeft == spotPxArr[i].spotWidth && spotPostListArr[x].moveTop == spotPxArr[i].spotHeight)) {
              spotsize++;
            }
          }
          if (spotsize == 0) {
            //console.log("相交成功");
            spotOver.moveLeft = fixedMarXLet;
            spotOver.moveTop = fixedMarYLet;
            spotOver.lineLeft = spotPxArr[i].spotWidth;
            spotOver.lineTop = spotPxArr[i].spotHeight;
            spotPostListArr.push(spotOver);
            let staFixed = { "fixedMarX": "0", "fixedMarY": "0" };
            staFixed.fixedMarX = spotPxArr[i].spotWidth;//重设起点
            staFixed.fixedMarY = spotPxArr[i].spotHeight;
            this.setData({
              spotindex: this.data.spotindex + 1,//一次操作画了几条线
              spotPostList: spotPostListArr,
              fixedStart: staFixed
            });
            //console.log(spotPostListArr);
          }
        }
      }
    }
    contextB.draw();

  },

  creatSpan: function (e) {
    let spotPxArr = this.data.spotPx;
    let spotpxlen = spotPxArr.length;
    let spotPostListArr = this.data.spotPostList;
    let spotPostListsize = spotPostListArr.length;

    for (let i = 0; i < spotpxlen; i++) {
      let canMarX = parseInt(spotPxArr[i].spotWidth * bodyWidth);
      let canMarY = parseInt(spotPxArr[i].spotHeight * bodyHeight);
      contextB.beginPath();
      contextB.arc(canMarX, canMarY, 6, 0, 360);
      contextB.fillStyle = "#ff9600";
      contextB.fill();//画实心圆
    }

    for (let z = 0; z < spotPostListsize; z++) {
      let widthLeft = parseInt(spotPostListArr[z].moveLeft * bodyWidth);
      let widthTop = parseInt(spotPostListArr[z].moveTop * bodyHeight);
      let canMarX = parseInt(spotPostListArr[z].lineLeft * bodyWidth);
      let canMarY = parseInt(spotPostListArr[z].lineTop * bodyHeight);
      contextB.beginPath();
      contextB.lineWidth = 3;
      contextB.strokeStyle = "red";
      contextB.moveTo(widthLeft, widthTop);
      contextB.lineTo(canMarX, canMarY);
      contextB.stroke();
      contextB.closePath();

      contextB.beginPath();
      contextB.arc(widthLeft, widthTop, 8, 0, 360, false);
      contextB.lineWidth = 1;
      contextB.strokeStyle = "red";
      contextB.stroke();
      contextB.closePath();

      contextB.beginPath();
      contextB.arc(canMarX, canMarY, 8, 0, 360, false);
      contextB.lineWidth = 1;
      contextB.strokeStyle = "red";
      contextB.stroke();
      contextB.closePath();
    }
  },

  stepNumObj: function() {//计算划线步数
    let totalstepNum = this.data.spotPx.length + this.data.spotPostList.length;
    this.setData({
      stepNum: totalstepNum
    })
  },


  /**
   * 获取挑战绘画数据
   */
  _initData: function(e){
    let that = this;
    util.request(api.painting+"?id="+ this.data.painting_Id +"").then(function (res) {
      if (res.returnCode === 0) {
        that.setData({
          spotPx: JSON.parse(res.data.ptSpot),
          painting_Name: res.data.ptName,
          painting_CountNum: parseInt(res.data.ptSpotStep + res.data.ptLineStep),
          painting_StepNum: res.data.ptSpotStep,
          painting_Uid: res.data.ptUserId,

          shareImg: res.data.ptSpotImg,
          shareTitle: '我画的点，看的懂伐？;提示('+ res.data.ptName +')'
        });

        that.creatSpan();
        contextB.draw();
        that.stepNumObj();

      }else{
        util.showErrorToast(""+ res.returnMsg +"");

      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let ptId = options.id
    this.setData({
      painting_Id: ptId,
      shareUrl: 'pages/worksdetails/worksdetails?id='+ ptId +''
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    contextB = wx.createCanvasContext('paintingCanvasB');
    bodyWidth = wx.getSystemInfoSync().screenWidth;
    bodyHeight = wx.getSystemInfoSync().screenHeight;
    this._initData();
    /*
    this.creatSpan();
    contextB.draw();
    this.stepNumObj();
    */
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.creatSpan();
    this.stepNumObj();

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
      imageUrl: this.data.shareImg,
    }
  }




});