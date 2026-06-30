# Score Adapters

This document describes the first ClutchLab score adapter layer.

## Source file

```text
src/data/scoreAdapters.ts
```

## Purpose

The adapter layer provides read-only lookup helpers for sample derived scores.

It does not change public UI scoring.

Current public routes should keep using demo/manual values until real derived data
coverage is ready and the UI migration plan is implemented.

Related document:

```text
docs/UI_MIGRATION_PLAN.md
```

## Current status

```text
sample-only
```

## Exports

```text
scoreAdapterLayerMeta
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleMapFitScore({ mapId, entityId, entityType })
getSampleRosterValueScore(rosterId)
hasSamplePlayerDerivedScore(playerId)
hasSampleTeamDerivedScore(teamId)
hasSampleRosterValueScore(rosterId)
getScoreAdapterCoverageSummary()
ScoreAdapterResult<T>
ScoreAdapterSource
ScoreAdapterStatus
```

## Result shape

```ts
type ScoreAdapterResult<T> = {
  value: T | undefined;
  source: "demo-manual" | "sample-derived" | "real-derived";
  status: "fallback" | "sample" | "active";
  confidence?: "low" | "medium" | "high";
  formulaId?: string;
  sourceIds?: string[];
  periodStart?: string;
  periodEnd?: string;
  reason?: string;
};
```

## Fallback behavior

If a sample row exists, the adapter returns:

```text
source: sample-derived
status: sample
value: row
```

If a sample row does not exist, the adapter returns:

```text
source: demo-manual
status: fallback
value: undefined
reason: ...
```

This keeps pages from assuming that sample data has complete coverage.

## Current helper examples

### Player score

```ts
const result = getSamplePlayerDerivedScore("zywoo");

if (result.value) {
  console.log(result.value.impact);
}
```

### Team score

```ts
const result = getSampleTeamDerivedScore("vitality");

if (result.value) {
  console.log(result.value.overall);
}
```

### Map fit scores for an entity

```ts
const result = getSampleMapFitScoresForEntity("spirit", "team");

if (result.value) {
  console.log(result.value.map((row) => row.fit));
}
```

### Single map fit score

```ts
const result = getSampleMapFitScore({
  mapId: "nuke",
  entityId: "spirit",
  entityType: "team",
});
```

### Roster value score

```ts
const result = getSampleRosterValueScore("sample-star-core-v1");

if (result.value) {
  console.log(result.value.value);
}
```

## Why this layer exists

Before public UI pages read derived score rows directly, the project needs a
stable adapter boundary.

The adapter layer helps prevent unsafe imports such as:

```ts
import { samplePlayerDerivedScores } from "../data/sampleDerivedScores";
```

inside public route pages.

Instead, future pages should read through adapter helpers.

## Current rules

```text
[✓] adapters may read sample derived score arrays
[✓] adapters must return explicit source/status metadata
[✓] adapters must support missing-row fallback
[✓] public pages should not sort/rank by sample-derived rows
[✓] sample rows must remain visibly labeled if used in UI
```

## Do not use this for

```text
[!] public live rankings
[!] official esports statistics
[!] betting or prediction features
[!] replacing current player catalog scoring
[!] replacing current team catalog scoring
[!] replacing roster builder logic
```

## Recommended next step

Add validation for adapter exports and coverage summary.

Possible script:

```text
scripts/validate-score-adapters.mjs
```

Possible command:

```bash
npm run validate:score-adapters
```

Suggested checks:

```text
[ ] adapter metadata status is sample-only
[ ] all expected helper names exist
[ ] coverage summary derives counts from sample arrays
[ ] fallback strings mention missing rows
[ ] no public route imports scoreAdapters directly yet
```
