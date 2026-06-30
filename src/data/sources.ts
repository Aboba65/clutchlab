export type SourceStatus = "demo" | "manual" | "planned-real" | "real";
export type SourceKind =
  "identity" | "raw-performance" | "derived-score" | "manual-adjustment" | "methodology";
export type SourceConfidence = "low" | "medium" | "high";

export type ClutchLabDataSource = {
  id: string;
  name: string;
  kind: SourceKind;
  status: SourceStatus;
  description: string;
  confidence: SourceConfidence;
  covers: string[];
  url?: string;
  note?: string;
  retrievedAt?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type ClutchLabSourceGroup = {
  id: string;
  name: string;
  description: string;
  sourceIds: string[];
};

export const dataSources: ClutchLabDataSource[] = [
  {
    id: "demo-player-ratings",
    name: "Demo player ratings",
    kind: "derived-score",
    status: "demo",
    description:
      "Manual MVP player ratings used to test player pages, comparison views, roster logic and filters.",
    confidence: "low",
    covers: ["players", "compare", "roster-builder", "saved-rosters"],
    note: "Not a live, official or current esports statistics source.",
  },
  {
    id: "demo-team-ratings",
    name: "Demo team ratings",
    kind: "derived-score",
    status: "demo",
    description:
      "Manual MVP team ratings used to test team pages, team comparison and map pool presentation.",
    confidence: "low",
    covers: ["teams", "team-compare"],
    note: "Not a live, official or current esports statistics source.",
  },
  {
    id: "demo-map-profiles",
    name: "Demo map profiles",
    kind: "methodology",
    status: "demo",
    description:
      "Manual MVP map profiles used to test map pages, map fit logic and roster-builder recommendations.",
    confidence: "low",
    covers: ["maps", "roster-builder"],
    note: "Map profiles are product-test values, not official map statistics.",
  },
  {
    id: "demo-role-profiles",
    name: "Demo role profiles",
    kind: "identity",
    status: "demo",
    description:
      "Manual role definitions used to test role pages, roster coverage checks and player categorization.",
    confidence: "medium",
    covers: ["roles", "players", "roster-builder"],
    note: "Role definitions are product methodology, not sourced live performance data.",
  },
  {
    id: "future-real-player-stats",
    name: "Future real player statistics",
    kind: "raw-performance",
    status: "planned-real",
    description:
      "Placeholder for future manually curated player statistics with source, time window and sample-size metadata.",
    confidence: "low",
    covers: ["players", "compare", "roster-builder"],
    note: "Planned source scaffold only. No real-stat rows are connected yet.",
  },
  {
    id: "future-real-team-stats",
    name: "Future real team statistics",
    kind: "raw-performance",
    status: "planned-real",
    description:
      "Placeholder for future manually curated team statistics with source, time window and sample-size metadata.",
    confidence: "low",
    covers: ["teams", "team-compare", "maps"],
    note: "Planned source scaffold only. No real-stat rows are connected yet.",
  },
];

export const sourceGroups: ClutchLabSourceGroup[] = [
  {
    id: "current-mvp-demo-layer",
    name: "Current MVP demo layer",
    description:
      "Sources that explain the current demo/manual values used by the public MVP.",
    sourceIds: [
      "demo-player-ratings",
      "demo-team-ratings",
      "demo-map-profiles",
      "demo-role-profiles",
    ],
  },
  {
    id: "future-real-stat-layer",
    name: "Future real-stat layer",
    description:
      "Planned source placeholders for future real statistics and source-aware derived scoring.",
    sourceIds: ["future-real-player-stats", "future-real-team-stats"],
  },
];
