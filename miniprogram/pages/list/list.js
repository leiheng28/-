var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');
var constants = require('../../utils/constants');

var STATUS_LIST = ['全部', '服役中', '已退役', '已卖出'];

Page({
  data: {
    categories: ['全部'].concat(constants.CATEGORIES),
    statusList: STATUS_LIST,
    category: '全部',
    status: '全部',
    filtered: [],
    count: 0
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadData();
  },

  loadData: function () {
    var assets = assetStore.getAll();
    var category = this.data.category;
    var status = this.data.status;

    var filtered = assets.filter(function (a) {
      if (category !== '全部' && a.category !== category) return false;
      if (status !== '全部' && a.status !== status) return false;
      return true;
    }).map(function (asset) {
      var statusTag = 'tag-gray';
      if (asset.status === '服役中') statusTag = 'tag-green';
      else if (asset.status === '已卖出') statusTag = 'tag-red';
      else if (asset.status === '已退役') statusTag = 'tag-orange';

      return {
        id: asset.id,
        emoji: asset.emoji,
        name: asset.name,
        category: asset.category,
        status: asset.status,
        days: calc.getAssetHoldDays(asset),
        daily: calc.formatMoney(calc.getAssetDailyCost(asset), 1),
        dailyLabel: asset.status === '已卖出' ? '实际日均' : '日均',
        statusTag: statusTag
      };
    });

    this.setData({ filtered: filtered, count: filtered.length });
  },

  setCategory: function (e) {
    this.setData({ category: e.currentTarget.dataset.value }, this.loadData.bind(this));
  },

  setStatus: function (e) {
    this.setData({ status: e.currentTarget.dataset.value }, this.loadData.bind(this));
  },

  goAdd: function () {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
