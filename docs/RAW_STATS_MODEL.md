# Raw Stats Model

ClutchLab currently uses demo/manual values.

This document defines the future raw-stat type model without replacing the
current MVP data.

## Source file

```text
src/data/rawStats.ts
```

## Current status

```text
planned-schema
```

No real-stat rows are connected yet.

The file provides types and metadata so future real-stat work can be implemented
without mixing raw numbers, derived scores and manual assumptions.

## Exported types

```text
StatWindow
SampleSizeRules
PlayerRawStats
TeamRawStats
MapRawStats
RoleRawStats
RawStatDatasetStatus
RawStatDatasetMeta
```

## Exported metadata

```text
rawStatDatasetMeta
rawStatFieldGroups
```

## Why this exists

The current MVP has useful UI and product logic, but its scores are demo/manual.

Future real-stat data needs a stricter structure:

```text
[✓] every stat row should know its source
[✓] every stat row should have a period/window
[✓] raw stats should not be mixed with derived scores
[✓] sample-size rules should be explicit
[✓] manual assumptions should be documented separately
```

## StatWindow

Every future raw-stat row should include a `StatWindow`.

```ts
type StatWindow = {
  sourceId: string;
  periodStart: string;
  periodEnd: string;
  retrievedAt?: string;
  eventScope: string;
  matchFormatScope?: string;
  sampleSize?: SampleSizeRules;
};
```

Purpose:

```text
sourceId           links the row to src/data/sources.ts
periodStart        beginning of stat window
periodEnd          end of stat window
retrievedAt        when the data was collected
eventScope         event/ranking/time scope
matchFormatScope   optional match format filter
sampleSize         optional minimum sample-size rules
```

## SampleSizeRules

```ts
type SampleSizeRules = {
  minimumMaps?: number;
  minimumRounds?: number;
  minimumMatches?: number;
  minimumTeams?: number;
  note?: string;
};
```

This avoids treating tiny samples as stable performance.

## PlayerRawStats

Future player raw rows should use:

```text
playerId
window
mapsPlayed
roundsPlayed
rating
adr
kd
kast
openingAttempts
openingSuccess
openingDuelWinRate
clutchAttempts
clutchWins
clutchWinRate
awpKills
rifleKills
headshotRate
firstKills
firstDeaths
```

These are raw or lightly normalized statistics. They should not be the same thing
as ClutchLab derived values like `impact`, `clutch`, `opening`, `awp`, `rifle` or
`consistency`.

## TeamRawStats

Future team raw rows should use:

```text
teamId
window
mapsPlayed
roundsPlayed
winRate
roundWinRate
tRoundWinRate
ctRoundWinRate
pistolRoundWinRate
conversionRate
retakeWinRate
clutchWinRate
openingDuelWinRate
```

## MapRawStats

Future map raw rows should use:

```text
mapId
window
mapsPlayed
roundsPlayed
tRoundWinRate
ctRoundWinRate
pistolRoundWinRate
openingDuelImpact
awpImpact
anchorPressure
retakeFrequency
```

## RoleRawStats

Future role aggregate rows should use:

```text
roleId
window
playerCount
mapsPlayed
roundsPlayed
averageRating
averageAdr
averageKast
averageOpeningAttempts
averageClutchAttempts
```

## Relationship to sources

Raw stats should reference source metadata through:

```text
window.sourceId
```

Source metadata lives in:

```text
src/data/sources.ts
docs/DATA_SOURCES.md
```

## Relationship to derived scores

Raw stats are inputs.

Derived scores should be separate.

Future files could be:

```text
src/scoring/playerScores.ts
src/scoring/teamScores.ts
src/scoring/mapFit.ts
src/scoring/rosterValue.ts
```

Example derived values:

```text
PlayerDerivedScore.impact
PlayerDerivedScore.clutch
PlayerDerivedScore.opening
TeamDerivedScore.firepower
TeamDerivedScore.structure
MapFitScore.anchorPressure
RosterValueScore.value
```

## Relationship to current demo/manual data

This model does not replace:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
```

It prepares the project for a later migration.

Current production-facing data remains:

```text
demo/manual
```

## Future validation rules

A future `validate:raw-stats` command should check:

```text
[ ] every raw stat row references an existing source id
[ ] every playerId exists
[ ] every teamId exists
[ ] every mapId exists
[ ] every roleId exists
[ ] periodStart and periodEnd are valid dates
[ ] periodStart is before periodEnd
[ ] mapsPlayed and roundsPlayed are non-negative
[ ] percentage fields are within valid ranges
[ ] sample-size rules are declared for real-stat datasets
[ ] derived scores do not appear in raw stat files
```

## Recommended next step

Add derived score type definitions:

```text
PlayerDerivedScore
TeamDerivedScore
MapFitScore
RosterValueScore
docs/DERIVED_SCORES_MODEL.md
```
