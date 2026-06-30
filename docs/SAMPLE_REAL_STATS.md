# Sample Real Stats

ClutchLab now has a small manual raw-stat sample.

This is an integration scaffold only. It does not replace the current public
demo/manual UI data.

## Source file

```text
src/data/sampleRawStats.ts
```

## Current status

```text
manual-sample
```

## Exports

```text
sampleRawStatsMeta
samplePlayerStatWindow
sampleTeamStatWindow
samplePlayerRawStats
sampleTeamRawStats
sampleRawStatsSummary
SampleRawStatsMeta
```

## Sample contents

Current sample rows:

```text
Players: 3
Teams:   2
Windows: 2
```

Player sample ids:

```text
zywoo
donk
monesy
```

Team sample ids:

```text
vitality
spirit
```

## Source ids

The sample uses existing planned real-stat source placeholders:

```text
future-real-player-stats
future-real-team-stats
```

These are defined in:

```text
src/data/sources.ts
```

## Stat windows

The sample includes separate windows for player and team raw stats.

Both windows include:

```text
sourceId
periodStart
periodEnd
retrievedAt
eventScope
matchFormatScope
sampleSize
```

## Why this exists

The project already has model scaffolds:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/derivedScores.ts
```

The sample file gives the future model a small concrete dataset for upcoming row
validation work.

The intended architecture remains:

```text
source metadata → raw stats → derived scores → UI scores
```

## Important boundaries

The sample is not:

```text
[!] live statistics
[!] official player ranking data
[!] complete event coverage
[!] connected to current player cards
[!] connected to the roster builder
[!] used for betting or prediction
```

Current public-facing UI data still comes from:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
```

## Recommended next validation step

Add row validation for the sample:

```text
scripts/validate-sample-stats.mjs
npm run validate:sample-stats
```

The validator should check:

```text
[ ] player ids exist in src/data/players.ts
[ ] team ids exist in src/data/teams.ts
[ ] source ids exist in src/data/sources.ts
[ ] period dates are valid
[ ] periodStart is before periodEnd
[ ] mapsPlayed and roundsPlayed are positive
[ ] percentage fields are between 0 and 100
[ ] sample summary matches row counts
```

## Recommended next documentation update

After this scaffold, update:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
