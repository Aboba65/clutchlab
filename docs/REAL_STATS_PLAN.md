# Real-Stat Data Plan

ClutchLab currently uses `demo/manual` data.

This document defines how the project should later move toward real statistics
without mixing raw facts, manual assumptions and derived scores.

## Goal

Replace MVP demo/manual scoring with a structured data workflow.

The goal is not to scrape or automate everything immediately. The first goal is
to define a clean model for:

```text
[✓] where a number came from
[✓] when it was updated
[✓] what time window it covers
[✓] whether it is raw or derived
[✓] whether it was manually adjusted
[✓] how derived scores are calculated
```

## Current state

Current data status:

```text
demo/manual
```

Current files:

```text
src/data/players.ts
src/data/teams.ts
src/data/meta.ts
src/config/maps.ts
src/config/roles.ts
```

Current data is useful for:

```text
[✓] UI testing
[✓] routing
[✓] filters
[✓] sorting
[✓] roster-builder logic
[✓] comparison logic
[✓] sitemap generation
```

Current data should not be presented as:

```text
[!] live esports statistics
[!] official rankings
[!] current player form
[!] betting or prediction data
[!] verified professional scouting data
```

## Data layers

A future real-stat implementation should separate data into layers.

### 1. Identity data

Stable or slow-changing information.

Examples:

```text
player id
player nickname
player full display name
nationality
main role
secondary roles
team id
team name
team region
map id
map name
role id
role name
```

Suggested future files:

```text
src/data/identity/players.ts
src/data/identity/teams.ts
src/data/identity/maps.ts
src/data/identity/roles.ts
```

### 2. Raw performance data

Unmodified statistics from a defined source and time window.

Examples:

```text
rating
ADR
K/D
KAST
opening attempts
opening success
clutch attempts
clutch wins
AWP kills
rifle kills
rounds played
maps played
event count
```

Suggested future files:

```text
src/data/stats/player-stats.ts
src/data/stats/team-stats.ts
src/data/stats/map-stats.ts
```

### 3. Source metadata

Every raw stat group should have traceability.

Required metadata:

```text
sourceName
sourceUrl or sourceNote
retrievedAt
periodStart
periodEnd
eventScope
matchFormatScope
minimumMaps
minimumRounds
manualEntryBy
confidence
```

Suggested future file:

```text
src/data/sources.ts
```

### 4. Derived scores

ClutchLab-specific 0–100 values should be calculated from raw statistics.

Examples:

```text
impact
clutch
opening
awp
rifle
consistency
team firepower
team structure
team mapPool
team form
map fit
roster value
```

Suggested future files:

```text
src/scoring/playerScores.ts
src/scoring/teamScores.ts
src/scoring/mapFit.ts
src/scoring/rosterValue.ts
```

### 5. Manual adjustments

Manual adjustments should be explicit and reviewable.

Examples:

```text
role override
temporary roster change
known sample-size problem
recent transfer context
map pool adjustment
injury / inactivity note
```

Suggested future file:

```text
src/data/adjustments.ts
```

Manual adjustments should never silently overwrite raw statistics.

## Recommended data object shape

### Player identity

```ts
type PlayerIdentity = {
  id: string;
  nickname: string;
  name: string;
  country: string;
  teamId: string;
  roles: PlayerRole[];
};
```

### Player raw stats

```ts
type PlayerRawStats = {
  playerId: string;
  periodStart: string;
  periodEnd: string;
  mapsPlayed: number;
  roundsPlayed: number;
  rating: number;
  adr: number;
  kd: number;
  kast: number;
  openingAttempts?: number;
  openingSuccess?: number;
  clutchAttempts?: number;
  clutchWins?: number;
  sourceId: string;
};
```

### Source metadata

```ts
type DataSource = {
  id: string;
  name: string;
  url?: string;
  note?: string;
  retrievedAt: string;
  periodStart: string;
  periodEnd: string;
  eventScope: string;
  minimumMaps?: number;
  minimumRounds?: number;
  confidence: "low" | "medium" | "high";
};
```

### Derived player score

```ts
type PlayerDerivedScore = {
  playerId: string;
  sourceId: string;
  impact: number;
  clutch: number;
  opening: number;
  awp: number;
  rifle: number;
  consistency: number;
  notes?: string[];
};
```

## Update workflow

### Phase 1 — Manual real-stat entry

Best next practical phase.

Workflow:

```text
1. Choose a source and event/time window.
2. Enter raw player/team stats manually.
3. Store source metadata.
4. Generate derived scores locally.
5. Run validation.
6. Run release check.
7. Document update in CHANGELOG.
```

Quality gate:

```bash
npm run generate:sitemap
npm run validate:data
npm run release:check
```

### Phase 2 — Semi-structured import

Later.

Workflow:

```text
1. Prepare CSV/JSON manually.
2. Add import script.
3. Convert external rows into internal data.
4. Validate schema and ranges.
5. Generate derived scores.
```

Possible scripts:

```text
scripts/import-player-stats.mjs
scripts/import-team-stats.mjs
scripts/derive-scores.mjs
scripts/validate-real-stats.mjs
```

### Phase 3 — API/backend

Later.

Workflow:

```text
1. Move stats to a backend or data service.
2. Keep identity data stable.
3. Fetch current stat windows.
4. Cache derived scores.
5. Keep source metadata visible.
```

This is not required for the MVP.

## Validation rules

Future validation should check:

```text
[✓] every stat row has a sourceId
[✓] every source has periodStart and periodEnd
[✓] every player stat row references an existing player
[✓] every team stat row references an existing team
[✓] every derived score references raw stats or a source
[✓] no score is outside 0–100
[✓] sample size is above minimum threshold
[✓] period dates are valid
[✓] source confidence is declared
[✓] manual overrides are documented
```

## UI disclosure rules

If real statistics are added, the UI should show:

```text
source
last updated
time window
minimum maps/rounds
demo/manual vs real-stat status
derived score note
```

The footer and DataNotice should continue to make data status clear.

## First implementation target

The first real-stat step should be documentation and structure only:

```text
[✓] docs/REAL_STATS_PLAN.md
[ ] source metadata type
[ ] raw stats type
[ ] derived score type
[ ] real-stat validation script
[ ] manual sample dataset
```

## Non-goals for now

Do not add yet:

```text
[ ] scraping
[ ] backend
[ ] user accounts
[ ] paid API integrations
[ ] automatic live updates
[ ] betting/prediction claims
```

## Recommended next step after this document

Add source metadata scaffolding without changing the current UI:

```text
src/data/sources.ts
src/types.ts source-related types
scripts/validate-data.mjs source validation
docs/DATA_SOURCES.md
```
