import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/stack")({ component: StackPage });

const LAYERS = [
  {
    name: "WOW SIGNAL",
    job: "Public square. Humans compose. No wallet in the path.",
    host: "wow.dogenals.com",
  },
  {
    name: "dogenals",
    job: "Protocol. Ð:WOW envelope, ÐPulse, ÐVow, Ð𝕏, marker dog.",
    host: "dogenals.com / spec",
  },
  {
    name: "command.dog",
    job: "Product backend. Sponsored inscribe-jobs, Grok briefing, WatchDoge WS.",
    host: "api.command.dog",
  },
  {
    name: "Treasury Dojak",
    job: "Operator wallet. Signs postage. Users never see this key.",
    host: "hot wallet",
  },
  {
    name: "dogex",
    job: "Chain truth. Indexes confirmed Ð:WOW. The wall reads this.",
    host: "dogex.command.dog",
  },
  {
    name: "WatchDoge",
    job: "Mempool flash + inbound donation UTXOs to the treasury.",
    host: "watchdoge",
  },
  {
    name: "Ðrok",
    job: "Optional paid art. Mission patches from Grok Imagine — extra, not required.",
    host: "drok.lol",
  },
];

const FLOW = [
  {
    step: "01",
    title: "Write",
    body: "Any human. 280 characters, optional ÐVow. Sign in with X or Google. Draft survives the popup.",
  },
  {
    step: "02",
    title: "Sponsor",
    body: "command.dog opens an inscribe-job against the postage pot. The user pays nothing.",
  },
  {
    step: "03",
    title: "Sign",
    body: "Treasury Dojak signs. command.dog never holds a user key because there is no user key.",
  },
  {
    step: "04",
    title: "Mempool",
    body: "WatchDoge WS flashes the raw tx. Same feed as the rest of the stack.",
  },
  {
    step: "05",
    title: "Confirm",
    body: "dogex indexes p: Ð:WOW. Explorer proves inclusion. Production wall reads dogex, not Postgres.",
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
          Blockchain underneath.
          <br />
          Humans on top.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted">
          This is not a wallet product. It is a guestbook that happens to
          settle on Dogecoin. The stack you already run pays the dust so
          someone who has never heard of a UTXO can still leave a mark.
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
        <h2 className="font-display text-2xl tracking-tight">Why we eat the fee</h2>
        <div className="mt-4 grid gap-6 text-sm text-muted md:grid-cols-2">
          <p>
            Dogecoin is how we give the stamp away. If we ask a first-time
            human to buy DOGE, install Dojak, and sign a PSBT, we lose the
            screenshot. If the pack pays, we get the species.
          </p>
          <p>
            Donations refill the treasury. Power users can later attach Dojak
            to buy extra daily signals or a Ðrok mission patch. Default path
            stays free. One transmission per Earth day keeps the hot wallet
            honest. The chain still earns history. Dogenals still earns the
            cultural moment.
          </p>
        </div>
        <Link
          to="/mission"
          className="mt-5 inline-flex h-11 items-center bg-gold px-5 text-[12px] uppercase tracking-[0.16em] text-bg hover:bg-gold-hot"
        >
          Fund the postage
        </Link>
      </div>

      <div>
        <h2 className="font-display text-2xl tracking-tight">Spec</h2>
        <pre className="mt-4 overflow-x-auto border border-border bg-bg p-4 text-[11px] leading-relaxed text-paper">
{`{
  "p": "Ð:WOW",
  "op": "send",
  "to": "mars | moon | earth | humanity",
  "msg": "<unicode ≤280>",
  "x": "@handle",
  "ts": 1730000000000,
  "vow": "<optional ÐVow ≤120>"
}`}
        </pre>
        <p className="mt-3 text-xs text-faint">
          Marker <span className="text-muted">dog</span> · dogex indexes{" "}
          <span className="text-muted">p</span> · treasury mints · ÐPulse
          counts wows · identity is the social login, optionally bound to Ð𝕏
          later.
        </p>
      </div>
    </div>
  );
}
