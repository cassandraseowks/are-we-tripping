# Travel Planner — Setup Guide

## Prerequisites
- Node.js 18+ (install via https://nodejs.org or `brew install node`)
- A Google Maps API key (enable Maps JavaScript API, Places API, Directions API)
- An Anthropic API key

## Quick Start

```bash
cd travel-planner
npm install
```

## Configure API Keys

Edit `.env.local` and fill in all four values:

```
ANTHROPIC_API_KEY=sk-ant-your-real-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza-your-real-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase setup (free, required for multi-device collaboration)

1. Create a free account at https://supabase.com
2. Click "New project", choose a region close to you
3. In the SQL editor, run:

```sql
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON trips
  FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE trips;
```

4. Go to Project Settings → API → copy "Project URL" and "anon public" key into `.env.local`

## Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Google Maps API Setup

1. Go to https://console.cloud.google.com
2. Create a project → Enable APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
3. Create an API key → restrict to your domain

## Anthropic API Setup

1. Go to https://console.anthropic.com
2. Create an API key
3. Add it to `.env.local`

## Features

- **Create a trip** → generates a share code for collaborators
- **Wishlist tab** → add places via address (Google autocomplete), TikTok link, or Instagram link
- **Vote** on contributions to surface the best picks
- **Itinerary tab** → click "Generate itinerary" to let Claude AI build a day-by-day plan
- **Map tab** → visualise all wishes on Google Maps, toggle directions
- **Stays tab** → track accommodation with check-in/check-out dates and pricing
- **Food tab** → filtered view of food-category wishes sorted by votes
- **Budget tab** → expense tracker with per-person split
- **Flights tab** → flight info cards with confirmation codes

## Project Structure

```
app/                       Next.js App Router pages & API routes
components/
  landing/                 Hero, Create/Join modals
  trip/                    Header + tab navigation
  tabs/                    One file per tab
  wishlist/                Contribution input + card components
  itinerary/               Day + item timeline components
  map/                     Google Maps view
  budget/                  Budget tracker
  ui/                      Button, Modal, Badge
lib/                       types.ts, storage.ts, maps.ts, utils.ts
context/                   TripContext.tsx (React context)
```
