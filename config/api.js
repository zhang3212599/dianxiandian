//const ApiRootUrl = 'https://www.yuganwang.com/api/';
const ApiRootUrl = 'http://127.0.0.1:8360/api/';

module.exports = {
  loginByWeixin: ApiRootUrl + 'auth/loginByWeixin', //微信登录

  workslistHot: ApiRootUrl + 'workslist/workslistHot', //热门绘画列表
  workslistNew: ApiRootUrl + 'workslist/workslistNew', //最新绘画列表
  worksDetails: ApiRootUrl + 'workslist/worksDetails', //绘画详情
  worksDetailsTheory: ApiRootUrl + 'workslist/worksDetailsTheory', //绘画详情_评论详情
  worksTheory: ApiRootUrl + 'workslist/worksTheory', //绘画详情_发起评论

  admin: ApiRootUrl + 'admin', //用户中心首屏
  adminIndex: ApiRootUrl + 'admin/adminIndex', //用户中心首屏
  adminIspt: ApiRootUrl + 'admin/adminIspt', //是否开关绘画呈现

  adminWorksUse: ApiRootUrl + 'adminworks/adminWorksUse', //我的绘画列表
  adminWorksHe: ApiRootUrl + 'adminworks/adminWorksHe', //我挑战的绘画列表
  adminWorksDel: ApiRootUrl + 'adminworks/adminWorksDel', //删除我的绘画Id

  painting: ApiRootUrl + 'painting', //获取挑战绘画信息
  paintingCord: ApiRootUrl + 'painting/paintingCord', //提交我的绘画
  paintingWar: ApiRootUrl + 'painting/paintingWar', //提交我挑战的绘画
  paintingShare: ApiRootUrl + 'painting/paintingShare', //分享绘画
  paintingBaseImg: ApiRootUrl + 'painting/paintingBaseImg', //base64图片上传




  shareTitle: '点线点_我画点，你画线',
  shareDesc: '我们的距离就是2个点+1根线-点线点',
  sharePath: '/pages/index/index',
  shareImage: '../../static/images/share.jpg'

};