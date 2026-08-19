import type { WowEnvelope } from "@/lib/protocol";

export function Envelope({ envelope }: { envelope: WowEnvelope }) {
  const json = JSON.stringify(envelope, null, 2);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Dogenals envelope · dog marker
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
          p: Ð:WOW
        </span>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-paper">
        {json}
      </pre>
    </div>
  );
}
