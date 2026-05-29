# Trip Advisor

[![CI](https://github.com/simplesanskar49/Trip-Advisor/actions/workflows/ci.yml/badge.svg)](https://github.com/simplesanskar49/Trip-Advisor/actions/workflows/ci.yml)

AI-powered travel itinerary planner. Generate, refine, and explore trips with Gemini on a Cloudflare-backed Expo app.

## Try it

- **Android APK:** https://expo.dev/artifacts/eas/jHgU4oWG9GtGF4Ym7axFrm.apk — download, install (allow "unknown sources" if prompted), launch.
- **API:** https://api.trip-advisor.workers.dev — `/health` returns `{"ok":true,...}`.

iOS isn't distributed (Apple requires a paid developer account). To run on iOS, clone the repo and `pnpm dev:mobile`.

## What it does

Four tabs that share one loop:

- **Plan** — describe a destination, days, and vibe → a structured day-by-day itinerary with morning/afternoon/evening blocks, real venues, costs, durations. Refine inline ("make day 2 more relaxed") before saving.
- **Trips** — your saved itineraries. Tap to see the full plan, refine further, share, or delete.
- **Map** — interactive world map (Leaflet inside a WebView, OpenStreetMap tiles) with a pin per saved trip. Pins are placed via on-device geocoding through Nominatim with a backfill pass for older trips. Tap a pin to open its itinerary.
- **Explore** — AI-curated destination recommendations seeded by your saved trips.

### Highlights

- **Share as a poster, not a wall of text.** Tapping the share icon on a trip renders an offscreen 1080×1920 card (cover image, destination in Fraunces serif, day count, top highlights) via `react-native-view-shot`, captures it as a PNG, and hands it to the native share sheet through `expo-sharing`. Recipients get an actual image on WhatsApp, iMessage, Instagram Stories — instead of the plaintext dump RN's built-in `Share` would produce.
- **Offline-first map with zero native modules.** `react-native-maps` requires a custom dev build (it isn't in Expo Go from SDK 53+), so the Map tab uses Leaflet inside a WebView instead. Same UX (pan, zoom, custom pins, popups → deep-link to the trip detail) with no native build step, and the choice is documented so it can be swapped to a native renderer later.

## Stack

| Layer | Choice |
| --- | --- |
| Mobile | Expo SDK 54, Expo Router |
| UI | NativeWind v4 (Tailwind), Reanimated 4 |
| Maps | Leaflet via `react-native-webview`, OpenStreetMap tiles, Nominatim geocoding |
| Sharing | `react-native-view-shot` (offscreen capture) + `expo-sharing` (native share sheet) |
| Haptics | `expo-haptics` |
| Server state | TanStack Query |
| Client state | Zustand + AsyncStorage |
| API | Cloudflare Workers + Hono |
| LLM | Gemini Flash (native `responseSchema` for strict JSON) |
| Validation | Zod schemas shared between client + server |
| Type-safety | TypeScript strict + `noUncheckedIndexedAccess` |
| Tooling | pnpm workspaces, Biome |

## Architecture

```
┌───────────────────────────────────┐
│ Expo app (Plan / Trips / Map / Explore) │
│  TanStack Query · Zustand         │
└──────────────┬────────────────────┘
               │ HTTPS (zod-validated)
               ▼
┌───────────────────────────────────────┐
│ Cloudflare Worker (Hono)              │
│  • POST /api/itinerary/generate       │
│  • POST /api/itinerary/refine         │
│  • POST /api/explore/recommendations  │
│  per-IP rate limiting · zod validation│
└──────────────┬────────────────────────┘
               ▼
            Gemini Flash
       (responseSchema = strict JSON)
```

The Gemini API key lives only as a Cloudflare Worker secret. The mobile bundle never sees it.

## Project layout

```
apps/
  mobile/    Expo app
    app/                            Expo Router screens
      (tabs)/{plan,trips,map,explore}.tsx
      trip/[id].tsx
    src/
      components/                   Card, Button, IconButton, Heading, Tag, Skeleton
      features/
        itinerary/                  ItineraryView, ItineraryResultCard
        plan/                       PromptForm, ItinerarySkeleton
        trips/                      TripCard, RefineBar, ShareCard
        ../lib/geocode.ts             Nominatim geocoder w/ in-memory cache
        explore/                    RecommendationCard
      lib/                          api, theme, storage, coverImage, friendlyError
      store/                        tripsStore (zustand + AsyncStorage)
  api/
    src/
      services/gemini.ts            generate / refine / recommend with retry
      routes/{itinerary,explore}.ts
      middleware/rateLimit.ts
      index.ts                      Hono app
packages/
  schemas/                          shared zod schemas
```

## Local setup

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
cp apps/api/.dev.vars.example apps/api/.dev.vars
# edit .dev.vars and set GEMINI_API_KEY  (free key at aistudio.google.com)

pnpm dev:api     # terminal 1 → http://localhost:8787
pnpm dev:mobile  # terminal 2 → scan QR with Expo Go
```

Testing on a physical device: set `apps/mobile/app.json` → `extra.apiUrl` to your Mac's LAN IP (e.g. `http://192.168.1.x:8787`) so the phone can reach the worker.

## Deploying

**API → Cloudflare Workers** (free tier):
```bash
cd apps/api
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

**Mobile → EAS Build** (free tier, produces a standalone APK):
```bash
# point app at the deployed worker
# edit apps/mobile/app.json → extra.apiUrl = <your worker URL>

npm install -g eas-cli
eas login
cd apps/mobile
eas init
eas build --profile preview --platform android
```

For JS-only changes after the first build, push OTA without rebuilding:
```bash
eas update --branch preview --message "..."
```

## Design notes

- **Theme:** warm off-white background, terracotta accent, serif display (Fraunces) + sans body (Inter). All colors flow through `src/lib/theme.ts` — no inline hex anywhere in the codebase.
- **Animations:** itinerary blocks fade-in-up with staggered delays via Reanimated for an editorial reveal.
- **Schema-first:** every LLM response is constrained by Gemini's `responseSchema` and re-validated client-side. Invalid JSON is structurally impossible.
- **Friendly errors:** all backend/network/LLM failures map to short user-facing messages via `friendlyError()`. Internal details stay in worker logs.
- **Resilience:** Gemini calls retry up to 3× on transient 503/429 errors with exponential backoff.

## Known limitations

- **Map tiles use OpenStreetMap**, which renders the *international* interpretation of disputed borders (e.g. Kashmir). For an India-targeted product the right swap is Mappls (MapMyIndia) tiles or Mapbox with `locale=IN` — both gated behind an API key, so left out of this portfolio build.

## What's intentionally not here

- **Auth / cloud sync** — trips are local-first (AsyncStorage). Adding Supabase would be a one-file swap of the trips store.
- **Streaming responses** — Gemini Flash is fast enough (~2-4s) that streaming would add complexity without much UX gain. Skeleton + entrance animations give the same "instant" feel.

## License

MIT
