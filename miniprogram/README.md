# 数当家 · 微信小程序（完整版）

个人资产全生命周期管理 — 原生微信小程序，开箱即用。

## 功能清单

| 模块 | 功能 |
|------|------|
| 资产概览 | 总资产、日均合计、AI 洞察、服役中 Top5 |
| 资产列表 | 品类/状态筛选、跳转详情 |
| 添加资产 | 手动录入 + AI 智能预填 |
| 编辑资产 | 修改名称、品类、价格、日期、目标日均 |
| 物品详情 | 日均成本、回本进度、退役/恢复、删除 |
| 价值追踪 | AI 估值刷新、手动估值、收益率图表 |
| 卖出复盘 | 盈亏分析、AI 复盘、持有效率 |
| 工具箱 | 买前计算器（买 vs 租） |
| 我的 | 导出 CSV、云端同步、恢复/清空数据 |

## 目录结构

```
miniprogram/
├── app.js / app.json / app.wxss
├── config/index.js
├── components/sell-sheet/
├── custom-tab-bar/
├── pages/ (index, list, tools, settings, add, edit, detail, value, sell)
├── services/ (supabase.js, sync.js)
├── utils/ (calculations, storage, assetStore, constants, ai)
└── docs/supabase-schema.sql
```

## 快速开始

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本目录
3. AppID 测试阶段选「测试号」
4. 编译 → 预览

## 部署

微信小程序发布在微信公众平台，不使用 Vercel：

1. 注册小程序并获取 AppID
2. 修改 `project.config.json` 的 `appid`
3. 开发者工具上传 → 提交审核 → 发布

## 接入 Supabase（可选）

如需云端同步，请提供 Supabase URL 和 anonKey，然后：

1. 执行 `docs/supabase-schema.sql`
2. 编辑 `config/index.js` 开启 `cloudSyncEnabled` 并填写密钥
3. 在微信后台添加 Supabase 为 request 合法域名

## 版本

MVP v1.0.0
