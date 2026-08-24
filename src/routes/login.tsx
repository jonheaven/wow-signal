import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authEnabled, signIn } from "@/lib/auth/client";
import { getSignInOptions } from "@/lib/auth/options";
import { FALLBACK_X, readProviders } from "@/lib/auth/sign-in-ui";
import { hasDraftMessage } from "@/lib/draft";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  loader: async () => ({
    providers: await getSignInOptions().catch(() => []),
  }),
  component: LoginPage,
});

function LoginPage() {
  const loaded = readProviders(Route.useLoaderData());
  const optionsQuery = useQuery({
    queryKey: ["wow-sign-in-options"],
    queryFn: () => getSignInOptions(),
    initialData: loaded.length ? loaded : undefined,
    retry: 5,
    retryDelay: 2000,
  });
  const providers = optionsQuery.data?.length ? optionsQuery.data : loaded;
  const shown = providers.length ? providers : FALLBACK_X;
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
        {authEnabled ? (
          shown.map((p) => (
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
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>

      <Link to="/transmit" className="mt-8 inline-block text-xs uppercase tracking-[0.16em] text-faint hover:text-muted">
        {draftWaiting ? "Back to draft" : "Write first, sign in later"}
      </Link>
    </div>
  );
}
