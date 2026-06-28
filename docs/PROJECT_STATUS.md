# Project Status

## Project

ClutchLab

## Current version

```text
0.1.2 MVP quality workflow
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

The product now has a complete first version of the interface and a stronger
quality workflow:

- dashboard
- catalogs
- detail pages
- comparison tools
- roster builder
- saved roster management
- methodology page
- public project documentation
- data validation script
- linting
- formatting
- release check script
- GitHub Actions CI

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not
be described as live, official or current esports statistics.

### What is demo/manual

- Player ratings
- Player prices
- Team scores
- Map scores
- Player impact index
- Map fit calculations
- Roster value calculations
- Team comparison scores

### What is real project structure

- Routing
- Components
- Pages
- Local data layer
- Roster builder logic
- Saved rosters via `localStorage`
- Data validation script
- ESLint config
- Prettier config
- Release check script
- GitHub Actions CI
- SEO files
- Documentation structure
- Vercel deployment setup

## Completed pages

```text
[✓] HomePage
[✓] PlayersPage
[✓] PlayerDetailPage
[✓] TeamsPage
[✓] TeamDetailPage
[✓] MapsPage
[✓] MapDetailPage
[✓] RolesPage
[✓] RoleDetailPage
[✓] ComparePage
[✓] TeamComparePage
[✓] RosterBuilderPage
[✓] SavedRostersPage
[✓] TraitsPage
[✓] AboutPage
[✓] NotFoundPage
```

## Completed product features

```text
[✓] Dashboard homepage
[✓] Player catalog filters
[✓] Player catalog sorting
[✓] Team catalog filters
[✓] Team catalog sorting
[✓] Map catalog filters
[✓] Map catalog sorting
[✓] Player detail analytics
[✓] Team detail analytics
[✓] Map detail analytics
[✓] Role detail analytics
[✓] Player comparison
[✓] Team comparison
[✓] Roster Builder
[✓] Saved Rosters manager
[✓] Data notice
[✓] About / Methodology page
```

## Completed technical work

```text
[✓] React Router route table
[✓] AppShell layout
[✓] Shared UI components
[✓] Data layer split
[✓] dataMeta
[✓] Data layer README
[✓] GitHub README
[✓] README badges
[✓] SEO meta tags
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
npm run validate:data
npm run lint
npm run format:check
npm run build
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

### Linting

Command:

```bash
npm run lint
```

Config:

```text
eslint.config.js
```

Current lint setup:

```text
[✓] ESLint flat config
[✓] TypeScript ESLint recommended rules
[✓] React Hooks rules
[✓] React Refresh export rule
[✓] browser globals for app files
[✓] node globals for scripts
```

### Formatting

Format files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Config files:

```text
.prettierrc
.prettierignore
```

### Release check

Command:

```bash
npm run release:check
```

Script:

```text
scripts/release-check.mjs
```

This is the preferred local pre-commit/pre-deploy command.

### GitHub Actions CI

Workflow:

```text
.github/workflows/ci.yml
```

GitHub runs on push and pull request to `main` or `master`:

```bash
npm ci
npm run validate:data
npm run lint
npm run format:check
npm run build
```

## Important files

```text
src/App.tsx
src/components/AppShell.tsx
src/components/DataNotice.tsx
src/config/navigation.ts
src/config/maps.ts
src/config/roles.ts
src/data.ts
src/data/index.ts
src/data/players.ts
src/data/teams.ts
src/data/meta.ts
src/data/README.md
src/lib.ts
src/types.ts
scripts/validate-data.mjs
scripts/release-check.mjs
eslint.config.js
.prettierrc
.prettierignore
.github/workflows/ci.yml
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
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
- No import/export for rosters yet
- No dynamic sitemap for all detail pages yet

### Quality limitations

- There are no unit tests yet
- There are no component tests yet
- Data validation is source-text based, not AST-based
- CI currently runs install, validation, lint, format check and build only

### SEO limitations

- Main routes are listed in sitemap
- Detail pages are not listed yet
- Open Graph image is SVG-based placeholder
- No per-route meta tags yet because the app is a client-side SPA

## Recommended next steps

### 1. Real-stat data plan

Create a documented workflow for replacing demo values:

```text
[ ] define sources
[ ] define update date
[ ] define event/time window
[ ] separate raw stats from derived scores
[ ] document manual adjustments
```

### 2. Roster export/import

Improve Saved Rosters:

```text
[ ] export roster to JSON
[ ] import roster from JSON
[ ] copy roster summary
[ ] share roster link later
```

### 3. Testing

Add project quality tools:

```text
[ ] basic smoke tests
[ ] component tests for core pages
[ ] CI test step
```

### 4. More real product polish

```text
[ ] per-route page titles
[ ] detail-page sitemap entries
[ ] loading/empty states audit
[ ] mobile navigation polish
[ ] better footer
```

## Build commands

```bash
npm install
npm run dev
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
