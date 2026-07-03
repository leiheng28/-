var calc = require('../../utils/calculations');

Page({
  data: {
    price: '8999',
    days: 1095,
    daysLabel: '',
    rent: '299',
    buyDaily: '¥0.00',
    rentDaily: '¥0.00',
    buyTotal: '¥0',
    rentTotal: '¥0',
    verdict: '',
    verdictText: '',
    showCompare: false
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.recalc();
  },

  recalc: function () {
    var price = parseFloat(this.data.price) || 0;
    var days = this.data.days;
    var rent = parseFloat(this.data.rent) || 0;
    var buyDaily = calc.calcDailyCost(price, days);
    var rentDaily = rent > 0 ? (rent * 12) / 365 : 0;
    var buyTotal = buyDaily * days;
    var rentTotal = rent * Math.ceil(days / 30);
    var verdict = '';
    var verdictText = '';

    if (price > 0 && days > 0) {
      if (rent > 0) {
        verdict = buyDaily <= rentDaily ? 'buy' : 'rent';
        verdictText = verdict === 'buy' ? '✓ 建议购买' : '✓ 建议租用';
      } else {
        verdict = 'buy';
        verdictText = '✓ 建议购买';
      }
    }

    this.setData({
      daysLabel: days + ' 天（约 ' + Math.round(days / 365 * 10) / 10 + ' 年）',
      buyDaily: calc.formatMoney(buyDaily, 2),
      rentDaily: calc.formatMoney(rentDaily, 2),
      buyTotal: calc.formatMoney(buyTotal, 0),
      rentTotal: calc.formatMoney(rentTotal, 0),
      verdict: verdict,
      verdictText: verdictText,
      showCompare: rent > 0
    });
  },

  onPriceInput: function (e) {
    this.setData({ price: e.detail.value }, this.recalc.bind(this));
  },

  onRentInput: function (e) {
    this.setData({ rent: e.detail.value }, this.recalc.bind(this));
  },

  onDaysChange: function (e) {
    this.setData({ days: e.detail.value }, this.recalc.bind(this));
  }
});
