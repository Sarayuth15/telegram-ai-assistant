# Telegram AI Assistant

A Next.js web chat and Telegram bot. Currently supports greetings and live weather
(Open-Meteo). **No AI provider is connected yet**; general questions get an honest
"not configured" reply.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

### Environment variables (server-side only)

| Variable | Purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather; needed to send replies |
| `TELEGRAM_WEBHOOK_SECRET` | Shared secret checked on every webhook request; endpoint returns 503 if unset |
| `TELEGRAM_OWNER_CHAT_ID` | Numeric chat ID that receives the scheduled Monday greeting (send `/myid` to the bot) |
| `CRON_SECRET` | Min. 16 chars. Authenticates Vercel Cron calls; cron endpoint returns 503 if unset |
| `AI_API_KEY` | Reserved for a future AI provider (unused; AI integration is postponed) |

## Telegram webhook

Deploy over HTTPS, then register the webhook (the secret must match `TELEGRAM_WEBHOOK_SECRET`):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<your-domain>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## API

- `POST /api/chat` `{ "message": string }` → `{ reply }`
- `GET /api/weather?city=...` → `{ weather }`
- `POST /api/telegram/webhook` (Telegram only)
- `GET /api/cron/morning-greeting` (Vercel Cron only; requires `Authorization: Bearer <CRON_SECRET>`)

Chat and weather endpoints are limited per IP using an in-memory limiter, which is
per instance; use a shared store for strict limits on multi-instance deployments.

## Scheduled Monday greeting

Sends "Good morning Sarayuth, have a nice day!" every **Monday at 6:18 AM Cambodia time**
(Asia/Phnom_Penh, UTC+7) to `TELEGRAM_OWNER_CHAT_ID`.

- **Mechanism:** Vercel Cron Jobs, configured in `vercel.json`, calling `/api/cron/morning-greeting`.
- **Schedule:** Vercel cron expressions are always **UTC**. 06:18 in UTC+7 is 23:18 UTC on the
  previous day, so the expression is `18 23 * * 0` (Sunday 23:18 UTC = Monday 06:18 Phnom Penh).
  Cambodia has no daylight saving, so this never shifts.
- **Safety check:** the route only sends when it is Monday in Asia/Phnom_Penh; otherwise it
  logs "skipped".
- **Logs:** each run logs `[cron:morning-greeting] sent|skipped|failed` with a timestamp
  (Vercel → project → Logs, filter by `/api/cron/morning-greeting`). Failures return 502/503
  and are not retried by Vercel.

### Plan limitation (important)

On the **Hobby** plan Vercel runs cron jobs at most once per day and may fire them anywhere
within the scheduled **hour** (e.g. 06:18–07:17 Phnom Penh), so exact-minute delivery is not
guaranteed. Exact-minute scheduling requires the **Pro** plan. Cron jobs only run on
**production** deployments.

### Setup

1. Send `/myid` to the bot and copy the number it replies with.
2. In Vercel → Settings → Environment Variables (Production), add `TELEGRAM_OWNER_CHAT_ID`
   and `CRON_SECRET` (alongside the existing bot token and webhook secret).
3. Redeploy to production (environment changes apply only to new deployments). Check
   Settings → Cron Jobs shows `/api/cron/morning-greeting` with `18 23 * * 0`.

### Testing

```bash
# Manual send, bypassing the Monday check (use your real CRON_SECRET)
curl -H "Authorization: Bearer <CRON_SECRET>"   "https://<your-domain>/api/cron/morning-greeting?force=true"
# Without ?force=true on a non-Monday it returns {"ok":true,"status":"skipped",...}
```

You can also use "Run" next to the job in Vercel → Settings → Cron Jobs (this does not
bypass the Monday check).

## AI provider

AI integration is **postponed**. The `AIProvider` interface (`src/services/ai/ai-provider.ts`)
and `aiService` are in place; general questions get an honest "not configured" reply.

## Scripts

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
