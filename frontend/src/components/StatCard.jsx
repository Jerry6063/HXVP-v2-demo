/**
 * StatCard — v2 editorial dark style.
 *
 * 保留原 API(label / value / sub / icon / color / onClick / active),
 * 内部全部改用新视觉。color prop 现在仅控制 icon accent,默认黄色。
 */

const accentMap = {
  indigo: 'var(--color-brand)',
  emerald: 'var(--color-brand)',
  amber: 'var(--color-brand)',
  sky: 'var(--color-brand)',
  red: 'var(--color-accent-2)',
  purple: 'var(--color-accent-2)',
  yellow: 'var(--color-brand)',
  coral: 'var(--color-accent-2)',
};

export default function StatCard({ label, value, sub, icon: Icon, color = 'yellow', onClick, active = false }) {
  const accent = accentMap[color] || 'var(--color-brand)';
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full text-left bg-[var(--color-paper-dark)] border p-5 transition-all
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
        ${active ? '' : ''}`}
      style={{
        borderColor: active ? accent : 'rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/50 mb-2">
            {label}
          </p>
          <p
            className="font-display text-3xl md:text-4xl leading-none text-[var(--color-paper)]"
            style={{ color: active ? accent : 'var(--color-paper)' }}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-paper)]/40">
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="p-2.5 border border-[var(--color-paper)]/20"
            style={{ color: accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
