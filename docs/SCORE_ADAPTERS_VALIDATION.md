# Score Adapters Validation

ClutchLab has a validation script for the score adapter layer.

## Command

```bash
npm run validate:score-adapters
```

## Script

```text
scripts/validate-score-adapters.mjs
```

## Files checked

```text
src/data/scoreAdapters.ts
src/pages/*
```

## Current adapter status

```text
sample-only
```

Generic helpers now exist, but public UI scoring has not migrated yet.

## What it validates

```text
[✓] ScoreAdapterSource is exported
[✓] ScoreAdapterStatus is exported
[✓] ScoreAdapterOptions is exported
[✓] ScoreAdapterResult is exported
[✓] ScoreAdapterSource contains demo-manual, sample-derived and real-derived
[✓] ScoreAdapterStatus contains fallback, sample and active
[✓] ScoreAdapterResult contains expected metadata fields
[✓] defaultScoreAdapterOptions exists
[✓] defaultScoreAdapterOptions.allowSample is false
[✓] defaultScoreAdapterOptions.preferReal is true
[✓] scoreAdapterLayerMeta exists
[✓] scoreAdapterLayerMeta.status is sample-only
[✓] scoreAdapterLayerMeta exposes generic defaults
[✓] scoreAdapterLayerMeta documents real/sample/fallback priority
[✓] resolveScoreAdapterOptions exists
[✓] generic adapter helper exports exist
[✓] sample adapter helper exports still exist
[✓] generic helpers reference real-derived arrays
[✓] generic helpers reference sample-derived arrays
[✓] generic helpers gate real-derived lookup behind preferReal
[✓] generic helpers gate sample-derived lookup behind allowSample
[✓] generic helpers return real-derived/active for real rows
[✓] generic helpers return sample-derived/sample for sample rows
[✓] generic helpers return demo-manual/fallback when no safe row exists
[✓] coverage summary includes sample and real-derived counts
[✓] public pages do not pass allowSample: true
[✓] public pages do not call getSample* helpers
[✓] public pages do not import sampleDerivedScores or realDerivedScores directly
```

## Generic helper exports checked

```text
resolveScoreAdapterOptions
getPlayerDerivedScore
getTeamDerivedScore
getMapFitScoresForEntity
getMapFitScore
getRosterValueScore
```

## Sample helper exports checked

```text
getSamplePlayerDerivedScore
getSampleTeamDerivedScore
getSampleMapFitScoresForEntity
getSampleMapFitScore
getSampleRosterValueScore
```

## Safe defaults

The validator requires:

```text
allowSample=false
preferReal=true
```

These defaults mean that public pages using generic helpers do not accidentally
consume sample-derived rows.

## Source priority

The validator checks that the adapter layer supports the intended source priority:

```text
real-derived → sample-derived → demo-manual fallback
```

## Public page rules

Public route pages may later import generic helpers from:

```text
src/data/scoreAdapters.ts
```

but they must not:

```text
[!] pass allowSample: true
[!] call getSample* helpers
[!] import sampleDerivedScores directly
[!] import realDerivedScores directly
```

## Sample Data exception

`src/pages/SampleDataPage.tsx` may still use sample-specific helpers because it is
a visibly labeled sample-only preview route.

```text
Sample only / not live stats
```

## Release workflow

Score adapter validation is part of:

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
npm run validate:score-adapters
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Why this matters

The generic adapter layer is the safe bridge between current demo/manual UI and a
future real-derived scoring layer.

This validation protects the project from:

```text
[✓] accidental sample-derived usage in public UI
[✓] direct public imports of derived score arrays
[✓] missing fallback behavior
[✓] unsafe adapter defaults
[✓] incomplete generic helper implementation
```

## Limitations

The validator is source-text based, not AST-based.

If adapter code is heavily refactored, the validator should be updated to match
the new canonical shape.
