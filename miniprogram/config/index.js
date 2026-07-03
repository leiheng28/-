/**
 * 数当家小程序配置
 * 云端同步默认关闭，接入 Supabase 后改为 true 并填写下方密钥
 */
module.exports = {
  appName: '数当家',
  version: '1.0.0',

  /** 是否启用云端同步（需配置 Supabase 并在微信后台添加 request 合法域名） */
  cloudSyncEnabled: false,

  /** Supabase 配置 — 需要时请提供并填入 */
  supabase: {
    url: '', // 例如 https://xxxxx.supabase.co
    anonKey: '' // 公开 anon key
  },

  /** 本地存储 key */
  storageKey: 'shudangjia_assets',

  /** AI 功能（MVP 为本地规则模拟，后续可接真实 API） */
  ai: {
    enabled: true,
    recognizeDelayMs: 800
  }
};
