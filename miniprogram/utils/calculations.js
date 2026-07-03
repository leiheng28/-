var MS_PER_DAY = 86400000;

function parseDate(dateStr) {
  var parts = dateStr.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function todayStr() {
  return formatDate(new Date());
}

function getHoldDays(purchaseDate, endDate) {
  var start = parseDate(purchaseDate);
  start.setDate(start.getDate() + 1);
  var end = endDate ? parseDate(endDate) : new Date();
  end.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  var diff = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
  return Math.max(diff, 0);
}

function calcDailyCost(price, holdDays) {
  if (holdDays <= 0) return price;
  return price / holdDays;
}

function formatMoney(amount, decimals) {
  if (decimals === undefined) decimals = 2;
  return '¥' + amount.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatMoneyShort(amount) {
  if (amount >= 10000) {
    return '¥' + (amount / 10000).toFixed(1) + '万';
  }
  return formatMoney(amount);
}

function getAssetDailyCost(asset) {
  if (asset.status === '已卖出' && asset.sellPrice != null && asset.sellDate) {
    var days = getHoldDays(asset.purchaseDate, asset.sellDate);
    if (days <= 0) return asset.purchasePrice;
    return (asset.purchasePrice - asset.sellPrice) / days;
  }
  var holdDays = getHoldDays(asset.purchaseDate);
  return calcDailyCost(asset.purchasePrice, holdDays);
}

function getAssetHoldDays(asset) {
  var end = asset.status === '已卖出' && asset.sellDate ? asset.sellDate : undefined;
  return getHoldDays(asset.purchaseDate, end);
}

function isBreakEven(asset) {
  if (!asset.targetDaily) return false;
  return getAssetDailyCost(asset) <= asset.targetDaily;
}

function getBreakEvenProgress(asset) {
  if (!asset.targetDaily) {
    var days = getAssetHoldDays(asset);
    return Math.min((days / 1095) * 100, 100);
  }
  var current = getAssetDailyCost(asset);
  if (current <= asset.targetDaily) return 100;
  var targetDays = asset.purchasePrice / asset.targetDaily;
  var elapsed = getAssetHoldDays(asset);
  return Math.min((elapsed / targetDays) * 100, 99);
}

function getDaysToBreakEven(asset) {
  if (!asset.targetDaily) return null;
  var current = getAssetDailyCost(asset);
  if (current <= asset.targetDaily) return 0;
  var targetDays = Math.ceil(asset.purchasePrice / asset.targetDaily);
  var elapsed = getAssetHoldDays(asset);
  return Math.max(targetDays - elapsed, 0);
}

function getBreakEvenDate(asset) {
  var daysLeft = getDaysToBreakEven(asset);
  if (daysLeft == null) return null;
  var date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return formatDate(date);
}

function getProfitLoss(asset) {
  if (asset.status !== '已卖出' || asset.sellPrice == null) return null;
  var amount = asset.sellPrice - asset.purchasePrice;
  var rate = (amount / asset.purchasePrice) * 100;
  return { amount: amount, rate: rate };
}

function getYieldRate(asset) {
  if (!asset.currentValue) return null;
  return ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100;
}

function getActiveAssets(assets) {
  return assets.filter(function (a) { return a.status === '服役中'; });
}

function getTotalPurchaseValue(assets) {
  return getActiveAssets(assets).reduce(function (sum, a) { return sum + a.purchasePrice; }, 0);
}

function getTotalDailyCost(assets) {
  return getActiveAssets(assets).reduce(function (sum, a) { return sum + getAssetDailyCost(a); }, 0);
}

function getMonthlySoldTotal(assets) {
  var now = new Date();
  var month = now.getMonth();
  var year = now.getFullYear();
  return assets
    .filter(function (a) {
      if (a.status !== '已卖出' || !a.sellDate || a.sellPrice == null) return false;
      var d = parseDate(a.sellDate);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce(function (sum, a) { return sum + (a.sellPrice || 0); }, 0);
}

function generateAiInsight(assets) {
  var active = getActiveAssets(assets);
  if (active.length === 0) {
    return '添加第一件物品，开始追踪你的资产日均成本。';
  }
  var sorted = active.slice().sort(function (a, b) {
    return getAssetHoldDays(b) - getAssetHoldDays(a);
  });
  var top = sorted[0];
  var days = getAssetHoldDays(top);
  var daily = getAssetDailyCost(top);
  if (top.currentValue) {
    return top.name + ' 已用 ' + days + ' 天，日均 ' + formatMoney(daily, 1) + '。二手估价 ' + formatMoney(top.currentValue, 0) + '，进入贬值平稳期，建议继续持有。';
  }
  if (daily > (top.targetDaily || 999)) {
    return top.name + ' 日均 ' + formatMoney(daily, 1) + ' 偏高，建议提高使用频率或关注二手行情。';
  }
  return top.name + ' 已用 ' + days + ' 天，日均 ' + formatMoney(daily, 1) + '，持有成本在合理区间。';
}

function supportsAiValuation(category) {
  return category === '黄金' || category === '数码';
}

module.exports = {
  parseDate: parseDate,
  formatDate: formatDate,
  todayStr: todayStr,
  getHoldDays: getHoldDays,
  calcDailyCost: calcDailyCost,
  formatMoney: formatMoney,
  formatMoneyShort: formatMoneyShort,
  getAssetDailyCost: getAssetDailyCost,
  getAssetHoldDays: getAssetHoldDays,
  isBreakEven: isBreakEven,
  getBreakEvenProgress: getBreakEvenProgress,
  getDaysToBreakEven: getDaysToBreakEven,
  getBreakEvenDate: getBreakEvenDate,
  getProfitLoss: getProfitLoss,
  getYieldRate: getYieldRate,
  getActiveAssets: getActiveAssets,
  getTotalPurchaseValue: getTotalPurchaseValue,
  getTotalDailyCost: getTotalDailyCost,
  getMonthlySoldTotal: getMonthlySoldTotal,
  generateAiInsight: generateAiInsight,
  supportsAiValuation: supportsAiValuation
};
