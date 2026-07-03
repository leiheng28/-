var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');

Page({
  data: {
    notFound: false,
    asset: null,
    assetRaw: null,
    daily: '',
    days: 0,
    breakEven: false,
    progress: 0,
    progressText: '',
    daysLeftText: '',
    breakEvenDate: '',
    showSell: false,
    supportsAi: false,
    notes: ''
  },

  onLoad: function (options) {
    this.assetId = options.id;
    this.loadAsset();
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

    if (asset.status === '已卖出') {
      wx.redirectTo({ url: '/pages/sell/sell?id=' + asset.id });
      return;
    }

    var daily = calc.getAssetDailyCost(asset);
    var days = calc.getAssetHoldDays(asset);
    var breakEven = calc.isBreakEven(asset);
    var progress = calc.getBreakEvenProgress(asset);
    var daysLeft = calc.getDaysToBreakEven(asset);
    var breakEvenDate = calc.getBreakEvenDate(asset);

    var daysLeftText = '持续使用中';
    if (daysLeft != null && daysLeft > 0) {
      daysLeftText = '还需 ' + daysLeft + ' 天';
    } else if (breakEven) {
      daysLeftText = '已达成目标';
    }

    var statusTag = 'tag-green';
    if (asset.status === '已退役') statusTag = 'tag-gray';

    this.setData({
      notFound: false,
      assetRaw: asset,
      asset: {
        id: asset.id,
        emoji: asset.emoji,
        name: asset.name,
        category: asset.category,
        purchaseDate: asset.purchaseDate,
        status: asset.status,
        statusTag: statusTag,
        purchasePrice: calc.formatMoney(asset.purchasePrice),
        purchasePriceRaw: asset.purchasePrice,
        targetDaily: asset.targetDaily ? calc.formatMoney(asset.targetDaily, 2) : ''
      },
      notes: asset.notes || '',
      daily: calc.formatMoney(daily, 2),
      days: days,
      breakEven: breakEven,
      progress: Math.round(progress),
      progressText: Math.round(progress) + '%',
      daysLeftText: daysLeftText,
      breakEvenDate: breakEvenDate || '',
      supportsAi: calc.supportsAiValuation(asset.category)
    });
  },

  openMenu: function () {
    var asset = this.data.assetRaw;
    if (!asset) return;
    var that = this;
    var items = ['编辑信息', '价值追踪'];
    if (asset.status === '服役中') {
      items.push('标记已退役');
    } else if (asset.status === '已退役') {
      items.push('恢复服役');
    }
    items.push('删除物品');

    wx.showActionSheet({
      itemList: items,
      success: function (res) {
        var action = items[res.tapIndex];
        if (action === '编辑信息') that.goEdit();
        else if (action === '价值追踪') that.goValue();
        else if (action === '标记已退役') that.handleRetire();
        else if (action === '恢复服役') that.handleReactivate();
        else if (action === '删除物品') that.handleDelete();
      }
    });
  },

  goEdit: function () {
    wx.navigateTo({ url: '/pages/edit/edit?id=' + this.assetId });
  },

  goValue: function () {
    wx.navigateTo({ url: '/pages/value/value?id=' + this.assetId });
  },

  openSell: function () {
    this.setData({ showSell: true });
  },

  closeSell: function () {
    this.setData({ showSell: false });
  },

  onSellConfirm: function (e) {
    assetStore.sellAsset(this.assetId, e.detail);
    this.setData({ showSell: false });
    wx.redirectTo({ url: '/pages/sell/sell?id=' + this.assetId });
  },

  handleRetire: function () {
    var that = this;
    wx.showModal({
      title: '标记已退役',
      content: '退役后不计入服役中统计，可随时恢复。',
      success: function (res) {
        if (res.confirm) {
          assetStore.retireAsset(that.assetId);
          that.loadAsset();
          wx.showToast({ title: '已退役', icon: 'success' });
        }
      }
    });
  },

  handleReactivate: function () {
    assetStore.reactivateAsset(this.assetId);
    this.loadAsset();
    wx.showToast({ title: '已恢复服役', icon: 'success' });
  },

  handleDelete: function () {
    var that = this;
    wx.showModal({
      title: '删除物品',
      content: '确定删除？此操作不可撤销。',
      confirmColor: '#ef4444',
      success: function (res) {
        if (res.confirm) {
          assetStore.deleteAsset(that.assetId);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(function () {
            wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
          }, 400);
        }
      }
    });
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
