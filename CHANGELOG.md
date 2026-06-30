# Changelog

All notable ClutchLab MVP changes are tracked here.

## 0.2.1 — Sample stats validation

Date: 2026-06-28

### Added

- Sample stats validation script: `scripts/validate-sample-stats.mjs`
- Sample stats validation documentation: `docs/SAMPLE_STATS_VALIDATION.md`
- NPM command: `npm run validate:sample-stats`
- Sample stats validation in `scripts/release-check.mjs`
- Sample stats validation in GitHub Actions CI
- README sample stats validation section
- Project status sample stats validation section
- Footer link to sample stats documentation

### Improved

- `npm run release:check` now runs:

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

- GitHub Actions CI now runs `npm run validate:sample-stats`.
- The quality gate now checks the manual sample raw-stat rows before lint/build.
- Footer version display was updated to `0.2.1`.

## 0.2.0 — Model validation

Date: 2026-06-28

### Added

- Model validation script: `scripts/validate-models.mjs`
- Model validation documentation: `docs/MODEL_VALIDATION.md`
- NPM command: `npm run validate:models`
- Model validation in `scripts/release-check.mjs`
- Model validation in GitHub Actions CI
- README model validation section
- Project status model validation section
- Footer link to model validation documentation

### Improved

- `npm run release:check` now runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run lint
npm run format:check
npm run build
```

- GitHub Actions CI now runs `npm run validate:models`.
- The quality gate now checks source metadata, raw-stat model scaffolds and
  derived-score formula scaffolds before lint/build.
- Footer version display was updated to `0.2.0`.

## 0.1.9 — Derived score model

Date: 2026-06-28

### Added

- Derived score type model: `src/data/derivedScores.ts`
- Derived score documentation: `docs/DERIVED_SCORES_MODEL.md`
- `ScoreFormulaMeta`
- `ScoreComponent`
- `PlayerDerivedScore`
- `TeamDerivedScore`
- `MapFitScore`
- `RosterValueScore`
- `DerivedScoreDatasetMeta`
- `derivedScoreDatasetMeta`
- `scoreFormulaScaffolds`
- `derivedScoreFieldGroups`
- Derived score exports from `src/data/index.ts`
- Derived score compatibility exports from `src/data.ts`
- README derived score model section
- Project status derived score model section

### Improved

- The real-stat architecture is now documented as:

```text
source metadata → raw stats → derived scores → UI scores
```

- The project now has planned formula scaffolds for:
  - `player-impact-v1`
  - `team-score-v1`
  - `map-fit-v1`
  - `roster-value-v1`
- Footer version display was updated to `0.1.9`.
- Footer now links to derived score documentation.

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

- `npm run release:check` now runs source validation.
- The project now distinguishes demo/manual MVP data from planned future real-stat sources.
- Footer version display was updated to `0.1.8`.

## 0.1.7 — Real-stat data plan

Date: 2026-06-28

### Added

- Real-stat migration plan: `docs/REAL_STATS_PLAN.md`
- Documentation for separating identity data, raw performance data, source metadata,
  derived scores and manual adjustments.
- Manual real-stat update workflow
- Future validation rules for real-stat data
- UI disclosure rules for source, period and data status

### Improved

- README now links to the real-stat migration plan.
- Project status now documents the planned path away from demo/manual values.
- Footer version display was updated to `0.1.7`.

## 0.1.6 — Dynamic sitemap generation

Date: 2026-06-28

### Added

- Dynamic sitemap generator: `scripts/generate-sitemap.mjs`
- NPM command: `npm run generate:sitemap`
- Sitemap documentation: `docs/SITEMAP.md`
- Generated detail routes for players, teams, maps and roles.

### Improved

- Release check and CI now run sitemap generation.
- `public/sitemap.xml` is generated from local data/config source files.
- Footer version display was updated to `0.1.6`.

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
