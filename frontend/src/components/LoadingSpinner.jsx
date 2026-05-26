/**
 * LoadingSpinner — v2 editorial style.
 *
 * 黄色描边动画 + uppercase tracking 提示文字。
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 border-2 border-[var(--color-paper)]/10" />
        <div className="absolute inset-0 border-2 border-transparent border-t-[var(--color-brand)] animate-spin" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-paper)]/40">
        {message}
      </p>
    </div>
  );
}
