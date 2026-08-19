import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { toast } from "sonner";
import { Envelope } from "@/components/envelope";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { DEST_META, callsign } from "@/lib/protocol";
import { briefSignal, getTransmission, wowSignal } from "@/lib/signals";

export const Route = createFileRoute("/signal/$id")({ component: SignalPage });

function SignalPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { user } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["signal", id],
    queryFn: () => getTransmission({ data: id }),
  });

  const wow = useMutation({
    mutationFn: () => wowSignal({ data: id }),
    onSuccess: (row) => {
      void qc.setQueryData(["signal", id], row);
      toast.success("Wow registered");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Need sign-in"),
  });

  const brief = useMutation({
    mutationFn: () => briefSignal({ data: id }),
    onSuccess: (row) => {
      void qc.setQueryData(["signal", id], row);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Briefing failed"),
  });

  if (q.isPending) return <div className="h-64 animate-pulse rounded-lg bg-surface" />;
  if (!q.data) {
    return (
      <div>
        <h1 className="font-display text-3xl">Signal not found</h1>
        <Link to="/wall" className="mt-4 inline-block text-sm text-gold">
          Back to the wall
        </Link>
      </div>
    );
  }

  const s = q.data;
  const dest = DEST_META[s.destination];
  const mine = user && user.id === s.userId;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
          {s.id} · {s.status}
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          {s.message}
        </h1>
        {s.vow ? (
          <p className="mt-4 border-l border-gold pl-4 text-sm text-muted">
            Vow · {s.vow}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Meta k="Callsign" v={callsign(s.handle)} />
          <Meta k="From" v={`@${s.handle}`} />
          <Meta k="Destination" v={dest.label} />
          <Meta k="Light time" v={dest.lightMs ? `${dest.lightMs.toLocaleString()} ms` : "local"} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => wow.mutate()}
            disabled={wow.isPending}
            className="inline-flex h-11 items-center gap-2 border border-border px-4 text-[12px] uppercase tracking-[0.16em] hover:border-gold hover:text-gold"
          >
            <Radio className="size-4" />
            Wow · <span className="tabular-nums">{s.wows}</span>
          </button>
          {mine && !s.briefing ? (
            <button
              type="button"
              onClick={() => brief.mutate()}
              disabled={brief.isPending}
              className="inline-flex h-11 items-center border border-border px-4 text-[12px] uppercase tracking-[0.16em] hover:border-gold hover:text-gold"
            >
              {brief.isPending ? "Asking Grok…" : "Mission briefing"}
            </button>
          ) : null}
          <Link
            to="/transmit"
            className="inline-flex h-11 items-center bg-gold px-4 text-[12px] uppercase tracking-[0.16em] text-bg hover:bg-gold-hot"
          >
            Reply with yours
          </Link>
        </div>

        {s.briefing ? (
          <div className="mt-8 border border-border bg-surface p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Grok · mission briefing
            </div>
            <p className="mt-2 text-sm text-paper">{s.briefing}</p>
          </div>
        ) : null}
      </div>

      <div>
        <Envelope envelope={s.envelope} />
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Production: command.dog queues the mint, Dojak signs, WatchDoge shows
          the mempool flash, dogex indexes the confirmed Ð:WOW, explorer proves
          the tx. Ðrok forges an optional mission patch from the WOW Collection
          Constitution (Grok Imagine, prepaid in DOGE). This preview is the
          consumer surface — not a second indexer.
        </p>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">{k}</dt>
      <dd className="mt-1 text-sm text-fg">{v}</dd>
    </div>
  );
}
