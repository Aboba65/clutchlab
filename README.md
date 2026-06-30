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
0.2.5 Adapter metadata on Sample Data
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
- Sample Data preview page
- Adapter metadata shown on Sample Data derived-score cards
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
- UI migration plan
- Source metadata scaffold
- Source metadata validation
- Raw stat type model
- Derived score type model
- Model validation for raw-stat and derived-score scaffolds
- Manual sample raw-stat scaffold
- Sample raw-stat row validation
- Manual sample derived-score scaffold
- Sample derived-score row validation
- Score adapter layer
- Score adapter validation
- Product-facing sample data preview route

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
/sample-data              Sample Data preview
/traits                   Traits
/about                    About / Methodology
/builder                  Redirect to /roster-builder
```

## Data layer

```text
src/data/players.ts              Player profiles
src/data/teams.ts                Team profiles
src/data/sources.ts              Source metadata scaffold
src/data/rawStats.ts             Future raw-stat type model
src/data/sampleRawStats.ts       Manual sample raw-stat scaffold
src/data/derivedScores.ts        Future derived-score type model
src/data/sampleDerivedScores.ts  Manual sample derived-score scaffold
src/data/scoreAdapters.ts        Read-only score adapter layer
src/data/meta.ts                 Dataset version, status and source notes
src/data/index.ts                Public data exports
src/data/README.md               Data rules and future real-stat notes
```

Current data status:

```text
Status: demo/manual data
Purpose: MVP navigation, UI testing and product logic
Not intended as: live esports statistics
```

Data and model documentation:

```text
docs/DATA_SOURCES.md
docs/RAW_STATS_MODEL.md
docs/SAMPLE_REAL_STATS.md
docs/SAMPLE_STATS_VALIDATION.md
docs/DERIVED_SCORES_MODEL.md
docs/SAMPLE_DERIVED_SCORES.md
docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
docs/SAMPLE_DATA_PAGE.md
docs/UI_MIGRATION_PLAN.md
docs/SCORE_ADAPTERS.md
docs/SCORE_ADAPTERS_VALIDATION.md
docs/MODEL_VALIDATION.md
docs/REAL_STATS_PLAN.md
```

## Real-stat architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → score adapters → sample preview page → future UI scores
```

Current model files:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
src/data/scoreAdapters.ts
```

## Score adapters

The score adapter layer is defined in:

```text
src/data/scoreAdapters.ts
```

Documentation:

```text
docs/SCORE_ADAPTERS.md
```

Validation:

```bash
npm run validate:score-adapters
```

Validation documentation:

```text
docs/SCORE_ADAPTERS_VALIDATION.md
```

Current adapter status:

```text
sample-only
```

Current helpers:

```text
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleMapFitScore({ mapId, entityId, entityType })
getSampleRosterValueScore(rosterId)
hasSamplePlayerDerivedScore(playerId)
hasSampleTeamDerivedScore(teamId)
hasSampleRosterValueScore(rosterId)
getScoreAdapterCoverageSummary()
```

The adapter layer returns a shared result shape:

```text
ScoreAdapterResult<T>
```

The adapter layer does not change public scoring behavior.

## Adapter metadata on Sample Data

The Sample Data page now uses score adapter helpers in the preview-only route:

```text
/sample-data
```

Page file:

```text
src/pages/SampleDataPage.tsx
```

The page shows adapter metadata for derived sample cards:

```text
source
status
confidence
formulaId
periodStart
periodEnd
sourceIds
fallback reason when relevant
```

The page also shows adapter coverage summary from:

```text
getScoreAdapterCoverageSummary()
```

Important boundary:

```text
Only src/pages/SampleDataPage.tsx may import scoreAdapters.ts.
```

The score adapter validator enforces this exception and still blocks other public
route pages from importing score adapters directly.

## UI migration plan

The UI migration plan is documented in:

```text
docs/UI_MIGRATION_PLAN.md
```

It defines how to safely move from demo/manual UI values to future derived scores
without accidentally presenting sample data as live official statistics.

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

Validate source metadata:

```bash
npm run validate:sources
```

Validate model scaffolds:

```bash
npm run validate:models
```

Validate sample raw stats:

```bash
npm run validate:sample-stats
```

Validate sample derived scores:

```bash
npm run validate:sample-derived-scores
```

Validate score adapters:

```bash
npm run validate:score-adapters
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
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run validate:sample-derived-scores
npm run validate:score-adapters
npm run lint
npm run format:check
npm run build
```

Quality config files:

```text
scripts/generate-sitemap.mjs
scripts/validate-data.mjs
scripts/validate-sources.mjs
scripts/validate-models.mjs
scripts/validate-sample-stats.mjs
scripts/validate-sample-derived-scores.mjs
scripts/validate-score-adapters.mjs
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
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run validate:sample-derived-scores
npm run validate:score-adapters
npm run lint
npm run format:check
npm run build
```

## Sitemap

The sitemap is generated from local source files by:

```text
scripts/generate-sitemap.mjs
```

Current generated sitemap route count:

```text
75 routes
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

## Roadmap

- Add adapter-based preview cards for more sample data views
- Extend adapters later to prefer real-derived rows when real data exists
- Keep current public scoring stable until coverage is sufficient
- Improve Sample Data page display names once the player model exposes a display name
- Expand manual sample stat coverage
- Replace demo/manual values with manually curated real statistics later
- Track update dates and event windows
- Add richer map-specific statistics
- Add automated data generation or backend/API later

## Important note

ClutchLab is not currently a live ranking system. It is a product MVP with a clean
interface, static local data, source metadata scaffolding, raw-stat model types,
sample raw-stat validation, derived-score model types, sample derived-score
validation, a score adapter layer with validation, adapter metadata on the
sample-only preview page and clear boundaries around demo/manual scoring.
