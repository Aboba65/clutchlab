# Real Derived Scores

This document describes the planned ClutchLab real-derived score scaffold.

## Source file

```text
src/data/realDerivedScores.ts
```

## Current status

```text
planned
```

## Source value

```text
real-derived
```

## Purpose

The real-derived score layer will eventually hold validated production-derived
scores for players, teams, map fit and roster value.

This scaffold intentionally contains no fake real-derived rows.

## Current exports

```text
realDerivedScoresMeta
realDerivedScoresSummary
realPlayerDerivedScores
realTeamDerivedScores
realMapFitScores
realRosterValueScores
RealDerivedScoreSource
RealDerivedScoreDatasetStatus
RealDerivedScoresMeta
```

## Current arrays

All current arrays are intentionally empty:

```text
realPlayerDerivedScores: []
realTeamDerivedScores: []
realMapFitScores: []
realRosterValueScores: []
```

## Current summary

The summary derives counts from the empty arrays:

```text
playerScores: 0
teamScores: 0
mapFitScores: 0
rosterValueScores: 0
status: planned
source: real-derived
```

## Current metadata

The metadata marks the layer as not ready for public UI:

```text
readyForPublicUi: false
```

Reasons:

```text
[✓] No validated real-derived score rows exist yet.
[✓] No real-derived score validation script exists yet.
[✓] Score adapters do not prefer real-derived rows yet.
[✓] Public UI routes must keep demo/manual scoring until coverage gates pass.
```

## Important boundary

Do not import this file directly in public route pages.

Future public UI usage must go through:

```text
src/data/scoreAdapters.ts
```

## Intended priority order

Future adapter priority:

```text
real-derived → sample-derived → demo-manual fallback
```

Current adapter behavior is still sample-only for preview usage.

## Related documents

```text
docs/REAL_DERIVED_SCORES_PLAN.md
docs/SCORE_ADAPTERS.md
docs/SCORE_ADAPTERS_VALIDATION.md
docs/UI_MIGRATION_PLAN.md
docs/DERIVED_SCORES_MODEL.md
```

## Future validation

Planned script:

```text
scripts/validate-real-derived-scores.mjs
```

Planned command:

```bash
npm run validate:real-derived-scores
```

Future validation should check:

```text
[ ] realDerivedScoresMeta exists
[ ] realDerivedScoresMeta.status is valid
[ ] realDerivedScoresMeta.source is real-derived
[ ] summary counts derive from arrays
[ ] every player id exists
[ ] every team id exists
[ ] every map id exists
[ ] every formulaId exists
[ ] every sourceId exists
[ ] every score is inside the expected range
[ ] every low-confidence row has notes
[ ] public route pages do not import realDerivedScores directly
```

## Current non-goals

```text
[ ] no fake real statistics
[ ] no public UI scoring change
[ ] no player catalog migration
[ ] no team catalog migration
[ ] no roster builder migration
[ ] no backend/API integration
```

## Recommended next step

Add validation for the scaffold itself:

```text
scripts/validate-real-derived-scores.mjs
docs/REAL_DERIVED_SCORES_VALIDATION.md
npm run validate:real-derived-scores
```
