# Sample Stats Validation

ClutchLab has a validation script for the manual sample raw-stat scaffold.

This validation does not validate live esports data. It checks that the small
sample dataset is internally consistent and compatible with the current local
project data.

## Command

```bash
npm run validate:sample-stats
```

## Script

```text
scripts/validate-sample-stats.mjs
```

## Files checked

```text
src/data/players.ts
src/data/teams.ts
src/data/sources.ts
src/data/sampleRawStats.ts
```

## What it validates

```text
[✓] samplePlayerStatWindow sourceId exists
[✓] sampleTeamStatWindow sourceId exists
[✓] periodStart is a valid date
[✓] periodEnd is a valid date
[✓] retrievedAt is a valid date when present
[✓] periodStart is before or equal to periodEnd
[✓] sample size values are non-negative
[✓] every sample playerId exists in src/data/players.ts
[✓] every sample teamId exists in src/data/teams.ts
[✓] player rows use samplePlayerStatWindow
[✓] team rows use sampleTeamStatWindow
[✓] mapsPlayed is positive
[✓] roundsPlayed is positive
[✓] non-negative numeric fields are not negative
[✓] percentage fields are between 0 and 100
[✓] sampleRawStatsSummary derives row counts from sample arrays
[✓] sampleRawStatsSummary.windows equals 2
[✓] sampleRawStatsSummary.status derives from sampleRawStatsMeta.status
```

## Release workflow

Sample stats validation is now part of:

```bash
npm run release:check
```

Release check runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run validate:sample-stats
npm run lint
npm run format:check
npm run build
```

## CI workflow

GitHub Actions also runs:

```bash
npm run validate:sample-stats
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Why this matters

The project now has the full early real-stat scaffold:

```text
source metadata → raw stat model → sample raw stats → derived score model
```

The validator makes sure the sample rows reference existing local players, teams
and source ids before the project is built or deployed.

## Limitations

The validator is source-text based, not AST-based.

It is meant for the current TypeScript scaffold. If the future sample data moves
to JSON, a backend or generated files, this validator should be updated to read
from the new canonical source.

## Recommended next step

After this validation step, update project documentation:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
