import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stack")({ component: StackPage });

const LAYERS = [
  {
    name: "WOW SIGNAL",
    job: "This product. The public square. Compose, read, share.",
    host: "wow.dogenals.com",
  },
  {
    name: "dogenals",
    job: "Protocol standard. Ð:WOW envelope, ÐPulse, ÐVow, Ð𝕏, marker dog.",
    host: "dogenals.com / spec",
  },
  {
    name: "command.dog",
    job: "Product backend. Inscribe jobs, Grok briefing, Ðoge𝕏ID, WatchDoge WS, Ðrok proxy.",
    host: "api.command.dog",
  },
  {
    name: "Ðrok",
    job: "Collective Ðream. Grok Imagine forges art from a Collection Constitution. Mission patches + later WOW collection.",
    host: "drok.lol · /v1/drok",
  },
  {
    name: "dogex",
    job: "Chain truth. Index confirmed Ð:WOW, proofs, broadcast, PSBT.",
    host: "dogex.command.dog",
  },
  {
    name: "electrs-doge",
    job: "UTXO and address history. Balances, not protocol state.",
    host: "electrs.command.dog",
  },
  {
    name: "Dojak",
    job: "Wallet signs the inscription. Keys stay with the user.",
    host: "wallet",
  },
];

const FLOW = [
  {
    step: "01",
    title: "Compose",
    body: "User writes a 280-character transmission and optional ÐVow. Identity from Ð𝕏 / X sign-in. Optional Ðrok mission patch from the WOW constitution.",
  },
  {
    step: "02",
    title: "Queue",
    body: "command.dog /v1/inscribe-jobs quotes postage, opens a deposit, worker builds the witness inscription with marker dog.",
  },
  {
    step: "03",
    title: "Sign",
    body: "Dojak (or Wizard / Scrypto) signs. command.dog never holds the user key.",
  },
  {
    step: "04",
    title: "Mempool",
    body: "WatchDoge WS flashes the raw tx. This UI can subscribe the same feed — no second indexer.",
  },
  {
    step: "05",
    title: "Confirm",
    body: "dogex indexes p: Ð:WOW. Explorer proves inclusion. The wall reads dogex, not Postgres, in production.",
  },
];

export function StackPage() {
  return (
    <div className="space-y-14">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
          Architecture
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          One product.
          <br />
          The stack you already have.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          WOW SIGNAL is not another protocol island. It is the consumer face
          that was missing: a cultural moment anyone understands in three
          seconds, settled by dogex, queued by command.dog, specified in
          dogenals.
        </p>
      </div>

      <div className="grid gap-3">
        {LAYERS.map((layer) => (
          <div
            key={layer.name}
            className="grid gap-1 border border-border bg-surface px-4 py-4 sm:grid-cols-[180px_1fr_auto] sm:items-center"
          >
            <div className="font-display text-lg">{layer.name}</div>
            <p className="text-sm text-muted">{layer.job}</p>
            <div className="text-[11px] uppercase tracking-[0.16em] text-faint">
              {layer.host}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl tracking-tight">Settlement path</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {FLOW.map((f) => (
            <div key={f.step} className="border-t border-border pt-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold">{f.step}</div>
              <h3 className="mt-2 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-display text-2xl tracking-tight">Why this, not another DEX</h2>
        <div className="mt-4 grid gap-6 text-sm text-muted md:grid-cols-2">
          <p>
            You already have markets (ÐMP), launches (ÐLaunch), games
            (ÐLotto), identity (Ð𝕏), chat (doge.cam), collective art (Ðrok),
            and an indexer that can replay the chain. What you did not have
            is a reason for someone who does not care about UTXOs to open a
            tab today.
          </p>
          <p>
            A guestbook aimed at Mars is that reason. Elon-screenshotable.
            Normie-complete in one sentence. Every send is a real Dogenal,
            so the infra earns fees and the chain earns history. This preview
            is the product surface. Production deletes the demo ledger and
            points the wall at dogex.
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl tracking-tight">Envelope</h2>
        <pre className="mt-4 overflow-x-auto border border-border bg-bg p-4 text-[11px] leading-relaxed text-paper">
{`{
  "p": "Ð:WOW",
  "op": "tx",
  "to": "mars | moon | earth | humanity",
  "msg": "<unicode ≤280>",
  "x": "@handle",
  "ts": 1730000000000,
  "vow": "<optional ÐVow ≤120>"
}`}
        </pre>
        <p className="mt-3 text-xs text-faint">
          Marker <span className="text-muted">dog</span> · dogex indexes{" "}
          <span className="text-muted">p</span> · command.dog mints · Ðrok
          forges the patch · WatchDoge observes · ÐPulse counts wows as
          engagement ops if you want them on-chain later.
        </p>
      </div>
    </div>
  );
}
