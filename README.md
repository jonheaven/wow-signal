# WOW SIGNAL

**Earth's outbound log. Addressed to Mars. Postage paid.**

**Live:** [wow.dogenals.com](https://wow.dogenals.com)

No wallet. Sign in with X or Google. Hold to stamp. The Dogenals postage pot inscribes an SVG postcard on Dogecoin — JSON in `<metadata>` for the indexer.

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

## Sign-in (X + Google)

Identity is **Sign in with X** or **Google** — no wallet. Sessions live on this app (Better Auth at `/api/auth/*`). Production **cannot** use the baked `grok_preview` client (that only allows `*.grok-sandbox.com`).

`dogenals launch` reads OAuth 2.0 client id/secret from **`command.dog/api/.env`** and injects them into this process.

### Which X keys to use (2026)

| You created | Use for |
| --- | --- |
| **OAuth 2.0 Client ID + Client Secret** (`X_CLIENT_ID`, `X_CLIENT_SECRET`) | **Sign in with X** (this app) |
| API Key + API Secret (`X_API_KEY`, `X_API_SECRET`) | OAuth 1.0a consumer — posting as the *app*, not user login |
| Access Token + Access Token Secret | One specific X account the *app* owns — not visitor registration |

A typo like `X_ACESS_SECRET` is unused. `TWITTER_CLIENT_ID` is an alias for `X_CLIENT_ID`.

**X Developer Portal:** [developer.x.com/en/portal/dashboard](https://developer.x.com/en/portal/dashboard) (same as [console.x.com](https://console.x.com)).

1. Project → App → **User authentication settings**.
2. Turn on **OAuth 2.0**. App type **Web App** (confidential client).
3. Callback URIs (all of them):
   - `https://wow.dogenals.com/api/auth/callback/twitter`
   - `http://127.0.0.1:3083/api/auth/callback/twitter`
   - `http://localhost:3083/api/auth/callback/twitter`
4. Website URL: `https://wow.dogenals.com`
5. Scopes: `tweet.read`, `users.read`, `offline.access` (add `user.email` if you want email).
6. Copy **Client ID** and **Client Secret** into `command.dog/api/.env` as `X_CLIENT_ID` / `X_CLIENT_SECRET`.
7. `dogenals reboot wow` so the process picks up env.

Better Auth still names the provider `twitter`; the callback path is `/api/auth/callback/twitter`.

### Google sign-in

**Google Cloud Console:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

1. Create or pick a GCP project.
2. **APIs & Services → OAuth consent screen** (External is fine for a public guestbook). App name WOW SIGNAL, support email you.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Authorized JavaScript origins:
   - `https://wow.dogenals.com`
   - `http://127.0.0.1:3083`
5. Authorized redirect URIs:
   - `https://wow.dogenals.com/api/auth/callback/google`
   - `http://127.0.0.1:3083/api/auth/callback/google`
   - `http://localhost:3083/api/auth/callback/google`
6. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `command.dog/api/.env`.
7. Reboot wow. The Google button stays hidden until both vars are set.

### Env

See [.env.example](.env.example). Also set a long `BETTER_AUTH_SECRET` so sessions survive process restart.

`COMMAND_DOG_API_URL` is the product backend. Grok briefing uses command.dog's `XAI_API_KEY`. `DATABASE_URL` is optional (defaults to embedded PGLite for **auth only**).

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
  "op": "send",
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

## Product surface

- `/` Beacon — send a message to Mars, free
- `/transmit` — compose + hold to stamp
- `/wall` — the book
- `/signal/:id` — share card + briefing
- `/mission` — postage pot, overflow rule
- `/stack` — ownership map

## License

MIT. Same as the rest of the Dogenals stack.
