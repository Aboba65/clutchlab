# Project Status

## Project

ClutchLab

## Current version

```text
0.1.6 Dynamic sitemap generation
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
workflow, mobile polish, route-level SEO metadata and dynamic sitemap generation.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

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
[✓] Data layer README
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
[✓] route meta descriptions
[✓] dynamic sitemap generator
[✓] generated sitemap detail routes
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
npm run lint
npm run format:check
npm run build
```

### Sitemap generation

Command:

```bash
npm run generate:sitemap
```

Script:

```text
scripts/generate-sitemap.mjs
```

Output:

```text
public/sitemap.xml
```

The generator reads:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
src/data/meta.ts
```

Current sitemap coverage:

```text
[✓] static routes
[✓] player detail routes
[✓] team detail routes
[✓] map detail routes
[✓] role detail routes
```

Detailed sitemap documentation:

```text
docs/SITEMAP.md
```

### Data validation

Command:

```bash
npm run validate:data
```

Script:

```text
scripts/validate-data.mjs
```

Current validation checks:

```text
[✓] player ids are unique
[✓] team ids are unique
[✓] map ids are unique
[✓] map names are unique
[✓] player.teamId exists in teams
[✓] team.players ids exist in players
[✓] team.bestMaps values exist in map profiles
[✓] player roles are valid
[✓] player prices are within expected builder range
[✓] player score fields are within 0–100
[✓] team score fields are within 0–100
[✓] map score fields are within 0–100
[✓] warnings for non-bidirectional player/team links
```

### Linting and formatting

```bash
npm run lint
npm run format
npm run format:check
```

Config files:

```text
eslint.config.js
.prettierrc
.prettierignore
```

### GitHub Actions CI

Workflow:

```text
.github/workflows/ci.yml
```

GitHub runs:

```bash
npm ci
npm run generate:sitemap
npm run validate:data
npm run lint
npm run format:check
npm run build
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
src/data/meta.ts
src/data/README.md
src/lib.ts
src/types.ts
scripts/generate-sitemap.mjs
scripts/validate-data.mjs
scripts/release-check.mjs
eslint.config.js
.prettierrc
.prettierignore
.github/workflows/ci.yml
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
docs/SITEMAP.md
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
- No automatic match updates
- No source-level stat tracking yet
- No event-window filtering yet

### Product limitations

- Saved Rosters are stored only in the current browser via `localStorage`
- No user accounts
- No backend

### Quality limitations

- There are no unit tests yet
- There are no component tests yet
- Data validation and sitemap generation are source-text based, not AST-based

### SEO limitations

- Open Graph image is still a static SVG placeholder
- Route metadata is client-side because the app is a client-side SPA

## Recommended next steps

### 1. Real-stat data plan

```text
[ ] define sources
[ ] define update date
[ ] define event/time window
[ ] separate raw stats from derived scores
[ ] document manual adjustments
```

### 2. Testing

```text
[ ] basic smoke tests
[ ] component tests for core pages
[ ] CI test step
```

### 3. Product polish

```text
[ ] loading/empty states audit
[ ] better public data methodology
[ ] static OG image polish
```

## Build commands

```bash
npm install
npm run dev
npm run generate:sitemap
npm run validate:data
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
