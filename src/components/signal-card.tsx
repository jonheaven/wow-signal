import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { DEST_META, callsign, type Transmission } from "@/lib/protocol";

function destClass(dest: Transmission["destination"]) {
  if (dest === "mars") return "text-mars";
  if (dest === "earth") return "text-earth";
  if (dest === "moon") return "text-moon";
  return "text-gold";
}

export function SignalCard({
  signal,
  compact = false,
}: {
  signal: Transmission;
  compact?: boolean;
}) {
  const dest = DEST_META[signal.destination];
  return (
    <Link
      to="/signal/$id"
      params={{ id: signal.id }}
      className="group block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-muted">
            <span className="text-fg">{callsign(signal.handle)}</span>
            <span>@{signal.handle}</span>
            <span className={destClass(signal.destination)}>→ {dest.label}</span>
          </div>
          <p
            className={
              compact
                ? "mt-2 line-clamp-2 text-sm text-paper"
                : "mt-2 text-sm text-paper"
            }
          >
            {signal.message}
          </p>
          {signal.vow && !compact ? (
            <p className="mt-2 text-xs text-muted">Vow · {signal.vow}</p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1 text-gold">
            <Radio className="size-3.5" strokeWidth={1.75} />
            <span className="font-display text-sm tabular-nums">{signal.wows}</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-faint">
            {signal.status}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-faint">
        <span>{signal.id}</span>
        <span className="tabular-nums">
          {new Date(signal.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Link>
  );
}
