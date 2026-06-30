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
0.2.3 Sample data preview page
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
- Source metadata scaffold
- Source metadata validation
- Raw stat type model
- Derived score type model
- Model validation for raw-stat and derived-score scaffolds
- Manual sample raw-stat scaffold
- Sample raw-stat row validation
- Manual sample derived-score scaffold
- Sample derived-score row validation
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

## Project structure

```text
src/
  components/             Shared UI components, app shell and footer
  config/                 Navigation, role profiles and map profiles
  data/                   Player, team, source, raw-stat and score models
  hooks/                  Route/title/meta hooks
  pages/                  Route-level pages
  App.tsx                 BrowserRouter and route table
  data.ts                 Compatibility data export
  index.css               Global styles
  lib.ts                  Shared scoring and helper functions
  types.ts                Shared TypeScript types

scripts/
  generate-sitemap.mjs                    Dynamic sitemap generator
  validate-data.mjs                       Local data integrity validation
  validate-sources.mjs                    Local source metadata validation
  validate-models.mjs                     Local raw/derived model validation
  validate-sample-stats.mjs               Local sample raw-stat row validation
  validate-sample-derived-scores.mjs      Local sample derived-score row validation
  release-check.mjs                       Local release gate
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
docs/MODEL_VALIDATION.md
docs/REAL_STATS_PLAN.md
```

## Real-stat architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → sample preview page → future UI scores
```

Current model files:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
```

Current model documentation:

```text
docs/DATA_SOURCES.md
docs/RAW_STATS_MODEL.md
docs/SAMPLE_REAL_STATS.md
docs/SAMPLE_STATS_VALIDATION.md
docs/DERIVED_SCORES_MODEL.md
docs/SAMPLE_DERIVED_SCORES.md
docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
docs/SAMPLE_DATA_PAGE.md
docs/MODEL_VALIDATION.md
```

## Sample Data preview page

The sample data layer is visible at:

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

The page previews:

```text
samplePlayerRawStats
sampleTeamRawStats
samplePlayerDerivedScores
sampleTeamDerivedScores
sampleMapFitScores
sampleRosterValueScores
```

It is clearly marked as:

```text
Sample only / not live stats
```

The page does not replace the current player catalog, team pages, map pages,
compare pages or roster builder scoring.

## Source metadata

Source metadata is defined in:

```text
src/data/sources.ts
```

Current source validation command:

```bash
npm run validate:sources
```

## Raw stat model and sample

Raw stat types are defined in:

```text
src/data/rawStats.ts
```

Manual sample raw stats are defined in:

```text
src/data/sampleRawStats.ts
```

Current sample raw-stat validation command:

```bash
npm run validate:sample-stats
```

## Derived score model and sample

Derived score types are defined in:

```text
src/data/derivedScores.ts
```

Manual sample derived scores are defined in:

```text
src/data/sampleDerivedScores.ts
```

They include:

```text
sampleDerivedScoresMeta
samplePlayerDerivedScores
sampleTeamDerivedScores
sampleMapFitScores
sampleRosterValueScores
sampleDerivedScoresSummary
```

Current sample derived-score coverage:

```text
Player derived scores: 3
Team derived scores:   2
Map fit scores:        2
Roster value scores:   1
```

Sample derived-score documentation:

```text
docs/SAMPLE_DERIVED_SCORES.md
```

## Sample derived-score validation

Sample derived-score validation is handled by:

```text
scripts/validate-sample-derived-scores.mjs
```

Command:

```bash
npm run validate:sample-derived-scores
```

Documentation:

```text
docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
```

## Model validation

Model validation is handled by:

```text
scripts/validate-models.mjs
```

Command:

```bash
npm run validate:models
```

Documentation:

```text
docs/MODEL_VALIDATION.md
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

Current generated sitemap route count:

```text
75 routes
```

The sitemap includes:

```text
12 static routes
40 player routes
8 team routes
7 map routes
8 role routes
```

Detailed sitemap documentation:

```text
docs/SITEMAP.md
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
[✓] /sample-data sitemap route
[✓] robots.txt
[✓] compact mobile header
[✓] horizontal mobile navigation
[✓] active mobile route visibility
[✓] keyboard focus ring on navigation links
[✓] app-wide footer
[✓] visible MVP version
[✓] visible data status
[✓] visible data updated date
[✓] GitHub, Changelog, Data, Sources, Sample stats, Sample scores and Live site links
```

## Roadmap

- Improve Sample Data page display names once the player model exposes a display name
- Add a UI migration plan for moving demo/manual scores to derived scores
- Expand manual sample stat coverage
- Connect a non-production analytics preview to more sample fields
- Replace demo/manual values with manually curated real statistics later
- Track update dates and event windows
- Add richer map-specific statistics
- Add automated data generation or backend/API later

## Important note

ClutchLab is not currently a live ranking system. It is a product MVP with a clean
interface, static local data, source metadata scaffolding, raw-stat model types,
sample raw-stat validation, derived-score model types, sample derived-score
validation, a visible sample data preview page and clear boundaries around
demo/manual scoring.
