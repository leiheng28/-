var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');

Page({
  data: {
    isEmpty: true,
    totalValue: '',
    activeCount: 0,
    monthlySold: '',
    totalDaily: '',
    aiInsight: '',
    topAssets: []
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadData();
  },

  loadData: function () {
    var assets = assetStore.getAll();
    var active = calc.getActiveAssets(assets);

    if (active.length === 0) {
      this.setData({ isEmpty: true });
      return;
    }

    var topAssets = active.slice().sort(function (a, b) {
      return calc.getAssetDailyCost(b) - calc.getAssetDailyCost(a);
    }).slice(0, 5).map(function (asset) {
      return {
        id: asset.id,
        emoji: asset.emoji,
        name: asset.name,
        status: asset.status,
        days: calc.getAssetHoldDays(asset),
        daily: calc.formatMoney(calc.getAssetDailyCost(asset), 1)
      };
    });

    this.setData({
      isEmpty: false,
      totalValue: calc.formatMoneyShort(calc.getTotalPurchaseValue(assets)),
      activeCount: active.length,
      monthlySold: calc.formatMoney(calc.getMonthlySoldTotal(assets), 0),
      totalDaily: calc.formatMoney(calc.getTotalDailyCost(assets), 2),
      aiInsight: assetStore.getAiInsight(),
      topAssets: topAssets
    });
  },

  goAdd: function () {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
