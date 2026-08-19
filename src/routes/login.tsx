import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Access</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Sign in</h1>
      <p className="mt-3 text-sm text-muted">
        X is the native identity for Ð𝕏. Google works too. Your handle becomes
        the callsign on the envelope.
      </p>

      <div className="mt-8 space-y-3">
        {authEnabled ? (
          GROK_PROVIDERS.slice()
            .reverse()
            .map((p) => (
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

      <Link to="/" className="mt-8 inline-block text-xs uppercase tracking-[0.16em] text-faint hover:text-muted">
        Back to beacon
      </Link>
    </div>
  );
}
