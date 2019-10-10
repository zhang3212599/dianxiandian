var api = require('../config/api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'x-dianxiandian-token': wx.getStorageSync('token')
      },
      success: function (res) {
        //console.log("success");

        if (res.statusCode == 200) {
          resolve(res.data);

          /*if (res.data.returnCode == 999) {
            //需要登录后才可以操作
            resolve(res.data);

          } else {
            resolve(res.data);
          }*/
        } else {
          reject(res.errMsg);
        }

      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}


function showOkToast(msg,durtime) {
  let durTime = durtime || 1500;
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: durTime
  })
}
function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png',
  })
}

module.exports = {
  formatTime,
  request,
  showOkToast,
  showErrorToast,
  checkSession
};


