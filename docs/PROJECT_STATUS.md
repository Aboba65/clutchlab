# Project Status

## Project

ClutchLab

## Current version

```text
0.2.6 Real-derived scaffold validation
```

## Live site

```text
https://clutchlab-olive.vercel.app/
```

## Repository

```text
https://github.com/Aboba65/clutchlab
```

## Summary

ClutchLab is a CS2 analytics MVP for exploring players, teams, maps, roles,
roster construction and matchup comparison.

The product now has a complete first version of the interface, a stronger quality
workflow, mobile polish, route-level SEO metadata, dynamic sitemap generation, a
real-stat migration plan, source metadata, raw-stat model types, manual sample
raw stats, raw-stat sample validation, derived-score model types, manual sample
derived scores, derived-score sample validation, model validation, a visible
Sample Data preview page, a score adapter layer, score adapter validation,
adapter metadata displayed on `/sample-data`, a real-derived score plan, a
real-derived scaffold and real-derived scaffold validation.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

## Data architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → score adapters → real-derived scaffold → sample preview page → future UI scores
```

Implemented real-stat files:

```text
[✓] docs/REAL_STATS_PLAN.md
[✓] docs/DATA_SOURCES.md
[✓] docs/RAW_STATS_MODEL.md
[✓] docs/SAMPLE_REAL_STATS.md
[✓] docs/SAMPLE_STATS_VALIDATION.md
[✓] docs/DERIVED_SCORES_MODEL.md
[✓] docs/SAMPLE_DERIVED_SCORES.md
[✓] docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
[✓] docs/SAMPLE_DATA_PAGE.md
[✓] docs/UI_MIGRATION_PLAN.md
[✓] docs/SCORE_ADAPTERS.md
[✓] docs/SCORE_ADAPTERS_VALIDATION.md
[✓] docs/REAL_DERIVED_SCORES_PLAN.md
[✓] docs/REAL_DERIVED_SCORES.md
[✓] docs/REAL_DERIVED_SCORES_VALIDATION.md
[✓] docs/MODEL_VALIDATION.md
[✓] src/data/sources.ts
[✓] src/data/rawStats.ts
[✓] src/data/sampleRawStats.ts
[✓] src/data/derivedScores.ts
[✓] src/data/sampleDerivedScores.ts
[✓] src/data/scoreAdapters.ts
[✓] src/data/realDerivedScores.ts
[✓] src/pages/SampleDataPage.tsx
[✓] scripts/validate-sources.mjs
[✓] scripts/validate-models.mjs
[✓] scripts/validate-sample-stats.mjs
[✓] scripts/validate-sample-derived-scores.mjs
[✓] scripts/validate-score-adapters.mjs
[✓] scripts/validate-real-derived-scores.mjs
```

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

```bash
npm run validate:real-derived-scores
```

Validation docs:

```text
docs/REAL_DERIVED_SCORES_VALIDATION.md
```

Current state:

```text
status: planned
source: real-derived
readyForPublicUi: false
realPlayerDerivedScores: []
realTeamDerivedScores: []
realMapFitScores: []
realRosterValueScores: []
```

Validation currently protects:

```text
[✓] real-derived arrays stay empty
[✓] metadata status remains planned
[✓] source remains real-derived
[✓] readyForPublicUi remains false
[✓] coverage summary derives counts from arrays
[✓] exports are wired through src/data/index.ts and src/data.ts
[✓] no public page imports realDerivedScores directly
```

## Score adapters

Source file:

```text
src/data/scoreAdapters.ts
```

Validation:

```bash
npm run validate:score-adapters
```

Current adapter boundary:

```text
Only src/pages/SampleDataPage.tsx may import scoreAdapters.ts.
```

Future adapter priority:

```text
real-derived → sample-derived → demo-manual fallback
```

## Sample Data preview page

Route:

```text
/sample-data
```

Page file:

```text
src/pages/SampleDataPage.tsx
```

The page is clearly marked:

```text
Sample only / not live stats
```

Displayed adapter metadata:

```text
[✓] source
[✓] status
[✓] confidence
[✓] formulaId
[✓] periodStart
[✓] periodEnd
[✓] sourceIds
[✓] fallback reason when relevant
[✓] adapter coverage summary
```

## Current quality workflow

Run this before committing:

```bash
npm run release:check
```

This runs:

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

GitHub runs:

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

## Current sitemap

Current generated route count:

```text
75
```

Current sitemap breakdown:

```text
Static routes: 12
Player routes: 40
Team routes:   8
Map routes:    7
Role routes:   8
```

## Completed product features

```text
[✓] Dashboard homepage
[✓] Player catalog filters and sorting
[✓] Player profile pages
[✓] Team catalog filters and sorting
[✓] Team profile pages
[✓] Map catalog filters and sorting
[✓] Map detail pages
[✓] Role pages and role detail pages
[✓] Player comparison
[✓] Team comparison
[✓] Roster Builder
[✓] Saved Rosters manager
[✓] Sample Data preview page
[✓] Adapter metadata on Sample Data page
[✓] Route page titles
[✓] Route meta descriptions
[✓] Open Graph route meta
[✓] Twitter route meta
[✓] Compact mobile header
[✓] Horizontal mobile navigation
[✓] Data notice
[✓] Footer status block
[✓] Dynamic sitemap generation
[✓] About / Methodology page
```

## Known limitations

### Data limitations

- Dataset is static
- Dataset is manually created
- Ratings are not live
- Prices are internal MVP values
- Score adapters currently read sample-derived rows only
- Real-derived layer is a planned empty scaffold
- Only SampleDataPage may import score adapters
- Public pages intentionally do not import score adapters or realDerivedScores
- Source metadata exists but real-stat rows are not connected to UI yet
- Sample rows do not replace demo/manual UI scores
- No automatic match updates
- No event-window filtering yet

### Product limitations

- Saved Rosters are stored only in the current browser via `localStorage`
- No user accounts
- No backend

### Quality limitations

- There are no unit tests yet
- There are no component tests yet
- Data validation, source validation, model validation, sample validation, adapter
  validation, real-derived validation and sitemap generation are source-text
  based, not AST-based

## Recommended next steps

### 1. Generic score adapter plan

```text
[ ] define getPlayerDerivedScore(playerId, options)
[ ] define getTeamDerivedScore(teamId, options)
[ ] define getMapFitScore(args, options)
[ ] define getRosterValueScore(rosterId, options)
[ ] default allowSample=false
[ ] default preferReal=true
```

### 2. Future real-derived row validation

```text
[ ] validate player ids
[ ] validate team ids
[ ] validate map ids
[ ] validate formula ids
[ ] validate source ids
[ ] validate confidence
[ ] validate score ranges
```

## Build commands

```bash
npm install
npm run dev
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run validate:sample-derived-scores
npm run validate:score-adapters
npm run validate:real-derived-scores
npm run lint
npm run format
npm run format:check
npm run build
npm run release:check
npm run preview
```

## Deploy flow

```bash
npm run release:check
git add -A
git commit -m "Your commit message"
git push
```

Vercel deploys from the pushed repository.
