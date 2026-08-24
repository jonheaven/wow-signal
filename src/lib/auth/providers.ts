/**
 * Sign-in providers shown in the UI (X + Google).
 *
 * Production (wow.dogenals.com) uses Better Auth **social** providers with
 * OAuth 2.0 client id/secret from env (`X_CLIENT_ID` / `GOOGLE_CLIENT_ID`).
 * The Grok auth broker remains an optional fallback when `GROK_AUTH_CLIENT_ID`
 * is set (sandbox / grok-sandbox.com).
 *
 * Better Auth's id for X is still `twitter` (callback `/api/auth/callback/twitter`).
 */
export type AuthProvider = {
  providerId: "twitter" | "google";
  label: string;
};

export const AUTH_PROVIDERS: readonly AuthProvider[] = [
  { providerId: "twitter", label: "X" },
  { providerId: "google", label: "Google" },
];

/** @deprecated Use AUTH_PROVIDERS. Kept so older grok-broker call sites type-check. */
export type GrokProvider = {
  providerId: string;
  idp: string;
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [
  { providerId: "grok-google", idp: "google", label: "Google" },
  { providerId: "grok-x", idp: "twitter", label: "X" },
];

export function isSocialProvider(providerId: string): providerId is "twitter" | "google" {
  return providerId === "twitter" || providerId === "google";
}
