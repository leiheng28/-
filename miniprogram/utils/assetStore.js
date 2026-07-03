var storage = require('./storage');
var constants = require('./constants');
var calc = require('./calculations');
var ai = require('./ai');
var sync = require('../services/sync');

var assetStore = {
  _assets: [],

  init: function () {
    this._assets = storage.loadAssets();
    return this._assets;
  },

  reload: function () {
    this._assets = storage.loadAssets();
    return this._assets;
  },

  getAll: function () {
    return this._assets;
  },

  getAsset: function (id) {
    return this._assets.find(function (a) { return a.id === id; });
  },

  _persist: function () {
    try {
      storage.saveAssets(this._assets);
    } catch (e) {
      console.error('[assetStore] persist failed:', e);
    }
    if (sync.isCloudEnabled()) {
      sync.pushToCloud(this._assets).catch(function () {
        /* 云端失败不阻塞本地 */
      });
    }
  },

  addAsset: function (form) {
    var asset = {
      id: storage.uid(),
      name: form.name.trim(),
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice),
      purchaseDate: form.purchaseDate,
      status: '服役中',
      emoji: constants.CATEGORY_EMOJI[form.category] || '📦',
      notes: form.notes || undefined,
      targetDaily: form.targetDaily ? parseFloat(form.targetDaily) : undefined,
      createdAt: Date.now()
    };
    this._assets = [asset].concat(this._assets);
    this._persist();
    return asset;
  },

  updateAsset: function (id, patch) {
    var self = this;
    this._assets = this._assets.map(function (a) {
      if (a.id !== id) return a;
      var next = Object.assign({}, a, patch);
      if (patch.category && patch.category !== a.category) {
        next.emoji = constants.CATEGORY_EMOJI[patch.category] || a.emoji;
      }
      return next;
    });
    this._persist();
    return this.getAsset(id);
  },

  updateFromForm: function (id, form) {
    return this.updateAsset(id, {
      name: form.name.trim(),
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice),
      purchaseDate: form.purchaseDate,
      notes: form.notes || undefined,
      targetDaily: form.targetDaily ? parseFloat(form.targetDaily) : undefined
    });
  },

  updateValuation: function (id, value, aiEstimated) {
    return this.updateAsset(id, {
      currentValue: parseFloat(value),
      aiEstimated: !!aiEstimated
    });
  },

  refreshAiValuation: function (id) {
    var asset = this.getAsset(id);
    if (!asset) return null;
    var estimated = ai.estimateValue(asset);
    if (estimated == null) return null;
    return this.updateValuation(id, estimated, true);
  },

  retireAsset: function (id) {
    return this.updateAsset(id, { status: '已退役' });
  },

  reactivateAsset: function (id) {
    return this.updateAsset(id, { status: '服役中' });
  },

  sellAsset: function (id, data) {
    this._assets = this._assets.map(function (a) {
      if (a.id !== id) return a;
      return Object.assign({}, a, {
        status: '已卖出',
        sellPrice: data.sellPrice,
        sellDate: data.sellDate
      });
    });
    this._persist();
    return this.getAsset(id);
  },

  deleteAsset: function (id) {
    this._assets = this._assets.filter(function (a) { return a.id !== id; });
    this._persist();
  },

  reset: function () {
    this._assets = storage.resetAssets();
    return this._assets;
  },

  clearAll: function () {
    this._assets = storage.clearAssets();
    return this._assets;
  },

  getAiInsight: function () {
    return calc.generateAiInsight(this._assets);
  },

  syncFromCloud: function () {
    var self = this;
    return sync.pullFromCloud().then(function (result) {
      if (result.synced) self.reload();
      return result;
    });
  }
};

module.exports = assetStore;
