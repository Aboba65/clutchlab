export type NavigationItem = {
  path: string;
  label: string;
  end?: boolean;
};

export const views: NavigationItem[] = [
  { path: "/", label: "Overview", end: true },
  { path: "/players", label: "Players" },
  { path: "/teams", label: "Teams" },
  { path: "/maps", label: "Maps" },
  { path: "/compare", label: "Compare" },
  { path: "/team-compare", label: "Team Compare" },
  { path: "/roster-builder", label: "Roster Builder" },
  { path: "/saved-rosters", label: "Saved Rosters" },
  { path: "/roles", label: "Roles" },
  { path: "/traits", label: "Traits" },
];
