# ClutchLab Architecture Snapshot

Current intended structure after the refactor:

```text
src/
  App.tsx
  components/
    AppShell.tsx
    Metric.tsx
    Panel.tsx
    PlayerCard.tsx
    PlayerProfile.tsx
    RoleBadge.tsx
    Score.tsx
    StatCard.tsx
    TeamCard.tsx
    Warning.tsx
  config/
    maps.ts
    navigation.ts
    roles.ts
  pages/
    ComparePage.tsx
    HomePage.tsx
    MapDetailPage.tsx
    MapsPage.tsx
    NotFoundPage.tsx
    PlayerDetailPage.tsx
    PlayersPage.tsx
    RoleDetailPage.tsx
    RolesPage.tsx
    RosterBuilderPage.tsx
    SavedRostersPage.tsx
    TeamComparePage.tsx
    TeamDetailPage.tsx
    TeamsPage.tsx
    TraitsPage.tsx
  data.ts
  index.css
  lib.ts
  main.tsx
  types.ts
```

## Responsibility split

```text
App.tsx
```

Router only:

- `BrowserRouter`
- `Routes`
- redirects
- page imports

```text
components/AppShell.tsx
```

Application shell:

- page wrapper
- header
- navigation UI

```text
config/navigation.ts
```

Navigation items used by `AppShell`.

```text
pages/*
```

Route-level screens.

```text
components/*
```

Reusable UI blocks and cards.

```text
config/roles.ts
config/maps.ts
```

Static configuration used across pages.

```text
data.ts
types.ts
lib.ts
```

Demo data, TypeScript models, and shared calculations.
