# Detail Score Preview Plan

This document defines a safe plan for adding read-only derived-score preview
blocks to detail pages.

It is documentation only.

No UI, routing, scoring, sorting, validation or data behavior is changed by this
document.

## Purpose

ClutchLab now has generic score adapters and a sample-only preview route.

The next safe UI step is not to replace public scoring. The next safe step is to
design read-only preview blocks for detail pages that can later show adapter
metadata without changing existing product logic.

## Current state

```text
generic score adapters: implemented
score adapter validation: implemented
/sample-data: uses generic adapters with allowSample=true
public catalog scoring: unchanged
public detail scoring: unchanged
roster-builder scoring: unchanged
real-derived rows: none
```

## Target behavior

Add optional, read-only derived-score preview blocks to detail routes later.

These blocks should:

```text
[✓] use generic adapters
[✓] use safe defaults
[✓] show adapter source/status/confidence
[✓] show fallback state when no real-derived row exists
[✓] not affect ranking
[✓] not affect sorting
[✓] not affect roster-builder scoring
[✓] not claim sample rows are live
```

## Non-goals

The first detail preview implementation must not:

```text
[ ] change player catalog sorting
[ ] change team catalog sorting
[ ] change map catalog sorting
[ ] change Compare scoring
[ ] change Team Compare scoring
[ ] change Roster Builder scoring
[ ] import sampleDerivedScores directly into public pages
[ ] import realDerivedScores directly into public pages
[ ] pass allowSample=true outside /sample-data
[ ] call getSample* helpers outside /sample-data
[ ] add fake real-derived rows
```

## Candidate routes

### First safe routes

```text
/players/:playerId
/teams/:teamId
/maps/:mapId
```

These are better first targets because they are detail pages, not ranking pages.

### Later routes

```text
/compare
/team-compare
```

These routes involve comparison logic, so they should be handled after detail page
preview blocks are stable.

### Last routes

```text
/players
/teams
/maps
/roster-builder
/saved-rosters
```

These routes are higher risk because they involve catalog ranking, sorting or
roster value logic.

## Recommended migration order

```text
1. Add shared preview card component
2. Add player detail preview block
3. Add team detail preview block
4. Add map detail preview block
5. Document preview copy rules
6. Add validation for public generic-helper imports
7. Add compare-page preview later
8. Migrate scoring only after real-derived coverage gates pass
```

## Source behavior

Public detail pages should call generic helpers with default options:

```ts
const result = getPlayerDerivedScore(playerId);
```

Equivalent options:

```text
allowSample=false
preferReal=true
```

This means:

```text
[✓] real-derived rows can be shown if they exist
[✓] sample-derived rows are not shown on public detail pages
[✓] fallback metadata is shown when real-derived rows do not exist
```

## Why not allowSample=true

`allowSample=true` is reserved for `/sample-data`.

Public pages must not pass:

```ts
getPlayerDerivedScore(playerId, { allowSample: true });
getTeamDerivedScore(teamId, { allowSample: true });
getMapFitScore(args, { allowSample: true });
getRosterValueScore(rosterId, { allowSample: true });
```

Reason:

```text
sample rows are manually created preview rows
sample rows are not official statistics
sample rows must not influence public-facing score interpretation
```

## Shared component plan

Future component:

```text
src/components/ScorePreviewCard.tsx
```

Suggested props:

```ts
type ScorePreviewCardProps = {
  title: string;
  description: string;
  result: ScoreAdapterResult<unknown>;
  children?: React.ReactNode;
};
```

Suggested display:

```text
title
description
source
status
confidence
formulaId
periodStart
periodEnd
sourceIds
fallback reason
preview disclaimer
```

## Player detail preview block

Route:

```text
/players/:playerId
```

Future helper:

```ts
const result = getPlayerDerivedScore(player.id);
```

Allowed display:

```text
Derived score preview
source/status/confidence
impact
clutch
opening
awp
rifle
consistency
value
fallback reason
```

Expected current result with empty real-derived arrays:

```text
source: demo-manual
status: fallback
value: undefined
reason: No real-derived score for player <id>.
```

Copy should say:

```text
No real-derived score is available yet. Current page values still use the
demo/manual MVP dataset.
```

## Team detail preview block

Route:

```text
/teams/:teamId
```

Future helper:

```ts
const result = getTeamDerivedScore(team.id);
```

Allowed display:

```text
Derived team score preview
source/status/confidence
overall
firepower
structure
map pool
clutch
form
fallback reason
```

