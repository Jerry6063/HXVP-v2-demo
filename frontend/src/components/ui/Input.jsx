/**
 * HXVP v2 Input
 *
 * 暗底主题输入框,薄边,无圆角,focus 时 border 变 brand 黄。
 * 上方 uppercase tracking 标签。
 *
 * 用法:
 *   <Input label="Email" type="email" value={x} onChange={e => setX(e.target.value)} />
 *   <Input label="Message" as="textarea" rows={4} ... />
 *   <Input label="Status" as="select" ...><option>...</option></Input>
 */

export default function Input({
  label,
  hint,
  error,
  as: Component = 'input',
  className = '',
  id,
  ...rest
}) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/50 mb-2"
        >
          {label}
        </label>
      )}
      <Component
        id={inputId}
        className={`w-full px-3 py-3 bg-transparent border text-sm placeholder:text-[var(--color-paper)]/30 transition-colors focus:outline-none text-[var(--color-paper)] ${
          error
            ? 'border-[var(--color-accent-2)] focus:border-[var(--color-accent-2)]'
            : 'border-[var(--color-paper)]/20 focus:border-[var(--color-brand)]'
        } ${className}`}
        {...rest}
      />
      {(hint || error) && (
        <p
          className={`mt-1.5 text-[10px] uppercase tracking-[0.2em] ${
            error ? 'text-[var(--color-accent-2)]' : 'text-[var(--color-paper)]/40'
          }`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
