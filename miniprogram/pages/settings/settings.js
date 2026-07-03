var assetStore = require('../../utils/assetStore');
var sync = require('../../services/sync');
var config = require('../../config/index');

Page({
  data: {
    assetCount: 0,
    syncStatus: {},
    version: config.version
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.setData({
      assetCount: assetStore.getAll().length,
      syncStatus: sync.getSyncStatus()
    });
  },

  handleExport: function () {
    var assets = assetStore.getAll();

    function escapeCsv(value) {
      if (value == null || value === undefined) return '';
      var str = String(value);
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    var csv = [
      ['名称', '品类', '购入价', '购入日期', '状态', '当前估值', '卖出价', '卖出日期'].map(escapeCsv).join(',')
    ].concat(assets.map(function (a) {
      return [
        a.name, a.category, a.purchasePrice, a.purchaseDate, a.status,
        a.currentValue || '', a.sellPrice || '', a.sellDate || ''
      ].map(escapeCsv).join(',');
    })).join('\n');

    wx.setClipboardData({
      data: csv,
      success: function () {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },

  handleSync: function () {
    var that = this;
    if (!sync.isCloudEnabled()) {
      wx.showModal({
        title: '云端同步未启用',
        content: '请在 config/index.js 中开启 cloudSyncEnabled 并填写 Supabase 配置。如需帮助请联系开发者。',
        showCancel: false
      });
      return;
    }
    wx.showLoading({ title: '同步中…' });
    assetStore.syncFromCloud().then(function (result) {
      wx.hideLoading();
      that.setData({ assetCount: assetStore.getAll().length });
      wx.showToast({
        title: result.synced ? '同步成功' : '同步跳过',
        icon: result.synced ? 'success' : 'none'
      });
    }).catch(function (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '同步失败', icon: 'none' });
    });
  },

  handleReset: function () {
    var that = this;
    wx.showModal({
      title: '恢复示例数据',
      content: '确定恢复示例数据？当前数据将被覆盖。',
      success: function (res) {
        if (res.confirm) {
          assetStore.reset();
          that.setData({ assetCount: assetStore.getAll().length });
          wx.showToast({ title: '已恢复', icon: 'success' });
        }
      }
    });
  },

  handleClear: function () {
    var that = this;
    wx.showModal({
      title: '清空全部数据',
      content: '确定清空所有资产？此操作不可撤销。',
      confirmColor: '#ef4444',
      success: function (res) {
        if (res.confirm) {
          assetStore.clearAll();
          that.setData({ assetCount: 0 });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
