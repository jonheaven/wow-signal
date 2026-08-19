import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  DESTINATIONS,
  MESSAGE_MAX,
  VOW_MAX,
  buildEnvelope,
  makeId,
  type Destination,
  type Transmission,
  type TransmissionStatus,
  type WowEnvelope,
} from "@/lib/protocol";

type Row = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  destination: string;
  message: string;
  vow: string | null;
  envelope: WowEnvelope | string;
  status: string;
  wows: number;
  briefing: string | null;
  is_seed: boolean;
  created_at: string;
};

function parseEnvelope(raw: WowEnvelope | string): WowEnvelope {
  if (typeof raw === "string") return JSON.parse(raw) as WowEnvelope;
  return raw;
}

function toTransmission(row: Row, wowedByMe = false): Transmission {
  return {
    id: row.id,
    userId: row.user_id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    destination: row.destination as Destination,
    message: row.message,
    vow: row.vow,
    envelope: parseEnvelope(row.envelope),
    status: row.status as TransmissionStatus,
    wows: Number(row.wows),
    briefing: row.briefing,
    isSeed: Boolean(row.is_seed),
    createdAt:
      typeof row.created_at === "string"
        ? row.created_at
        : new Date(row.created_at).toISOString(),
    wowedByMe,
  };
}

const SEED: Array<{
  id: string;
  handle: string;
  displayName: string;
  destination: Destination;
  message: string;
  vow?: string;
  hoursAgo: number;
  wows: number;
}> = [
  {
    id: "WOW-000001",
    handle: "kabosu",
    displayName: "Kabosu",
    destination: "humanity",
    message: "much wow. first signal from earth.",
    hoursAgo: 96,
    wows: 42069,
  },
  {
    id: "WOW-000002",
    handle: "dogenals",
    displayName: "Dogenals",
    destination: "mars",
    message: "If you are reading this on Mars, we made it.",
    vow: "Still here when we land.",
    hoursAgo: 72,
    wows: 1337,
  },
  {
    id: "WOW-000003",
    handle: "jontype",
    displayName: "Jon",
    destination: "humanity",
    message: "We chose the cheap chain so everyone could speak.",
    hoursAgo: 48,
    wows: 888,
  },
  {
    id: "WOW-000004",
    handle: "watchdoge",
    displayName: "WatchDoge",
    destination: "earth",
    message: "1 DOGE = 1 DOGE. Always was.",
    hoursAgo: 36,
    wows: 690,
  },
  {
    id: "WOW-000005",
    handle: "dogex",
    displayName: "DogeX",
    destination: "moon",
    message: "Replay the blocks. Same rules. Same truth.",
    hoursAgo: 24,
    wows: 256,
  },
  {
    id: "WOW-000006",
    handle: "commanddog",
    displayName: "command.dog",
    destination: "mars",
    message: "Do not wait for permission to build.",
    hoursAgo: 12,
    wows: 194,
  },
  {
    id: "WOW-000007",
    handle: "dojak",
    displayName: "Dojak",
    destination: "earth",
    message: "The keys stay with the dog.",
    hoursAgo: 6,
    wows: 108,
  },
  {
    id: "WOW-000008",
    handle: "elon",
    displayName: "Mission Control",
    destination: "mars",
    message: "The currency of Earth. Aimed at the sky.",
    vow: "Won't abandon the species.",
    hoursAgo: 3,
    wows: 69420,
  },
];

