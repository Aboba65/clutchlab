# Changelog

All notable ClutchLab MVP changes are tracked here.

## 0.1.8 — Source metadata scaffold

Date: 2026-06-28

### Added

- Source metadata scaffold: `src/data/sources.ts`
- Source metadata documentation: `docs/DATA_SOURCES.md`
- Source validation script: `scripts/validate-sources.mjs`
- NPM command: `npm run validate:sources`
- Source exports from `src/data/index.ts`
- Source compatibility exports from `src/data.ts`
- Source validation in `scripts/release-check.mjs`
- Source validation in GitHub Actions CI
- README source metadata section
- Project status source metadata section

### Improved

- `npm run release:check` now runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run lint
npm run format:check
npm run build
```

- GitHub Actions CI now runs `npm run validate:sources`.
- The project now distinguishes demo/manual MVP data from planned future real-stat sources.
- Footer version display was updated to `0.1.8`.

## 0.1.7 — Real-stat data plan

Date: 2026-06-28

### Added

- Real-stat migration plan: `docs/REAL_STATS_PLAN.md`
- Documentation for separating:
  - identity data
  - raw performance data
  - source metadata
  - derived scores
  - manual adjustments
- Recommended future types for player identity, raw stats, sources and derived scores
- Manual real-stat update workflow
- Future validation rules for real-stat data
- UI disclosure rules for source, period and data status
- README data roadmap section
- Project status real-stat plan section

### Improved

- README now links to the real-stat migration plan.
- Project status now documents the planned path away from demo/manual values.
- Footer version display was updated to `0.1.7`.
- Footer now links to real-stat documentation.

## 0.1.6 — Dynamic sitemap generation

Date: 2026-06-28

### Added

- Dynamic sitemap generator: `scripts/generate-sitemap.mjs`
- NPM command: `npm run generate:sitemap`
- Sitemap documentation: `docs/SITEMAP.md`
- Generated detail routes for:
  - `/players/:playerId`
  - `/teams/:teamId`
  - `/maps/:mapId`
  - `/roles/:roleId`
- Sitemap documentation in `README.md`
- Sitemap documentation in `docs/PROJECT_STATUS.md`

### Improved

- `npm run release:check` now runs sitemap generation before validation, linting,
  formatting and build.
- GitHub Actions CI now runs `npm run generate:sitemap`.
- `public/sitemap.xml` is now generated from the local data/config source files.
- The sitemap now covers static pages plus player, team, map and role detail pages.
- Footer version display was updated to `0.1.6`.

## 0.1.5 — SEO route meta polish

Date: 2026-06-28

### Added

- Route-based meta descriptions through `src/hooks/usePageTitle.ts`
- Open Graph route title updates
- Open Graph route description updates
- Twitter route title updates
- Twitter route description updates
- README route meta documentation
- Project status SEO route meta documentation

## 0.1.4 — Mobile navigation polish

Date: 2026-06-28

### Added

- Compact mobile header spacing
- Horizontal mobile navigation row
- Better active navigation visibility
- Keyboard focus ring for navigation links

## 0.1.3 — UX polish

Date: 2026-06-28

### Added

- Route-based browser tab titles
- Footer status block
- App-wide footer rendering
- Footer project links

### Fixed

- Fixed footer metadata field usage from `dataMeta.updatedAt` to
  `dataMeta.lastUpdated`.

## 0.1.2 — Linting and formatting workflow

Date: 2026-06-28

### Added

- ESLint flat config
- Prettier config
- `npm run lint`
- `npm run format`
- `npm run format:check`

## 0.1.1 — Quality workflow and repository polish

Date: 2026-06-28

### Added

- Data validation script
- Release check script
- GitHub Actions CI
- README badges

## 0.1.0 — MVP buildout

Date: 2026-06-28

### Added

- React + TypeScript + Vite project foundation
- Tailwind CSS setup
- React Router routing
- Vercel SPA rewrite
- App shell and shared navigation
- Dashboard homepage
- Player, team, map and role pages
- Compare pages
- Roster Builder
- Saved Rosters
- Traits page
- About / Methodology page
- SEO metadata
- `robots.txt`
- `sitemap.xml`
- Project documentation
