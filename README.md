# ClutchLab

**ClutchLab** is a CS2 analytics MVP inspired by modern sports analytics products.  
It provides player profiles, team profiles, map pages, player comparison, role-based rankings, and an interactive roster builder.

Live site: https://clutchlab-olive.vercel.app/

## Features

- **Players catalog**
  - Search by nickname, team, country, and role
  - Role, team, and country filters
  - Sorting by impact, rating, ADR, clutch, and price

- **Player profiles**
  - Player role, team, country, and price
  - Impact Index
  - Rating, ADR, K/D, KAST
  - Role read and performance profile

- **Teams**
  - Team cards and team profile pages
  - Firepower, structure, map pool, clutch, and form scores
  - Roster overview
  - Best maps

- **Compare 2.0**
  - Compare two players
  - Search-based player selection
  - Category winners
  - Overall edge
  - Swap players

- **Roster Builder**
  - Build a 5-player CS2 roster
  - Budget system
  - Role validation
  - Roster score
  - Warnings and roster analysis

- **Traits**
  - Highest Impact
  - Best Clutch
  - Best AWPers
  - Best Entry Pressure

- **Maps**
  - Map cards
  - Map profile pages
  - Best team fits
  - Best player fits
  - T-side difficulty, CT strength, AWP value, entry value, and anchor pressure

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vercel

## Project Structure

```text
src/
  App.tsx       # Main application, routes, views, and UI components
  data.ts      # MVP player and team data
  lib.ts       # Scoring and helper functions
  types.ts     # TypeScript types
  index.css    # Tailwind and global styles
  main.tsx     # React entry point
```

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deployment

The project is deployed on Vercel.

The repository includes `vercel.json` with SPA rewrites so React Router routes work after page refresh:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Current Status

This is an MVP.  
The teams and players are real-world CS2 names, but the current ratings, prices, map scores, and custom indexes are demo values created for the product prototype.

## Roadmap

- Add Team Compare
- Add Favorites / Saved Rosters
- Add Similar Players
- Add role-fit pages
- Add map-specific player breakdowns
- Add real statistical data pipeline
- Add backend/database
- Add authentication and saved user lineups

## Important Note

ClutchLab is an independent fan-made analytics prototype.  
It is not affiliated with Valve, HLTV, tournament organizers, teams, or players.
