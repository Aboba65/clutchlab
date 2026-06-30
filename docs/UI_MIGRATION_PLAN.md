# UI Migration Plan

This document defines how ClutchLab can safely migrate from current demo/manual
UI scoring to the future source-grounded raw-stat and derived-score layers.

## Current status

Current public UI pages still use demo/manual values from:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
src/lib.ts
```

The real-stat scaffold currently exists separately:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
```

The sample preview page reads from the scaffold:

```text
src/pages/SampleDataPage.tsx
```

Current preview route:

```text
/sample-data
```

## Non-goals

The migration must not immediately:

```text
[!] replace all public player ratings
[!] replace all public team ratings
[!] replace roster builder scoring
[!] remove demo/manual values before real data is complete
[!] present sample data as live official statistics
[!] hide data status from the UI
[!] make betting or prediction claims
```

## Migration principle

The public UI should move in small reversible stages.

Safe direction:

```text
demo/manual UI values
→ sample preview page
→ hidden adapter layer
→ opt-in non-production analytics view
→ real derived scores behind explicit data status
→ public UI migration
```

Unsafe direction:

```text
sample rows → direct public rankings
```

## Data boundaries

### Identity data

Identity data describes what an entity is.

Examples:

```text
player id
team id
region
role
team name
map id
role id
```

