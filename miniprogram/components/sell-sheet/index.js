var calc = require('../../utils/calculations');

Component({
  properties: {
    visible: { type: Boolean, value: false },
    asset: { type: Object, value: null }
  },

  data: {
    sellPrice: '',
    sellDate: '',
    today: '',
    confirming: false,
    sellValid: false
  },

  observers: {
    visible: function (visible) {
      if (visible) {
        this.setData({
          sellPrice: '',
          sellDate: calc.todayStr(),
          today: calc.todayStr(),
          confirming: false,
          sellValid: false
        });
      }
    }
  },

  methods: {
    onClose: function () {
      this.triggerEvent('close');
    },

    stopBubble: function () {},

    onSellPriceInput: function (e) {
      var sellPrice = e.detail.value;
      var asset = this.properties.asset;
      var sellDate = this.data.sellDate;
      var sellValid = parseFloat(sellPrice) > 0 && asset && sellDate >= asset.purchaseDate;
      this.setData({ sellPrice: sellPrice, confirming: false, sellValid: sellValid });
    },

    onSellDateChange: function (e) {
      var sellDate = e.detail.value;
      var asset = this.properties.asset;
      var sellValid = parseFloat(this.data.sellPrice) > 0 && asset && sellDate >= asset.purchaseDate;
      this.setData({ sellDate: sellDate, confirming: false, sellValid: sellValid });
    },

    onSubmit: function () {
      if (!this.data.sellValid) return;
      if (!this.data.confirming) {
        this.setData({ confirming: true });
        return;
      }
      this.triggerEvent('confirm', {
        sellPrice: parseFloat(this.data.sellPrice),
        sellDate: this.data.sellDate
      });
    }
  }
});
