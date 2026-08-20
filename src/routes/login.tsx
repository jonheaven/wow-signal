import { createFileRoute, Link } from "@tanstack/react-router";
import { authEnabled, signIn } from "@/lib/auth/client";
import { getSignInOptions } from "@/lib/auth/options";
import { hasDraftMessage } from "@/lib/draft";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  loader: async () => ({
    providers: await getSignInOptions().catch(() => []),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { providers } = Route.useLoaderData();
  const [draftWaiting, setDraftWaiting] = useState(false);
  useEffect(() => {
    setDraftWaiting(hasDraftMessage());
  }, []);

  return (
    <div className="mx-auto max-w-md py-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Access</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm text-muted">
        {draftWaiting
          ? "Your transmission is waiting. Sign in — we pay the Dogecoin postage and queue it. No wallet."
          : "No Dogecoin required. X or Google is your callsign. We inscribe the message from the treasury."}
      </p>

      <div className="mt-8 space-y-3">
        {authEnabled && providers.length ? (
          providers.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => void signIn(p.providerId, { callbackURL: "/transmit" })}
                className="flex h-12 w-full items-center justify-center border border-border bg-surface text-[12px] uppercase tracking-[0.18em] transition-colors hover:border-gold hover:text-gold"
              >
                Continue with {p.label}
              </button>
            ))
        ) : (
          <p className="text-sm text-muted">
            Sign-in on this host needs Google and X app credentials. Preview
            OAuth only works on grok-sandbox.com — not wow.dogenals.com.
          </p>
        )}
      </div>

      <Link to="/transmit" className="mt-8 inline-block text-xs uppercase tracking-[0.16em] text-faint hover:text-muted">
        {draftWaiting ? "Back to draft" : "Write first, sign in later"}
      </Link>
    </div>
  );
}
