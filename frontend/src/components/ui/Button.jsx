/**
 * HXVP v2 Button
 *
 * 三档变体 + 三档尺寸,无圆角(editorial),uppercase + tracking,
 * League Gothic 风格小标注。
 *
 * 用法:
 *   <Button>Default Primary</Button>
 *   <Button variant="secondary">Outline</Button>
 *   <Button variant="ghost" size="sm">Text only</Button>
 *   <Button as={Link} to="/foo">As link</Button>
 */

const VARIANTS = {
  primary:
    'bg-[var(--color-brand)] text-[var(--color-ink)] hover:bg-[var(--color-brand-hover)] disabled:opacity-50',
  secondary:
    'bg-transparent text-[var(--color-paper)] border border-[var(--color-paper)]/30 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--color-paper)]/70 hover:text-[var(--color-brand)] disabled:opacity-50',
  danger:
    'bg-[var(--color-accent-2)] text-[var(--color-paper)] hover:opacity-90 disabled:opacity-50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[10px] tracking-[0.2em]',
  md: 'px-5 py-2.5 text-xs tracking-[0.22em]',
  lg: 'px-7 py-3.5 text-sm tracking-[0.25em]',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 uppercase font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
