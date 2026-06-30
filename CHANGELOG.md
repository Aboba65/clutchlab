# Changelog

All notable ClutchLab MVP changes are tracked here.

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

### Verified

The generated sitemap contains the main static routes plus detail routes for
players, teams, maps and roles.

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

### Improved

- `usePageTitle()` now manages both page title and route metadata.
- Key routes now expose more specific descriptions in browser metadata.
- README now documents dynamic route metadata.
- Project status now includes route metadata in SEO/UX polish.
- Footer version display was updated to `0.1.5`.

## 0.1.4 — Mobile navigation polish

Date: 2026-06-28

### Added

- Compact mobile header spacing
- Horizontal mobile navigation row
- Better active navigation visibility
- Keyboard focus ring for navigation links
- README mobile navigation section
- Project status mobile navigation notes

### Improved

- Mobile navigation no longer wraps into a tall multi-line block.
- Mobile page padding is tighter.
- Mobile header uses smaller spacing and title scale.
- Desktop header and wrapped navigation behavior are preserved.
- Documentation now reflects mobile navigation polish.
- Footer version display was updated to `0.1.4`.

## 0.1.3 — UX polish

Date: 2026-06-28

### Added

- Route-based browser tab titles through `src/hooks/usePageTitle.ts`
- Footer status block through `src/components/Footer.tsx`
- App-wide footer rendering in `AppShell`
- Footer MVP version display
- Footer data status display from `dataMeta.status`
- Footer data updated display from `dataMeta.lastUpdated`
- Footer project links:
  - About
  - Changelog
  - Data
  - GitHub
  - Live site
- README UX polish section
- Browser titles section in README

### Fixed

- Fixed footer metadata field usage from `dataMeta.updatedAt` to
  `dataMeta.lastUpdated`.

## 0.1.2 — Linting and formatting workflow

Date: 2026-06-28

### Added

- ESLint flat config: `eslint.config.js`
- Prettier config: `.prettierrc`
- Prettier ignore file: `.prettierignore`
- NPM command: `npm run lint`
- NPM command: `npm run format`
- NPM command: `npm run format:check`

### Improved

- `npm run release:check` now includes data validation, lint, format check and build.
- GitHub Actions CI now includes validation, lint, format check and build.

## 0.1.1 — Quality workflow and repository polish

Date: 2026-06-28

### Added

- Data validation script: `scripts/validate-data.mjs`
- NPM command: `npm run validate:data`
- Release check script: `scripts/release-check.mjs`
- NPM command: `npm run release:check`
- GitHub Actions CI workflow: `.github/workflows/ci.yml`
- README badges

### Fixed

- Fixed data validation parser for typed array exports.
- Fixed Windows compatibility issue in `release-check.mjs`.

## 0.1.0 — MVP buildout

Date: 2026-06-28

### Added

- React + TypeScript + Vite project foundation
- Tailwind CSS setup
- React Router routing
- Vercel SPA rewrite via `vercel.json`
- App shell and shared navigation
- Dashboard homepage
- Player catalog and player profiles
- Team catalog and team profiles
- Map catalog and map details
- Role catalog and role details
- Player Compare and Team Compare
- Roster Builder and Saved Rosters
- Traits page
- About / Methodology page
- SEO metadata
- `robots.txt`
- `sitemap.xml`
- Project documentation
