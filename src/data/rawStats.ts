export type StatWindow = {
  sourceId: string;
  periodStart: string;
  periodEnd: string;
  retrievedAt?: string;
  eventScope: string;
  matchFormatScope?: string;
  sampleSize?: SampleSizeRules;
};

export type SampleSizeRules = {
  minimumMaps?: number;
  minimumRounds?: number;
  minimumMatches?: number;
  minimumTeams?: number;
  note?: string;
};

export type PlayerRawStats = {
  playerId: string;
  window: StatWindow;
  mapsPlayed: number;
  roundsPlayed: number;
  rating?: number;
  adr?: number;
  kd?: number;
  kast?: number;
  openingAttempts?: number;
  openingSuccess?: number;
  openingDuelWinRate?: number;
  clutchAttempts?: number;
  clutchWins?: number;
  clutchWinRate?: number;
  awpKills?: number;
  rifleKills?: number;
  headshotRate?: number;
  firstKills?: number;
  firstDeaths?: number;
};

export type TeamRawStats = {
  teamId: string;
  window: StatWindow;
  mapsPlayed: number;
  roundsPlayed: number;
  winRate?: number;
  roundWinRate?: number;
  tRoundWinRate?: number;
  ctRoundWinRate?: number;
  pistolRoundWinRate?: number;
  conversionRate?: number;
  retakeWinRate?: number;
  clutchWinRate?: number;
  openingDuelWinRate?: number;
};

export type MapRawStats = {
  mapId: string;
  window: StatWindow;
  mapsPlayed: number;
  roundsPlayed: number;
  tRoundWinRate?: number;
  ctRoundWinRate?: number;
  pistolRoundWinRate?: number;
  openingDuelImpact?: number;
  awpImpact?: number;
  anchorPressure?: number;
  retakeFrequency?: number;
};

export type RoleRawStats = {
  roleId: string;
  window: StatWindow;
  playerCount?: number;
  mapsPlayed?: number;
  roundsPlayed?: number;
  averageRating?: number;
  averageAdr?: number;
  averageKast?: number;
  averageOpeningAttempts?: number;
  averageClutchAttempts?: number;
};

export type RawStatDatasetStatus = "planned-schema" | "manual-sample" | "active";

export type RawStatDatasetMeta = {
  version: string;
  status: RawStatDatasetStatus;
  description: string;
  intendedUse: string[];
  nonGoals: string[];
};

export const rawStatDatasetMeta: RawStatDatasetMeta = {
  version: "0.1.0",
  status: "planned-schema",
  description:
    "Type-level scaffold for future raw CS2 performance statistics. No real-stat rows are connected yet.",
  intendedUse: [
    "separate raw performance values from derived ClutchLab scores",
    "require source windows for future real-stat rows",
    "prepare validation for sample sizes, periods and source ids",
  ],
  nonGoals: [
    "live statistics",
    "official rankings",
    "betting or prediction data",
    "automatic scraping",
  ],
};

export const rawStatFieldGroups = {
  player: [
    "rating",
    "adr",
    "kd",
    "kast",
    "openingAttempts",
    "openingSuccess",
    "clutchAttempts",
    "clutchWins",
    "awpKills",
    "rifleKills",
  ],
  team: [
    "winRate",
    "roundWinRate",
    "tRoundWinRate",
    "ctRoundWinRate",
    "pistolRoundWinRate",
    "conversionRate",
    "retakeWinRate",
    "clutchWinRate",
  ],
  map: [
    "tRoundWinRate",
    "ctRoundWinRate",
    "pistolRoundWinRate",
    "openingDuelImpact",
    "awpImpact",
    "anchorPressure",
    "retakeFrequency",
  ],
  role: [
    "averageRating",
    "averageAdr",
    "averageKast",
    "averageOpeningAttempts",
    "averageClutchAttempts",
  ],
} as const;
