# Project Context

The application provides a web chat UI and Telegram bot.

Current features:
- Greeting responses
- Weather lookup by city (Open-Meteo, with timeout and one retry)
- Telegram /start and /help (webhook at /api/telegram/webhook, secret-verified)
- Next.js chat API (/api/chat) and weather API (/api/weather), both rate limited per IP (in-memory)

Not yet implemented:
- Real AI provider
- Persistent conversation history
- Database
- User authentication
- Forecast by date
- Production monitoring
- Shared (multi-instance) rate limiting

Weather queries must use the weather service.
General questions must use the AI provider abstraction.
Never fabricate weather information or AI responses.
