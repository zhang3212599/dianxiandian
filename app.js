const util = require('./utils/util.js');
var user = require('./services/user.js');
var api = require('./config/api.js');

App({
  onLaunch: function (options) {
    //获取用户的登录信息
    user.checkLogin().then(res => {
      console.log('app login');
      this.globalData.userInfo = wx.getStorageSync('userInfo');
      this.globalData.token = wx.getStorageSync('token');

    }).catch(() => {
      this.appUserPost(options.path);

    });
  },

  appUserPost: function(e) {
    console.log(e);
    wx.setStorageSync('loginafterurl', ""+ e +"");

    let code = null;
    let userInfo = null;
    let that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          code = res.code;
          that.globalData.code = code;

          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              console.log(res);
              wx.request({
                url: api.loginByWeixin,
                data: {
                  code: code,
                  userInfo: res
                },
                method: "POST",
                success: function (res) {
                  let data = res.data;
                  if (data.returnCode === 0) {
                    util.showOkToast("登录成功");
                    wx.setStorageSync('userInfo', ""+ data.data.userInfo +"");
                    wx.setStorageSync('token', ""+ data.data.token +"");
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

            },
            fail: function (err) {
              wx.reLaunch({
                url: '/pages/login/login'
              })
            }
          })


        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },

  globalData: {
    userInfo: {
      userid: 0,
      username: '用户名称',
      avatar: './static/images/head.png'
    },
    token: '',
    code: '',
  }
});