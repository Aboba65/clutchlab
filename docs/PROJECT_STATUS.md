# Project Status

## Project

ClutchLab

## Current version

```text
0.2.5 Adapter metadata on Sample Data
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
Sample Data preview page, a score adapter layer, score adapter validation and
adapter metadata displayed on `/sample-data`.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

## Real-stat architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → score adapters → sample preview page → future UI scores
```

Implemented real-stat scaffold files:

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
[✓] docs/MODEL_VALIDATION.md
[✓] src/data/sources.ts
[✓] src/data/rawStats.ts
[✓] src/data/sampleRawStats.ts
[✓] src/data/derivedScores.ts
[✓] src/data/sampleDerivedScores.ts
[✓] src/data/scoreAdapters.ts
[✓] src/pages/SampleDataPage.tsx
[✓] scripts/validate-sources.mjs
[✓] scripts/validate-models.mjs
[✓] scripts/validate-sample-stats.mjs
[✓] scripts/validate-sample-derived-scores.mjs
[✓] scripts/validate-score-adapters.mjs
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

Documentation:

```text
docs/SAMPLE_DATA_PAGE.md
```

The page is clearly marked:

```text
Sample only / not live stats
```

The page does not replace current demo/manual UI scoring.

## Adapter metadata on Sample Data

`SampleDataPage` now imports score adapter helpers and shows adapter metadata on
derived sample cards.

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

Used helpers:

```text
[✓] getSamplePlayerDerivedScore
[✓] getSampleTeamDerivedScore
[✓] getSampleMapFitScore
[✓] getSampleRosterValueScore
[✓] getScoreAdapterCoverageSummary
[✓] scoreAdapterLayerMeta
```

Important boundary:

```text
Only src/pages/SampleDataPage.tsx may import scoreAdapters.ts.
```

Other public pages remain protected by:

```bash
npm run validate:score-adapters
```

## Score adapters

Source file:

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

## Completed technical work

```text
[✓] React Router route table
[✓] AppShell layout
[✓] Shared UI components
[✓] Route title/meta hook
[✓] Mobile navigation polish
[✓] Footer component
[✓] Data layer split
[✓] dataMeta
[✓] source metadata scaffold
[✓] source metadata validation
[✓] raw stat type model
[✓] sample raw-stat scaffold
[✓] sample stats validation
[✓] derived score type model
[✓] sample derived-score scaffold
[✓] sample derived-score validation
[✓] sample data preview page
[✓] UI migration plan
[✓] score adapter layer
[✓] score adapter validation
[✓] adapter metadata on sample data page
[✓] model validation
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
[✓] route meta descriptions
[✓] dynamic sitemap generator
[✓] /sample-data sitemap route
[✓] real-stat data plan
[✓] Vercel SPA rewrite
[✓] Data validation script
[✓] ESLint config
[✓] Prettier config
[✓] Release check script
[✓] GitHub Actions CI
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

## Data roadmap

Documents:

```text
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
docs/MODEL_VALIDATION.md
```

Current data architecture direction:

```text
[✓] demo/manual status is explicit
[✓] source scaffolding exists
[✓] planned real-stat source placeholders exist
[✓] raw stat model exists
[✓] sample raw-stat rows exist
[✓] sample stats validation exists
[✓] derived score model exists
[✓] sample derived-score rows exist
[✓] sample derived-score validation exists
[✓] sample data preview page exists
[✓] UI migration plan exists
[✓] score adapter layer exists
[✓] score adapter validation exists
[✓] adapter metadata visible on sample page
[✓] source validation exists
[✓] model validation exists
[ ] real-derived score layer
[ ] public UI migration after real coverage
```

## Known limitations

### Data limitations

- Dataset is static
- Dataset is manually created
- Ratings are not live
- Prices are internal MVP values
- Score adapters currently read sample-derived rows only
- Only SampleDataPage may import score adapters
- Public pages intentionally do not import score adapters yet
- Source metadata exists but real-stat rows are not connected to UI yet
- Sample raw-stat rows exist but do not replace demo/manual UI data
- Sample derived-score rows exist but do not replace demo/manual UI scores
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
  validation and sitemap generation are source-text based, not AST-based

## Recommended next steps

### 1. Real-derived score layer plan

```text
[ ] define future realDerivedScores file shape
[ ] extend adapters to prefer real-derived rows later
[ ] preserve demo/manual fallback
[ ] keep score source visible
```

### 2. Sample Data page polish

```text
[ ] improve density of adapter metadata cards
[ ] add filters for raw stats vs derived scores
[ ] add component breakdown expansion
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
