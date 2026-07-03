Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '资产', icon: '💰' },
      { pagePath: '/pages/list/list', text: '列表', icon: '📋' },
      { pagePath: '/pages/tools/tools', text: '工具', icon: '🔧' },
      { pagePath: '/pages/settings/settings', text: '我的', icon: '👤' }
    ]
  },

  methods: {
    switchTab: function (e) {
      var index = e.currentTarget.dataset.index;
      var item = this.data.list[index];
      wx.switchTab({ url: item.pagePath });
    }
  }
});
