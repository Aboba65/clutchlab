# Sample Derived Scores Validation

ClutchLab has a validation script for the manual sample derived-score scaffold.

This validation does not validate live esports data. It checks that the small
sample derived-score dataset is internally consistent and compatible with the
current local project data and formula scaffolds.

## Command

```bash
npm run validate:sample-derived-scores
```

## Script

```text
scripts/validate-sample-derived-scores.mjs
```

## Files checked

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/data/sources.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
```

## What it validates

```text
[✓] sample player derived score playerIds exist
[✓] sample team derived score teamIds exist
[✓] sample map fit mapIds exist
[✓] map fit entity ids match entity type
[✓] roster playerIds exist
[✓] formulaIds exist in scoreFormulaScaffolds
[✓] each sample group uses the expected formula id
[✓] sourceIds exist in src/data/sources.ts
[✓] score fields are between 0 and 100
[✓] confidence values are valid
[✓] low-confidence rows include notes
[✓] periodStart and periodEnd are valid dates when present
[✓] periodStart is before or equal to periodEnd
[✓] roster totalCost is non-negative
[✓] roster budgetLimit is positive
[✓] roster totalCost does not exceed budgetLimit
[✓] sampleDerivedScoresSummary derives row counts from sample arrays
[✓] sampleDerivedScoresSummary.status derives from sampleDerivedScoresMeta.status
```

## Release workflow

Sample derived score validation is now part of:

```bash
npm run release:check
```

Release check runs:

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

## CI workflow

GitHub Actions also runs:

```bash
npm run validate:sample-derived-scores
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Why this matters

The project now has a sample pipeline:

```text
source metadata → sample raw stats → sample derived scores
```

The validator makes sure sample derived rows reference existing players, teams,
maps, source ids and formula ids before the project is built or deployed.

## Limitations

The validator is source-text based, not AST-based.

It is meant for the current TypeScript scaffold. If future sample data moves to
JSON, a backend or generated files, this validator should be updated to read from
the new canonical source.

## Recommended next step

After this validation step, update project documentation:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
