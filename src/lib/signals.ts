import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  DESTINATIONS,
  MESSAGE_MAX,
  VOW_MAX,
  type Destination,
  type Transmission,
} from "@/lib/protocol";
import { TREASURY, nextQuotaAt } from "@/lib/treasury";

function commandDogBase(): string {
  const raw =
    process.env.COMMAND_DOG_API_URL ||
    process.env.VITE_COMMAND_DOG_API_URL ||
    "http://127.0.0.1:3000";
  return raw.replace(/\/$/, "");
}

async function commandDog<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${commandDogBase()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error: text };
  }
  if (!res.ok) {
    const err =
      json && typeof json === "object" && "error" in json
        ? String((json as { error: unknown }).error)
        : `command.dog ${res.status}`;
    throw new Error(err);
  }
  return json as T;
}

function sumWows(rows: Transmission[]): number {
  return rows.reduce((n, s) => n + (Number(s.wows) || 0), 0);
}

export const listTransmissions = createServerFn({ method: "GET" })
  .validator((input?: { dest?: string; limit?: number }) => input ?? {})
  .handler(async ({ data }) => {
    const limit = Math.min(Math.max(data.limit ?? 40, 1), 80);
    const dest = DESTINATIONS.includes(data.dest as Destination)
      ? (data.dest as Destination)
      : null;
    const qs = new URLSearchParams({ limit: String(limit) });
    if (dest) qs.set("dest", dest);
    return commandDog<Transmission[]>(`/v1/wow/wall?${qs}`);
  });

export const getTransmission = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    try {
      return await commandDog<Transmission>(
        `/v1/wow/signal/${encodeURIComponent(id)}`,
      );
    } catch {
      return null;
    }
  });

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const stats = await commandDog<{
    total: number;
    mars: number;
    energy: number;
  }>("/v1/wow/stats");
  // command.dog stats() used to sum only the in-memory wow HashMap, so seed
  // rows (Kabosu 42069, …) reported energy 0. Prefer the API; fall back to
  // the wall's `wows` fields when energy is still empty.
  if ((stats.energy ?? 0) > 0) return stats;
  try {
    const wall = await commandDog<Transmission[]>("/v1/wow/wall?limit=80");
    return { ...stats, energy: sumWows(wall) };
  } catch {
    return stats;
  }
});

export const getQuota = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const qs = new URLSearchParams({ user_id: context.userId });
    const rows = await commandDog<Transmission[]>(`/v1/wow/mine?${qs}`).catch(
      () => [] as Transmission[],
    );
    const last = rows[0];
    if (!last) {
      return { remaining: TREASURY.dailyPerHuman, nextAt: null as string | null };
    }
    const next = nextQuotaAt(last.createdAt);
    if (Date.now() >= next.getTime()) {
      return { remaining: TREASURY.dailyPerHuman, nextAt: null as string | null };
    }
    return { remaining: 0, nextAt: next.toISOString() };
  });

export const getTreasuryPulse = createServerFn({ method: "GET" }).handler(
  async () => {
    const stats = await getStats().catch(() => ({ total: 0 }));
    return {
      sponsored: Number(stats.total ?? 0),
      address: TREASURY.address,
      label: TREASURY.label,
    };
  },
);

export const listMine = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const qs = new URLSearchParams({ user_id: context.userId });
    return commandDog<Transmission[]>(`/v1/wow/mine?${qs}`);
  });

export const transmit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      destination: Destination;
      message: string;
      vow?: string;
      handle?: string;
      displayName?: string;
      avatarUrl?: string | null;
      stamp?: string;
      trap?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { assertStamp } = await import("./stamp-crypto");
    assertStamp(data.stamp, data.trap);

    const message = data.message.trim();
    if (!message) throw new Error("Message is empty.");
    if (message.length > MESSAGE_MAX) throw new Error("Message exceeds 280.");
    if (!DESTINATIONS.includes(data.destination)) {
      throw new Error("Unknown destination.");
    }
    const vow = data.vow?.trim() ?? "";
    if (vow.length > VOW_MAX) throw new Error("Vow exceeds 120.");

    const qs = new URLSearchParams({ user_id: context.userId });
    const mine = await commandDog<Transmission[]>(`/v1/wow/mine?${qs}`).catch(
      () => [] as Transmission[],
    );
    const last = mine[0];
    if (last) {
      const next = nextQuotaAt(last.createdAt);
      if (Date.now() < next.getTime()) {
        throw new Error(
          `One free signal per Earth day. Next window ${next.toUTCString()}.`,
        );
      }
      if (last.message.trim().toLowerCase() === message.toLowerCase()) {
        throw new Error("That signal is already on the wall.");
      }
    }

    const handle = (data.handle || "anon")
      .replace(/^@/, "")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 24) || "anon";
    const displayName = (data.displayName || handle).slice(0, 48);
    return commandDog<Transmission>("/v1/wow/queue", {
      method: "POST",
      body: JSON.stringify({
        destination: data.destination,
        message,
        vow: vow || undefined,
        handle,
        display_name: displayName,
        avatar_url: data.avatarUrl ?? null,
        user_id: context.userId,
      }),
    });
  });

export const wowSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    return commandDog<Transmission>("/v1/wow/wow", {
      method: "POST",
      body: JSON.stringify({ id, user_id: context.userId }),
    });
  });

export const briefSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    return commandDog<Transmission>("/v1/wow/brief", {
      method: "POST",
      body: JSON.stringify({ id, user_id: context.userId }),
    });
  });

export const getChainTip = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const tip = await commandDog<{ height: number; source: string }>(
      "/v1/wow/tip",
    );
    if (typeof tip.height === "number" && tip.height > 0) {
      return {
        height: tip.height,
        source: tip.source === "dogex" || tip.source === "core" ? "live" : tip.source,
      };
    }
  } catch {
    /* fall through */
  }
  const minutes = Math.floor(Date.now() / 60_000);
  return {
    height: 6_620_000 + (minutes % 10_000),
    source: "estimate" as const,
  };
});
