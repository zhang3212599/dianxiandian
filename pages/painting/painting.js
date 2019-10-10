const util = require('../../utils/util.js');
const api = require('../../config/api.js');

const upng = require('../../utils/UPNG.js');

let bodyWidth = 0, bodyHeight = 0;
let contextA = null, contextB = null; //画布上下文

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
    pt_spotimg: '', //画点图片地址
    pt_lineimg: '', //画线图片地址


    focus: false,
    inputVal: '',
    stepNum: 0,
    canvasDisplay: false //显示画点画布
  },

  /**
   * Input 表单两个字的提示
   */
  bindKeyInput: function(e){
    this.setData({
      inputVal: e.detail.value
    })
  },

  /**
   * 画点，清空画布
   */
  onResetCanvasA: function (e) {
    this.setData({
      spotPx: [],
      stepNum: 0
    });
    this.StartCanvasArc();
    util.showOkToast("清空画布成功");
  },

  /**
   * 画点，后退一步
   */
  onEndCanvasA: function (e) {
    let sptotPxPop = this.data.spotPx;
    if (sptotPxPop.length > 0) {
      sptotPxPop.pop();
      this.setData({
        spotPx: sptotPxPop,
        stepNum: sptotPxPop.length
      });
      this.StartCanvasArc();

    } else {
      util.showOkToast("已经是最后一步了");
    }
    
  },

  /**
   * 画点，开始连线
   */
  onLineCanvasA: function (e) {
    if (this.data.spotPx.length>0){
      let that = this;
      wx.canvasGetImageData({
        canvasId: 'paintingCanvasA',
        x: 0,
        y: 0,
        width: bodyWidth,
        height: bodyHeight,
        success: function (resImg) {

          let pngData = upng.encode([resImg.data.buffer], resImg.width, resImg.height);
          let base64 = wx.arrayBufferToBase64(pngData);
          //console.log(base64);
          util.request(api.paintingBaseImg, {"baseimg":base64}, 'POST').then(function (res) {
            if (res.returnCode === 0) {
              //console.log(res.data);
              that.setData({
                pt_spotimg: res.data,
                canvasDisplay: true //显示画线画布
              });

              that.creatSpan();
              contextB.draw();

              util.showOkToast("数据已准备，请开始连线");

            }else{
              util.showErrorToast(""+ res.returnMsg +"");

            }
          });

        }
      });



    }else{
      util.showOkToast("请先描点哦");
    }
  },


  /**
   * 画点开始
  */
  StartCanvasArc: function() {
    let spotPxArr = this.data.spotPx;
    for (let z = 0; z < spotPxArr.length; z++) {
      contextA.beginPath();
      contextA.arc(parseInt(spotPxArr[z].spotWidth * bodyWidth), parseInt(spotPxArr[z].spotHeight * bodyHeight), 6, 0, 360, false);
      contextA.fillStyle = "red";
      contextA.fill();//画实心圆
    }
    contextA.draw();
    //console.log(spotPx); //打印'画点'最新数据
  },
  onStartCanvasA: function(e) {
    //console.log(bodyWidth + ',' + bodyHeight)
    //console.log(e.touches[0].x + ',' + e.touches[0].y)
    let spotPxArr = this.data.spotPx;
    let canMarX = e.touches[0].x;
    let canMarY = e.touches[0].y;
    let spotlen = spotPxArr.length;
    let spotlenA = spotlen + 1;
    let spotconPx = {};
    let index = 0;

    spotconPx.spotWidth = canMarX / bodyWidth;
    spotconPx.spotHeight = canMarY / bodyHeight;
    for (let i = 0; i < spotlen; i++) {
      let widthLeft = parseInt(spotPxArr[i].spotWidth * bodyWidth);
      let widthTop = parseInt(spotPxArr[i].spotHeight * bodyHeight);
      if ((widthLeft < (canMarX + 16) && widthLeft > (canMarX - 16)) && (widthTop < (canMarY + 16) && widthTop > (canMarY - 16))) {
        index++;
      }
    }

    if (index == 0) {
      spotPxArr.push(spotconPx);
      this.setData({
        spotPx: spotPxArr,
        stepNum: spotPxArr.length
      });
      this.StartCanvasArc();

    } else {
      util.showOkToast("圆与圆不能太近描点");

    }
  },

  /**
   * 画线 返回描点
  */
  onResetCanvasB: function(e){
    this.setData({
      spotPostList: [],
      spotindexarrar: [],
      canvasDisplay: false,
      pt_lineimg: ''
    });
    this.StartCanvasArc();
    this.stepNumObj();//重新计算步数
    util.showOkToast("回到描点");

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
    if (this.data.spotPostList.length <= 0){
      util.showOkToast('请以"点"连"线"后,再提交');

    } else if(this.data.inputVal == ''){
      util.showOkToast('请输入"7个字内"的提示');
      this.setData({
        focus: true
      })

    }else{
      let that = this;
      wx.canvasGetImageData({
        canvasId: 'paintingCanvasB',
        x: 0,
        y: 0,
        width: bodyWidth,
        height: bodyHeight,
        success: function (resImg) {

          let pngData = upng.encode([resImg.data.buffer], resImg.width, resImg.height);
          let base64 = wx.arrayBufferToBase64(pngData);
          //console.log(base64);
          util.request(api.paintingBaseImg, {"baseimg":base64}, 'POST').then(function (res) {
            if (res.returnCode === 0) {
              //console.log(res.data);
              that.setData({
                pt_lineimg: res.data
              });

            }else{
              util.showErrorToast(""+ res.returnMsg +"");

            }
          });

        }
      });

      wx.showLoading({
        title: '提交绘画中',
      });

      let data = this.data;
      let postTime = setInterval(function(){
        if(data.pt_spotimg != '' && data.pt_lineimg != ''){
          //let postData = '提示语：'+ data.inputVal +'; 绘点信息：'+ JSON.stringify(spotPx) +'; 绘点步数：'+ spotPx.length +'; 绘点图片地址：'+ pt_spotimg +'; 绘线信息：'+ JSON.stringify(spotPostList) +'; 绘线步数：'+ spotPostList.length +'; 绘线图片地址：'+ pt_lineimg +'; ';
          //console.log(postData);
          let postData = {ptName:''+ data.inputVal +'', ptSpot:''+ JSON.stringify(data.spotPx) +'', ptSpotStep:''+ data.spotPx.length +'', ptSpotImg:''+ data.pt_spotimg +'', ptLine:''+ JSON.stringify(data.spotPostList) +'', ptLineStep:''+ data.spotPostList.length +'', ptLineImg:''+ data.pt_lineimg +'' };

          //let postData = {ptName:''+ data.inputVal +'', ptSpot:''+ encodeURIComponent(JSON.stringify(spotPx)) +'' };
          //console.log(postData);
          clearInterval(postTime);

          util.request(api.paintingCord, postData, 'POST').then(function (res) {
            wx.hideLoading();

            if (res.returnCode === 0) {
              //console.log(res);
              util.showOkToast("提交成功");
              wx.redirectTo({
                url: "/pages/share/share?id="+ res.data +""
              })

            }else{
              util.showErrorToast(""+ res.returnMsg +"");

            }
          });

        }
      },400);




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
      let spotPostListArr = this.data.spotPostList;
      for (let i = 0; i < spotpxlen; i++) {
        let spotwidth = parseInt(spotPxArr[i].spotWidth * bodyWidth);
        let spotheight = parseInt(spotPxArr[i].spotHeight * bodyHeight);
        if (((((widthLeft + 10) > xjLeftwidth && xjLeftwidth > (widthLeft - 10)) && ((widthTop + 10) > xjLeftheight && xjLeftheight > (widthTop - 10))) != true) && ((spotwidth + 10) > xjLeftwidth && xjLeftwidth > (spotwidth - 10)) && ((spotheight + 10) > xjLeftheight && xjLeftheight > (spotheight - 10))) {

          //spotPostList
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    contextA = wx.createCanvasContext('paintingCanvasA');
    contextB = wx.createCanvasContext('paintingCanvasB');
    bodyWidth = wx.getSystemInfoSync().screenWidth;
    bodyHeight = wx.getSystemInfoSync().screenHeight;

    //this.creatSpan();
    //contextB.draw();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.showOkToast("开始你的描点吧");

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