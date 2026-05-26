import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { PORTAL_TRANSITION, portalLayoutId } from './portalTransition';

/**
 * LoginPage — 接收来自 HomePage portal 卡片的 Apple-style 放大转场。
 *
 * 顶部 motion.div 用与 HomePage 卡片相同的 layoutId,在 AnimatePresence
 * 切换路由时自动衔接位置/尺寸/skew 三维变化(800ms 戏剧化 quart 缓动)。
 * 卡片 skewX:-10° → 此处 skewX:0,放大后自动复正。
 */

const portalMeta = {
  production: {
    number: '01',
    title: 'Production',
    subtitle: '制作端中枢',
    redirect: '/production/dashboard',
  },
  client: {
    number: '02',
    title: 'Client',
    subtitle: '客户协作入口',
    redirect: '/client/dashboard',
  },
  talent: {
    number: '03',
    title: 'Model',
    subtitle: '模特、演员、制作组',
    redirect: '/talent/dashboard',
  },
  crew: {
    // v2: Crew 不再有独立入口,从 Model Portal 进入. 此 meta 仅在直接访问
    // /crew/login URL 时使用,保留兼容.
    number: '03',
    title: 'Model',
    subtitle: '模特、演员、制作组',
    redirect: '/crew/dashboard',
  },
};

export default function LoginPage({ portal }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meta = portalMeta[portal];

  const redirectTo = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}${location.state.from.hash || ''}`
    : meta.redirect;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, portal);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-paper-dark)] text-[var(--color-paper)] flex flex-col overflow-hidden relative">
      {/* 微噪点纹理 */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 70% 65%, #fff 0.5px, transparent 0.5px)",
          backgroundSize: '3px 3px, 5px 5px',
        }}
      />

      {/* ── HERO PANEL —— layoutId 转场的目标形态 ──────────────────────── */}
      <motion.div
        layoutId={portalLayoutId(portal)}
        style={{ skewX: 0 }}
        transition={PORTAL_TRANSITION}
        className="relative z-10 h-[42vh] bg-[var(--color-paper-dark)] border-b border-white/15 overflow-hidden"
      >
        {/* 顶部 nav,转场完成后延迟淡入 */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.55, ease: 'easeOut' } }}
          className="absolute top-0 inset-x-0 px-8 md:px-12 py-5 flex items-center justify-between z-20"
        >
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl tracking-wide leading-none flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span>HXVP</span>
            <span className="text-[var(--color-brand)]">/</span>
            <span>STUDIO</span>
          </Link>
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-[var(--color-brand)] transition-colors"
          >
            ← All Portals
          </Link>
        </motion.header>

        {/* hover 残留的黄色扫光层(已铺满,但因为目标 skewX:0,看不到扫光动画——纯保留可视一致性) */}
        <span className="absolute inset-x-0 bottom-0 h-0 bg-[var(--color-brand)] -z-0" />

        {/* HERO 内容:大写 portal 名 + 编号 */}
        <div className="relative z-10 h-full px-8 md:px-12 lg:px-20 pt-20 pb-8 flex flex-col justify-end max-w-[1500px] mx-auto w-full">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.6, ease: 'easeOut' } }}
            className="text-[10px] tracking-[0.3em] text-white/40 mb-3"
          >
            {meta.number} · {meta.subtitle}
          </motion.span>
          <h1 className="font-display text-[12vw] md:text-[10vw] lg:text-[9rem] leading-[0.86] tracking-tight">
            <span className="text-[var(--color-brand)]">{meta.title}.</span>
          </h1>
        </div>

        {/* 底部 yellow 横条 */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[var(--color-brand)]" />
      </motion.div>

      {/* ── FORM —— 转场完成后淡入 ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6, ease: 'easeOut' } }}
        className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-6 md:px-12"
      >
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-brand)] mb-4 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-[var(--color-brand)]" />
            Sign In
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 border border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/10 text-sm text-[var(--color-accent-2)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-[var(--color-ink)] uppercase tracking-[0.25em] text-xs font-medium transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3"
            >
              {loading ? 'Signing in...' : 'Enter Portal'}
              {!loading && (
                <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                  <path d="M0 5 H20 M16 1 L20 5 L16 9" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              )}
            </button>
          </form>

          {portal !== 'production' && (
            <div className="flex justify-between text-xs pt-5 text-white/40">
              <Link to={`/${portal}/forgot-password`} className="hover:text-[var(--color-brand)] transition-colors uppercase tracking-[0.2em]">
                Forgot Password
              </Link>
              <Link to={`/${portal}/register`} className="hover:text-[var(--color-brand)] transition-colors uppercase tracking-[0.2em]">
                Create Account →
              </Link>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-3 bg-transparent border border-white/20 focus:border-[var(--color-brand)] focus:outline-none text-sm placeholder:text-white/30 transition-colors text-white"
      />
    </div>
  );
}
