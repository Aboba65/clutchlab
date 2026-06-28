# ClutchLab data layer

This folder contains the core local data used by the MVP.

## Files

```text
src/data/players.ts   → player profiles
src/data/teams.ts     → team profiles
src/data/meta.ts      → dataset status, version and source notes
src/data/index.ts     → public data exports
```

`src/data.ts` remains as a compatibility export for older imports.

## Current status

The current dataset is **demo/manual data**.

That means:

- player and team names are used for product testing and navigation;
- ratings, prices, role scores, map fit scores and custom indexes are not live statistics;
- values should not be presented as current real-world esports data;
- future real-stat work should update `meta.ts`.

## Adding a player

When adding a player to `players.ts`, keep the object shape consistent:

```ts
{
  id: "player-id",
  nickname: "nickname",
  fullName: "Full Name",
  country: "Country",
  age: 20,
  teamId: "team-id",
  role: "Entry",
  price: 6,
  stats: {
    rating: 1.15,
    adr: 82.5,
    kd: 1.10,
    kast: 74.0,
    impact: 86,
    clutch: 78,
    opening: 88,
    awp: 30,
    rifle: 91,
    consistency: 82,
  },
  traits: ["Space creator", "High tempo"],
}
```

Checklist:

- `id` must be unique;
- `teamId` should match a team in `teams.ts`;
- `role` must match `PlayerRole`;
- `price` should stay compatible with Roster Builder budget logic;
- `traits` should be short and useful for search.

## Adding a team

When adding a team to `teams.ts`, keep the object shape consistent:

```ts
{
  id: "team-id",
  name: "Team Name",
  region: "Europe",
  players: ["player-one", "player-two"],
  bestMaps: ["Mirage", "Nuke"],
  scores: {
    firepower: 88,
    structure: 84,
    mapPool: 82,
    clutch: 80,
    form: 86,
  },
}
```

Checklist:

- `id` must be unique;
- `players` should reference existing player ids;
- `bestMaps` should use names that match map profiles;
- score values should stay within 0–100;
- if real data is used, update `meta.ts`.

## Future real stats structure

A later real-data version should separate:

```text
identity data      → names, countries, roles, team ids
current stats      → ratings, ADR, KAST, K/D, maps
market/builder     → price, role fit, roster value
source metadata    → source, date, event filters
```

Recommended future files:

```text
src/data/players.identity.ts
src/data/players.stats.ts
src/data/teams.identity.ts
src/data/teams.stats.ts
src/data/sources.ts
```

## Source notes rules

When replacing demo values with real or curated data:

1. Record the source name.
2. Record the date of the data.
3. Record the event/time window if applicable.
4. Keep manual adjustments separate from raw stats.
5. Update `dataMeta.version` and `dataMeta.lastUpdated`.
