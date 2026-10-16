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
| `AI_API_KEY` | Reserved for a future AI provider (unused) |

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

Chat and weather endpoints are limited per IP using an in-memory limiter, which is
per instance; use a shared store for strict limits on multi-instance deployments.

## Scripts

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
