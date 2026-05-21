# Trip Architect

AI-powered travel itinerary planner. Built with Expo + Cloudflare Workers + Gemini 2.0 Flash.

## Stack

- **Mobile:** Expo SDK 52, Expo Router, NativeWind, TanStack Query, Zustand, Reanimated
- **API:** Cloudflare Workers + Hono, Gemini 2.0 Flash (streaming, structured output)
- **Shared:** Zod schemas in `packages/schemas`
- **Storage:** Supabase (Postgres) — added in a later step
- **Images:** Unsplash — added in a later step

## Project layout

```
apps/
  mobile/     Expo app (3 tabs: Plan, Trips, Explore)
  api/        Cloudflare Worker (Hono)
packages/
  schemas/    Shared zod types
```

## Setup

Requires Node 20+, pnpm 9+.

```bash
pnpm install
```

### API (Cloudflare Worker)

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
# fill in GEMINI_API_KEY (get free key at https://aistudio.google.com)
pnpm dev:api
# runs at http://localhost:8787
```

### Mobile (Expo)

```bash
pnpm dev:mobile
# scan QR with Expo Go (iOS / Android)
```

If running on a device, update `apps/mobile/app.json` → `extra.apiUrl` to your machine's LAN IP (e.g. `http://192.168.1.10:8787`) so the device can reach the local worker.

## Deployment

- API → `pnpm --filter @trip/api deploy` (Cloudflare Workers)
- Mobile → EAS Update / Expo Go QR

## Status

Scaffold only — feature work coming next.