async function ensureSeed() {
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from transmissions`;
  if ((existing[0]?.n ?? 0) > 0) return;

  const now = Date.now();
  for (const s of SEED) {
    const ts = now - s.hoursAgo * 3600_000;
    const envelope = buildEnvelope({
      handle: s.handle,
      destination: s.destination,
      message: s.message,
      vow: s.vow,
      ts,
    });
    await sql`
      insert into transmissions (
        id, user_id, handle, display_name, destination, message, vow,
        envelope, status, wows, is_seed, created_at
      ) values (
        ${s.id}, ${`seed:${s.handle}`}, ${s.handle}, ${s.displayName},
        ${s.destination}, ${s.message}, ${s.vow ?? null},
        ${JSON.stringify(envelope)}::jsonb, ${"seed"}, ${s.wows}, ${true},
        ${new Date(ts).toISOString()}
      )
      on conflict (id) do nothing
    `;
  }
}

export const listTransmissions = createServerFn({ method: "GET" })
  .validator((input?: { dest?: string; limit?: number }) => input ?? {})
  .handler(async ({ data }) => {
    await ensureSeed();
    const sql = await getSql();
    const limit = Math.min(Math.max(data.limit ?? 40, 1), 80);
    const dest = DESTINATIONS.includes(data.dest as Destination)
      ? (data.dest as Destination)
      : null;

    const rows = dest
      ? await sql<Row>`
          select * from transmissions
          where destination = ${dest}
          order by created_at desc
          limit ${limit}
        `
      : await sql<Row>`
          select * from transmissions
          order by created_at desc
          limit ${limit}
        `;

    return rows.map((r) => toTransmission(r));
  });

export const getTransmission = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<Row>`select * from transmissions where id = ${id} limit 1`;
    if (!rows[0]) return null;
    return toTransmission(rows[0]);
  });

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const [counts] = await sql<{
    total: number;
    mars: number;
    energy: number;
  }>`
    select
      count(*)::int as total,
      count(*) filter (where destination = 'mars')::int as mars,
      coalesce(sum(wows), 0)::int as energy
    from transmissions
  `;
  return {
    total: Number(counts?.total ?? 0),
    mars: Number(counts?.mars ?? 0),
    energy: Number(counts?.energy ?? 0),
  };
});

export const listMine = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select * from transmissions
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map((r) => toTransmission(r));
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
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const message = data.message.trim();
    if (!message) throw new Error("Message is empty.");
    if (message.length > MESSAGE_MAX) throw new Error("Message exceeds 280.");
    if (!DESTINATIONS.includes(data.destination)) {
      throw new Error("Unknown destination.");
    }
    const vow = data.vow?.trim() ?? "";
    if (vow.length > VOW_MAX) throw new Error("Vow exceeds 120.");

    const handle = (data.handle || "anon")
      .replace(/^@/, "")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 24) || "anon";
    const displayName = (data.displayName || handle).slice(0, 48);
    const envelope = buildEnvelope({
      handle,
      destination: data.destination,
      message,
      vow: vow || undefined,
    });
    const id = makeId();
    const sql = await getSql();
    await sql`
      insert into transmissions (
        id, user_id, handle, display_name, avatar_url, destination, message, vow,
        envelope, status, wows, is_seed
      ) values (
        ${id}, ${context.userId}, ${handle}, ${displayName}, ${data.avatarUrl ?? null},
        ${data.destination}, ${message}, ${vow || null},
        ${JSON.stringify(envelope)}::jsonb, ${"queued"}, ${0}, ${false}
      )
    `;
    const rows = await sql<Row>`select * from transmissions where id = ${id}`;
    return toTransmission(rows[0]!);
  });

export const wowSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const exists = await sql<{ id: string }>`select id from transmissions where id = ${id}`;
    if (!exists[0]) throw new Error("Signal not found.");

    const already = await sql<{ user_id: string }>`
      select user_id from transmission_wows
      where transmission_id = ${id} and user_id = ${context.userId}
    `;
    if (already[0]) {
      const rows = await sql<Row>`select * from transmissions where id = ${id}`;
      return toTransmission(rows[0]!, true);
    }

    await sql`
      insert into transmission_wows (transmission_id, user_id)
      values (${id}, ${context.userId})
    `;
    await sql`update transmissions set wows = wows + 1 where id = ${id}`;
    const rows = await sql<Row>`select * from transmissions where id = ${id}`;
    return toTransmission(rows[0]!, true);
  });

export const briefSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select * from transmissions where id = ${id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) throw new Error("Only the sender can request a briefing.");
    if (row.briefing) return toTransmission(row);

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("Grok is not available in this environment.");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "You are Mission Control for WOW SIGNAL, humanity's guestbook inscribed on Dogecoin and aimed at Mars. Write a 2-sentence mission briefing for this transmission. Dry, cinematic, no emoji, no hashtags, no marketing fluff.",
          },
          {
            role: "user",
            content: `Destination: ${row.destination}\nFrom: @${row.handle}\nMessage: ${row.message}${row.vow ? `\nVow: ${row.vow}` : ""}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`xAI error ${res.status}`);
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const text = body.choices[0]?.message.content?.trim() ?? "";
    if (!text) throw new Error("Empty briefing.");

    await sql`update transmissions set briefing = ${text} where id = ${id}`;
    const updated = await sql<Row>`select * from transmissions where id = ${id}`;
    return toTransmission(updated[0]!);
  });

export const getChainTip = createServerFn({ method: "GET" }).handler(async () => {
  const fallback = () => {
    const minutes = Math.floor(Date.now() / 60_000);
    return {
      height: 6_620_000 + (minutes % 10_000),
      source: "estimate" as const,
    };
  };

  try {
    const res = await fetch("https://api.blockcypher.com/v1/doge/main", {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return fallback();
    const json = (await res.json()) as { height?: number };
    if (typeof json.height === "number" && json.height > 1_000_000) {
      return { height: json.height, source: "blockcypher" as const };
    }
    return fallback();
  } catch {
    return fallback();
  }
});
