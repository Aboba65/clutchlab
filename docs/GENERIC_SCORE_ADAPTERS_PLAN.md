# Generic Score Adapters Plan

This document defines the future generic score adapter layer for ClutchLab.

It is a planning document only.

No public UI behavior is changed by this plan.

## Current state

ClutchLab currently has:

```text
source metadata → sample raw stats → sample derived scores → score adapters → real-derived scaffold → sample preview page → future UI scores
```

Current score-related files:

```text
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
src/data/scoreAdapters.ts
src/data/realDerivedScores.ts
```

Current validation:

```text
scripts/validate-sample-derived-scores.mjs
scripts/validate-score-adapters.mjs
scripts/validate-real-derived-scores.mjs
```

Current adapter behavior:

```text
sample-only
```

Current `scoreAdapters.ts` exposes sample-specific helpers:

```text
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleMapFitScore({ mapId, entityId, entityType })
getSampleRosterValueScore(rosterId)
```

## Goal

Add generic score adapter helpers that can later choose between:

```text
real-derived → sample-derived → demo-manual fallback
```

without public pages importing raw score data files directly.

## Non-goals

This plan does not add:

```text
[ ] fake real-derived rows
[ ] public UI scoring migration
[ ] player catalog ranking changes
[ ] team catalog ranking changes
[ ] roster builder scoring changes
[ ] backend/API integration
```

## Future generic helpers

Future helper names:

```text
getPlayerDerivedScore(playerId, options)
getTeamDerivedScore(teamId, options)
getMapFitScoresForEntity(entityId, entityType, options)
getMapFitScore({ mapId, entityId, entityType }, options)
getRosterValueScore(rosterId, options)
```

Existing sample helpers should remain available for explicit preview contexts.

## Adapter options

Suggested options type:

```ts
export type ScoreAdapterOptions = {
  allowSample?: boolean;
  preferReal?: boolean;
};
```

Default options:

```ts
const defaultScoreAdapterOptions: Required<ScoreAdapterOptions> = {
  allowSample: false,
  preferReal: true,
};
```

Meaning:

```text
allowSample=false
  Public pages cannot accidentally use sample-derived rows.

preferReal=true
  Real-derived rows are selected first once they exist and validate.
```

## Source priority

Generic adapters should use this priority:

```text
1. real-derived
2. sample-derived, only when allowSample is true
3. demo-manual fallback
```

## Result shape

Generic helpers should keep returning the existing shape:

```text
ScoreAdapterResult<T>
```

Current shape:

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

## Status mapping

### Real-derived selected

```text
source: real-derived
status: active
```

### Sample-derived selected

```text
source: sample-derived
status: sample
```

### No derived row selected

```text
source: demo-manual
status: fallback
```

## Proposed helper behavior

### getPlayerDerivedScore

```ts
getPlayerDerivedScore(playerId, options);
```

Priority:

```text
realPlayerDerivedScores.find(row.playerId === playerId)
samplePlayerDerivedScores.find(row.playerId === playerId) if allowSample
fallback
```

### getTeamDerivedScore

```ts
getTeamDerivedScore(teamId, options);
```

Priority:

```text
realTeamDerivedScores.find(row.teamId === teamId)
sampleTeamDerivedScores.find(row.teamId === teamId) if allowSample
fallback
```

### getMapFitScoresForEntity

```ts
getMapFitScoresForEntity(entityId, entityType, options);
```

Priority:

```text
realMapFitScores.filter(row.entityId === entityId && row.entityType === entityType)
sampleMapFitScores.filter(row.entityId === entityId && row.entityType === entityType) if allowSample
fallback
```

### getMapFitScore

```ts
getMapFitScore({ mapId, entityId, entityType }, options);
```

Priority:

```text
realMapFitScores.find(row.mapId === mapId && row.entityId === entityId && row.entityType === entityType)
sampleMapFitScores.find(row.mapId === mapId && row.entityId === entityId && row.entityType === entityType) if allowSample
fallback
```

### getRosterValueScore

```ts
getRosterValueScore(rosterId, options);
```

Priority:

```text
realRosterValueScores.find(row.rosterId === rosterId)
sampleRosterValueScores.find(row.rosterId === rosterId) if allowSample
fallback
```

## Suggested implementation shape

Future file:

```text
src/data/scoreAdapters.ts
```

Suggested new exports:

```text
defaultScoreAdapterOptions
resolveScoreAdapterOptions
getPlayerDerivedScore
getTeamDerivedScore
getMapFitScoresForEntity
getMapFitScore
getRosterValueScore
```

Existing sample helpers should stay:

```text
getSamplePlayerDerivedScore
getSampleTeamDerivedScore
getSampleMapFitScoresForEntity
getSampleMapFitScore
getSampleRosterValueScore
```

This keeps preview usage explicit and avoids breaking `/sample-data`.

## Suggested pseudo-code

