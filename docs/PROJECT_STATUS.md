# Project Status

## Project

ClutchLab

## Current version

```text
0.1.0 MVP
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

ClutchLab is a CS2 analytics MVP for exploring players, teams, maps, roles, roster construction and matchup comparison.

The product now has a complete first version of the interface: dashboard, catalogs, detail pages, comparison tools, roster builder, saved roster management, methodology page and public project documentation.

## Current data status

```text
demo/manual data
```

The current dataset is useful for product testing and UI logic, but it should not be described as live, official or current esports statistics.

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
[✓] SEO meta tags
[✓] favicon.svg
[✓] og-image.svg
[✓] site.webmanifest
[✓] robots.txt
[✓] sitemap.xml
[✓] Vercel SPA rewrite
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
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
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
- No advanced testing suite yet
- No dynamic sitemap for all detail pages yet
- No automated data validation scripts yet

### SEO limitations

- Main routes are listed in sitemap
- Detail pages are not listed yet
- Open Graph image is SVG-based placeholder
- No per-route meta tags yet because the app is a client-side SPA

## Recommended next steps

### 1. Data validation

Add a script that checks:

```text
[ ] player ids are unique
[ ] team ids are unique
[ ] every player.teamId exists
[ ] every team.players id exists
[ ] every team.bestMaps value matches a map profile
[ ] player prices are within expected builder range
[ ] score values are within 0–100
```

### 2. Real-stat data plan

Create a documented workflow for replacing demo values:

```text
[ ] define sources
[ ] define update date
[ ] define event/time window
[ ] separate raw stats from derived scores
[ ] document manual adjustments
```

### 3. Roster export/import

Improve Saved Rosters:

```text
[ ] export roster to JSON
[ ] import roster from JSON
[ ] copy roster summary
[ ] share roster link later
```

### 4. Testing and quality

Add project quality tools:

```text
[ ] lint command
[ ] format command
[ ] data validation command
[ ] basic build check workflow
```

### 5. More real product polish

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
npm run build
npm run preview
```

## Deploy flow

```bash
npm run build
git add -A
git commit -m "Your commit message"
git push
```

Vercel deploys from the pushed repository.
