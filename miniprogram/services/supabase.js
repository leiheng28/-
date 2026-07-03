var config = require('../config/index');

var REQUEST_TIMEOUT = 10000;

function isConfigured() {
  return !!(config.cloudSyncEnabled && config.supabase.url && config.supabase.anonKey);
}

function request(path, options) {
  if (!isConfigured()) {
    return Promise.reject(new Error('Supabase 未配置，请在 config/index.js 中填写 url 和 anonKey'));
  }

  var url = config.supabase.url.replace(/\/$/, '') + '/rest/v1/' + path;
  var method = (options && options.method) || 'GET';
  var headers = {
    apikey: config.supabase.anonKey,
    Authorization: 'Bearer ' + config.supabase.anonKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  return new Promise(function (resolve, reject) {
    var timeoutTimer = setTimeout(function () {
      reject(new Error('Supabase 请求超时'));
    }, REQUEST_TIMEOUT);

    wx.request({
      url: url,
      method: method,
      header: headers,
      data: options && options.body,
      timeout: REQUEST_TIMEOUT,
      success: function (res) {
        clearTimeout(timeoutTimer);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error('Supabase 请求失败: ' + res.statusCode));
        }
      },
      fail: function (err) {
        clearTimeout(timeoutTimer);
        reject(err);
      }
    });
  });
}

/** 拉取当前用户全部资产（需 Supabase 表 assets 与 RLS 策略） */
function fetchAssets(userId) {
  return request('assets?user_id=eq.' + userId + '&order=created_at.desc');
}

/**  upsert 单条资产 */
function upsertAsset(asset, userId) {
  var row = Object.assign({}, asset, {
    user_id: userId,
    payload: asset
  });
  return request('assets', { method: 'POST', body: row });
}

/** 删除资产 */
function deleteAsset(id, userId) {
  return request('assets?id=eq.' + id + '&user_id=eq.' + userId, { method: 'DELETE' });
}

module.exports = {
  isConfigured: isConfigured,
  fetchAssets: fetchAssets,
  upsertAsset: upsertAsset,
  deleteAsset: deleteAsset
};
