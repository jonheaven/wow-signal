/** Sponsored postage. Humans never hold a key. The treasury does. */

/**
 * Dogecoin fee model for a Ð:WOW JSON inscription (Aug 2026).
 *
 * Facts:
 * - Core recommended fee: 0.01 DOGE / kB. Min relay 0.001 DOGE/kB.
 *   https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md
 * - Soft dust 0.01 DOGE (postage output). Hard dust 0.001. Recycled on reveal.
 * - Dogecoin has no SegWit. Inscriptions live in P2SH redeem scripts
 *   (apezord/doginals, Dogenals dog-marker). Full bytes, no 4× witness discount.
 * - Envelope: OP_FALSE OP_IF "dog" <ver> <JSON/CBOR> OP_ENDIF. Body ~250 B typical,
 *   ~500 B max latin, ~1.5 kB emoji-max (2-part).
 * - Path: commit (~224 B) + reveal (~350–600 B) ≈ 600–800 serialized bytes.
 * - Today the chain is empty: ~8.7 kB blocks vs ~1 MB cap, ~26k tx/day,
 *   median fee 0.022 Ð. Quiet rate holds.
 * - 2023 doginals minters defaulted FEE_PER_KB = 1 Ð/kB (mania).
 * - DOGE ≈ $0.07 (19 Aug 2026).
 */
export const FEE = {
  dogeUsd: 0.07,
  recommendedPerKb: 0.01,
  typicalBytes: 700,
  /** Quiet chain — today's empty blocks, recommended 0.01 Ð/kB. */
  quietDoge: 0.007,
  /** Busy but not jammed — 0.1 Ð/kB. */
  busyDoge: 0.07,
  /** Inscription mania — apezord-style 1 Ð/kB. */
  maniaDoge: 0.7,
  /** In-flight P2SH postage. Working capital, not a spend. */
  lockedPerJob: 0.01,
} as const;

export const TREASURY = {
  /** Preview address. Swap for the live Dogenals treasury on wow.dogenals.com. */
  address: "DWowSignalFundPreviewDoNotSend1",
  network: "Dogecoin",
  label: "Dogenals treasury",
  postageDoge: FEE.quietDoge,
  quotaHours: 24,
  dailyPerHuman: 1,
} as const;

export const SCALE = [
  { users: 1_000, label: "1K" },
  { users: 10_000, label: "10K" },
  { users: 100_000, label: "100K" },
  { users: 1_000_000, label: "1M" },
  { users: 5_000_000, label: "5M" },
] as const;

export function costAt(users: number, per: number = FEE.quietDoge): {
  doge: number;
  usd: number;
} {
  const doge = users * per;
  return { doge, usd: doge * FEE.dogeUsd };
}

export function formatUsd(n: number): string {
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 1000) return `$${n.toFixed(0)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function signalsFromDoge(doge: number): number {
  return Math.max(0, Math.floor(doge / TREASURY.postageDoge));
}

export function formatDoge(n: number, digits = 3): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function nextQuotaAt(lastCreatedAt: string | Date): Date {
  const t = new Date(lastCreatedAt).getTime();
  return new Date(t + TREASURY.quotaHours * 3600_000);
}
