export const DESTINATIONS = ["earth", "moon", "mars", "humanity"] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const DEST_META: Record<
  Destination,
  { label: string; short: string; lightMs: number; token: string }
> = {
  earth: { label: "Earth", short: "EAR", lightMs: 0, token: "earth" },
  moon: { label: "Moon", short: "LUN", lightMs: 1280, token: "moon" },
  mars: { label: "Mars", short: "MRS", lightMs: 182_000, token: "mars" },
  humanity: { label: "Humanity", short: "HUM", lightMs: 0, token: "gold" },
};

export type TransmissionStatus = "queued" | "mempool" | "confirmed" | "seed";

export type Transmission = {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  destination: Destination;
  message: string;
  vow: string | null;
  envelope: WowEnvelope;
  status: TransmissionStatus;
  wows: number;
  briefing: string | null;
  isSeed: boolean;
  createdAt: string;
  wowedByMe?: boolean;
};

export type WowEnvelope = {
  p: "Ð:WOW";
  op: "send";
  to: Destination;
  msg: string;
  x: string;
  ts: number;
  vow?: string;
};

export function buildEnvelope(input: {
  handle: string;
  destination: Destination;
  message: string;
  vow?: string;
  ts?: number;
}): WowEnvelope {
  const env: WowEnvelope = {
    p: "Ð:WOW",
    op: "send",
    to: input.destination,
    msg: input.message.trim(),
    x: input.handle.startsWith("@") ? input.handle : `@${input.handle}`,
    ts: input.ts ?? Date.now(),
  };
  if (input.vow?.trim()) env.vow = input.vow.trim();
  return env;
}

export function callsign(handle: string): string {
  const clean = handle.replace(/^@/, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `Ð/${clean.slice(0, 10) || "ANON"}`;
}

export function makeId(): string {
  const n = Math.floor(Math.random() * 36 ** 6)
    .toString(36)
    .toUpperCase()
    .padStart(6, "0");
  return `WOW-${n}`;
}

export const MESSAGE_MAX = 280;
export const VOW_MAX = 120;
