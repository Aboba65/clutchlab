# Changelog

All notable ClutchLab MVP changes are tracked here.

## 0.2.6 — Real-derived scaffold validation

Date: 2026-06-28

### Added

- Real-derived score layer plan: `docs/REAL_DERIVED_SCORES_PLAN.md`
- Real-derived score scaffold: `src/data/realDerivedScores.ts`
- Real-derived score documentation: `docs/REAL_DERIVED_SCORES.md`
- Real-derived score validation script:
  `scripts/validate-real-derived-scores.mjs`
- Real-derived score validation documentation:
  `docs/REAL_DERIVED_SCORES_VALIDATION.md`
- NPM command: `npm run validate:real-derived-scores`
- Real-derived score validation in `scripts/release-check.mjs`
- Real-derived score validation in GitHub Actions CI
- Real-derived scaffold exports through `src/data/index.ts` and `src/data.ts`
- Footer links to real-derived documentation

### Improved

- `npm run release:check` now runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run validate:sample-derived-scores
npm run validate:score-adapters
npm run validate:real-derived-scores
npm run lint
npm run format:check
npm run build
```

- GitHub Actions CI now runs `npm run validate:real-derived-scores`.
- The real-derived scaffold is protected from fake rows and accidental public UI
  imports.
- Footer version display was updated to `0.2.6`.

## 0.2.5 — Adapter metadata on Sample Data

Date: 2026-06-28

### Added

- Adapter metadata display on `/sample-data`
- Adapter overview block on `SampleDataPage`
- Derived sample cards now show:
  - `source`
  - `status`
  - `confidence`
  - `formulaId`
  - `periodStart`
  - `periodEnd`
  - `sourceIds`
  - fallback reason when relevant
- `SampleDataPage` now uses score adapter helpers.

### Improved

- Score adapter validation now allows `scoreAdapters.ts` imports only in
  `src/pages/SampleDataPage.tsx`.
- Other public pages remain protected from directly importing score adapters.
- Footer version display was updated to `0.2.5`.

## 0.2.4 — Score adapter validation

Date: 2026-06-28

### Added

- Score adapter layer: `src/data/scoreAdapters.ts`
- Score adapter documentation: `docs/SCORE_ADAPTERS.md`
- Score adapter validation script: `scripts/validate-score-adapters.mjs`
- Score adapter validation documentation: `docs/SCORE_ADAPTERS_VALIDATION.md`
- NPM command: `npm run validate:score-adapters`
- Score adapter validation in release check and CI.

## 0.2.3 — Sample data preview page

Date: 2026-06-28

### Added

- Product-facing Sample Data preview page: `/sample-data`
- Page file: `src/pages/SampleDataPage.tsx`
- Documentation: `docs/SAMPLE_DATA_PAGE.md`
- Navigation item: `Sample Data`
- Route title and meta description for `/sample-data`
- `/sample-data` route in dynamic sitemap generation

## 0.2.2 — Sample derived-score validation

Date: 2026-06-28

### Added

- Sample derived-score validation script:
  `scripts/validate-sample-derived-scores.mjs`
- Sample derived-score validation documentation:
  `docs/SAMPLE_DERIVED_SCORES_VALIDATION.md`
- NPM command: `npm run validate:sample-derived-scores`
- Sample derived-score validation in release check and CI.

## 0.2.1 — Sample stats validation

Date: 2026-06-28

### Added

- Sample stats validation script: `scripts/validate-sample-stats.mjs`
- Sample stats validation documentation: `docs/SAMPLE_STATS_VALIDATION.md`
- NPM command: `npm run validate:sample-stats`
- Sample stats validation in release check and CI.

## 0.2.0 — Model validation

Date: 2026-06-28

### Added

- Model validation script: `scripts/validate-models.mjs`
- Model validation documentation: `docs/MODEL_VALIDATION.md`
- NPM command: `npm run validate:models`
- Model validation in release check and CI.

## 0.1.9 — Derived score model

Date: 2026-06-28

### Added

- Derived score type model: `src/data/derivedScores.ts`
- Derived score documentation: `docs/DERIVED_SCORES_MODEL.md`
- Formula scaffolds and derived score field groups.

## 0.1.8 — Source metadata scaffold

Date: 2026-06-28

### Added

- Source metadata scaffold: `src/data/sources.ts`
- Source metadata documentation: `docs/DATA_SOURCES.md`
- Source validation script: `scripts/validate-sources.mjs`
- NPM command: `npm run validate:sources`

## 0.1.7 — Real-stat data plan

Date: 2026-06-28

### Added

- Real-stat migration plan: `docs/REAL_STATS_PLAN.md`

## 0.1.6 — Dynamic sitemap generation

Date: 2026-06-28

### Added

- Dynamic sitemap generator: `scripts/generate-sitemap.mjs`
- NPM command: `npm run generate:sitemap`
- Sitemap documentation: `docs/SITEMAP.md`

## 0.1.5 — SEO route meta polish

Date: 2026-06-28

### Added

- Route-based meta descriptions through `src/hooks/usePageTitle.ts`
- Open Graph route title/description updates
- Twitter route title/description updates

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
