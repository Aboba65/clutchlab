# ClutchLab

[![CI](https://github.com/Aboba65/clutchlab/actions/workflows/ci.yml/badge.svg)](https://github.com/Aboba65/clutchlab/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-Vercel-000000?logo=vercel&logoColor=white)](https://clutchlab-olive.vercel.app/)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

CS2 analytics MVP for exploring players, teams, maps, roles, roster construction
and matchup comparison.

Live site: https://clutchlab-olive.vercel.app/  
Repository: https://github.com/Aboba65/clutchlab

## Status

ClutchLab is currently an MVP with a static local data layer.

Current documented version:

```text
0.1.3 UX polish
```

The interface is built like a real analytics product, but the current ratings,
prices, team scores, map scores and custom indexes are **demo/manual values**
used for product testing. They should not be treated as live, official or current
esports statistics.

## Features

- Dashboard homepage
- Player catalog with filters and sorting
- Team catalog with filters and sorting
- Map catalog with filters and sorting
- Role pages and role detail pages
- Player profile pages
- Team profile pages
- Map detail pages
- Player comparison page
- Team comparison page
- Roster Builder with budget, role checks, value scoring and map fit
- Saved Rosters manager using `localStorage`
- Traits page
- About / Methodology page
- Route-based browser tab titles
- Data notice shown in the app shell
- Footer with version, data status and project links

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Browser `localStorage`
- ESLint
- Prettier
- GitHub Actions CI
- Vercel deployment

## Routes

```text
/                         Home dashboard
/players                  Player catalog
/players/:playerId        Player profile
/teams                    Team catalog
/teams/:teamId            Team profile
/maps                     Map catalog
/maps/:mapId              Map detail
/roles                    Role catalog
/roles/:roleId            Role detail
/compare                  Player comparison
/team-compare             Team comparison
/roster-builder           Roster Builder
/saved-rosters            Saved Rosters
/traits                   Traits
/about                    About / Methodology
/builder                  Redirect to /roster-builder
```

## Browser titles

The app updates the browser tab title on route changes.

```text
/                         ClutchLab — CS2 Analytics
/players                  ClutchLab — Players
/players/:playerId        ClutchLab — Player Profile
/teams                    ClutchLab — Teams
/teams/:teamId            ClutchLab — Team Profile
/maps                     ClutchLab — Maps
/maps/:mapId              ClutchLab — Map Detail
/roles                    ClutchLab — Roles
/roles/:roleId            ClutchLab — Role Detail
/compare                  ClutchLab — Player Compare
/team-compare             ClutchLab — Team Compare
/roster-builder           ClutchLab — Roster Builder
/saved-rosters            ClutchLab — Saved Rosters
/traits                   ClutchLab — Traits
/about                    ClutchLab — About
*                         ClutchLab — Not Found
```

## Project structure

```text
src/
  components/             Shared UI components, app shell and footer
  config/                 Navigation, role profiles and map profiles
  data/                   Player data, team data and dataset metadata
  hooks/                  Route/title hooks
  pages/                  Route-level pages
  App.tsx                 BrowserRouter and route table
  data.ts                 Compatibility data export
  index.css               Global styles
  lib.ts                  Shared scoring and helper functions
  types.ts                Shared TypeScript types
```

## Data layer

```text
src/data/players.ts       Player profiles
src/data/teams.ts         Team profiles
src/data/meta.ts          Dataset version, status and source notes
src/data/index.ts         Public data exports
src/data/README.md        Data rules and future real-stat notes
```

`src/data.ts` remains as a compatibility export so older imports continue to work.

Current data status:

```text
Status: demo/manual data
Purpose: MVP navigation, UI testing and product logic
Not intended as: live esports statistics
```

## Local setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Validate local data:

```bash
npm run validate:data
```

Lint source files:

```bash
npm run lint
```

Format files:

```bash
npm run format
```

Check formatting without writing changes:

```bash
npm run format:check
```

Run full release check:

```bash
npm run release:check
```

Preview production build locally:

```bash
npm run preview
```

## Quality workflow

Before committing or deploying, run:

```bash
npm run release:check
```

The release check runs:

```bash
npm run validate:data
npm run lint
npm run format:check
npm run build
```

Quality config files:

```text
scripts/validate-data.mjs
scripts/release-check.mjs
eslint.config.js
.prettierrc
.prettierignore
.github/workflows/ci.yml
```

## CI

GitHub Actions runs on pushes and pull requests to `main` or `master`.

The CI workflow runs:

```bash
npm ci
npm run validate:data
npm run lint
npm run format:check
npm run build
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Deployment

The project is configured for Vercel.

`vercel.json` contains a SPA rewrite so React Router routes work after refresh:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Typical deployment flow:

```bash
npm run release:check
git add -A
git commit -m "Your commit message"
git push
```

Vercel then builds the latest pushed version.

## UX polish

Current UX polish includes:

```text
[✓] route-based browser titles
[✓] app-wide footer
[✓] visible MVP version
[✓] visible data status
[✓] visible data updated date
[✓] GitHub, Changelog, Data and Live site links
```

## Methodology overview

### Player Impact

A custom MVP index for comparing individual players. It blends demo values such
as rating, ADR, K/D, KAST, opening, clutch, AWP/rifle value and consistency into
a 0–100 style read.

### Team Score

A weighted team profile using firepower, structure, map pool, clutch and form.

### Map Fit

A map-specific read based on AWP value, entry value, anchor pressure, side
profile and preferred roles.

### Roster Value

A budget-aware read used in Roster Builder and Saved Rosters. It considers player
impact, player price, role coverage, roster cost and overall roster balance.

## Roadmap

- Replace demo/manual values with manually curated real statistics
- Add source metadata per dataset
- Track update dates and event windows
- Separate identity data from current performance data
- Add richer map-specific statistics
- Add better saved roster export/import if it becomes useful later
- Add automated data generation or backend/API later

## Important note

ClutchLab is not currently a live ranking system. It is a product MVP with a clean
interface, static local data and clear boundaries around demo/manual scoring.
