# Project Status

## Project

ClutchLab

## Current version

```text
0.2.1 Sample stats validation
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
real-stat migration plan, source metadata, raw-stat model types, a manual sample
raw-stat scaffold, sample stats validation, derived-score model types and model
validation.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

## Real-stat architecture

Current architecture direction:

```text
source metadata → raw stats → sample raw stats → derived scores → UI scores
```

Implemented real-stat scaffold files:

```text
[✓] docs/REAL_STATS_PLAN.md
[✓] docs/DATA_SOURCES.md
[✓] docs/RAW_STATS_MODEL.md
[✓] docs/SAMPLE_REAL_STATS.md
[✓] docs/SAMPLE_STATS_VALIDATION.md
[✓] docs/DERIVED_SCORES_MODEL.md
[✓] docs/MODEL_VALIDATION.md
[✓] src/data/sources.ts
[✓] src/data/rawStats.ts
[✓] src/data/sampleRawStats.ts
[✓] src/data/derivedScores.ts
[✓] scripts/validate-sources.mjs
[✓] scripts/validate-models.mjs
[✓] scripts/validate-sample-stats.mjs
```

## Sample raw stats

Source file:

```text
src/data/sampleRawStats.ts
```

Documentation:

```text
docs/SAMPLE_REAL_STATS.md
```

Current sample contents:

```text
Players: 3
Teams:   2
Windows: 2
```

Current sample player ids:

```text
zywoo
donk
monesy
```

Current sample team ids:

```text
vitality
spirit
```

The sample is not connected to current UI scoring.

## Sample stats validation

Command:

```bash
npm run validate:sample-stats
```

Script:

```text
scripts/validate-sample-stats.mjs
```

Documentation:

```text
docs/SAMPLE_STATS_VALIDATION.md
```

Current sample validation checks:

```text
[✓] sample player ids exist
[✓] sample team ids exist
[✓] sample source ids exist
[✓] stat window dates are valid
[✓] periodStart is before or equal to periodEnd
[✓] mapsPlayed and roundsPlayed are positive
[✓] non-negative numeric fields are not negative
[✓] percentage fields are between 0 and 100
[✓] sampleRawStatsSummary derives counts from sample arrays
```

## Model validation

Command:

```bash
npm run validate:models
```

Script:

```text
scripts/validate-models.mjs
```

Documentation:

```text
docs/MODEL_VALIDATION.md
```

## Source metadata scaffold

Source file:

```text
src/data/sources.ts
```

Documentation:

```text
docs/DATA_SOURCES.md
```

Validation:

```bash
npm run validate:sources
```

## Raw stat model

Source file:

```text
src/data/rawStats.ts
```

Documentation:

```text
docs/RAW_STATS_MODEL.md
```

## Derived score model

Source file:

```text
src/data/derivedScores.ts
```

Documentation:

```text
docs/DERIVED_SCORES_MODEL.md
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
[✓] model validation
[✓] Data layer README
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
[✓] route meta descriptions
[✓] dynamic sitemap generator
[✓] generated sitemap detail routes
[✓] real-stat data plan
[✓] Vercel SPA rewrite
[✓] Data validation script
[✓] ESLint config
[✓] Prettier config
[✓] Release check script
[✓] GitHub Actions CI
```

## Current quality workflow

### Local checks

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
npm run lint
npm run format:check
npm run build
```

### Sitemap generation

```bash
npm run generate:sitemap
```

### Data validation

```bash
npm run validate:data
```

### Source validation

```bash
npm run validate:sources
```

### Model validation

```bash
npm run validate:models
```

### Sample stats validation

```bash
npm run validate:sample-stats
```

### Linting and formatting

```bash
npm run lint
npm run format
npm run format:check
```

### GitHub Actions CI

GitHub runs:

```bash
npm ci
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run lint
npm run format:check
npm run build
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
[✓] source validation exists
[✓] model validation exists
[ ] derived score sample rows
[ ] derived score row validation
```

## Important files

```text
src/App.tsx
src/components/AppShell.tsx
src/components/DataNotice.tsx
src/components/Footer.tsx
src/config/navigation.ts
src/config/maps.ts
src/config/roles.ts
src/hooks/usePageTitle.ts
src/data.ts
src/data/index.ts
src/data/players.ts
src/data/teams.ts
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/meta.ts
src/lib.ts
src/types.ts
scripts/generate-sitemap.mjs
scripts/validate-data.mjs
scripts/validate-sources.mjs
scripts/validate-models.mjs
scripts/validate-sample-stats.mjs
scripts/release-check.mjs
.github/workflows/ci.yml
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
docs/SITEMAP.md
docs/REAL_STATS_PLAN.md
docs/DATA_SOURCES.md
docs/RAW_STATS_MODEL.md
docs/SAMPLE_REAL_STATS.md
docs/SAMPLE_STATS_VALIDATION.md
docs/DERIVED_SCORES_MODEL.md
docs/MODEL_VALIDATION.md
vercel.json
index.html
public/robots.txt
public/sitemap.xml
```

## Known limitations

### Data limitations

- Dataset is static
- Dataset is manually created
- Ratings are not live
- Prices are internal MVP values
- Source metadata exists but real-stat rows are not connected to UI yet
- Sample raw-stat rows exist but do not replace demo/manual UI data
- Derived score types exist but no derived-score rows are connected yet
- No automatic match updates
- No event-window filtering yet

### Product limitations

- Saved Rosters are stored only in the current browser via `localStorage`
- No user accounts
- No backend

### Quality limitations

- There are no unit tests yet
- There are no component tests yet
- Data validation, source validation, model validation, sample validation and
  sitemap generation are source-text based, not AST-based
- Derived score row validation does not exist yet because derived score rows do
  not exist yet

## Recommended next steps

### 1. Derived score sample rows

```text
[ ] add src/data/sampleDerivedScores.ts
[ ] add sample player derived scores
[ ] add sample team derived scores
[ ] document source/formula relationship
```

### 2. Derived score row validation

```text
[ ] validate formula ids
[ ] validate formula source ids
[ ] validate score ranges
[ ] validate low-confidence notes
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
