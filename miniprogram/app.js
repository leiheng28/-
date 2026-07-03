var assetStore = require('./utils/assetStore');
var config = require('./config/index');

App({
  onLaunch: function () {
    assetStore.init();
    console.log('[数当家] 启动 v' + config.version);
  },

  onShow: function () {
    console.log('[数当家] 小程序显示');
  },

  onHide: function () {
    console.log('[数当家] 小程序隐藏');
  },

  onError: function (error) {
    console.error('[数当家] 全局错误:', error);
    try {
      wx.showToast({
        title: '系统异常',
        icon: 'none',
        duration: 3000
      });
    } catch (e) {
      console.error('[数当家] 错误提示失败:', e);
    }
  },

  onPageNotFound: function (options) {
    console.warn('[数当家] 页面不存在:', options.path);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  globalData: {
    assetStore: assetStore,
    config: config
  }
});
