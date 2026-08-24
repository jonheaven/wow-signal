/** Client-safe helpers for the login / transmit buttons. */

export type SignInButton = {
  providerId: string;
  label: string;
};

export function readProviders(
  data: { providers?: SignInButton[] } | null | undefined,
): SignInButton[] {
  return Array.isArray(data?.providers) ? data.providers : [];
}

/** X is the production default on wow.dogenals.com when the options loader 530s. */
export const FALLBACK_X: SignInButton[] = [
  { providerId: "twitter", label: "X" },
];
