# Project Status

## Project

ClutchLab

## Current version

```text
0.2.3 Sample data preview page
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
derived scores, derived-score sample validation, model validation and a visible
Sample Data preview page.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

## Real-stat architecture

Current architecture direction:

```text
source metadata → sample raw stats → sample derived scores → sample preview page → future UI scores
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
[✓] docs/MODEL_VALIDATION.md
[✓] src/data/sources.ts
[✓] src/data/rawStats.ts
[✓] src/data/sampleRawStats.ts
[✓] src/data/derivedScores.ts
[✓] src/data/sampleDerivedScores.ts
[✓] src/pages/SampleDataPage.tsx
[✓] scripts/validate-sources.mjs
[✓] scripts/validate-models.mjs
[✓] scripts/validate-sample-stats.mjs
[✓] scripts/validate-sample-derived-scores.mjs
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

The page displays:

```text
[✓] samplePlayerRawStats
[✓] sampleTeamRawStats
[✓] sampleRawStatsSummary
[✓] sampleRawStatsMeta
[✓] samplePlayerDerivedScores
[✓] sampleTeamDerivedScores
[✓] sampleMapFitScores
[✓] sampleRosterValueScores
[✓] sampleDerivedScoresSummary
[✓] sampleDerivedScoresMeta
```

The page is clearly marked:

```text
Sample only / not live stats
```

The page does not replace current demo/manual UI scoring.

## Sample derived scores

Source file:

```text
src/data/sampleDerivedScores.ts
```

Documentation:

```text
docs/SAMPLE_DERIVED_SCORES.md
```

Current sample contents:

```text
Player derived scores: 3
Team derived scores:   2
Map fit scores:        2
Roster value scores:   1
```

Validation:

```bash
npm run validate:sample-derived-scores
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

Validation:

```bash
npm run validate:sample-stats
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
[✓] Sample Data preview page
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
[✓] model validation
[✓] Data layer README
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
[✓] route meta descriptions
[✓] dynamic sitemap generator
[✓] generated sitemap detail routes
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
npm run validate:sample-derived-scores
npm run lint
npm run format:check
npm run build
```

### Sitemap generation

```bash
npm run generate:sitemap
```

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

### Sample raw-stat validation

```bash
npm run validate:sample-stats
```

### Sample derived-score validation

```bash
npm run validate:sample-derived-scores
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
npm run validate:sample-derived-scores
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
docs/SAMPLE_DERIVED_SCORES.md
docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
docs/SAMPLE_DATA_PAGE.md
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
[✓] source validation exists
[✓] model validation exists
[ ] UI migration plan
[ ] player display names in sample preview
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
src/pages/SampleDataPage.tsx
src/data.ts
src/data/index.ts
src/data/players.ts
src/data/teams.ts
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
src/data/meta.ts
src/lib.ts
src/types.ts
scripts/generate-sitemap.mjs
scripts/validate-data.mjs
scripts/validate-sources.mjs
scripts/validate-models.mjs
scripts/validate-sample-stats.mjs
scripts/validate-sample-derived-scores.mjs
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
docs/SAMPLE_DERIVED_SCORES.md
docs/SAMPLE_DERIVED_SCORES_VALIDATION.md
docs/SAMPLE_DATA_PAGE.md
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
- Sample derived-score rows exist but do not replace demo/manual UI scores
- Sample Data page currently displays player ids because `CS2Player` does not
  expose a display name field
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

## Recommended next steps

### 1. UI migration plan

```text
[ ] document how demo/manual player scores could move to derived scores
[ ] document how team scores could move to derived scores
[ ] document how roster builder could consume RosterValueScore later
```

### 2. Sample Data page polish

```text
[ ] improve player display names
[ ] add links from sample rows to player/team/map detail pages
[ ] add filters for raw stats vs derived scores
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
