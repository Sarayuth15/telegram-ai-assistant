# Telegram AI Assistant

## Goal
Build a secure Telegram assistant and Next.js web application.

## Stack
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Telegram Bot API
- Open-Meteo
- Vitest

## Architecture
- UI components belong in src/components.
- HTTP endpoints belong in src/app/api.
- Business logic belongs in src/services.
- Shared types belong in src/types.
- Environment configuration belongs in src/lib/env.ts.

## Rules
- Keep API keys on the server.
- Never expose secrets through NEXT_PUBLIC_ variables.
- Validate all user input.
- Handle network errors and timeouts.
- Avoid any and unsafe type assertions when possible.
- Do not call external APIs directly from UI components.
- Add tests for new business logic.
- Do not claim AI is implemented until a real AI provider is connected.

## Development workflow
1. Inspect existing code.
2. Explain the implementation plan.
3. Implement a focused change.
4. Run lint and tests.
5. Run the production build.
6. Document new environment variables.