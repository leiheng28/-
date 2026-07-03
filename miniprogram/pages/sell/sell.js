var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');
var ai = require('../../utils/ai');

Page({
  data: {
    notFound: false,
    asset: null,
    plAmount: '',
    plRate: '',
    isProfit: true,
    daily: '',
    days: 0,
    progressWidth: 50,
    progressLabel: '',
    progressGrade: '',
    aiReview: ''
  },

  onLoad: function (options) {
    this.assetId = options.id;
    this.loadAsset();
  },

  loadAsset: function () {
    var asset = assetStore.getAsset(this.assetId);
    if (!asset || asset.status !== '已卖出') {
      this.setData({ notFound: true });
      return;
    }

    var pl = calc.getProfitLoss(asset);
    var daily = calc.getAssetDailyCost(asset);
    var days = calc.getAssetHoldDays(asset);
    var isProfit = pl.amount >= 0;

    this.setData({
      notFound: false,
      asset: {
        emoji: asset.emoji,
        name: asset.name,
        purchasePrice: calc.formatMoney(asset.purchasePrice, 0),
        sellPrice: calc.formatMoney(asset.sellPrice || 0, 0),
        sellDate: asset.sellDate || ''
      },
      plAmount: (isProfit ? '+' : '') + calc.formatMoney(pl.amount, 0),
      plRate: (isProfit ? '+' : '') + pl.rate.toFixed(1) + '%',
      isProfit: isProfit,
      daily: calc.formatMoney(daily, 2),
      days: days,
      progressWidth: Math.min(Math.max(100 + pl.rate, 10), 90),
      progressLabel: isProfit ? '变现表现良好' : '持有成本偏高',
      progressGrade: isProfit ? '推荐' : '中等偏下',
      aiReview: ai.getSellReview(asset, pl, daily, days)
    });
  },

  goBack: function () {
    wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  }
});
