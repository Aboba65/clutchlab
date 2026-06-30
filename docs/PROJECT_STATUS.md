# Project Status

## Project

ClutchLab

## Current version

```text
0.1.8 Source metadata scaffold
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
real-stat migration plan and a source metadata scaffold.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

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

Current source scaffold includes:

```text
[✓] dataSources
[✓] sourceGroups
[✓] SourceStatus
[✓] SourceKind
[✓] SourceConfidence
[✓] ClutchLabDataSource
[✓] ClutchLabSourceGroup
```

Current source groups:

```text
current-mvp-demo-layer
future-real-stat-layer
```

Current sources:

```text
demo-player-ratings
demo-team-ratings
demo-map-profiles
demo-role-profiles
future-real-player-stats
future-real-team-stats
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
[✓] Data layer README
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
[✓] route meta descriptions
[✓] dynamic sitemap generator
[✓] generated sitemap detail routes
[✓] real-stat data plan
[✓] favicon.svg
[✓] og-image.svg
[✓] site.webmanifest
[✓] robots.txt
[✓] sitemap.xml
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
npm run lint
npm run format:check
npm run build
```

### Sitemap generation

```bash
npm run generate:sitemap
```

Output:

```text
public/sitemap.xml
```

### Data validation

```bash
npm run validate:data
```

### Source validation

```bash
npm run validate:sources
```

Validator:

```text
scripts/validate-sources.mjs
```

Checks:

```text
[✓] dataSources export exists
[✓] sourceGroups export exists
[✓] source ids are unique
[✓] source group ids are unique
[✓] each source has id, name and description
[✓] each source has valid kind
[✓] each source has valid status
[✓] each source has valid confidence
[✓] each source covers at least one app area
[✓] sourceGroups reference existing source ids
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
npm run lint
npm run format:check
npm run build
```

## Data roadmap

Documents:

```text
docs/REAL_STATS_PLAN.md
docs/DATA_SOURCES.md
```

Current data architecture direction:

```text
[✓] demo/manual status is explicit
[✓] source scaffolding exists
[✓] planned real-stat source placeholders exist
[ ] raw stat type definitions
[ ] derived score type definitions
[ ] real-stat validation script
[ ] manually curated real-stat sample
```

## SEO and UX polish

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
[✓] footer status block
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
src/data/meta.ts
src/data/README.md
src/lib.ts
src/types.ts
scripts/generate-sitemap.mjs
scripts/validate-data.mjs
scripts/validate-sources.mjs
scripts/release-check.mjs
eslint.config.js
.prettierrc
.prettierignore
.github/workflows/ci.yml
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
docs/SITEMAP.md
docs/REAL_STATS_PLAN.md
docs/DATA_SOURCES.md
docs/ARCHITECTURE.md
docs/RELEASE_CHECKLIST.md
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
- Source metadata exists but real-stat rows are not connected yet
- No automatic match updates
- No event-window filtering yet

### Product limitations

- Saved Rosters are stored only in the current browser via `localStorage`
- No user accounts
- No backend

### Quality limitations

- There are no unit tests yet
- There are no component tests yet
- Data validation, source validation and sitemap generation are source-text based,
  not AST-based

### SEO limitations

- Open Graph image is still a static SVG placeholder
- Route metadata is client-side because the app is a client-side SPA

## Recommended next steps

### 1. Raw stat type definitions

```text
[ ] PlayerRawStats
[ ] TeamRawStats
[ ] MapRawStats
[ ] SourceWindow
[ ] SampleSizeRules
```

### 2. Derived score type definitions

```text
[ ] PlayerDerivedScore
[ ] TeamDerivedScore
[ ] MapFitScore
[ ] RosterValueScore
```

### 3. Real-stat validation

```text
[ ] validate sourceId references
[ ] validate stat periods
[ ] validate minimum sample sizes
[ ] validate derived score ranges
```

## Build commands

```bash
npm install
npm run dev
npm run generate:sitemap
npm run validate:data
npm run validate:sources
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
