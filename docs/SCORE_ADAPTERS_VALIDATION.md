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
src/data/sampleDerivedScores.ts
src/pages/*
```

## What it validates

```text
[✓] ScoreAdapterSource is exported
[✓] ScoreAdapterStatus is exported
[✓] ScoreAdapterResult is exported
[✓] ScoreAdapterSource contains demo-manual, sample-derived and real-derived
[✓] ScoreAdapterStatus contains fallback, sample and active
[✓] ScoreAdapterResult contains expected metadata fields
[✓] scoreAdapterLayerMeta exists
[✓] scoreAdapterLayerMeta.status is sample-only
[✓] scoreAdapterLayerMeta says public UI scoring is not changed
[✓] all expected adapter helpers are exported
[✓] adapter helpers reference sample derived score arrays
[✓] fallback messages exist
[✓] fallback results use demo-manual/fallback
[✓] sample results use sample-derived/sample
[✓] coverage summary derives counts from sample arrays
[✓] public pages do not import scoreAdapters directly yet
```

## Expected helper exports

```text
scoreAdapterLayerMeta
getSamplePlayerDerivedScore
getSampleTeamDerivedScore
getSampleMapFitScoresForEntity
getSampleMapFitScore
getSampleRosterValueScore
hasSamplePlayerDerivedScore
hasSampleTeamDerivedScore
hasSampleRosterValueScore
getScoreAdapterCoverageSummary
```

## Release workflow

Score adapter validation is now part of:

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

The score adapter layer is supposed to be a safe boundary.

It can read sample derived score rows, but public route pages should not start
using it until the UI migration plan allows that behavior.

This validation protects against accidental direct rollout of sample scores into
public pages.

## Limitations

The validator is source-text based, not AST-based.

If adapter code is heavily refactored, the validator should be updated to match
the new canonical shape.
