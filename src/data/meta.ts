export const dataMeta = {
  version: "0.1.0",
  lastUpdated: "2026-06-28",
  status: "demo-manual",
  coverage: {
    players: 40,
    teams: 8,
    maps: 7,
    roles: 8,
  },
  notes: [
    "Players and teams use recognizable CS2 names for MVP navigation and product testing.",
    "Ratings, prices, scores, map fits, and custom indexes are manual demo values.",
    "Do not present the current dataset as live esports data.",
    "Before adding real stats, keep source notes and update dates close to the dataset.",
  ],
  plannedSources: [
    "manual scouting notes",
    "official match pages",
    "public match statistics",
    "team roster announcements",
    "map-specific performance tables",
  ],
} as const;

export type DataMeta = typeof dataMeta;
