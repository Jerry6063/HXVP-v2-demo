/**
 * Shared transition tokens for HomePage ↔ LoginPage Apple app-launch morph.
 *
 * 拆到独立文件是为了 Vite/React Fast Refresh 友好 —— React 组件文件应只 export
 * 组件,否则 HMR 会 full-reload。
 */

export const PORTAL_TRANSITION = {
  // 慢戏剧 ease-in-out-quart,800ms 给放大过程足够的呼吸感
  layout: { duration: 0.8, ease: [0.83, 0, 0.17, 1] },
  default: { duration: 0.8, ease: [0.83, 0, 0.17, 1] },
};

export const portalLayoutId = (key) => `portal-card-${key}`;
