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
- Pairing codes synchronize library state through the Express server for 30 days. For multi-instance production deployment, replace the JSON sync store with a shared database (PostgreSQL, etc.).
- Christian verification is confidence-based; the app does not claim that keyword matching is infallible.
