var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');
var constants = require('../../utils/constants');

Page({
  data: {
    notFound: false,
    today: '',
    categories: constants.CATEGORIES,
    categoryIndex: 0,
    form: {
      name: '',
      category: '数码',
      purchasePrice: '',
      purchaseDate: '',
      notes: '',
      targetDaily: ''
    },
    isValid: false
  },

  onLoad: function (options) {
    this.assetId = options.id;
    this.setData({ today: calc.todayStr() });
    this.loadAsset();
  },

  loadAsset: function () {
    var asset = assetStore.getAsset(this.assetId);
    if (!asset) {
      this.setData({ notFound: true });
      return;
    }
    var categoryIndex = constants.CATEGORIES.indexOf(asset.category);
    this.setData({
      notFound: false,
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      form: {
        name: asset.name,
        category: asset.category,
        purchasePrice: String(asset.purchasePrice),
        purchaseDate: asset.purchaseDate,
        notes: asset.notes || '',
        targetDaily: asset.targetDaily ? String(asset.targetDaily) : ''
      }
    }, this.validate.bind(this));
  },

  validate: function () {
    var form = this.data.form;
    var isValid =
      form.name.trim().length >= 2 &&
      form.name.trim().length <= 30 &&
      parseFloat(form.purchasePrice) > 0 &&
      !!form.purchaseDate;
    this.setData({ isValid: isValid });
  },

  onNameInput: function (e) {
    this.setData({ 'form.name': e.detail.value }, this.validate.bind(this));
  },

  onPriceInput: function (e) {
    this.setData({ 'form.purchasePrice': e.detail.value }, this.validate.bind(this));
  },

  onTargetDailyInput: function (e) {
    this.setData({ 'form.targetDaily': e.detail.value });
  },

  onNotesInput: function (e) {
    this.setData({ 'form.notes': e.detail.value });
  },

  onDateChange: function (e) {
    this.setData({ 'form.purchaseDate': e.detail.value }, this.validate.bind(this));
  },

  onCategoryChange: function (e) {
    var index = parseInt(e.detail.value, 10);
    this.setData({
      categoryIndex: index,
      'form.category': constants.CATEGORIES[index]
    });
  },

  handleSubmit: function () {
    if (!this.data.isValid) return;
    assetStore.updateFromForm(this.assetId, this.data.form);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },

  goBack: function () {
    wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/index/index' }); } });
  }
});
