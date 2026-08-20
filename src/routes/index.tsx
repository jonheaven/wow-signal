import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Radio } from "lucide-react";
import { BeaconCanvas } from "@/components/beacon-canvas";
import { DEST_META } from "@/lib/protocol";
import { getChainTip, getStats, listTransmissions } from "@/lib/signals";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [list, stats, tip] = await Promise.all([
      listTransmissions({ data: { limit: 24 } }).catch(() => []),
      getStats().catch(() => ({ total: 0, mars: 0, energy: 0 })),
      getChainTip(),
    ]);
    return { list, stats, tip };
  },
  component: BeaconPage,
});

function BeaconPage() {
  const initial = Route.useLoaderData();
  const signals = useQuery({
    queryKey: ["signals"],
    queryFn: () => listTransmissions({ data: { limit: 24 } }),
    initialData: initial.list,
    refetchInterval: 8000,
  });
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(),
    initialData: initial.stats,
    refetchInterval: 8000,
  });
  const tip = useQuery({
    queryKey: ["tip"],
    queryFn: () => getChainTip(),
    initialData: initial.tip,
    staleTime: 30_000,
  });

  const list = signals.data ?? [];
  const latest = list[0];

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <BeaconCanvas signals={list} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-bg/40" />

      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-4 pb-8 pt-28 sm:px-8 sm:pb-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
              Free · We pay · Dogecoin · Mars
            </p>
            <h1 className="mt-3 font-display text-5xl tracking-tight text-fg sm:text-7xl">
              Send a message
              <br />
              to Mars.
              <span className="text-gold"> Free.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
              We pay the postage. You never touch a wallet. Your words get
              inscribed on Dogecoin and aimed at the sky. Permanent. Public.
              LFG.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
              <Link
                to="/transmit"
                className="inline-flex h-11 items-center gap-2 bg-gold px-5 text-[12px] font-medium uppercase tracking-[0.18em] text-bg transition-colors hover:bg-gold-hot"
              >
                Send it — 0 Ð
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/mission"
                className="inline-flex h-11 items-center border border-border px-5 text-[12px] font-medium uppercase tracking-[0.18em] text-fg transition-colors hover:border-gold hover:text-gold"
              >
                Wait, you pay?
              </Link>
            </div>
          </div>

          <div className="pointer-events-auto grid gap-3 sm:grid-cols-4">
            <Hud
              label="Chain tip"
              value={
                tip.data
                  ? tip.data.height.toLocaleString()
                  : "—"
              }
              hint={
                !tip.data || tip.data.source === "estimate"
                  ? "est."
                  : "dogex"
              }
            />
            <Hud
              label="Transmissions"
              value={stats.data ? String(stats.data.total) : "—"}
              hint="sponsored"
            />
            <Hud
              label="Aimed at Mars"
              value={stats.data ? String(stats.data.mars) : "—"}
              hint="destination"
            />
            <Hud
              label="Wow energy"
              value={stats.data ? stats.data.energy.toLocaleString() : "—"}
              hint="wows"
            />
          </div>

          {latest ? (
            <Link
              to="/signal/$id"
              params={{ id: latest.id }}
              className="pointer-events-auto flex max-w-xl items-start gap-3 border border-border bg-surface/80 px-4 py-3 backdrop-blur-sm transition-colors hover:border-gold/50"
            >
              <Radio className="mt-0.5 size-4 shrink-0 text-gold" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Latest · @{latest.handle} → {DEST_META[latest.destination].label}
                </div>
                <p className="mt-1 truncate text-sm text-paper">{latest.message}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Hud({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="pointer-events-auto border border-border bg-surface/70 px-4 py-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl tabular-nums tracking-tight text-fg">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-faint">{hint}</div>
    </div>
  );
}
