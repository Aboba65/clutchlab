# Real Derived Scores Plan

This document defines the future ClutchLab `real-derived` score layer.

It is a planning document only.

No public UI behavior is changed by this plan.

## Current state

ClutchLab currently has this data chain:

```text
source metadata → sample raw stats → sample derived scores → score adapters → sample preview page → future UI scores
```

Implemented files:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
src/data/scoreAdapters.ts
src/pages/SampleDataPage.tsx
```

Implemented validation:

```text
scripts/validate-sources.mjs
scripts/validate-models.mjs
scripts/validate-sample-stats.mjs
scripts/validate-sample-derived-scores.mjs
scripts/validate-score-adapters.mjs
```

Current adapter status:

```text
sample-only
```

Current adapter source values:

```text
demo-manual
sample-derived
real-derived
```

`real-derived` already exists as a future source value, but no real-derived data
file exists yet.

## Goal

Add a future production-grade derived score layer that can eventually replace
demo/manual UI scores safely.

Target future file:

```text
src/data/realDerivedScores.ts
```

Target future validation:

```text
scripts/validate-real-derived-scores.mjs
```

Target future docs:

```text
docs/REAL_DERIVED_SCORES.md
docs/REAL_DERIVED_SCORES_VALIDATION.md
```

## Non-goals

This plan does not add:

```text
[ ] fake real statistics
[ ] public ranking changes
[ ] player catalog score migration
[ ] team page score migration
[ ] roster builder score migration
[ ] backend/API integration
[ ] automatic match ingestion
```

Until real coverage is ready, public pages must keep their current demo/manual
values.

## Future data source priority

The adapter layer should eventually choose scores in this order:

```text
real-derived → sample-derived → demo-manual fallback
```

Meaning:

1. Use `real-derived` when a real-derived row exists and passes validation.
2. Use `sample-derived` only in preview contexts or clearly labeled development
   contexts.
3. Use `demo-manual` fallback when no derived score is safe to use.

## Adapter priority rule

Future adapter behavior should follow this logic:

```text
if real-derived row exists:
  return source: real-derived, status: active

else if sample-derived row exists and sample usage is allowed:
  return source: sample-derived, status: sample

else:
  return source: demo-manual, status: fallback
```

Public UI pages should not silently use `sample-derived`.

Preview-only pages may use `sample-derived` if clearly labeled.

## Proposed future file shape

Future file:

```text
src/data/realDerivedScores.ts
```

Expected exports:

```text
realDerivedScoresMeta
realPlayerDerivedScores
realTeamDerivedScores
realMapFitScores
realRosterValueScores
realDerivedScoresSummary
```

Suggested metadata:

```ts
export const realDerivedScoresMeta = {
  version: "0.1.0",
  status: "planned",
  source: "real-derived",
  generatedAt: "YYYY-MM-DD",
  periodStart: "YYYY-MM-DD",
  periodEnd: "YYYY-MM-DD",
  formulaVersion: "v1",
  coverage: {
    players: 0,
    teams: 0,
    maps: 0,
    rosterScores: 0,
  },
  warnings: ["Do not publish real-derived scores until source coverage is validated."],
} as const;
```

Suggested score row groups:

```text
realPlayerDerivedScores
realTeamDerivedScores
realMapFitScores
realRosterValueScores
```

These should use the existing derived score types:

```text
PlayerDerivedScore
TeamDerivedScore
MapFitScore
RosterValueScore
```

Defined in:

```text
src/data/derivedScores.ts
```

## Required row metadata

Every real-derived row should include:

```text
formulaId
sourceIds
confidence
periodStart
periodEnd
```

Every row should also trace back to source metadata from:

```text
src/data/sources.ts
```

## Required source status

Real-derived rows should only use sources with one of these statuses:

```text
real
planned-real
```

For production use, the preferred status is:

```text
real
```

Rows based only on `planned-real` sources should not be shown as active public
scores.

## Formula requirements

Every real-derived row must reference a known formula id from:

```text
src/data/derivedScores.ts
```

Known current formula scaffold ids:

```text
player-impact-v1
team-score-v1
map-fit-v1
roster-value-v1
```

Future real-derived formulas must be documented before use.

## Confidence requirements

Allowed confidence values:

```text
low
medium
high
```

Public UI should prefer:

```text
medium
high
```

Rows with `low` confidence may be used only when:

```text
[✓] the UI explicitly shows the low-confidence label
[✓] the source period is visible
[✓] no official/live claim is made
```

## Coverage requirements before public UI migration

Before any public route uses real-derived scores, the project should define
minimum coverage rules.

Suggested minimum coverage:

```text
Player catalog:
  [ ] at least 80% of displayed players have real-derived player scores
  [ ] every active top-card player has a real-derived score
  [ ] player score period is recent enough for the selected update window

Team catalog:
  [ ] at least 80% of displayed teams have real-derived team scores
  [ ] every top-card team has a real-derived score
  [ ] team score period is recent enough for the selected update window

Map pages:
  [ ] map fit rows exist for the relevant player/team entities
  [ ] fallback handling is visible when map fit is missing

Roster Builder:
  [ ] all selected players have real-derived player scores
  [ ] role coverage calculation is still stable
  [ ] budget/value scoring keeps a visible source label
