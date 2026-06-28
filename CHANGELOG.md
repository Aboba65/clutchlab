# Changelog

All notable ClutchLab MVP changes are tracked here.

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

### Improved

- Browser tabs now show meaningful page names for key routes.
- Users can see dataset status and project links at the bottom of every page.
- Documentation now reflects route titles and footer/status polish.
- Footer version was aligned with the documented project version.

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
- Lint and format documentation in `README.md`
- Updated quality workflow documentation in `docs/PROJECT_STATUS.md`

### Improved

- `npm run release:check` now runs:

```bash
npm run validate:data
npm run lint
npm run format:check
npm run build
```

- GitHub Actions CI now runs:

```bash
npm ci
npm run validate:data
npm run lint
npm run format:check
npm run build
```

- README now documents linting, formatting and the full local quality workflow.
- Project status now treats lint and formatting as completed quality tools.

### Quality gates

Current quality gates:

```text
[✓] Local data validation
[✓] Local lint
[✓] Local format check
[✓] Local production build
[✓] Local release check
[✓] GitHub Actions install check
[✓] GitHub Actions data validation
[✓] GitHub Actions lint
[✓] GitHub Actions format check
[✓] GitHub Actions production build
```

## 0.1.1 — Quality workflow and repository polish

Date: 2026-06-28

### Added

- Data validation script: `scripts/validate-data.mjs`
- NPM command: `npm run validate:data`
- Release check script: `scripts/release-check.mjs`
- NPM command: `npm run release:check`
- GitHub Actions CI workflow: `.github/workflows/ci.yml`
- README badges:
  - CI status
  - Vercel live site
  - TypeScript
  - React
  - Vite
- CI section in `README.md`
- Quality workflow documentation in `docs/PROJECT_STATUS.md`

### Improved

- Local release flow now uses one command before commit/deploy:

```bash
npm run release:check
```

- `release:check` runs:

```bash
npm run validate:data
npm run build
```

- GitHub CI now validates data and builds the project on push / pull request.
- README deployment flow now recommends running `npm run release:check` before
  committing.

### Fixed

- Fixed data validation parser so it correctly reads arrays after TypeScript type
  annotations like:

```ts
export const players: CS2Player[] = [
```

- Fixed Windows compatibility issue in `release-check.mjs` by switching to
  `execSync` with `shell: true`.

## 0.1.0 — MVP buildout

Date: 2026-06-28

### Added

- React + TypeScript + Vite project foundation
- Tailwind CSS setup
- React Router routing
- Vercel SPA rewrite via `vercel.json`
- App shell and shared navigation
- Dashboard homepage
- Player catalog
- Player detail pages
- Team catalog
- Team detail pages
- Map catalog
- Map detail pages
- Role catalog
- Role detail pages
- Player Compare page
- Team Compare page
- Roster Builder
- Saved Rosters manager
- Traits page
- About / Methodology page
- DataNotice component
- SEO metadata
- SVG favicon
- SVG Open Graph preview image
- Web manifest
- `robots.txt`
- `sitemap.xml`
- Project README
- Data layer documentation
- Release checklist
- Architecture documentation
- Project status documentation

### Improved

- Player catalog filters and sorting
- Team catalog filters and sorting
- Map catalog filters and sorting
- Roster Builder filters, sorting, role fill, value scoring and map fit
- Saved Rosters search, sorting, status filtering and load/delete actions
- Player Compare with presets, searchable pickers, winner badges and analytical
  read
- Team Compare with presets, searchable pickers, roster strength, map pool overlap
  and analytical read
- Homepage upgraded into a product dashboard
- Data layer split into separate player and team files
- Data metadata added through `dataMeta`
- Public project documentation improved

### Fixed

- Vercel refresh routing via SPA rewrite
- Data layer circular export issue
- About / Methodology TypeScript type issues
- Several refactor-time unused import and page extraction issues

### Data status

Current data is marked as `demo/manual`.

The interface uses recognizable CS2 names for product testing, but ratings,
prices, team scores, map scores and custom indexes are not live or official
esports statistics.

## Next

Planned next milestones:

- Strengthen real-stat data model
- Add source metadata per stat group
- Add manual real-stat update workflow
- Expand player and team database
- Add dynamic sitemap generation for detail pages
- Add lightweight tests later