```ts
export function getPlayerDerivedScore(
  playerId: string,
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<PlayerDerivedScore> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRow = realPlayerDerivedScores.find((row) => row.playerId === playerId);

    if (realRow) {
      return createRealResult(realRow);
    }
  }

  if (resolved.allowSample) {
    const sampleRow = samplePlayerDerivedScores.find((row) => row.playerId === playerId);

    if (sampleRow) {
      return createSampleResult(
        sampleRow,
        `No sample player derived score for ${playerId}.`,
      );
    }
  }

  return createFallbackResult(`No real-derived score for player ${playerId}.`);
}
```

## Public UI rules

Public route pages may use generic helpers only with safe defaults:

```ts
getPlayerDerivedScore(playerId);
```

This means:

```text
allowSample=false
preferReal=true
```

Public pages must not use:

```ts
getPlayerDerivedScore(playerId, { allowSample: true });
```

unless the page is explicitly sample-only or preview-only.

## Preview page rules

Preview pages may use sample-derived rows deliberately:

```ts
getPlayerDerivedScore(playerId, { allowSample: true });
```

Current allowed preview route:

```text
src/pages/SampleDataPage.tsx
```

## Validation updates needed

Current validator:

```text
scripts/validate-score-adapters.mjs
```

Should later check:

```text
[ ] defaultScoreAdapterOptions exists
[ ] default allowSample is false
[ ] default preferReal is true
[ ] generic helper exports exist
[ ] generic helpers reference realDerivedScores arrays
[ ] generic helpers reference sampleDerivedScores arrays
[ ] generic helpers return real-derived/active for real rows
[ ] generic helpers return sample-derived/sample only when allowSample is true
[ ] fallback result uses demo-manual/fallback
[ ] public pages do not pass allowSample: true
```

## Public import validation

Future validation should distinguish:

```text
Allowed:
  public pages import generic score adapter helpers

Blocked:
  public pages import sampleDerivedScores directly
  public pages import realDerivedScores directly
  public pages pass allowSample: true
```

Current direct import rules should become:

```text
[✓] public pages may import from scoreAdapters
[✓] public pages may call generic helpers with default options
[!] public pages may not call sample helpers
[!] public pages may not use allowSample: true
[!] public pages may not import sampleDerivedScores
[!] public pages may not import realDerivedScores
```

Exception:

```text
src/pages/SampleDataPage.tsx
```

may continue using sample helpers and sample-derived metadata because it is a
sample-only route.

## Migration sequence

### Step 1 — Add generic adapter helpers

```text
src/data/scoreAdapters.ts
docs/GENERIC_SCORE_ADAPTERS.md
```

No public UI changes.

### Step 2 — Expand score adapter validation

```text
scripts/validate-score-adapters.mjs
docs/SCORE_ADAPTERS_VALIDATION.md
```

Validation should check safe defaults and public import rules.

### Step 3 — Use generic adapters in Sample Data

```text
src/pages/SampleDataPage.tsx
```

Still preview-only.

### Step 4 — Add small public preview blocks

Possible first public pages:

```text
/players/:playerId
/teams/:teamId
/maps/:mapId
```

These should use default generic adapters and show fallback if no real-derived row
exists.

### Step 5 — Migrate scoring surfaces later

Higher-risk surfaces:

```text
/players
/teams
/compare
/team-compare
/roster-builder
```

These should migrate only after real-derived coverage gates pass.

## Coverage gates before public scoring migration

Before catalog or roster-builder scores use generic adapters, require:

```text
[ ] real-derived rows exist
[ ] validate:real-derived-scores passes with non-empty rows
[ ] score adapter validation passes
[ ] source coverage is documented
[ ] confidence labels are visible or inspectable
[ ] fallback behavior is visible
[ ] CHANGELOG documents the migration
[ ] PROJECT_STATUS documents coverage limits
```

## Copy rules

Avoid:

```text
official score
live ranking
guaranteed best
```

Prefer:

```text
derived score
model score
period-based score
source-backed score
```

## Risk log

### Risk: sample rows leak into public UI

Mitigation:

```text
allowSample defaults to false
validation blocks allowSample: true outside SampleDataPage
```

### Risk: public pages import data arrays directly

Mitigation:

```text
validation blocks direct sampleDerivedScores and realDerivedScores imports
```

### Risk: fallback states are invisible

Mitigation:

```text
ScoreAdapterResult includes source/status/reason
```

### Risk: real-derived coverage is incomplete

Mitigation:

```text
coverage gates before catalog-wide migration
```

### Risk: formulas change over time

Mitigation:

```text
formulaId remains part of ScoreAdapterResult
```

## Recommended next implementation step

Add the generic score adapter documentation file:

```text
docs/GENERIC_SCORE_ADAPTERS.md
```

Then implement generic helpers in a separate code step:

```text
src/data/scoreAdapters.ts
```

Do not change public UI in the same step.
