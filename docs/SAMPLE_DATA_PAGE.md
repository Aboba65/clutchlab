# Sample Data Page

## Route

```text
/sample-data
```

## Source file

```text
src/pages/SampleDataPage.tsx
```

## Purpose

The Sample Data page is a preview-only route for checking raw stat samples,
derived score samples and adapter metadata before any public scoring migration.

It is not a live ranking page.

It is not a source of official CS2 statistics.

## Current status

```text
sample-only preview
```

## Current implementation

The page now uses generic score adapter helpers with explicit sample opt-in:

```text
getPlayerDerivedScore(..., { allowSample: true })
getTeamDerivedScore(..., { allowSample: true })
getMapFitScore(..., { allowSample: true })
getRosterValueScore(..., { allowSample: true })
```

This means `/sample-data` exercises the same generic adapter API that future
public pages may use, while still keeping sample-derived rows isolated to a
labeled preview route.

## Safety labels

The page must keep visible labels:

```text
Sample only
Not live stats
Generic adapters allowSample=true
```

## Why allowSample=true is allowed here

`allowSample=true` is safe on `/sample-data` because:

```text
[✓] the route is visibly labeled as sample-only
[✓] the route is not used for public rankings
[✓] the route is not used for catalog sorting
[✓] the route is not used by Roster Builder scoring
[✓] validation blocks allowSample=true on other public pages
```

## Public page boundary

Public scoring pages remain unchanged:

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
```

These pages must not:

```text
[!] pass allowSample: true
[!] call getSample* helpers
[!] import sampleDerivedScores directly
[!] import realDerivedScores directly
```

## Displayed sections

The page shows:

```text
[✓] raw player stat samples
[✓] raw team stat samples
[✓] player derived score samples through generic adapters
[✓] team derived score samples through generic adapters
[✓] map fit score samples through generic adapters
[✓] roster value score samples through generic adapters
[✓] adapter metadata
[✓] sample metadata
[✓] coverage summary
```

## Adapter metadata shown

For each adapted derived score card, the page shows:

```text
source
status
confidence
formulaId
periodStart
periodEnd
sourceIds
fallback reason when relevant
```

Expected sample-preview values:

```text
source: sample-derived
status: sample
```

## Optional field safety

Some raw and derived fields are intentionally optional in the model because real
imports may not always provide every field.

The page must render missing optional values safely as:

```text
n/a
```

This applies to optional raw stat fields and optional derived score fields.

## Raw stat field names

Player raw stat preview uses field names from `PlayerRawStats`:

```text
openingSuccess
clutchWins
clutchAttempts
```

Older display-only names should not be used:

```text
openingDuelSuccess
clutch1vXWins
clutch1vXAttempts
```

## Validation

Run:

```bash
npm run validate:score-adapters
npm run release:check
```

The score adapter validator protects the public-page boundary and allows the
sample route to remain a controlled exception.

## Non-goals

The Sample Data page must not:

```text
[ ] replace public UI scores
[ ] change player catalog sorting
[ ] change team catalog sorting
[ ] change compare page logic
[ ] change roster-builder value logic
[ ] claim sample rows are official
[ ] add fake real-derived rows
```

## Recommended next step

Add read-only generic adapter preview blocks to detail routes later, but keep them
separate from ranking/sorting logic until real-derived coverage gates are ready.
