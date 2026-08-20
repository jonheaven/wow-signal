import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SignalCard } from "@/components/signal-card";
import { DESTINATIONS, DEST_META, type Destination } from "@/lib/protocol";
import { listTransmissions } from "@/lib/signals";

export const Route = createFileRoute("/wall")({
  loader: async () => {
    const list = await listTransmissions({ data: { limit: 60 } }).catch(
      () => [],
    );
    return { list };
  },
  component: WallPage,
});

function WallPage() {
  const initial = Route.useLoaderData();
  const [dest, setDest] = useState<Destination | "all">("all");
  const q = useQuery({
    queryKey: ["signals", dest],
    queryFn: () =>
      listTransmissions({
        data: dest === "all" ? { limit: 60 } : { dest, limit: 60 },
      }),
    initialData: dest === "all" ? initial.list : undefined,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Guestbook</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">The wall</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Every queued and confirmed transmission. Confirmed rows come from
            dogex via command.dog. Pending jobs sit on command.dog until the
            inscription confirms.
          </p>
        </div>
        <Link
          to="/transmit"
          className="inline-flex h-11 items-center justify-center bg-gold px-5 text-[12px] font-medium uppercase tracking-[0.18em] text-bg hover:bg-gold-hot"
        >
          Transmit
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip active={dest === "all"} onClick={() => setDest("all")}>
          All
        </FilterChip>
        {DESTINATIONS.map((d) => (
          <FilterChip key={d} active={dest === d} onClick={() => setDest(d)}>
            {DEST_META[d].label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {q.isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-surface-2" />
            ))
          : null}
        {q.data?.length === 0 ? (
          <p className="border border-border px-4 py-8 text-sm text-muted">
            No transmissions on this heading yet.
          </p>
        ) : null}
        {q.data?.map((s) => (
          <SignalCard key={s.id} signal={s} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-9 border border-gold px-3 text-[11px] uppercase tracking-[0.16em] text-gold"
          : "h-9 border border-border px-3 text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
      }
    >
      {children}
    </button>
  );
}
