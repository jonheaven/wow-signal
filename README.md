# WOW SIGNAL

**Humanity's first guestbook. Written on Dogecoin. Aimed at Mars.**

**Live:** [wow.dogenals.com](https://wow.dogenals.com)

Every transmission is a Dogenal — permanent, public, cheap enough for anyone.

Consumer app for the [`Ð:WOW`](https://github.com/jonheaven/dogenals/tree/main/spec/protocols/wow) protocol. Compose a 280-character message, optional ÐVow, sign with X / Ð𝕏. Production settles through the stack you already run:

| Layer | Job |
| --- | --- |
| [dogenals](https://github.com/jonheaven/dogenals) | Protocol standard. Envelope, marker `dog`. |
| [command.dog](https://github.com/jonheaven/command.dog) | Inscribe jobs, Grok briefing, Ðoge𝕏ID, WatchDoge WS, Ðrok proxy. |
| [dogex](https://github.com/jonheaven/dogex) | Index confirmed `p: "Ð:WOW"`. Proofs. Broadcast. |
| [Ðrok](https://github.com/jonheaven/drok.lol) | Optional mission patch from a Collection Constitution (Grok Imagine). |
| Dojak / Wizard / Scrypto | User signs. Keys stay with the dog. |

This repo is the **public square**. It is not a second indexer.

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

1. Compose — identity from Ð𝕏 / X sign-in.
2. Queue — `command.dog /v1/inscribe-jobs` quotes postage.
3. Sign — Dojak (or Wizard / Scrypto). command.dog never holds the key.
4. Mempool — WatchDoge WS flashes the raw tx.
5. Confirm — dogex indexes `p: Ð:WOW`. The wall reads dogex.

The preview in this repo used a local demo ledger so the product was playable without a wallet. **Production wall / stats / tip / queue / briefing talk to command.dog** (`/v1/wow/*`). command.dog reads confirmed `p:"Ð:WOW"` from **dogex** `/api/wow/*`. Auth sessions still use PGLite (or `DATABASE_URL`) on this app.

## Local

```bash
npm install
cp .env.example .env
npm run dev
```

Dev server: `http://localhost:8080` (`npm run dev`).

On the Dogenals stack, `dogenals launch` starts this app on **`:3083`** → **[wow.dogenals.com](https://wow.dogenals.com)** (dogex already owns `:8080`). Skip with `DOGENALS_SKIP_WOW=1`. First-time DNS: `dogenals provision`.

| Script | What |
| --- | --- |
| `npm run dev` | Vite + PGLite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build + migrate |

### Env

See [.env.example](.env.example). Auth federates through the Grok broker (`GROK_AUTH_ISSUER`) for X / Google. `COMMAND_DOG_API_URL` (default `http://127.0.0.1:3000`) is the product backend. Grok briefing uses command.dog's `XAI_API_KEY`. `DATABASE_URL` is optional (defaults to embedded PGLite for **auth only**).

## Product surface

- `/` Beacon — Earth / Moon / Mars, live pulses, chain-tip HUD
- `/transmit` — write the envelope
- `/wall` — guestbook
- `/signal/:id` — share card + briefing
- `/stack` — ownership map

## License

MIT. Same as the rest of the Dogenals stack.
