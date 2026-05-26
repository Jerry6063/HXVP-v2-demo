import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PORTAL_TRANSITION, portalLayoutId } from './portalTransition';

/**
 * HXVP Studio — Landing
 *
 * 单屏布局 (h-screen, 无滚动) + Apple app-launch 风格转场:
 *  - 4 portal 卡片 motion.div 用 layoutId 跨页绑定到 LoginPage 顶部 hero
 *  - 点击 → 800ms 戏剧化形变:位置/尺寸放大 + skew 从 -10° 复正
 *  - 其余非动画内容用 exit={{opacity:0}} 快速淡出
 *
 * 视觉规范参考 https://hxvp.us/
 */

/*
 * v2: Talent + Crew 合并为单一 "Model Portal" 入口(导演确认).
 * 内部路由仍保留 /talent/* 和 /crew/* 兼容,Model 登录后根据用户角色自动路由
 * (在 LoginPage 里处理).
 */
const portals = [
  {
    key: 'production',
    number: '01',
    name: 'Production',
    description: '项目、团队、档期、合同',
    to: '/production/login',
  },
  {
    key: 'client',
    number: '02',
    name: 'Client',
    description: '项目进度、交付审阅、结算',
    to: '/client/login',
  },
  {
    key: 'talent',
    number: '03',
    name: 'Model',
    description: '档期、通告单、薪资、报销',
    to: '/talent/login',
  },
];


export default function HomePage() {
  return (
    <motion.div
      className="h-screen w-screen bg-[var(--color-paper-dark)] text-[var(--color-paper)] flex flex-col overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
    >
      {/* 微噪点纹理覆盖全屏 */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 70% 65%, #fff 0.5px, transparent 0.5px)",
          backgroundSize: '3px 3px, 5px 5px',
        }}
      />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 shrink-0 px-8 md:px-12 py-5 flex items-center justify-between border-b border-white/10">
        <div className="font-display text-2xl md:text-3xl tracking-wide leading-none flex items-center gap-2">
          <span>HXVP</span>
          <span className="text-[var(--color-brand)]">/</span>
          <span>STUDIO</span>
        </div>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-[0.2em] text-white/50">
          <a
            href="https://hxvp.us/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-brand)] transition-colors"
          >
            ← Main Site
          </a>
          <span className="text-white">Internal Portal</span>
        </nav>
      </header>

      {/* ── HERO — 紧凑,但黄字仍是视觉中心 ──────────────────────────── */}
      <section className="relative z-10 shrink-0 px-8 md:px-12 pt-8 md:pt-10 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[var(--color-brand)] mb-4 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[var(--color-brand)]" />
            Studio Operations · v2
          </p>

          <h1 className="font-display leading-[0.86] tracking-tight text-[8vw] md:text-[6.5vw] lg:text-[5.5vw]">
            <span className="text-[var(--color-brand)]">Where Creativity </span>
            <span className="text-white">Meets Operations.</span>
          </h1>
        </div>
      </section>

      {/* yellow accent strip 把 hero 和 portals 隔开 */}
      <div className="relative z-10 shrink-0 h-1 w-full bg-[var(--color-brand)]" />

      {/* ── PORTAL GRID — 占下半屏主体,4 卡平行四边形倾斜,文字同向 ─────── */}
      <section className="relative z-10 flex-1 min-h-0 px-12 md:px-20 lg:px-28">
        <div className="max-w-[1500px] mx-auto h-full flex flex-col">
          <div className="flex items-baseline justify-between py-4 shrink-0">
            <h2 className="font-display text-2xl md:text-3xl leading-none">
              Select <span className="text-[var(--color-brand)]">·</span> Portal
            </h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              3 Portals
            </span>
          </div>

          {/*
             每张卡 skewX(-10deg) 整体倾斜,内容不反 skew —— 文字跟随框一起倾斜
             (像 italic 但是几何变形,League Gothic 倾斜后非常硬朗有动感)。
             section 外层留 px-12~px-28 padding,让最左/最右卡片的斜角能完整显示
             在留白里,不被裁切。
          */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3">
            {portals.map((portal) => (
              <Link
                key={portal.to}
                to={portal.to}
                className="group block h-full"
              >
                <motion.div
                  layoutId={portalLayoutId(portal.key)}
                  /*
                     skewX 通过 motion 的 transform 值系统应用 (而不是 CSS transform),
                     这样在跨页 layoutId 转场时,Framer Motion 能平滑地动画 skewX 从
                     -10° 过渡到 LoginPage 的 0°,得到 "卡片倾斜状态下放大并复正" 的戏剧效果。
                  */
                  style={{ skewX: -10 }}
                  transition={PORTAL_TRANSITION}
                  whileHover={{ y: -8 }}
                  className="relative h-full bg-[var(--color-paper-dark)] border border-white/15 overflow-hidden group-hover:bg-[var(--color-brand)] group-hover:text-[var(--color-ink)] group-hover:border-[var(--color-brand)] transition-[background-color,color,border-color] duration-300"
                >
                  {/* hover 时黄色背景从下往上扫过 */}
                  <span className="absolute inset-x-0 bottom-0 h-0 bg-[var(--color-brand)] transition-all duration-300 group-hover:h-full -z-0" />

                  <div className="relative z-10 h-full px-5 md:px-7 py-6 md:py-8 flex flex-col gap-3 md:gap-4">
                    <span className="text-[10px] tracking-[0.3em] text-white/40 group-hover:text-[var(--color-ink)]/60 transition-colors">
                      {portal.number}
                    </span>
                    <h3 className="font-display text-[4.5vh] md:text-[5.5vh] lg:text-[6.5vh] leading-[0.9] -mt-1 whitespace-nowrap">
                      {portal.name}
                    </h3>
                    <p className="text-xs md:text-sm text-white/60 group-hover:text-[var(--color-ink)]/80 leading-relaxed transition-colors">
                      {portal.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.25em]">
                      Enter
                      <svg
                        width="22"
                        height="10"
                        viewBox="0 0 22 10"
                        fill="none"
                        className="transition-transform group-hover:translate-x-2"
                      >
                        <path d="M0 5 H20 M16 1 L20 5 L16 9" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER — 单行 demo 凭证 ───────────────────────────────────── */}
      <footer className="relative z-10 shrink-0 px-8 md:px-12 py-3 border-t border-white/10 text-[10px] md:text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-2 text-white/40 uppercase tracking-[0.2em]">
            <span className="text-[var(--color-brand)]">●</span>
            Demo · password
            <code className="font-mono text-white normal-case tracking-normal">password123</code>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/40 font-mono">
            <span>admin@studio.com</span>
            <span>client@brandco.com</span>
            <span>talent1@studio.com</span>
            <span>crew1@studio.com</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
