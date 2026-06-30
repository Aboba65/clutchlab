# Sample Derived Scores

ClutchLab now has a small manual derived-score sample.

This is an integration scaffold only. It does not replace the current public
demo/manual UI scoring.

## Source file

```text
src/data/sampleDerivedScores.ts
```

## Current status

```text
manual-sample
```

## Exports

```text
sampleDerivedScoresMeta
samplePlayerDerivedScores
sampleTeamDerivedScores
sampleMapFitScores
sampleRosterValueScores
sampleDerivedScoresSummary
SampleDerivedScoresMeta
```

## Sample contents

Current sample rows:

```text
Player derived scores: 3
Team derived scores:   2
Map fit scores:        2
Roster value scores:   1
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

Map sample ids:

```text
mirage
nuke
```

Roster sample ids:

```text
sample-star-core-v1
```

## Formula ids

The sample uses existing formula scaffolds:

```text
player-impact-v1
team-score-v1
map-fit-v1
roster-value-v1
```

These are defined in:

```text
src/data/derivedScores.ts
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

## Why this exists

The project already has:

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/sampleRawStats.ts
src/data/derivedScores.ts
```

The sample derived scores file gives the future scoring model a concrete dataset
for upcoming derived-score row validation.

The intended architecture remains:

```text
source metadata → sample raw stats → sample derived scores → future UI scores
```

## Important boundaries

The sample is not:

```text
[!] live scoring
[!] official player ranking data
[!] official team ranking data
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

Add row validation for derived scores:

```text
scripts/validate-sample-derived-scores.mjs
npm run validate:sample-derived-scores
```

The validator should check:

```text
[ ] player ids exist in src/data/players.ts
[ ] team ids exist in src/data/teams.ts
[ ] map ids exist in src/config/maps.ts
[ ] source ids exist in src/data/sources.ts
[ ] formula ids exist in src/data/derivedScores.ts
[ ] score fields are between 0 and 100
[ ] low-confidence rows include notes
[ ] sampleDerivedScoresSummary matches row counts
```

## Recommended next documentation update

After this scaffold, update:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
