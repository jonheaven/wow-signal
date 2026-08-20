import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SignalCard } from "@/components/signal-card";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMine, getQuota } from "@/lib/signals";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const { user, isPending } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["mine"],
    queryFn: () => listMine(),
    enabled: Boolean(user),
  });
  const quota = useQuery({
    queryKey: ["quota", user?.id],
    queryFn: () => getQuota(),
    enabled: Boolean(user),
  });

  if (isPending) return <div className="h-48 animate-pulse rounded-lg bg-surface" />;
  if (!user) return <RedirectToSignIn />;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Your log</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Transmissions</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {user.displayName ?? user.primaryEmail}. Postage is on
        the treasury
        {quota.data
          ? quota.data.remaining > 0
            ? " — one free signal left today."
            : ` — next free window ${quota.data.nextAt ? new Date(quota.data.nextAt).toLocaleString() : "in 24h"}.`
          : "."}
      </p>

      <div className="mt-8 grid gap-3">
        {q.data?.length === 0 ? (
          <div className="border border-border px-4 py-8 text-sm text-muted">
            Nothing queued yet.{" "}
            <Link to="/transmit" className="text-gold">
              Transmit
            </Link>
          </div>
        ) : null}
        {q.data?.map((s) => (
          <SignalCard key={s.id} signal={s} />
        ))}
      </div>
    </div>
  );
}
