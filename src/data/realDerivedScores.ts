import type {
  MapFitScore,
  PlayerDerivedScore,
  RosterValueScore,
  TeamDerivedScore,
} from "./derivedScores";

export type RealDerivedScoreSource = "real-derived";

export type RealDerivedScoreDatasetStatus = "planned" | "active" | "disabled";

export type RealDerivedScoresMeta = {
  version: string;
  status: RealDerivedScoreDatasetStatus;
  source: RealDerivedScoreSource;
  description: string;
  generatedAt?: string;
  periodStart?: string;
  periodEnd?: string;
  formulaVersion: string;
  coverage: {
    players: number;
    teams: number;
    mapFitScores: number;
    rosterValueScores: number;
  };
  migrationGate: {
    readyForPublicUi: boolean;
    reasons: readonly string[];
  };
  warnings: readonly string[];
};

export const realPlayerDerivedScores: PlayerDerivedScore[] = [];

export const realTeamDerivedScores: TeamDerivedScore[] = [];

export const realMapFitScores: MapFitScore[] = [];

export const realRosterValueScores: RosterValueScore[] = [];

export const realDerivedScoresSummary = {
  playerScores: realPlayerDerivedScores.length,
  teamScores: realTeamDerivedScores.length,
  mapFitScores: realMapFitScores.length,
  rosterValueScores: realRosterValueScores.length,
  status: "planned",
  source: "real-derived",
} as const;

export const realDerivedScoresMeta: RealDerivedScoresMeta = {
  version: "0.1.0",
  status: "planned",
  source: "real-derived",
  description:
    "Planned production derived score layer. This scaffold intentionally contains no fake real-derived rows.",
  formulaVersion: "planned",
  coverage: {
    players: realPlayerDerivedScores.length,
    teams: realTeamDerivedScores.length,
    mapFitScores: realMapFitScores.length,
    rosterValueScores: realRosterValueScores.length,
  },
  migrationGate: {
    readyForPublicUi: false,
    reasons: [
      "No validated real-derived score rows exist yet.",
      "No real-derived score validation script exists yet.",
      "Score adapters do not prefer real-derived rows yet.",
      "Public UI routes must keep demo/manual scoring until coverage gates pass.",
    ],
  },
  warnings: [
    "This is a scaffold for future real-derived scores only.",
    "Do not add fake real-derived rows.",
    "Do not wire this file directly into public UI pages.",
    "Future UI usage must go through score adapters.",
  ],
} as const;
