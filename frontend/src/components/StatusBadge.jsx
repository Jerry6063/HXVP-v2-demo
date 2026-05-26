/**
 * StatusBadge — v2 editorial style.
 *
 * 把原来 40+ 状态色映射归为 5 个语义档:
 *   success   (绿调 → 用 brand 黄替代,因为 brand 是积极色)
 *   warning   (黄褐 → 用 brand 黄做强 outline)
 *   info      (蓝调 → 用白色 outline)
 *   danger    (红/橙 → 用 coral)
 *   neutral   (灰)
 *
 * 保留 API:<StatusBadge status="..." />
 */

const STATUS_GROUPS = {
  success: [
    'active', 'accepted', 'available', 'approved', 'signed', 'paid',
    'verified', 'contract_signed', 'completed',
  ],
  warning: [
    'pending', 'on_hold', 'in_progress', 'submitted', 'under_review',
    'awaiting_admin_approval', 'review', 'in_production', 'revised',
    'checked_out', 'client_commented', 'revision_requested',
  ],
  info: [
    'scheduled', 'sent', 'delivered', 'booked', 'contract_sent',
    'awaiting_payment',
  ],
  danger: [
    'cancelled', 'declined', 'expired', 'overdue', 'rejected',
  ],
  neutral: [
    'archived', 'draft', 'unavailable', 'unpaid',
    'awaiting_hours_confirmation',
  ],
};

/*
   样式为浅色主背景 (paper-soft) 设计 —— 内部页面 main content 是亮底。
   如果将来要在暗底卡片中使用,需要传入额外 tone prop 覆盖。
*/
const STYLES = {
  success: 'bg-[var(--color-brand)] text-[var(--color-ink)]',
  warning: 'bg-transparent text-[var(--color-ink)] border border-[var(--color-brand)]',
  info:    'bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/40',
  danger:  'bg-[var(--color-accent-2)] text-[var(--color-paper)]',
  neutral: 'bg-transparent text-[var(--color-ink-muted)] border border-[var(--color-rule)]',
};

function groupOf(status) {
  for (const [group, list] of Object.entries(STATUS_GROUPS)) {
    if (list.includes(status)) return group;
  }
  return 'neutral';
}

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ');
  const group = groupOf(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium ${STYLES[group]}`}
    >
      {label}
    </span>
  );
}
