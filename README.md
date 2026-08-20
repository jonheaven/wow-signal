# WOW SIGNAL

**Earth's outbound log. Addressed to Mars. Postage paid.**

**Live:** [wow.dogenals.com](https://wow.dogenals.com)

No wallet. Sign in with X or Google. Hold to stamp. The Dogenals postage pot inscribes your words on Dogecoin.

Consumer app for the [`Ð:WOW`](https://github.com/jonheaven/dogenals/tree/main/spec/protocols/wow) protocol. Production settles through the stack you already run:

| Layer | Job |
| --- | --- |
| [dogenals](https://github.com/jonheaven/dogenals) | Protocol standard. Envelope, marker `dog`. |
| [command.dog](https://github.com/jonheaven/command.dog) | Sponsored inscribe jobs, Grok briefing, WatchDoge WS. |
| Treasury Dojak | Operator wallet signs postage. Users never hold a key. |
| [dogex](https://github.com/jonheaven/dogex) | Index confirmed `p: "Ð:WOW"`. Proofs. Broadcast. |
| [WatchDoge](https://github.com/jonheaven/watchdoge) | Mempool flash + inbound donation UTXOs. |
| [Ðrok](https://github.com/jonheaven/drok.lol) | Optional paid mission patch. Not required. |

This repo is the **public square**. It is not a second indexer.

## Product contract

- Identity = X or Google. Callsign from the handle.
- Postage = community pot. Writers pay 0 Ð. If the pot runs dry, the faucet pauses.
- Quota = one free signal per Earth day.
- Stamp = hold-to-send + signed challenge. Not a captcha page.
- Overflow = more of the mission, in public. Not a slush fund.

## Envelope

```json
{
  "p": "Ð:WOW",
  "op": "tx",
  "to": "mars",
  "msg": "If you are reading this on Mars, we made it.",
  "x": "@jontype",
  "ts": 1730000000000,
  "vow": "Still here when we land."
}
```

`to` is one of `earth` | `moon` | `mars` | `humanity`.  
`msg` ≤ 280 unicode. `vow` ≤ 120. Marker `dog`.

Normative rules: [dogenals/spec/protocols/wow](https://github.com/jonheaven/dogenals/tree/main/spec/protocols/wow).

## Settlement path

1. Compose — identity from X / Google. No wallet.
2. Stamp — hold until gold fills. Signed challenge, honeypot, quota.
3. Sponsor — `command.dog` queues postage against the treasury.
4. Sign — treasury Dojak. There is no user key.
5. Mempool — WatchDoge WS flashes the raw tx.
6. Confirm — dogex indexes `p: Ð:WOW`. The wall reads dogex.

**Production wall / stats / tip / queue / briefing talk to command.dog** (`/v1/wow/*`). command.dog reads confirmed `p:"Ð:WOW"` from **dogex** `/api/wow/*`. Auth sessions still use PGLite (or `DATABASE_URL`) on this app.

## Local

```bash
npm install
cp .env.example .env
npm run dev
```

Dev server: `http://localhost:8080` (`npm run dev`).

On the Dogenals stack, `dogenals launch` starts this app on **`:3083`**. Public **[wow.dogenals.com](https://wow.dogenals.com)** needs a Cloudflare CNAME on the **dogenals.com** zone (cert.pem cannot write that zone):

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| CNAME | `wow` | `33c26e6b-d4d0-413d-a1ce-164b514538cd.cfargotunnel.com` | Proxied |

Skip the app with `DOGENALS_SKIP_WOW=1`. Local: `http://127.0.0.1:3083`.

**Do not serve `vite dev` on the public host.** After `git pull`:

```bash
npm install
npm run build
PORT=3083 npm start
```

`npm start` is `vite preview` on `PORT` (default 8080; `dogenals launch` uses 3083). Cloudflare on `wow.dogenals.com`:

1. SSL/TLS mode **Full** (tunnel origin is HTTP).
2. **Always Use HTTPS** (SSL/TLS → Edge Certificates).
3. Keep the CNAME **Proxied**.

| Script | What |
| --- | --- |
| `npm run dev` | Vite + PGLite (auth) — local only |
| `npm start` | Production preview (`vite preview`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build + migrate |

### Env

See [.env.example](.env.example). Auth federates through the Grok broker (`GROK_AUTH_ISSUER`) for X / Google. `COMMAND_DOG_API_URL` (default `http://127.0.0.1:3000`) is the product backend. Grok briefing uses command.dog's `XAI_API_KEY`. `DATABASE_URL` is optional (defaults to embedded PGLite for **auth only**).

## Product surface

- `/` Beacon — send a message to Mars, free
- `/transmit` — compose + hold to stamp
- `/wall` — the book
- `/signal/:id` — share card + briefing
- `/mission` — postage pot, overflow rule
- `/stack` — ownership map

## License

MIT. Same as the rest of the Dogenals stack.
