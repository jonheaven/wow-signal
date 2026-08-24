import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Envelope } from "@/components/envelope";
import { Postcard } from "@/components/postcard";
import { PostageMark } from "@/components/postage";
import { StampButton } from "@/components/stamp-button";
import { authEnabled, signIn } from "@/lib/auth/client";
import { getSignInOptions } from "@/lib/auth/options";
import { FALLBACK_X, readProviders } from "@/lib/auth/sign-in-ui";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { clearDraft, readDraft, saveDraft } from "@/lib/draft";
import {
  DESTINATIONS,
  DEST_META,
  MESSAGE_MAX,
  VOW_MAX,
  buildEnvelope,
  type Destination,
} from "@/lib/protocol";
import { getQuota, transmit } from "@/lib/signals";
import { issueStamp } from "@/lib/stamp";
import { STAMP_MAX_AGE_MS, STAMP_MIN_AGE_MS, STAMP_STORAGE_KEY } from "@/lib/stamp-shared";

export const Route = createFileRoute("/transmit")({
  loader: async () => ({
    stamp: await issueStamp(),
    providers: await getSignInOptions().catch(() => []),
  }),
  component: TransmitPage,
});

function TransmitPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const loaderData = Route.useLoaderData();
  const issued = loaderData?.stamp;
  const loadedProviders = readProviders(loaderData);
  const optionsQuery = useQuery({
    queryKey: ["wow-sign-in-options"],
    queryFn: () => getSignInOptions(),
    initialData: loadedProviders.length ? loadedProviders : undefined,
    retry: 5,
    retryDelay: 2000,
  });
  const resolvedProviders = optionsQuery.data?.length
    ? optionsQuery.data
    : loadedProviders;
  const providers = resolvedProviders.length ? resolvedProviders : FALLBACK_X;
  const [destination, setDestination] = useState<Destination>("mars");
  const [message, setMessage] = useState("");
  const [vow, setVow] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [stamp, setStamp] = useState(issued);
  const [trap, setTrap] = useState("");
  const pendingQueue = useRef(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setDestination(draft.destination);
      setMessage(draft.message);
      setVow(draft.vow);
      pendingQueue.current = Boolean(draft.autoQueue);
    }
    try {
      const stored = window.sessionStorage.getItem(STAMP_STORAGE_KEY);
      const age = stored ? Date.now() - Number(stored.split(".")[0]) : 0;
      if (stored && stored.split(".").length === 3 && age > 0 && age < STAMP_MAX_AGE_MS) {
        setStamp(stored);
      } else if (issued) {
        window.sessionStorage.setItem(STAMP_STORAGE_KEY, issued);
        setStamp(issued);
      }
    } catch {
      if (issued) setStamp(issued);
    }
    setHydrated(true);
  }, [issued]);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft({ destination, message, vow, autoQueue: pendingQueue.current });
  }, [destination, message, vow, hydrated]);

  const handle = (user?.displayName || user?.primaryEmail?.split("@")[0] || "anon")
    .replace(/\s+/g, "")
    .slice(0, 24);

  const quota = useQuery({
    queryKey: ["quota", user?.id],
    queryFn: () => getQuota(),
    enabled: Boolean(user),
    staleTime: 10_000,
  });
  const blocked = Boolean(user && quota.data && quota.data.remaining <= 0);

  const envelope = useMemo(
    () =>
      buildEnvelope({
        handle,
        destination,
        message: message || "…",
        vow: vow || undefined,
      }),
    [handle, destination, message, vow],
  );

  async function queueNow(session: AppUser) {
    setBusy(true);
    try {
      const row = await transmit({
        data: {
          destination,
          message,
          vow,
          handle: (session.displayName || session.primaryEmail?.split("@")[0] || "anon")
            .replace(/\s+/g, "")
            .slice(0, 24),
          displayName: session.displayName || handle,
          avatarUrl: session.profileImageUrl,
          stamp,
          trap,
        },
      });
      clearDraft();
      pendingQueue.current = false;
      try {
        window.sessionStorage.removeItem(STAMP_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      toast.success(`Queued ${row.id}`);
      void navigate({ to: "/signal/$id", params: { id: row.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transmit failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !user || busy || !pendingQueue.current) return;
    if (!message.trim() || !stamp) return;
    const age = Date.now() - Number(stamp.split(".")[0]);
    const wait = Math.max(0, STAMP_MIN_AGE_MS + 50 - (Number.isFinite(age) ? age : 0));
    const t = window.setTimeout(() => {
      if (!pendingQueue.current) return;
      pendingQueue.current = false;
      void queueNow(user);
    }, wait);
    return () => window.clearTimeout(t);
    // queue after OAuth restore — message/user are the restored draft + session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, message, busy, stamp]);

  function beginSignIn(providerId: string) {
    saveDraft({
      destination,
      message,
      vow,
      autoQueue: Boolean(message.trim()),
    });
    pendingQueue.current = Boolean(message.trim());
    void signIn(providerId, { callbackURL: "/transmit" }).catch((err) => {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user) return;
    if (!message.trim()) return;
    saveDraft({ destination, message, vow, autoQueue: true });
    pendingQueue.current = true;
    void navigate({ to: "/login" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Compose</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Send it to Mars.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Free. We pay. Sign in with X or Google — we inscribe your words on
          Dogecoin. No wallet. One shot per Earth day. FTW.
        </p>
        <PostageMark className="mt-4" />
        {blocked ? (
          <p className="mt-3 text-xs text-mars">
            Today's postage is spent. Next window{" "}
            {quota.data?.nextAt
              ? new Date(quota.data.nextAt).toLocaleString()
              : "after 24h"}
            .{" "}
            <Link to="/mission" className="text-gold">
              Fund more humans
            </Link>
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="relative mt-8 space-y-6">
          <fieldset>
            <legend className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Destination
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DESTINATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDestination(d)}
                  className={
                    destination === d
                      ? "h-16 border border-gold bg-surface px-3 text-left"
                      : "h-16 border border-border bg-surface px-3 text-left hover:border-muted"
                  }
                >
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {DEST_META[d].short}
                  </div>
                  <div className="font-display text-lg">{DEST_META[d].label}</div>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Message · {message.length}/{MESSAGE_MAX}
            </span>
            <textarea
              required
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="What should still be readable when we land?"
              className="mt-2 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-sm text-fg outline-none placeholder:text-faint focus:border-gold"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Optional vow · ÐVow · {vow.length}/{VOW_MAX}
            </span>
            <input
              maxLength={VOW_MAX}
              value={vow}
              onChange={(e) => setVow(e.target.value)}
              placeholder="Still here when we land."
              className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none placeholder:text-faint focus:border-gold"
            />
          </label>

          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Fax
              <input
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </label>
          </div>

          {user ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <StampButton
                  disabled={busy || blocked || !message.trim()}
                  busy={busy}
                  label={blocked ? "Quota used" : "Hold to stamp — 0 Ð"}
                  busyLabel="Stamping…"
                  onStamp={() => {
                    if (blocked) {
                      toast.error("One free signal per Earth day.");
                      return;
                    }
                    void queueNow(user);
                  }}
                />
                <Link
                  to="/mission"
                  className="inline-flex h-11 items-center border border-border px-4 text-[12px] uppercase tracking-[0.16em] text-muted hover:text-fg"
                >
                  Why we pay
                </Link>
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-faint">
                Much wow. Hold until the gold fills.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Sign in to send. We pay the Dogecoin postage. Your draft stays
                in this tab.
              </p>
              {authEnabled && providers.length ? (
                providers.map((p) => (
                    <button
                      key={p.providerId}
                      type="button"
                      disabled={isPending || busy || !message.trim()}
                      onClick={() => beginSignIn(p.providerId)}
                      className="flex h-12 w-full items-center justify-center border border-border bg-surface text-[12px] uppercase tracking-[0.18em] transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                    >
                      {p.providerId === "twitter" || p.label === "X"
                        ? "Sign in with X — we pay"
                        : `Continue with ${p.label} — free`}
                    </button>
                  ))
              ) : authEnabled ? (
                <p className="text-xs text-muted">
                  Sign-in on this host needs Google / X credentials. The Grok
                  preview client cannot redirect to wow.dogenals.com.
                </p>
              ) : (
                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  className="inline-flex h-11 items-center bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.18em] text-bg disabled:opacity-40 hover:bg-gold-hot"
                >
                  Queue inscription — free
                </button>
              )}
              <Link
                to="/mission"
                className="inline-flex h-11 items-center text-[12px] uppercase tracking-[0.16em] text-muted hover:text-fg"
              >
                Why it's free
              </Link>
            </div>
          )}
        </form>
      </div>

      <div className="lg:pt-10">
        <Postcard envelope={envelope} />
        <div className="mt-3">
          <Envelope envelope={envelope} />
        </div>
        <p className="mt-3 text-xs text-faint">
          The postcard is what lands on Dogecoin —{" "}
          <span className="text-muted">image/svg+xml</span>. JSON in{" "}
          <span className="text-muted">{"<metadata>"}</span> is how dogex
          reads it. Marker <span className="text-muted">dog</span>.
        </p>
      </div>
    </div>
  );
}
