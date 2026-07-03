var config = require('../config/index');

var INITIAL_ASSETS = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    category: '数码',
    purchasePrice: 8799,
    purchaseDate: '2024-09-15',
    status: '服役中',
    emoji: '📱',
    targetDaily: 10,
    currentValue: 4200,
    aiEstimated: true
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    category: '数码',
    purchasePrice: 7999,
    purchaseDate: '2025-05-10',
    status: '服役中',
    emoji: '💻',
    targetDaily: 15,
    currentValue: 6200,
    aiEstimated: true
  },
  {
    id: '3',
    name: 'Sony A7M4',
    category: '数码',
    purchasePrice: 6800,
    purchaseDate: '2025-09-25',
    status: '服役中',
    emoji: '📷',
    targetDaily: 12
  },
  {
    id: '4',
    name: '黄金 50g',
    category: '黄金',
    purchasePrice: 17500,
    purchaseDate: '2023-06-10',
    status: '服役中',
    emoji: '🌟',
    currentValue: 29000,
    aiEstimated: true
  },
  {
    id: '5',
    name: 'AirPods Pro 2',
    category: '数码',
    purchasePrice: 1899,
    purchaseDate: '2025-11-01',
    status: '服役中',
    emoji: '🎧',
    targetDaily: 3
  },
  {
    id: '6',
    name: 'Sony A7M4（旧）',
    category: '数码',
    purchasePrice: 6800,
    purchaseDate: '2023-10-01',
    status: '已卖出',
    emoji: '📷',
    sellPrice: 3500,
    sellDate: '2025-12-08'
  }
];

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
