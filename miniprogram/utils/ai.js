var calc = require('./calculations');

var AI_SUGGESTIONS = {
  iphone: { name: 'iPhone 15 Pro', category: '数码', purchasePrice: '8799', targetDaily: '10' },
  macbook: { name: 'MacBook Air M2', category: '数码', purchasePrice: '7999', targetDaily: '15' },
  airpods: { name: 'AirPods Pro 2', category: '数码', purchasePrice: '1899', targetDaily: '3' },
  sony: { name: 'Sony A7M4', category: '数码', purchasePrice: '6800', targetDaily: '12' },
  黄金: { name: '黄金 50g', category: '黄金', purchasePrice: '17500' },
  gold: { name: '黄金 50g', category: '黄金', purchasePrice: '17500' }
};

/** 根据输入文本匹配预填建议（MVP 模拟 AI 识别） */
function recognizeAsset(input) {
  var text = (input || '').toLowerCase();
  var key = Object.keys(AI_SUGGESTIONS).find(function (k) {
    return text.indexOf(k) !== -1;
  }) || 'iphone';
  return Object.assign({}, AI_SUGGESTIONS[key]);
}

/** 模拟 AI 估值（基于品类与持有天数折旧） */
function estimateValue(asset) {
  if (!calc.supportsAiValuation(asset.category)) return null;

  var days = calc.getAssetHoldDays(asset);
  var price = asset.purchasePrice;
  var rate;

  if (asset.category === '黄金') {
    rate = 1 + Math.min(days / 365, 3) * 0.08;
  } else {
    var yearFactor = Math.min(days / 365, 5);
    rate = Math.max(0.35, 1 - yearFactor * 0.18);
  }

  return Math.round(price * rate);
}

function getSellAdvice(asset) {
  var yieldRate = calc.getYieldRate(asset);
  if (yieldRate == null || yieldRate <= 30) return null;
  return asset.name + ' 当前处于近 12 个月高位区间，收益率已达 ' + yieldRate.toFixed(1) + '%。建议关注市场动态，考虑分批卖出。';
}

function getSellReview(asset, pl, daily, days) {
  var isProfit = pl.amount >= 0;
  if (isProfit) {
    return asset.name + ' 变现成功，实际日均 ' + calc.formatMoney(daily, 2) + '。持有 ' + days + ' 天后出手时机较好。';
  }
  return asset.name + ' 使用率低于预期，实际日均 ' + calc.formatMoney(daily, 2) + ' 高于目标。建议下次购买前参考 AI 购买建议，选择更适合使用频率的设备。';
}

module.exports = {
  AI_SUGGESTIONS: AI_SUGGESTIONS,
  recognizeAsset: recognizeAsset,
  estimateValue: estimateValue,
  getSellAdvice: getSellAdvice,
  getSellReview: getSellReview
};
