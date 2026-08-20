import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { STAMP_MAX_AGE_MS, STAMP_MIN_AGE_MS } from "@/lib/stamp-shared";

function secret(): string {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.STAMP_SECRET ||
    "wow-signal-stamp-preview"
  );
}

export function mintStamp(): string {
  const n = randomBytes(16).toString("hex");
  const t = Date.now().toString(10);
  const payload = `${t}.${n}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function assertStamp(token: string | undefined, trap: string | undefined): void {
  if (typeof trap === "string" && trap.trim().length > 0) {
    throw new Error("Could not queue.");
  }
  if (!token || token.length > 200) {
    throw new Error("Could not queue. Try again.");
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Could not queue. Try again.");
  }
  const [t, n, sig] = parts;
  if (!/^\d+$/.test(t) || !/^[0-9a-f]+$/.test(n) || !/^[0-9a-f]+$/.test(sig)) {
    throw new Error("Could not queue. Try again.");
  }
  const payload = `${t}.${n}`;
  const expect = createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expect, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Could not queue. Try again.");
  }
  const age = Date.now() - Number(t);
  if (age < STAMP_MIN_AGE_MS || age > STAMP_MAX_AGE_MS) {
    throw new Error("Could not queue. Try again.");
  }
}
