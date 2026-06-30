# Generic Score Adapters

This document describes the intended public API for future generic score adapters
in ClutchLab.

It is documentation only.

No public UI behavior is changed by this document.

## Related plan

```text
docs/GENERIC_SCORE_ADAPTERS_PLAN.md
```

## Current status

```text
planned
```

The current adapter layer exists in:

```text
src/data/scoreAdapters.ts
```

Current adapter behavior is still:

```text
sample-only
```

Current sample-specific helpers remain the active implementation:

```text
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleMapFitScore({ mapId, entityId, entityType })
getSampleRosterValueScore(rosterId)
```

## Future goal

Generic helpers should let the app ask for the best available derived score
without importing score arrays directly.

Future priority:

```text
real-derived → sample-derived → demo-manual fallback
```

## Future API

Future generic helper exports:

```text
getPlayerDerivedScore(playerId, options?)
getTeamDerivedScore(teamId, options?)
getMapFitScoresForEntity(entityId, entityType, options?)
getMapFitScore({ mapId, entityId, entityType }, options?)
getRosterValueScore(rosterId, options?)
```

Future support exports:

```text
defaultScoreAdapterOptions
resolveScoreAdapterOptions
ScoreAdapterOptions
```

Existing sample-specific helpers should remain available for explicit preview
usage.

## ScoreAdapterOptions

Suggested type:

```ts
export type ScoreAdapterOptions = {
  allowSample?: boolean;
  preferReal?: boolean;
};
```

Suggested defaults:

```ts
export const defaultScoreAdapterOptions = {
  allowSample: false,
  preferReal: true,
} as const;
```

Meaning:

```text
allowSample=false
  Generic helpers do not use sample-derived rows unless explicitly allowed.

preferReal=true
  Generic helpers look for real-derived rows first.
```

## Result shape

Generic helpers should continue returning the existing adapter result shape:

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

### Real-derived row selected

```text
source: real-derived
status: active
```

### Sample-derived row selected

```text
source: sample-derived
status: sample
```

### No derived row selected

```text
source: demo-manual
status: fallback
value: undefined
reason: ...
```

## Public page usage

Public route pages should use generic helpers with default options:

```ts
const score = getPlayerDerivedScore(playerId);
```

Equivalent behavior:

```text
allowSample=false
preferReal=true
```

This means public pages will not accidentally use sample-derived rows.

If no real-derived score exists, the result should be a safe fallback:

```ts
{
  value: undefined,
  source: "demo-manual",
  status: "fallback",
  reason: "No real-derived score for player zywoo.",
}
```

## Preview page usage

Preview-only pages may explicitly allow sample-derived rows:

```ts
const score = getPlayerDerivedScore(playerId, { allowSample: true });
```

Current approved preview route:

```text
src/pages/SampleDataPage.tsx
```

This route is visibly labeled as:

```text
Sample only / not live stats
```

## Disallowed public usage

Public pages should not use:

```ts
getPlayerDerivedScore(playerId, { allowSample: true });
getTeamDerivedScore(teamId, { allowSample: true });
getMapFitScore(args, { allowSample: true });
getRosterValueScore(rosterId, { allowSample: true });
```

Public pages should not import:

```text
src/data/sampleDerivedScores.ts
src/data/realDerivedScores.ts
```

Public pages should import only through:

```text
src/data/scoreAdapters.ts
```

once generic helper validation allows it.

## Future implementation examples

### Player score

```ts
const result = getPlayerDerivedScore("zywoo");

if (result.value) {
  console.log(result.value.impact);
}

console.log(result.source);
console.log(result.status);
```

### Team score

```ts
const result = getTeamDerivedScore("vitality");

if (result.value) {
  console.log(result.value.overall);
}
```

### Map fit score

```ts
const result = getMapFitScore({
  mapId: "nuke",
  entityId: "spirit",
  entityType: "team",
});
```

### Roster value score

```ts
const result = getRosterValueScore("sample-star-core-v1");
```

### Sample preview usage

```ts
const result = getPlayerDerivedScore("zywoo", {
  allowSample: true,
});
```

## Future helper behavior

### getPlayerDerivedScore

Expected lookup order:

```text
1. realPlayerDerivedScores.find(row.playerId === playerId)
2. samplePlayerDerivedScores.find(row.playerId === playerId), only when allowSample=true
3. fallback result
```

