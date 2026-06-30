# Derived Scores Model

ClutchLab currently uses MVP demo/manual scoring.

This document defines the future derived-score type model without replacing the
current public data.

## Source file

```text
src/data/derivedScores.ts
```

## Current status

```text
planned-schema
```

No real-stat derived score rows are connected yet.

The file provides types and formula metadata so future score work can be
implemented without mixing raw stats, derived scores and manual assumptions.

## Exported types

```text
ScoreScale
ScoreConfidence
ScoreDatasetStatus
ScoreFormulaMeta
ScoreComponent
PlayerDerivedScore
TeamDerivedScore
MapFitScore
RosterValueScore
DerivedScoreDatasetMeta
```

## Exported metadata

```text
derivedScoreDatasetMeta
scoreFormulaScaffolds
derivedScoreFieldGroups
```

## Why this exists

The raw stat model describes source-grounded numbers.

Derived scores describe ClutchLab-calculated values.

The architecture should remain:

```text
identity data
  ↓
source metadata
  ↓
raw stats
  ↓
derived scores
  ↓
UI scoring / comparison / roster logic
```

## Formula metadata

Every future formula should have metadata.

```ts
type ScoreFormulaMeta = {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceIds: string[];
  inputFields: string[];
  outputFields: string[];
  scale: ScoreScale;
  confidence: ScoreConfidence;
  notes?: string[];
};
```

Purpose:

```text
id             stable formula id
name           readable formula name
version        formula version
description    what the formula calculates
sourceIds      sources used by the formula
inputFields    raw or derived inputs
outputFields   generated score fields
scale          score scale
confidence     confidence in the formula/data
notes          caveats and methodology notes
```

## ScoreComponent

A score can be broken into components.

```ts
type ScoreComponent = {
  id: string;
  label: string;
  value: number;
  weight?: number;
  description?: string;
};
```

This allows future UI to show why a score is high or low.

## PlayerDerivedScore

Future player score rows should include:

```text
playerId
formulaId
sourceIds
periodStart
periodEnd
impact
clutch
opening
awp
rifle
consistency
value
components
confidence
notes
```

This should eventually replace hardcoded/demo score values in player profiles and
comparison views.

## TeamDerivedScore

Future team score rows should include:

```text
teamId
formulaId
sourceIds
periodStart
periodEnd
overall
firepower
structure
mapPool
clutch
form
components
confidence
notes
```

This should eventually power team pages and team comparison.

## MapFitScore

Future map fit rows should include:

```text
mapId
entityId
entityType
formulaId
sourceIds
fit
awpFit
entryFit
anchorFit
lurkFit
supportFit
components
confidence
notes
```

This model supports map fit for:

```text
player
team
roster
```

## RosterValueScore

Future roster scoring rows should include:

```text
rosterId
formulaId
sourceIds
playerIds
totalCost
budgetLimit
value
roleCoverage
firepower
clutch
mapFit
balance
warnings
components
confidence
notes
```

This should eventually power the Roster Builder.

## Current formula scaffolds

The current file defines planned formula scaffolds:

```text
player-impact-v1
team-score-v1
map-fit-v1
roster-value-v1
```

These are scaffolds only.

They are not connected to real-stat rows yet.

## Relationship to raw stats

Raw stats live in:

```text
src/data/rawStats.ts
docs/RAW_STATS_MODEL.md
```

Derived scores should reference raw/source context through:

```text
formulaId
sourceIds
periodStart
periodEnd
```

## Relationship to current demo/manual data

This model does not replace:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
```

Current production-facing data remains:

```text
demo/manual
```

## Future validation rules

A future `validate:derived-scores` command should check:

```text
[ ] every formula id is unique
[ ] every derived score references an existing formula id
[ ] every sourceId exists
[ ] every playerId exists
[ ] every teamId exists
[ ] every mapId exists
[ ] every score is within 0–100 where applicable
[ ] formula inputFields and outputFields are non-empty
[ ] formula sourceIds are declared
[ ] confidence is declared
[ ] notes exist for low-confidence formulas
```

## Recommended next step

Add documentation update for this scaffold:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
