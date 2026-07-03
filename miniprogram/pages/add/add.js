var calc = require('../../utils/calculations');
var assetStore = require('../../utils/assetStore');
var constants = require('../../utils/constants');
var ai = require('../../utils/ai');
var config = require('../../config/index');

Page({
  data: {
    mode: 'manual',
    aiInput: '',
    aiLoading: false,
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

  onLoad: function () {
    var today = calc.todayStr();
    this.setData({
      today: today,
      'form.purchaseDate': today
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

  setMode: function (e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
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

  onAiInput: function (e) {
    this.setData({ aiInput: e.detail.value });
  },

  handleAiRecognize: function () {
    var that = this;
    var aiInput = this.data.aiInput;
    if (!aiInput.trim()) return;

    this.setData({ aiLoading: true });
    setTimeout(function () {
      var suggestion = ai.recognizeAsset(aiInput);
      var categoryIndex = constants.CATEGORIES.indexOf(suggestion.category);

      that.setData({
        aiLoading: false,
        mode: 'manual',
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        'form.name': suggestion.name || that.data.form.name,
        'form.category': suggestion.category || that.data.form.category,
        'form.purchasePrice': suggestion.purchasePrice || that.data.form.purchasePrice,
        'form.targetDaily': suggestion.targetDaily || that.data.form.targetDaily
      }, that.validate.bind(that));
    }, config.ai.recognizeDelayMs);
  },

  handleSubmit: function () {
    if (!this.data.isValid) return;
    assetStore.addAsset(this.data.form);
    wx.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(function () {
      wx.switchTab({ url: '/pages/index/index' });
    }, 400);
  }
});
