/**
 * HXVP v2 Card
 *
 * 组合式:Card / Card.Header / Card.Body / Card.Footer。
 * 默认深色编辑式风格(无圆角、细 border、可选 yellow accent)。
 *
 * 变体:
 *   - default:  deep dark + thin white border
 *   - paper:    light card-on-light(用在 paper-soft 背景里)
 *   - emphasis: hover 时 yellow border + 上浮
 *
 * 用法:
 *   <Card>
 *     <Card.Header eyebrow="01" title="Production" action={<Button>...</Button>} />
 *     <Card.Body>...content...</Card.Body>
 *     <Card.Footer>...</Card.Footer>
 *   </Card>
 *
 *   <Card variant="emphasis" as={Link} to="/foo">...</Card>
 */

const VARIANTS = {
  default:
    'bg-[var(--color-paper-dark)] border border-white/15 text-[var(--color-paper)]',
  paper:
    'bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)]',
  emphasis:
    'bg-[var(--color-paper-dark)] border border-white/15 text-[var(--color-paper)] cursor-pointer transition-all hover:border-[var(--color-brand)] hover:-translate-y-1',
};

function Card({ as: Component = 'div', variant = 'default', className = '', children, ...rest }) {
  return (
    <Component className={`${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </Component>
  );
}

function Header({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 md:px-6 pt-5 md:pt-6 pb-3 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-brand)] mb-1.5">
            {eyebrow}
          </p>
        )}
        {title && (
          <h3 className="font-display text-2xl md:text-3xl leading-none truncate">
            {title}
          </h3>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function Body({ className = '', children }) {
  return <div className={`px-5 md:px-6 py-4 ${className}`}>{children}</div>;
}

function Footer({ className = '', children }) {
  return (
    <div className={`px-5 md:px-6 py-3 border-t border-white/10 text-xs text-[var(--color-paper)]/60 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card;
