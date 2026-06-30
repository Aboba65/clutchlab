# Data Sources

ClutchLab now has a source metadata scaffold.

This does not convert the current MVP into a real-stat product yet. It creates a
clear place to document what the current data means and how future real-stat data
should be connected.

## Source file

```text
src/data/sources.ts
```

## Exports

```text
dataSources
sourceGroups
```

## Types

The source file exports:

```text
SourceStatus
SourceKind
SourceConfidence
ClutchLabDataSource
ClutchLabSourceGroup
```

## Current source statuses

```text
demo          current MVP/demo source
manual        manually curated source
planned-real  placeholder for future real-stat data
real          real-stat source with source metadata
```

## Current source kinds

```text
identity            stable identity data
raw-performance     raw stats from a defined source/window
derived-score       ClutchLab-calculated score
manual-adjustment   explicit human adjustment
methodology         product methodology / framework
```

## Current source groups

```text
current-mvp-demo-layer
future-real-stat-layer
```

## Current sources

```text
demo-player-ratings
demo-team-ratings
demo-map-profiles
demo-role-profiles
future-real-player-stats
future-real-team-stats
```

## Validation

Command:

```bash
npm run validate:sources
```

Script:

```text
scripts/validate-sources.mjs
```

The validator checks:

```text
[✓] dataSources export exists
[✓] sourceGroups export exists
[✓] source ids are unique
[✓] source group ids are unique
[✓] each source has id, name and description
[✓] each source has valid kind
[✓] each source has valid status
[✓] each source has valid confidence
[✓] each source covers at least one app area
[✓] sourceGroups reference existing source ids
```

## Release workflow

Source validation is now part of:

```bash
npm run release:check
```

Release check runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run lint
npm run format:check
npm run build
```

## CI workflow

GitHub Actions also runs:

```bash
npm run validate:sources
```

## Important rule

Source metadata must not be used to pretend demo/manual values are real data.

Current MVP data remains:

```text
demo/manual
```

Future real-stat data should include:

```text
source id
source status
time window
retrieved date
sample-size rules
confidence
manual adjustment notes
```

## Recommended next step

After this scaffold, the next safe step is to document and type the future raw
stat shape without replacing the current demo/manual data.
