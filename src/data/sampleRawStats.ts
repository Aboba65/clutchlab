import type { PlayerRawStats, StatWindow, TeamRawStats } from "./rawStats";

export type SampleRawStatsMeta = {
  version: string;
  status: "manual-sample";
  description: string;
  sourceNotes: string[];
  nonGoals: string[];
};

export const sampleRawStatsMeta: SampleRawStatsMeta = {
  version: "0.1.0",
  status: "manual-sample",
  description:
    "Small manually entered raw-stat sample used to test the future real-stat data shape. It is not connected to the public UI scoring yet.",
  sourceNotes: [
    "Rows use the future real-stat source placeholders from src/data/sources.ts.",
    "Values are example/sample rows for model integration and validation planning.",
    "This file must not be presented as live, official or complete esports statistics.",
  ],
  nonGoals: [
    "replace current demo/manual UI data",
    "provide live player rankings",
    "provide official tournament statistics",
    "power betting or prediction features",
  ],
};

export const samplePlayerStatWindow: StatWindow = {
  sourceId: "future-real-player-stats",
  periodStart: "2026-01-01",
  periodEnd: "2026-06-28",
  retrievedAt: "2026-06-28",
  eventScope: "manual sample window for future real-stat schema testing",
  matchFormatScope: "professional CS2 maps, sample-only",
  sampleSize: {
    minimumMaps: 10,
    minimumRounds: 200,
    note: "Sample-size rule for schema testing only.",
  },
};

export const sampleTeamStatWindow: StatWindow = {
  sourceId: "future-real-team-stats",
  periodStart: "2026-01-01",
  periodEnd: "2026-06-28",
  retrievedAt: "2026-06-28",
  eventScope: "manual sample window for future real-stat schema testing",
  matchFormatScope: "professional CS2 maps, sample-only",
  sampleSize: {
    minimumMaps: 10,
    minimumRounds: 200,
    note: "Sample-size rule for schema testing only.",
  },
};

export const samplePlayerRawStats: PlayerRawStats[] = [
  {
    playerId: "zywoo",
    window: samplePlayerStatWindow,
    mapsPlayed: 24,
    roundsPlayed: 618,
    rating: 1.28,
    adr: 85.4,
    kd: 1.34,
    kast: 76.2,
    openingAttempts: 92,
    openingSuccess: 54,
    openingDuelWinRate: 58.7,
    clutchAttempts: 31,
    clutchWins: 15,
    clutchWinRate: 48.4,
    awpKills: 142,
    rifleKills: 221,
    headshotRate: 41.6,
    firstKills: 54,
    firstDeaths: 38,
  },
  {
    playerId: "donk",
    window: samplePlayerStatWindow,
    mapsPlayed: 22,
    roundsPlayed: 571,
    rating: 1.31,
    adr: 91.7,
    kd: 1.29,
    kast: 74.8,
    openingAttempts: 118,
    openingSuccess: 69,
    openingDuelWinRate: 58.5,
    clutchAttempts: 24,
    clutchWins: 10,
    clutchWinRate: 41.7,
    awpKills: 4,
    rifleKills: 286,
    headshotRate: 55.2,
    firstKills: 69,
    firstDeaths: 49,
  },
  {
    playerId: "monesy",
    window: samplePlayerStatWindow,
    mapsPlayed: 23,
    roundsPlayed: 596,
    rating: 1.24,
    adr: 78.9,
    kd: 1.27,
    kast: 75.1,
    openingAttempts: 101,
    openingSuccess: 59,
    openingDuelWinRate: 58.4,
    clutchAttempts: 29,
    clutchWins: 14,
    clutchWinRate: 48.3,
    awpKills: 167,
    rifleKills: 128,
    headshotRate: 38.9,
    firstKills: 59,
    firstDeaths: 42,
  },
];

export const sampleTeamRawStats: TeamRawStats[] = [
  {
    teamId: "vitality",
    window: sampleTeamStatWindow,
    mapsPlayed: 28,
    roundsPlayed: 721,
    winRate: 67.9,
    roundWinRate: 53.8,
    tRoundWinRate: 51.6,
    ctRoundWinRate: 56.2,
    pistolRoundWinRate: 57.1,
    conversionRate: 72.5,
    retakeWinRate: 35.8,
    clutchWinRate: 54.2,
    openingDuelWinRate: 52.9,
  },
  {
    teamId: "spirit",
    window: sampleTeamStatWindow,
    mapsPlayed: 26,
    roundsPlayed: 676,
    winRate: 65.4,
    roundWinRate: 53.1,
    tRoundWinRate: 52.4,
    ctRoundWinRate: 53.9,
    pistolRoundWinRate: 55.8,
    conversionRate: 70.4,
    retakeWinRate: 34.1,
    clutchWinRate: 51.7,
    openingDuelWinRate: 54.6,
  },
];

export const sampleRawStatsSummary = {
  players: samplePlayerRawStats.length,
  teams: sampleTeamRawStats.length,
  windows: 2,
  status: sampleRawStatsMeta.status,
} as const;
