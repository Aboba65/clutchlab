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

Current documented version:

```text
0.2.8 Generic score adapters
```

ClutchLab is still an MVP with a static local data layer. Current ratings,
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
- Source metadata scaffold and validation
- Raw-stat model and sample raw-stat validation
- Derived-score model and sample derived-score validation
- Score adapter layer and validation
- Real-derived score plan, scaffold and validation
- Generic score adapters implemented with safe defaults
- Generic score adapter validation
- Dynamic sitemap generation
- Route-based title/meta updates
- GitHub Actions CI and local release gate

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

## Data architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → score adapters → real-derived scaffold → generic adapters → sample preview page → future UI scores
```

Current data/model files:

```text
src/data/players.ts
src/data/teams.ts
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
src/data/scoreAdapters.ts
src/data/realDerivedScores.ts
src/data/meta.ts
src/data/index.ts
src/data.ts
```

Current data status:

```text
Status: demo/manual data
Purpose: MVP navigation, UI testing and product logic
Not intended as: live esports statistics
```

## Generic score adapters

Source file:

```text
src/data/scoreAdapters.ts
```

Documentation:

```text
docs/GENERIC_SCORE_ADAPTERS_PLAN.md
docs/GENERIC_SCORE_ADAPTERS.md
docs/SCORE_ADAPTERS.md
docs/SCORE_ADAPTERS_VALIDATION.md
```

Implemented generic helper API:

```text
getPlayerDerivedScore(playerId, options?)
getTeamDerivedScore(teamId, options?)
getMapFitScoresForEntity(entityId, entityType, options?)
getMapFitScore({ mapId, entityId, entityType }, options?)
getRosterValueScore(rosterId, options?)
```

Implemented support API:

```text
ScoreAdapterOptions
defaultScoreAdapterOptions
resolveScoreAdapterOptions
hasScoreAdapterValue(result)
getScoreAdapterCoverageSummary()
```

Safe defaults:

```text
allowSample=false
preferReal=true
```

Source priority:

```text
real-derived → sample-derived only if allowSample=true → demo-manual fallback
```

Important behavior:

```text
Current real-derived arrays are empty.
Generic helpers therefore fall back by default.
Sample rows are used only when allowSample=true.
Public UI has not migrated to generic adapters yet.
```

## Score adapter validation

Command:

```bash
npm run validate:score-adapters
```

Validation protects:

```text
[✓] ScoreAdapterOptions exists
[✓] default allowSample=false
[✓] default preferReal=true
[✓] generic helper exports exist
[✓] real-derived/active path exists
[✓] sample-derived/sample path is gated behind allowSample
[✓] demo-manual/fallback path exists
[✓] public pages do not pass allowSample: true
[✓] public pages do not call getSample* helpers
[✓] public pages do not import sampleDerivedScores or realDerivedScores directly
```

`SampleDataPage.tsx` remains the only allowed sample-helper exception because it
is a sample-only preview route.

## Real-derived score layer

Plan:

```text
docs/REAL_DERIVED_SCORES_PLAN.md
```

Scaffold:

```text
src/data/realDerivedScores.ts
docs/REAL_DERIVED_SCORES.md
```

Validation:

```text
scripts/validate-real-derived-scores.mjs
docs/REAL_DERIVED_SCORES_VALIDATION.md
```

Command:

```bash
npm run validate:real-derived-scores
```

Current scaffold state:

```text
status: planned
source: real-derived
readyForPublicUi: false
realPlayerDerivedScores: []
realTeamDerivedScores: []
realMapFitScores: []
realRosterValueScores: []
```

The scaffold intentionally contains no fake real-derived rows and does not change
public UI scoring.

## Sample Data preview page

Route:

```text
/sample-data
```

Page file:

```text
src/pages/SampleDataPage.tsx
```

Documentation:

```text
docs/SAMPLE_DATA_PAGE.md
```

The page is clearly marked:

```text
Sample only / not live stats
```

It shows adapter metadata for derived sample cards:

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

## Documentation index

```text
docs/PROJECT_STATUS.md
docs/REAL_STATS_PLAN.md
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
docs/REAL_DERIVED_SCORES_PLAN.md
docs/REAL_DERIVED_SCORES.md
docs/REAL_DERIVED_SCORES_VALIDATION.md
docs/GENERIC_SCORE_ADAPTERS_PLAN.md
docs/GENERIC_SCORE_ADAPTERS.md
docs/MODEL_VALIDATION.md
docs/SITEMAP.md
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

Run full release check:

```bash
npm run release:check
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
npm run validate:real-derived-scores
npm run lint
npm run format:check
npm run build
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
npm run validate:real-derived-scores
npm run lint
npm run format:check
npm run build
```

## Sitemap

Dynamic sitemap generator:

```text
scripts/generate-sitemap.mjs
```

Current generated sitemap route count:

```text
75 routes
```

Breakdown:

```text
12 static routes
40 player routes
8 team routes
7 map routes
8 role routes
```

## Deployment

Typical deployment flow:

```bash
npm run release:check
git add -A
git commit -m "Your commit message"
git push
```

Vercel then builds the latest pushed version.

## Roadmap

- Use generic adapters in preview-only blocks first
- Extend real-derived validation when real rows exist
- Add real-derived row coverage gates
- Keep public scoring stable until coverage gates pass
- Replace demo/manual values only after validated real-derived coverage exists
- Add backend/API or automated ingestion later

## Important note

ClutchLab is not currently a live ranking system. It is a product MVP with a clean
interface, static local data, source metadata scaffolding, raw-stat model types,
sample validation, derived-score model types, score adapters, real-derived score
planning/scaffold validation, generic adapters with safe defaults, and clear
boundaries around demo/manual scoring.
