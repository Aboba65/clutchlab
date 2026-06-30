# Real Derived Scores Validation

ClutchLab has a validation script for the planned real-derived score scaffold.

## Command

```bash
npm run validate:real-derived-scores
```

## Script

```text
scripts/validate-real-derived-scores.mjs
```

## Files checked

```text
src/data/realDerivedScores.ts
src/data/index.ts
src/data.ts
src/pages/*
```

## What it validates now

```text
[✓] RealDerivedScoreSource is exported
[✓] RealDerivedScoreDatasetStatus is exported
[✓] RealDerivedScoresMeta is exported
[✓] realDerivedScoresMeta is exported
[✓] realDerivedScoresSummary is exported
[✓] realPlayerDerivedScores is exported
[✓] realTeamDerivedScores is exported
[✓] realMapFitScores is exported
[✓] realRosterValueScores is exported
[✓] real-derived arrays are currently empty
[✓] realDerivedScoresMeta.status is planned
[✓] realDerivedScoresMeta.source is real-derived
[✓] realDerivedScoresMeta.migrationGate.readyForPublicUi is false
[✓] metadata states that no fake rows exist
[✓] coverage counts derive from arrays
[✓] summary counts derive from arrays
[✓] migration gate reasons exist
[✓] warnings exist
[✓] src/data/index.ts exports realDerivedScores
[✓] src/data.ts exports realDerivedScores
[✓] public pages do not import realDerivedScores directly
```

## Current expected state

The scaffold is expected to remain:

```text
status: planned
source: real-derived
readyForPublicUi: false
```

Current arrays must stay empty:

```text
realPlayerDerivedScores: []
realTeamDerivedScores: []
realMapFitScores: []
realRosterValueScores: []
```

This protects the project from accidentally adding fake real-derived rows.

## Release workflow

Real-derived score validation is now part of:

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
npm run validate:score-adapters
npm run validate:real-derived-scores
npm run lint
npm run format:check
npm run build
```

## CI workflow

GitHub Actions also runs:

```bash
npm run validate:real-derived-scores
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Why this matters

The real-derived layer is the future production score layer.

At the current stage, it must stay a scaffold:

```text
[✓] no fake real stats
[✓] no public UI migration
[✓] no direct route imports
[✓] no active status
```

This validation keeps the scaffold safe until real rows and their validation rules
are introduced deliberately.

## Future validation expansion

When real rows are added later, this validator should expand to check:

```text
[ ] every player id exists in src/data/players.ts
[ ] every team id exists in src/data/teams.ts
[ ] every map id exists in src/config/maps.ts
[ ] every formulaId exists in scoreFormulaScaffolds
[ ] every sourceId exists in dataSources
[ ] every row has confidence
[ ] every row has periodStart and periodEnd
[ ] every score is inside the expected range
[ ] every low-confidence row has notes
[ ] score adapters prefer real-derived rows safely
```

## Limitations

The validator is source-text based, not AST-based.

If the scaffold is refactored, update the validator to match the new canonical
shape.
