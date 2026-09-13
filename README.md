# GospelStream TV

GospelStream TV is a React + Express Christian video application with server-side YouTube verification, persistent pairing-code sync, and real browser offline caching for direct media sources.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `YOUTUBE_API_KEY` if YouTube search/status features are needed.
4. Run `npm run dev`.

## Important behavior

- YouTube search uses the official YouTube Data API. The app no longer scrapes YouTube HTML.
- YouTube videos are streamed through YouTube and are not downloaded by GospelStream.
- Offline downloads use IndexedDB and are available only for direct media URLs that permit browser caching.
- Pairing uses a one-time 6-digit code (10-minute expiry) to issue a private device token. Durable multi-instance sync uses the configured KV REST store; without KV, sync is process-local and should only be used for local development.
- Christian verification is confidence-based; the app does not claim that keyword matching is infallible.


## Production readiness notes

- YouTube API keys stay server-side; configure `YOUTUBE_API_KEY`.
- Cloud pairing uses a short-lived one-time code and a private device token.
- For Vercel/serverless deployments, configure `KV_REST_API_URL` and `KV_REST_API_TOKEN` for shared sync storage. Without them, cloud sync is intentionally unavailable rather than pretending JSON-on-disk is durable.
- Offline downloads are device-local IndexedDB caches. Downloaded media is never represented as cloud-synced bytes.
- The built-in sermon catalog is starter/demo content and is labeled accordingly. Replace it with licensed/owned content before production launch.
- YouTube videos cannot be downloaded by GospelStream TV; users should use YouTube-supported offline features where available.
- Live status is only labeled LIVE when confirmed by the YouTube API.


## YouTube connection

GospelStream connects to the official YouTube Data API on the server for live/recorded Christian content discovery and status checks. The provider is intentionally not advertised throughout the GospelStream interface.

Set `YOUTUBE_API_KEY` in the server environment. Do not place the key in client-side React code or commit it to Git.

The video player uses YouTube's privacy-enhanced embed host. YouTube may still display platform-required player attribution/branding inside its own player controls; GospelStream does not add separate source labels around the player.
