type NavigationItem = {
  path: string;
  label: string;
  end?: boolean;
};

export const views: NavigationItem[] = [
  {
    path: "/",
    label: "Home",
    end: true,
  },
  {
    path: "/players",
    label: "Players",
  },
  {
    path: "/teams",
    label: "Teams",
  },
  {
    path: "/maps",
    label: "Maps",
  },
  {
    path: "/roles",
    label: "Roles",
  },
  {
    path: "/compare",
    label: "Compare",
  },
  {
    path: "/team-compare",
    label: "Team Compare",
  },
  {
    path: "/roster-builder",
    label: "Roster Builder",
  },
  {
    path: "/saved-rosters",
    label: "Saved Rosters",
  },
  {
    path: "/sample-data",
    label: "Sample Data",
  },
  {
    path: "/traits",
    label: "Traits",
  },
  {
    path: "/about",
    label: "About",
  },
];
