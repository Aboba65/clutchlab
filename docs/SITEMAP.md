# Sitemap

ClutchLab uses a generated sitemap.

## Command

```bash
npm run generate:sitemap
```

## Script

```text
scripts/generate-sitemap.mjs
```

## Output

```text
public/sitemap.xml
```

## Site URL

```text
https://clutchlab-olive.vercel.app
```

## Source files

The generator reads local source files:

```text
src/data/players.ts
src/data/teams.ts
src/config/maps.ts
src/config/roles.ts
src/data/meta.ts
```

## Generated route groups

```text
[✓] static routes
[✓] /players/:playerId
[✓] /teams/:teamId
[✓] /maps/:mapId
[✓] /roles/:roleId
```

## Current expected coverage

Based on the current MVP dataset:

```text
Static routes: 11
Players:       40
Teams:         8
Maps:          7
Roles:         8
Total routes:  74
```

## Static routes

```text
/
/players
/teams
/maps
/roles
/compare
/team-compare
/roster-builder
/saved-rosters
/traits
/about
```

## Sitemap metadata

`lastmod` is generated from:

```text
dataMeta.lastUpdated
```

Current value:

```text
2026-06-28
```

Route groups use different priorities:

```text
/                         1.0
/players                  0.9
/teams                    0.9
/roster-builder           0.9
main utility pages         0.7–0.8
detail routes              0.6–0.7
saved browser-local page   0.5
```

## Quality workflow

Sitemap generation is part of the local release gate:

```bash
npm run release:check
```

The release check runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run lint
npm run format:check
npm run build
```

## CI workflow

GitHub Actions also runs sitemap generation:

```bash
npm run generate:sitemap
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Manual verification

After running the generator, open:

```text
public/sitemap.xml
```

After deploy, open:

```text
https://clutchlab-olive.vercel.app/sitemap.xml
```

Check that the file contains:

```text
/players/zywoo
/teams/vitality
/maps/mirage
/roles/awper
```

## Notes

The sitemap generator is intentionally simple and source-text based. If the data
layer later moves to JSON, a database or an API, the generator should be updated
to read from the new canonical source.