Expected current result with empty real-derived arrays:

```text
source: demo-manual
status: fallback
value: undefined
reason: No real-derived score for team <id>.
```

## Map detail preview block

Route:

```text
/maps/:mapId
```

Map detail is more complex because map fit scores require an entity.

Recommended first implementation:

```text
do not add map fit entity scoring yet
add only a read-only note explaining map fit previews are available on /sample-data
```

Alternative later implementation:

```text
show map-fit preview only when route has a selected player/team entity
```

Recommended helper for future entity-aware block:

```ts
const result = getMapFitScore({
  mapId,
  entityId,
  entityType,
});
```

## Compare page preview

Routes:

```text
/compare
/team-compare
```

These should be later than detail pages.

Allowed future behavior:

```text
show read-only adapter metadata beside existing comparison
do not replace comparison score
do not alter winner/highlight logic
do not alter sorting
```

## Roster Builder boundary

Route:

```text
/roster-builder
```

Do not use `getRosterValueScore` to replace Roster Builder scoring until real
coverage gates pass.

Allowed future behavior before migration:

```text
show a collapsed technical preview panel
show fallback status
do not affect current budget/value calculation
```

## Copy rules

Avoid:

```text
official rating
live ranking
best player
confirmed score
real-time score
```

Prefer:

```text
derived score preview
adapter preview
real-derived availability
source-backed score
fallback state
not used for ranking
```

## Required disclaimers

For public detail preview blocks:

```text
This preview is not used for ranking or sorting.
```

When no real-derived row exists:

```text
No real-derived score is available yet. Current page values still use the
demo/manual MVP dataset.
```

When a future real-derived row exists:

```text
This score is derived from the listed source ids and period. It is shown as a
preview and does not replace catalog ranking until coverage gates pass.
```

## Validation expectations

Update `scripts/validate-score-adapters.mjs` later to allow public pages to import
generic helpers while still blocking unsafe sample usage.

Future validation should allow:

```text
public pages importing generic helpers from scoreAdapters
public pages calling getPlayerDerivedScore(playerId)
public pages calling getTeamDerivedScore(teamId)
public pages calling getMapFitScore(args)
```

Future validation should still block:

```text
allowSample: true outside src/pages/SampleDataPage.tsx
getSample* calls outside src/pages/SampleDataPage.tsx
direct sampleDerivedScores imports outside data layer
direct realDerivedScores imports outside data layer
public sorting driven by adapter values before coverage gates
```

## Component-level validation ideas

Later validation could check that any public preview block includes visible copy:

```text
preview
not used for ranking
demo/manual fallback
source
status
confidence
```

## Real-derived coverage gate

Before public scoring replacement, require:

```text
[ ] real player derived rows exist
[ ] real team derived rows exist
[ ] real map fit rows exist
[ ] rows pass validation
[ ] source ids are valid
[ ] formula ids are valid
[ ] confidence is not low for public ranking surfaces
[ ] coverage threshold is documented
[ ] fallback behavior is documented
```

## Safe implementation checklist

Before adding player/team detail preview blocks:

```text
[ ] add shared ScorePreviewCard component
[ ] keep ScorePreviewCard read-only
[ ] use generic helpers with default options
[ ] do not pass allowSample=true
[ ] display fallback state
[ ] display source/status/confidence
[ ] add copy that preview is not used for ranking
[ ] run validate:score-adapters
[ ] run release:check
```

## Suggested first implementation

First implementation should add only:

```text
src/components/ScorePreviewCard.tsx
```

and no route usage yet.

Then update validation/docs.

After that, add the component to:

```text
src/pages/PlayerDetailPage.tsx
```

only.

## Risk log

### Risk: users think preview is live ranking

Mitigation:

```text
show explicit preview and not-ranking copy
show source/status/confidence
show fallback when real-derived data is unavailable
```

### Risk: sample rows leak into public pages

Mitigation:

```text
validation blocks allowSample=true outside /sample-data
validation blocks getSample* calls outside /sample-data
```

### Risk: public ranking changes accidentally

Mitigation:

```text
detail blocks are read-only
no catalog sorting changes
no roster-builder scoring changes
```

### Risk: real-derived rows are empty

Mitigation:

```text
show fallback state only
do not hide the block silently during implementation testing
```

## Recommended next step

Create shared preview component documentation or implement a small reusable
`ScorePreviewCard` component without mounting it on public routes yet.
