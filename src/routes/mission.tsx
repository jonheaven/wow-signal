import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Radio } from "lucide-react";
import { TREASURY } from "@/lib/treasury";
import { getTreasuryPulse } from "@/lib/signals";

export const Route = createFileRoute("/mission")({
  loader: async () => {
    const pulse = await getTreasuryPulse().catch(() => ({
      sponsored: 0,
      address: TREASURY.address,
      label: TREASURY.label,
    }));
    return { pulse };
  },
  component: MissionPage,
});

function MissionPage() {
  const initial = Route.useLoaderData();
  const pulse = useQuery({
    queryKey: ["treasury"],
    queryFn: () => getTreasuryPulse(),
    initialData: initial.pulse,
    refetchInterval: 15_000,
  });
  const data = pulse.data ?? initial.pulse;
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(TREASURY.address);
      setCopied(true);
      toast.success("Treasury address copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="space-y-14">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
          Free for you · Funded by the pack
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-6xl">
          Send a message to Mars.
          <br />
          We cover the stamp.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Sign in. Write 280 characters. The treasury inscribes it on
          Dogecoin. You never buy crypto. The pack keeps the faucet on —
          millions of stamps still add up, and this is not a one-wallet job.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat k="Signals sponsored" v={String(data.sponsored)} h="this ledger" />
        <Stat k="Faucet" v="On" h="while the pot lasts" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-gold/50 bg-surface p-5 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
            Postage pot
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight">
            Help keep it free
          </h2>
          <p className="mt-3 text-sm text-muted">
            Every transmission is a real Dogecoin write. We pay so strangers
            don't have to. If you think Earth's outbound log should
            stay open, throw Ð in the pot. If the pot runs dry, the faucet
            pauses. That's the deal.
          </p>

          <div className="mt-6 border border-border bg-bg px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-faint">
              {TREASURY.network} · {TREASURY.label}
            </div>
            <div className="mt-2 break-all font-mono text-sm text-paper">
              {TREASURY.address}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              Preview address — do not send real DOGE here. Live treasury
              ships with wow.dogenals.com.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void copyAddress()}
            className="mt-4 inline-flex h-11 items-center gap-2 bg-gold px-5 text-[12px] font-medium uppercase tracking-[0.18em] text-bg hover:bg-gold-hot"
          >
            <Copy className="size-4" />
            {copied ? "Copied" : "Copy address"}
          </button>
        </div>

        <div>
          <h2 className="font-display text-2xl tracking-tight">The split</h2>
          <div className="mt-5 grid gap-4">
            <Rule
              n="Writers"
              t="Pay nothing"
              b="X or Google. One signal per Earth day. We inscribe it."
            />
            <Rule
              n="The pack"
              t="Fill the pot"
              b="Shibes, humans, anyone who wants the wall to stay open. Any Ð. No amount too small, and we need more than one wallet."
            />
            <Rule
              n="The desk"
              t="Pause if we have to"
              b="If postage runs out or the mempool blows up, the faucet stops. Nobody is on an open tab."
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
          If the pot overflows
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          Postage first. Then we go further.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Surplus is not a slush fund. Stamps for the wall always come first.
          What's left goes back into the species — more of this, then
          the next thing.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Rule
            n="01"
            t="Keep the faucet on"
            b="Every queued message gets inscribed. Buffer so a busy week doesn't kill the wall."
          />
          <Rule
            n="02"
            t="Widen it"
            b="More free signals. Mission patches on the house. The book gets louder without asking writers to pay."
          />
          <Rule
            n="03"
            t="Give it back"
            b="Airdrops to the wall. A printed archive. Beam the log when something actually leaves Earth. The next public thing — funded in the open."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/transmit"
          className="inline-flex h-11 items-center gap-2 bg-gold px-5 text-[12px] font-medium uppercase tracking-[0.18em] text-bg hover:bg-gold-hot"
        >
          <Radio className="size-4" />
          Transmit — 0 Ð
        </Link>
        <Link
          to="/stack"
          className="inline-flex h-11 items-center border border-border px-5 text-[12px] uppercase tracking-[0.16em] text-muted hover:text-fg"
        >
          How the stack settles
        </Link>
      </div>
    </div>
  );
}

function Stat({ k, v, h }: { k: string; v: string; h: string }) {
  return (
    <div className="border border-border bg-surface px-4 py-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{k}</div>
      <div className="mt-1 font-display text-3xl tabular-nums tracking-tight">{v}</div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-faint">{h}</div>
    </div>
  );
}

function Rule({ n, t, b }: { n: string; t: string; b: string }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold">{n}</div>
      <h3 className="mt-2 font-display text-xl">{t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
    </div>
  );
}
