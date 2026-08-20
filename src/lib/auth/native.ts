/**
 * Self-hosted production auth (wow.dogenals.com).
 *
 * The baked `grok_preview` client only allows `*.grok-sandbox.com` callbacks.
 * On a custom domain it must NEVER be used — that's the "Invalid redirect URI"
 * / "Grok Build wants to access your account" failure.
 *
 * Production: register Google + X apps whose redirect URIs are this origin's
 * Better Auth callbacks, then set GOOGLE_* and TWITTER_* (or X_*) env vars.
 */
import { GROK_PROVIDERS } from "./providers";

export type SignInOption = {
  providerId: string;
  label: string;
  kind: "grok" | "social";
};

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

export function googleCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function twitterCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = env("TWITTER_CLIENT_ID") ?? env("X_CLIENT_ID");
  const clientSecret = env("TWITTER_CLIENT_SECRET") ?? env("X_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** Preview client is only valid on sandbox / loopback. */
export function grokPreviewSafe(baseURL: string | undefined): boolean {
  if (!baseURL) return true;
  try {
    const host = new URL(baseURL).hostname;
    return (
      host.endsWith(".grok-sandbox.com") ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]"
    );
  } catch {
    return false;
  }
}

export function listSignInOptions(input: {
  grokBroker: boolean;
  previewSafe: boolean;
}): SignInOption[] {
  const social: SignInOption[] = [];
  if (googleCredentials()) {
    social.push({ providerId: "google", label: "Google", kind: "social" });
  }
  if (twitterCredentials()) {
    social.push({ providerId: "twitter", label: "X", kind: "social" });
  }
  if (social.length) return social;
  if (input.grokBroker && input.previewSafe) {
    return GROK_PROVIDERS.map((p) => ({
      providerId: p.providerId,
      label: p.label,
      kind: "grok" as const,
    }));
  }
  return [];
}