### getTeamDerivedScore

Expected lookup order:

```text
1. realTeamDerivedScores.find(row.teamId === teamId)
2. sampleTeamDerivedScores.find(row.teamId === teamId), only when allowSample=true
3. fallback result
```

### getMapFitScoresForEntity

Expected lookup order:

```text
1. realMapFitScores.filter(row.entityId === entityId && row.entityType === entityType)
2. sampleMapFitScores.filter(row.entityId === entityId && row.entityType === entityType), only when allowSample=true
3. fallback result
```

### getMapFitScore

Expected lookup order:

```text
1. realMapFitScores.find(row.mapId === mapId && row.entityId === entityId && row.entityType === entityType)
2. sampleMapFitScores.find(row.mapId === mapId && row.entityId === entityId && row.entityType === entityType), only when allowSample=true
3. fallback result
```

### getRosterValueScore

Expected lookup order:

```text
1. realRosterValueScores.find(row.rosterId === rosterId)
2. sampleRosterValueScores.find(row.rosterId === rosterId), only when allowSample=true
3. fallback result
```

## Future validation expectations

Update:

```text
scripts/validate-score-adapters.mjs
docs/SCORE_ADAPTERS_VALIDATION.md
```

Validation should eventually check:

```text
[ ] ScoreAdapterOptions is exported
[ ] defaultScoreAdapterOptions is exported
[ ] default allowSample is false
[ ] default preferReal is true
[ ] resolveScoreAdapterOptions is exported
[ ] generic helper exports exist
[ ] generic helpers reference realDerivedScores arrays
[ ] generic helpers reference sampleDerivedScores arrays
[ ] generic helpers can return real-derived/active
[ ] generic helpers can return sample-derived/sample only with allowSample
[ ] generic helpers can return demo-manual/fallback
[ ] public pages do not pass allowSample: true
[ ] public pages do not call sample-specific helpers
[ ] public pages do not import sampleDerivedScores directly
[ ] public pages do not import realDerivedScores directly
```

## Future public import rules

Eventually allowed:

```text
public pages importing generic helpers from scoreAdapters
```

Still blocked:

```text
public pages importing sampleDerivedScores directly
public pages importing realDerivedScores directly
public pages passing allowSample: true
public pages calling getSample* helper functions
```

Exception:

```text
src/pages/SampleDataPage.tsx
```

because it is a sample-only preview route.

## Migration checklist

Before implementing generic helpers:

```text
[ ] keep sample-specific helpers unchanged
[ ] keep SampleDataPage behavior unchanged
[ ] keep public scoring pages unchanged
[ ] add generic helpers to scoreAdapters.ts
[ ] add validation for safe defaults
[ ] document new API in CHANGELOG and PROJECT_STATUS
```

Before using generic helpers on public pages:

```text
[ ] real-derived validation supports real rows
[ ] real-derived coverage gates are documented
[ ] fallback UI copy exists
[ ] source/status/confidence display rules exist
[ ] public pages do not use allowSample=true
[ ] public pages do not import raw score arrays
```

## Migration order

Recommended order:

```text
1. Add generic adapter helpers
2. Add validation for generic adapter helpers
3. Use generic helpers in /sample-data only
4. Add read-only preview blocks to detail pages
5. Migrate low-risk detail surfaces
6. Migrate catalog sorting/scoring later
7. Migrate roster-builder value logic last
```

## Route risk levels

### Low risk

```text
/sample-data
/players/:playerId preview blocks
/teams/:teamId preview blocks
/maps/:mapId preview blocks
```

### Medium risk

```text
/compare
/team-compare
```

### High risk

```text
/players catalog scoring/sorting
/teams catalog scoring/sorting
/roster-builder value scoring
```

## Copy rules

Avoid:

```text
official rating
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

## Non-goals for the first implementation

The first generic adapter implementation should not:

```text
[ ] change public page scoring
[ ] change roster builder scoring
[ ] add fake real-derived rows
[ ] remove sample-specific helpers
[ ] remove demo/manual fallback
```

## Recommended next step

Implement the generic helpers in:

```text
src/data/scoreAdapters.ts
```

without changing UI.

Then update:

```text
scripts/validate-score-adapters.mjs
docs/SCORE_ADAPTERS_VALIDATION.md
```

to enforce safe defaults.
