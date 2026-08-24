var config = require('../config/index');

var INITIAL_ASSETS = [];

var STORAGE_KEY = config.storageKey;
var MAX_STORAGE_SIZE = 8 * 1024 * 1024;

function getStorageInfo() {
  try {
    return wx.getStorageInfoSync();
  } catch (e) {
    return { currentSize: 0, limitSize: MAX_STORAGE_SIZE };
  }
}

function loadAssets() {
  try {
    var raw = wx.getStorageSync(STORAGE_KEY);
    if (raw && raw.length) return raw;
  } catch (e) {
    console.error('[storage] loadAssets failed:', e);
  }
  return INITIAL_ASSETS.slice();
}

function saveAssets(assets) {
  try {
    var info = getStorageInfo();
    if (info.currentSize > MAX_STORAGE_SIZE * 0.9) {
      console.warn('[storage] storage near limit:', info.currentSize, '/', info.limitSize);
    }
    wx.setStorageSync(STORAGE_KEY, assets);
  } catch (e) {
    console.error('[storage] saveAssets failed:', e);
    throw e;
  }
}

function resetAssets() {
  try {
    saveAssets(INITIAL_ASSETS.slice());
    return INITIAL_ASSETS.slice();
  } catch (e) {
    console.error('[storage] resetAssets failed:', e);
    return INITIAL_ASSETS.slice();
  }
}

function clearAssets() {
  try {
    saveAssets([]);
    return [];
  } catch (e) {
    console.error('[storage] clearAssets failed:', e);
    return [];
  }
}

function uid() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

module.exports = {
  INITIAL_ASSETS: INITIAL_ASSETS,
  STORAGE_KEY: STORAGE_KEY,
  loadAssets: loadAssets,
  saveAssets: saveAssets,
  resetAssets: resetAssets,
  clearAssets: clearAssets,
  uid: uid
};
