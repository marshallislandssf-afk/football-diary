# ⚽ Football Diary

A personal football match journal — track every match you've attended, with lineup data, annotations, notes, and images.

## Features

- **Chronological match log** — all your matches in order, expandable for detail
- **API-Sports integration** — fetch real lineup data with one click
- **Player stats** — see which players you've watched most across all matches
- **Special annotations** — mark remarkable matches (promotions, milestones, historic games)
- **Notes & images** — add personal notes and photos to any match (Phase 2)
- **Manual entry** — add matches that aren't on API-Sports
- **Search & filter** — find matches by team, competition, country, or year

## Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
cd football-diary
npm install
vercel
```

### Option B — GitHub + Vercel dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: Next.js (auto-detected)
4. Click Deploy

No environment variables needed — your API key is entered in-app and stored in your browser.

## Local development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## API-Sports setup
1. Sign up at [api-sports.io](https://api-sports.io) (free tier: 100 requests/day)
2. Copy your API key
3. In the app, go to **Settings** → paste your key → Save
4. Open any match → click **Fetch Lineup from API-Sports**

## Data storage
All data (matches, notes, images) is stored in your browser's localStorage. It persists across sessions but is device-specific. Export/sync coming in a future update.

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- API-Sports v3 (football)
- date-fns