```

## Future adapter API

Current helper names:

```text
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleMapFitScore({ mapId, entityId, entityType })
getSampleRosterValueScore(rosterId)
```

Future generic helpers could be added:

```text
getPlayerDerivedScore(playerId, options)
getTeamDerivedScore(teamId, options)
getMapFitScoresForEntity(entityId, entityType, options)
getMapFitScore({ mapId, entityId, entityType }, options)
getRosterValueScore(rosterId, options)
```

Suggested options:

```ts
type ScoreAdapterOptions = {
  allowSample?: boolean;
  preferReal?: boolean;
};
```

Recommended default:

```ts
{
  allowSample: false,
  preferReal: true,
}
```

This prevents public pages from accidentally using sample scores.

## Future adapter result examples

### Real-derived result

```ts
{
  value: row,
  source: "real-derived",
  status: "active",
  confidence: row.confidence,
  formulaId: row.formulaId,
  sourceIds: row.sourceIds,
  periodStart: row.periodStart,
  periodEnd: row.periodEnd,
}
```

### Sample-derived result

```ts
{
  value: row,
  source: "sample-derived",
  status: "sample",
  confidence: row.confidence,
  formulaId: row.formulaId,
  sourceIds: row.sourceIds,
  periodStart: row.periodStart,
  periodEnd: row.periodEnd,
}
```

### Demo/manual fallback result

```ts
{
  value: undefined,
  source: "demo-manual",
  status: "fallback",
  reason: "No real-derived score for player zywoo.",
}
```

## Future validation script

Future script:

```text
scripts/validate-real-derived-scores.mjs
```

Suggested command:

```bash
npm run validate:real-derived-scores
```

Suggested checks:

```text
[ ] realDerivedScoresMeta exists
[ ] realDerivedScoresMeta.status is valid
[ ] realDerivedScoresMeta.source is real-derived
[ ] realDerivedScoresSummary derives counts from arrays
[ ] every player id exists in src/data/players.ts
[ ] every team id exists in src/data/teams.ts
[ ] every map id exists in src/config/maps.ts
[ ] every formulaId exists in scoreFormulaScaffolds
[ ] every sourceId exists in dataSources
[ ] every row has confidence
[ ] every row has periodStart and periodEnd
[ ] every periodStart is before or equal to periodEnd
[ ] every 0-100 score field is inside range
[ ] every component weight is valid
[ ] every low-confidence row has notes
[ ] no public UI route imports realDerivedScores directly
[ ] public UI imports only scoreAdapters
```

## Future release-check integration

After the script exists, `release:check` should run:

```bash
npm run validate:real-derived-scores
```

Suggested future release check order:

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

## Future CI integration

GitHub Actions should also run:

```bash
npm run validate:real-derived-scores
```

after:

```bash
npm run validate:score-adapters
```

and before:

```bash
npm run lint
```

## Public UI migration gate

Public UI can start using real-derived scores only when all of these are true:

```text
[ ] realDerivedScores.ts exists
[ ] validate:real-derived-scores passes
[ ] scoreAdapters prefer real-derived by default
[ ] public pages import only scoreAdapters, not raw data files
[ ] source/status/confidence can be shown or audited
[ ] fallback behavior is defined for missing rows
[ ] README and PROJECT_STATUS state real-derived coverage limits
[ ] CHANGELOG documents the migration
```

## Route-by-route migration order

Recommended order:

```text
1. /sample-data
2. /players/:playerId preview blocks
3. /teams/:teamId preview blocks
4. /maps/:mapId preview blocks
5. /compare preview blocks
6. /team-compare preview blocks
7. /players catalog score labels
8. /teams catalog score labels
9. /roster-builder value scoring
```

Rationale:

```text
detail/preview blocks are lower risk than catalog-wide ranking changes.
```

## Public copy rules

When real-derived scores are shown publicly, the UI should show or make available:

```text
source
status
confidence
formulaId
periodStart
periodEnd
```

Avoid wording like:

```text
official rating
live ranking
guaranteed best
```

Prefer wording like:

```text
derived score
source-based estimate
current model score
period-based score
```

## Risk log

### Risk: real-derived rows are incomplete

Mitigation:

```text
use adapter fallback and visible missing-row state
```

### Risk: sample-derived rows leak into public rankings

Mitigation:

```text
adapter options default allowSample=false
validate public imports
```

### Risk: formula changes break comparisons

Mitigation:

```text
version formula ids and show formulaId in metadata
```

### Risk: stale data appears current

Mitigation:

```text
show periodStart/periodEnd and generatedAt
```

### Risk: source credibility varies

Mitigation:

```text
track sourceIds and source confidence
```

## Recommended implementation sequence

### Step A — add real-derived score file scaffold

```text
src/data/realDerivedScores.ts
docs/REAL_DERIVED_SCORES.md
```

No public UI changes.

### Step B — add real-derived validation

```text
scripts/validate-real-derived-scores.mjs
docs/REAL_DERIVED_SCORES_VALIDATION.md
npm run validate:real-derived-scores
release-check integration
CI integration
```

### Step C — extend score adapters

```text
getPlayerDerivedScore(playerId, options)
getTeamDerivedScore(teamId, options)
getMapFitScore(args, options)
getRosterValueScore(rosterId, options)
```

Default behavior:

```text
prefer real-derived
do not allow sample unless explicitly requested
fallback to demo-manual
```

### Step D — add preview usage only

```text
/sample-data
```

No public scoring changes.

### Step E — migrate public UI only after coverage gate

```text
players → teams → maps → compare → roster-builder
```

## Current recommended next step

Add the future real-derived score file scaffold without real rows:

```text
src/data/realDerivedScores.ts
docs/REAL_DERIVED_SCORES.md
```

Keep metadata status as:

```text
planned
```

Do not add fake real-derived rows.
