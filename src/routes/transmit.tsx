import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Envelope } from "@/components/envelope";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { clearDraft, readDraft, saveDraft } from "@/lib/draft";
import {
  DESTINATIONS,
  DEST_META,
  MESSAGE_MAX,
  VOW_MAX,
  buildEnvelope,
  callsign,
  type Destination,
} from "@/lib/protocol";
import { transmit } from "@/lib/signals";

export const Route = createFileRoute("/transmit")({ component: TransmitPage });

function TransmitPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination>("mars");
  const [message, setMessage] = useState("");
  const [vow, setVow] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pendingQueue = useRef(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setDestination(draft.destination);
      setMessage(draft.message);
      setVow(draft.vow);
      pendingQueue.current = Boolean(draft.autoQueue);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft({ destination, message, vow, autoQueue: pendingQueue.current });
  }, [destination, message, vow, hydrated]);

  const handle = (user?.displayName || user?.primaryEmail?.split("@")[0] || "anon")
    .replace(/\s+/g, "")
    .slice(0, 24);

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
        },
      });
      clearDraft();
      pendingQueue.current = false;
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
    if (!message.trim()) return;
    pendingQueue.current = false;
    void queueNow(user);
    // queue after OAuth restore — message/user are the restored draft + session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, message, busy]);

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
    if (!message.trim()) return;
    if (user) {
      await queueNow(user);
      return;
    }
    saveDraft({ destination, message, vow, autoQueue: true });
    pendingQueue.current = true;
    void navigate({ to: "/login" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Compose</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Transmit</h1>
        <p className="mt-2 text-sm text-muted">
          Callsign {callsign(handle)}. Write first
          {user ? "" : " — sign in when you queue"}. Settles on{" "}
          <span className="text-fg">command.dog /v1/wow</span>. Postage and
          commit–reveal still go through inscribe-jobs; dogex indexes the
          confirmed inscription.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
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

          {user ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy || !message.trim()}
                className="inline-flex h-11 items-center bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.18em] text-bg disabled:opacity-40 hover:bg-gold-hot"
              >
                {busy ? "Queuing…" : "Queue inscription"}
              </button>
              <Link
                to="/stack"
                className="inline-flex h-11 items-center border border-border px-4 text-[12px] uppercase tracking-[0.16em] text-muted hover:text-fg"
              >
                How it settles
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Sign in to queue this on Dogecoin. Your draft stays in this tab.
              </p>
              {authEnabled ? (
                GROK_PROVIDERS.slice()
                  .reverse()
                  .map((p) => (
                    <button
                      key={p.providerId}
                      type="button"
                      disabled={isPending || busy || !message.trim()}
                      onClick={() => beginSignIn(p.providerId)}
                      className="flex h-12 w-full items-center justify-center border border-border bg-surface text-[12px] uppercase tracking-[0.18em] transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                    >
                      {p.idp === "twitter"
                        ? "Sign in with X to queue"
                        : `Continue with ${p.label}`}
                    </button>
                  ))
              ) : (
                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  className="inline-flex h-11 items-center bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.18em] text-bg disabled:opacity-40 hover:bg-gold-hot"
                >
                  Queue inscription
                </button>
              )}
              <Link
                to="/stack"
                className="inline-flex h-11 items-center text-[12px] uppercase tracking-[0.16em] text-muted hover:text-fg"
              >
                How it settles
              </Link>
            </div>
          )}
        </form>
      </div>

      <div className="lg:pt-16">
        <Envelope envelope={envelope} />
        <p className="mt-3 text-xs text-faint">
          Marker <span className="text-muted">dog</span> · protocol{" "}
          <span className="text-muted">Ð:WOW</span> · identity via Ð𝕏 ·
          engagement via ÐPulse · optional ÐVow · art via Ðrok / Grok Imagine.
        </p>
      </div>
    </div>
  );
}
