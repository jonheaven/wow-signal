export function PostageMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border border-gold/40 bg-surface px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted ${className}`}
    >
      <span className="text-gold">You pay 0 Ð</span>
      <span>We cover the stamp</span>
      <span className="text-faint">Funded by the pack</span>
    </div>
  );
}
