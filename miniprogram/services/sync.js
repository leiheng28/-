var config = require('../config/index');
var supabase = require('./supabase');
var storage = require('../utils/storage');

/** 获取或生成本地用户 ID（未接微信登录时的 MVP 方案） */
function getLocalUserId() {
  var key = 'shudangjia_user_id';
  try {
    var id = wx.getStorageSync(key);
    if (id) return id;
  } catch (e) { /* ignore */ }
  var newId = 'local-' + Date.now();
  wx.setStorageSync(key, newId);
  return newId;
}

function isCloudEnabled() {
  return config.cloudSyncEnabled && supabase.isConfigured();
}

/** 从云端拉取并覆盖本地（需用户授权后调用） */
function pullFromCloud() {
  if (!isCloudEnabled()) {
    return Promise.resolve({ synced: false, reason: 'cloud_disabled' });
  }
  return supabase.fetchAssets(getLocalUserId()).then(function (rows) {
    var assets = (rows || []).map(function (row) {
      return row.payload || row;
    });
    if (assets.length) storage.saveAssets(assets);
    return { synced: true, count: assets.length };
  });
}

/** 将本地数据推送到云端 */
function pushToCloud(assets) {
  if (!isCloudEnabled()) {
    return Promise.resolve({ synced: false, reason: 'cloud_disabled' });
  }
  var userId = getLocalUserId();
  var chain = Promise.resolve();
  (assets || []).forEach(function (asset) {
    chain = chain.then(function () {
      return supabase.upsertAsset(asset, userId);
    });
  });
  return chain.then(function () {
    return { synced: true, count: assets.length };
  });
}

function getSyncStatus() {
  if (!config.cloudSyncEnabled) {
    return { label: '本地存储', desc: '数据保存在本机', enabled: false };
  }
  if (!supabase.isConfigured()) {
    return { label: '待配置', desc: '请在 config/index.js 填写 Supabase', enabled: false };
  }
  return { label: '云端同步', desc: 'Supabase 已配置', enabled: true };
}

module.exports = {
  getLocalUserId: getLocalUserId,
  isCloudEnabled: isCloudEnabled,
  pullFromCloud: pullFromCloud,
  pushToCloud: pushToCloud,
  getSyncStatus: getSyncStatus
};
