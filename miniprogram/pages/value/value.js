var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');
var ai = require('../../utils/ai');

var CHART_HEIGHTS = [25, 32, 28, 40, 38, 55, 72];

Page({
  data: {
    notFound: false,
    asset: null,
    currentValue: '',
    profit: '',
    yieldRate: '',
    days: 0,
    aiSupported: false,
    aiEstimated: false,
    showSellInsight: false,
    sellInsightText: '',
    chartBars: [],
    showValuation: false,
    manualValue: '',
    manualValid: false,
    aiLoading: false
  },

  onLoad: function (options) {
    this.assetId = options.id;
  },

  onShow: function () {
    this.loadAsset();
  },

  loadAsset: function () {
    var asset = assetStore.getAsset(this.assetId);
    if (!asset) {
      this.setData({ notFound: true });
      return;
    }

    var currentValueNum = asset.currentValue != null ? asset.currentValue : asset.purchasePrice;
    var yieldRateNum = calc.getYieldRate(asset) || 0;
    var profitNum = currentValueNum - asset.purchasePrice;
    var aiSupported = calc.supportsAiValuation(asset.category);
    var sellAdvice = ai.getSellAdvice(Object.assign({}, asset, { currentValue: currentValueNum }));

    this.setData({
      notFound: false,
      asset: {
        emoji: asset.emoji,
        name: asset.name,
        category: asset.category,
        purchaseDate: asset.purchaseDate,
        purchasePrice: calc.formatMoney(asset.purchasePrice)
      },
      currentValue: calc.formatMoney(currentValueNum, 0),
      currentValueNum: currentValueNum,
      profit: (profitNum >= 0 ? '+' : '') + calc.formatMoney(profitNum, 0),
      yieldRate: (yieldRateNum >= 0 ? '+' : '') + yieldRateNum.toFixed(1) + '%',
      days: calc.getAssetHoldDays(asset),
      aiSupported: aiSupported,
      aiEstimated: !!(aiSupported && asset.aiEstimated),
      showSellInsight: !!sellAdvice,
      sellInsightText: sellAdvice || '',
      manualValue: asset.currentValue ? String(asset.currentValue) : '',
      chartBars: CHART_HEIGHTS.map(function (h, i) {
        return { height: h, active: i === CHART_HEIGHTS.length - 1 };
      })
    });
  },

  openValuation: function () {
    this.setData({
      showValuation: true,
      manualValue: this.data.asset && this.data.asset.currentValue ? String(this.data.asset.currentValue) : '',
      manualValid: false
    });
  },

  closeValuation: function () {
    this.setData({ showValuation: false });
  },

  onManualInput: function (e) {
    var val = e.detail.value;
    this.setData({ manualValue: val, manualValid: parseFloat(val) > 0 });
  },

  saveManualValuation: function () {
    if (!this.data.manualValid) return;
    assetStore.updateValuation(this.assetId, this.data.manualValue, false);
    this.setData({ showValuation: false });
    wx.showToast({ title: '估值已更新', icon: 'success' });
    this.loadAsset();
  },

  refreshAiValuation: function () {
    var that = this;
    this.setData({ aiLoading: true });
    setTimeout(function () {
      assetStore.refreshAiValuation(that.assetId);
      that.setData({ aiLoading: false });
      wx.showToast({ title: 'AI 估值已刷新', icon: 'success' });
      that.loadAsset();
    }, 600);
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
