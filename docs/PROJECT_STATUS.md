# Project Status

## Project

ClutchLab

## Current version

```text
0.2.9 Sample Data generic adapters
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
real-derived scaffold, real-derived scaffold validation, generic score adapter
documentation, generic score adapters implemented in code, validation for generic
adapter safety rules, and `/sample-data` migrated to generic adapters with
`allowSample=true`.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

## Data architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → score adapters → real-derived scaffold → generic adapters → sample preview page → future UI scores
```

Implemented real-stat and adapter files:

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
[✓] docs/GENERIC_SCORE_ADAPTERS_PLAN.md
[✓] docs/GENERIC_SCORE_ADAPTERS.md
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

## Generic score adapters

Source file:

```text
src/data/scoreAdapters.ts
```

Implemented generic helper API:

```text
[✓] getPlayerDerivedScore(playerId, options?)
[✓] getTeamDerivedScore(teamId, options?)
[✓] getMapFitScoresForEntity(entityId, entityType, options?)
[✓] getMapFitScore({ mapId, entityId, entityType }, options?)
[✓] getRosterValueScore(rosterId, options?)
```

Implemented support API:

```text
[✓] ScoreAdapterOptions
[✓] defaultScoreAdapterOptions
[✓] resolveScoreAdapterOptions
[✓] hasScoreAdapterValue(result)
[✓] getScoreAdapterCoverageSummary()
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

Current behavior:

```text
[✓] real-derived arrays are empty
[✓] generic helpers fall back by default
[✓] sample-derived rows require allowSample=true
[✓] /sample-data opts into sample-derived preview rows
[✓] public scoring pages are not migrated
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

Current behavior:

```text
[✓] getPlayerDerivedScore(..., { allowSample: true })
[✓] getTeamDerivedScore(..., { allowSample: true })
[✓] getMapFitScore(..., { allowSample: true })
[✓] getRosterValueScore(..., { allowSample: true })
[✓] sample-only label remains visible
[✓] not-live-stats label remains visible
[✓] optional raw stat fields render as n/a
[✓] optional derived score fields render as n/a
[✓] public pages remain unchanged
[✓] public scoring remains unchanged
```

## Score adapter validation

Command:

```bash
npm run validate:score-adapters
```

Current validation protects:

```text
[✓] generic helper exports exist
[✓] safe defaults exist
[✓] real-derived/active path exists
[✓] sample-derived/sample path is gated behind allowSample
[✓] demo-manual/fallback path exists
[✓] coverage summary includes sample and real-derived counts
[✓] public pages do not pass allowSample: true
[✓] public pages do not call getSample* helpers
[✓] public pages do not import sampleDerivedScores or realDerivedScores directly
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
[✓] Sample Data generic adapter usage
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
- Real-derived layer is a planned empty scaffold
- Generic helpers are implemented but not used by public scoring pages yet
- Only SampleDataPage may opt into sample rows with `allowSample=true`
- Public pages intentionally do not import sampleDerivedScores or realDerivedScores
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

### 1. Add read-only generic adapter preview blocks later

```text
[ ] /players/:playerId preview block
[ ] /teams/:teamId preview block
[ ] no catalog sorting migration yet
[ ] no roster-builder scoring migration yet
```

### 2. Add real-derived row validation when real data exists

```text
[ ] validate real player derived rows
[ ] validate real team derived rows
[ ] validate real map fit rows
[ ] validate real roster value rows
[ ] validate coverage gates
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
