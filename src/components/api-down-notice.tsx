import { useCallback, useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

const ACK_KEY = "wow-signal-api-down-ack";
const POLL_MS = 20_000;

function readAck(): boolean {
  try {
    return window.sessionStorage.getItem(ACK_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAck(): void {
  try {
    window.sessionStorage.setItem(ACK_KEY, "1");
  } catch {
    /* private mode */
  }
}

function clearAck(): void {
  try {
    window.sessionStorage.removeItem(ACK_KEY);
  } catch {
    /* ignore */
  }
}

function commandDogHealthUrl(): string {
  const raw = (import.meta.env.VITE_COMMAND_DOG_API_URL as string | undefined)?.trim();
  const pageLocal = /localhost|127\.0\.0\.1/i.test(window.location.hostname);
  const configuredLocal = raw ? /localhost|127\.0\.0\.1/i.test(raw) : true;
  const base =
    !pageLocal && configuredLocal
      ? "https://api.command.dog"
      : (raw || "https://api.command.dog").replace(/\/$/, "");
  return `${base}/health`;
}

async function pingOk(url: string, timeoutMs = 8_000): Promise<boolean> {
  const ac = new AbortController();
  const timer = window.setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export function ApiDownNotice() {
  const [down, setDown] = useState(false);
  const [acked, setAcked] = useState(() => readAck());

  const runProbe = useCallback(async () => {
    const ok = await pingOk(commandDogHealthUrl());
    setDown(!ok);
    if (ok) {
      clearAck();
      setAcked(false);
    }
  }, []);

  useEffect(() => {
    void runProbe();
    const id = window.setInterval(() => void runProbe(), POLL_MS);
    const onFocus = () => void runProbe();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [runProbe]);

  const open = down && !acked;
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wow-api-down-title"
    >
      <div className="w-full max-w-md rounded-t-2xl border border-gold/40 bg-surface p-5 text-fg shadow-2xl sm:rounded-2xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center border border-danger/40 bg-danger/15 text-danger">
            <WifiOff size={16} aria-hidden />
          </span>
          <h3 id="wow-api-down-title" className="font-display text-lg">
            Live APIs are unreachable
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          command.dog is not responding. The wall and transmit flow may look empty until the
          backend is back.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          You can keep browsing. Don’t treat a blank wall as “no one has transmitted.”
        </p>
        <button
          type="button"
          className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center bg-gold px-4 text-[12px] font-medium uppercase tracking-[0.18em] text-bg hover:bg-gold-hot"
          onClick={() => {
            writeAck();
            setAcked(true);
          }}
        >
          OK — I’ll browse anyway
        </button>
      </div>
    </div>
  );
}
