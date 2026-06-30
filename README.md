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
0.1.7 Real-stat data plan
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
- Route-based meta descriptions
- Open Graph title/description updates
- Twitter title/description updates
- Compact mobile header
- Horizontal mobile navigation
- Data notice shown in the app shell
- Footer with version, data status and project links
- Dynamic sitemap generation for static and detail routes
- Real-stat data migration plan

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

## Browser titles and route meta

The app updates browser title and route metadata on route changes through:

```text
src/hooks/usePageTitle.ts
```

The hook updates:

```text
document.title
meta[name="description"]
meta[property="og:title"]
meta[property="og:description"]
meta[name="twitter:title"]
meta[name="twitter:description"]
```

## Project structure

```text
src/
  components/             Shared UI components, app shell and footer
  config/                 Navigation, role profiles and map profiles
  data/                   Player data, team data and dataset metadata
  hooks/                  Route/title/meta hooks
  pages/                  Route-level pages
  App.tsx                 BrowserRouter and route table
  data.ts                 Compatibility data export
  index.css               Global styles
  lib.ts                  Shared scoring and helper functions
  types.ts                Shared TypeScript types

scripts/
  validate-data.mjs       Local data integrity validation
  release-check.mjs       Local release gate
  generate-sitemap.mjs    Dynamic sitemap generator
```

## Data layer

```text
src/data/players.ts       Player profiles
src/data/teams.ts         Team profiles
src/data/meta.ts          Dataset version, status and source notes
src/data/index.ts         Public data exports
src/data/README.md        Data rules and future real-stat notes
```

Current data status:

```text
Status: demo/manual data
Purpose: MVP navigation, UI testing and product logic
Not intended as: live esports statistics
```

Real-stat migration plan:

```text
docs/REAL_STATS_PLAN.md
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

Generate sitemap:

```bash
npm run generate:sitemap
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

Build production bundle:

```bash
npm run build
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
npm run generate:sitemap
npm run validate:data
npm run lint
npm run format:check
npm run build
```

Quality config files:

```text
scripts/generate-sitemap.mjs
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
npm run generate:sitemap
npm run validate:data
npm run lint
npm run format:check
npm run build
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Sitemap

The sitemap is generated from local source files by:

```text
scripts/generate-sitemap.mjs
```

Output:

```text
public/sitemap.xml
```

Detailed sitemap documentation:

```text
docs/SITEMAP.md
```

## Data roadmap

ClutchLab should move from demo/manual values to real statistics in phases:

```text
1. Keep identity data separate from performance data.
2. Add source metadata for every raw stat group.
3. Store raw stats separately from derived scores.
4. Make manual adjustments explicit.
5. Validate sources, periods, sample sizes and derived score ranges.
6. Keep UI disclosure clear: demo/manual vs real-stat.
```

Detailed plan:

```text
docs/REAL_STATS_PLAN.md
```

## Deployment

The project is configured for Vercel.

Typical deployment flow:

```bash
npm run release:check
git add -A
git commit -m "Your commit message"
git push
```

Vercel then builds the latest pushed version.

## SEO and UX polish

Current SEO/UX polish includes:

```text
[✓] static index.html meta
[✓] route-based browser titles
[✓] route-based meta descriptions
[✓] Open Graph title/description route updates
[✓] Twitter title/description route updates
[✓] generated sitemap.xml
[✓] sitemap detail routes
[✓] robots.txt
[✓] compact mobile header
[✓] horizontal mobile navigation
[✓] active mobile route visibility
[✓] keyboard focus ring on navigation links
[✓] app-wide footer
[✓] visible MVP version
[✓] visible data status
[✓] visible data updated date
[✓] GitHub, Changelog, Data, Sitemap and Live site links
```

## Roadmap

- Add source metadata scaffolding
- Add raw stats type definitions
- Add derived score type definitions
- Add real-stat validation script
- Replace demo/manual values with manually curated real statistics later
- Add source metadata per stat group
- Track update dates and event windows
- Separate identity data from current performance data
- Add richer map-specific statistics
- Add automated data generation or backend/API later

## Important note

ClutchLab is not currently a live ranking system. It is a product MVP with a clean
interface, static local data and clear boundaries around demo/manual scoring.