Current files:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
```

Identity data can remain stable during migration.

### Raw stat data

Raw stat data describes source-shaped measurements.

Examples:

```text
rating
ADR
KAST
opening duel win rate
clutch win rate
map win rate
round win rate
```

Current files:

```text
src/data/rawStats.ts
src/data/sampleRawStats.ts
```

Raw stat data should not be displayed as final product scores unless the UI
labels source, period, sample size and data status.

### Derived score data

Derived score data describes ClutchLab-calculated values.

Examples:

```text
PlayerDerivedScore.impact
TeamDerivedScore.overall
MapFitScore.fit
RosterValueScore.value
```

Current files:

```text
src/data/derivedScores.ts
src/data/sampleDerivedScores.ts
```

Derived score data can power UI scores only after source, formula and confidence
metadata are visible or traceable.

## Current public UI score surfaces

The migration affects these surfaces:

```text
/players
/players/:playerId
/teams
/teams/:teamId
/maps
/maps/:mapId
/compare
/team-compare
/roster-builder
/saved-rosters
/
/sample-data
```

## Target score mapping

### Player catalog and player detail pages

Current UI source:

```text
src/data/players.ts
```

Future score source:

```text
PlayerDerivedScore
```

Suggested mapping:

```text
current player rating      → PlayerDerivedScore.impact
current clutch indicator   → PlayerDerivedScore.clutch
current opening indicator  → PlayerDerivedScore.opening
current awp signal         → PlayerDerivedScore.awp
current rifle signal       → PlayerDerivedScore.rifle
current value signal       → PlayerDerivedScore.value
```

Required guardrails:

```text
[✓] show data status
[✓] show periodStart / periodEnd where relevant
[✓] show confidence
[✓] keep fallback to demo/manual values
[✓] never show sample rows as live rankings
```

### Team catalog and team detail pages

Current UI source:

```text
src/data/teams.ts
```

Future score source:

```text
TeamDerivedScore
```

Suggested mapping:

```text
current team score       → TeamDerivedScore.overall
current firepower score  → TeamDerivedScore.firepower
current structure score  → TeamDerivedScore.structure
current map pool score   → TeamDerivedScore.mapPool
current form score       → TeamDerivedScore.form
current clutch score     → TeamDerivedScore.clutch
```

Required guardrails:

```text
[✓] preserve current team identity fields
[✓] keep fallback to current demo/manual team values
[✓] avoid sorting public teams by sample rows
[✓] show source/period/confidence if derived scores become visible
```

### Map pages

Current UI source:

```text
src/config/maps.ts
```

Future score source:

```text
MapFitScore
```

Suggested mapping:

```text
map fit display       → MapFitScore.fit
AWP suitability       → MapFitScore.awpFit
entry suitability     → MapFitScore.entryFit
anchor suitability    → MapFitScore.anchorFit
lurk suitability      → MapFitScore.lurkFit
support suitability   → MapFitScore.supportFit
```

Required guardrails:

```text
[✓] map identity text remains config-driven
[✓] score rows are entity-specific
[✓] entityType must determine player/team/roster linking
[✓] missing score rows must not break map pages
```

### Player Compare

Current UI source:

```text
src/data/players.ts
```

Future score source:

```text
PlayerDerivedScore
```

Migration approach:

```text
1. Keep existing comparison cards.
2. Add optional derived-score comparison section.
3. Show derived scores only when both selected players have rows.
4. Use fallback labels when one row is missing.
5. Do not change default sort until coverage is complete.
```

### Team Compare

Current UI source:

```text
src/data/teams.ts
```

Future score source:

```text
TeamDerivedScore
```

Migration approach:

```text
1. Keep current team comparison stable.
2. Add optional derived-score comparison section.
3. Show formulaId and confidence.
4. Preserve demo/manual fallback when derived rows are missing.
```

### Roster Builder

Current UI source:

```text
src/data/players.ts
src/lib.ts
```

Future score source:

```text
RosterValueScore
```

Suggested mapping:

```text
current value score     → RosterValueScore.value
role coverage           → RosterValueScore.roleCoverage
firepower estimate      → RosterValueScore.firepower
clutch estimate         → RosterValueScore.clutch
map fit estimate        → RosterValueScore.mapFit
balance estimate        → RosterValueScore.balance
budget warnings         → RosterValueScore.warnings
```

Required guardrails:

```text
[✓] keep current roster builder logic as default
[✓] do not depend on precomputed roster rows for arbitrary user rosters
[✓] use RosterValueScore as a future output shape, not the only source of truth
[✓] keep budget validation local and deterministic
[✓] never block roster creation because derived data is missing
```

## Adapter layer plan

Before public UI migration, add a small adapter layer.

Suggested file:

```text
src/data/scoreAdapters.ts
```

Suggested responsibilities:

```text
getPlayerScore(playerId)
getTeamScore(teamId)
getMapFitScore(mapId, entityId, entityType)
getRosterValueScore(rosterId)
```

Each adapter should return:

```ts
type ScoreAdapterResult<T> = {
  value: T | undefined;
  source: "demo-manual" | "sample-derived" | "real-derived";
  status: "fallback" | "sample" | "active";
  confidence?: "low" | "medium" | "high";
  formulaId?: string;
  periodStart?: string;
  periodEnd?: string;
};
```

This prevents pages from importing sample score arrays directly.

## UI disclosure requirements

Any page using derived scores should show at least one of:

```text
Data status
Formula id
Confidence
Period start/end
Source group
Sample/live status
```

Minimum visible copy for sample data:

```text
Sample data only — not live official statistics.
```

Minimum visible copy for future real data:

```text
Derived from source-grounded data for the displayed period.
```

## Fallback strategy

Every migrated UI surface must have a fallback.

Fallback priority:

```text
1. real derived score
2. sample derived score only on preview/non-production pages
3. demo/manual current value
4. empty state
```

For public production routes, sample derived scores should not outrank
demo/manual values unless the route is explicitly marked as a sample preview.

## Validation before migration

Required validation commands:

```bash
npm run validate:data
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run validate:sample-derived-scores
npm run release:check
```

Before any public UI migration, add or confirm validation for:

```text
[ ] real derived score rows
[ ] real source ids
[ ] formula ids
[ ] score ranges
[ ] data periods
[ ] confidence metadata
[ ] fallback behavior
```

## Recommended migration phases

### Phase 1 — Current state

Status:

```text
[✓] demo/manual UI
[✓] real-stat scaffold
[✓] sample raw stats
[✓] sample derived scores
[✓] sample data preview page
[✓] validation scripts
```

Do not change public scoring.

### Phase 2 — Adapter layer

Add:

```text
src/data/scoreAdapters.ts
```

Expose read-only score lookup helpers.

No UI behavior change yet.

### Phase 3 — Preview-only UI wiring

Use adapters only on:

```text
/sample-data
```

or a future non-production route:

```text
/sample-analytics
```

Do not wire derived scores into:

```text
/players
/teams
/roster-builder
```

yet.

### Phase 4 — Optional public annotations

Add small non-ranking annotations to public pages.

Examples:

```text
Sample derived profile available
Future score model: player-impact-v1
Data migration preview available
```

Do not sort or rank by sample derived scores.

### Phase 5 — Real data import

Add manually curated real-stat rows or generated real-stat rows.

Required files may include:

```text
src/data/realRawStats.ts
src/data/realDerivedScores.ts
```

or external generated files later.

### Phase 6 — Real derived score preview

Create an opt-in preview.

Possible route:

```text
/analytics-preview
```

Requirements:

```text
[✓] not indexed if data is incomplete
[✓] visible data status
[✓] source period
[✓] confidence
[✓] clear fallback behavior
```

### Phase 7 — Public UI migration

Only after enough coverage exists:

```text
[ ] player coverage is high enough
[ ] team coverage is high enough
[ ] map coverage is high enough
[ ] source metadata is complete
[ ] validation passes
[ ] copy clearly explains score source
```

Then public routes can use real derived scores.

## Route-by-route migration checklist

### `/players`

```text
[ ] Add adapter lookup
[ ] Add data status chip
[ ] Keep demo/manual fallback
[ ] Avoid sample-derived sorting
[ ] Add confidence copy
```

### `/players/:playerId`

```text
[ ] Show formula id
[ ] Show period
[ ] Show confidence
[ ] Show component breakdown
[ ] Keep current strengths/weaknesses
```

### `/teams`

```text
[ ] Add adapter lookup
[ ] Add data status chip
[ ] Keep demo/manual fallback
[ ] Avoid sample-derived sorting
```

### `/teams/:teamId`

```text
[ ] Show formula id
[ ] Show component breakdown
[ ] Preserve team identity text
```

### `/maps`

```text
[ ] Keep config-driven map identity
[ ] Use MapFitScore only for entity-specific rows
```

### `/compare`

```text
[ ] Add optional derived-score section
[ ] Handle missing rows
[ ] Show confidence
```

### `/team-compare`

```text
[ ] Add optional derived-score section
[ ] Handle missing rows
[ ] Show confidence
```

### `/roster-builder`

```text
[ ] Keep deterministic current calculations
[ ] Do not require precomputed roster rows
[ ] Use RosterValueScore shape as future output contract
```

## Copy rules

Avoid:

```text
best player
official rating
live ranking
prediction
expected winner
betting edge
```

Prefer:

```text
demo/manual score
sample derived score
source-grounded score
derived from selected period
low-confidence sample
preview only
```

## Risk log

### Risk: sample data looks official

Mitigation:

```text
[✓] visible sample warning
[✓] docs warning
[✓] no public ranking migration yet
```

### Risk: incomplete data changes rankings

Mitigation:

```text
[✓] fallback strategy
[✓] coverage checks
[✓] no derived sorting until coverage is complete
```

### Risk: formulas are treated as final

Mitigation:

```text
[✓] formula scaffolds marked planned/manual
[✓] confidence metadata
[✓] model validation
```

### Risk: roster builder becomes brittle

Mitigation:

```text
[✓] keep current local scoring
[✓] use RosterValueScore as output shape only
[✓] keep budget/role checks deterministic
```

## Recommended next implementation step

Add an adapter-only step:

```text
src/data/scoreAdapters.ts
docs/SCORE_ADAPTERS.md
```

This should introduce lookup helpers without changing public UI behavior.

Suggested initial helpers:

```text
getSamplePlayerDerivedScore(playerId)
getSampleTeamDerivedScore(teamId)
getSampleMapFitScoresForEntity(entityId, entityType)
getSampleRosterValueScore(rosterId)
```

Recommended commit message:

```bash
git commit -m "Add score adapter plan"
```
