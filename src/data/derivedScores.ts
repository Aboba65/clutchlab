export type ScoreScale = "0-100" | "0-1" | "rank" | "label";
export type ScoreConfidence = "low" | "medium" | "high";
export type ScoreDatasetStatus = "planned-schema" | "manual-sample" | "active";

export type ScoreFormulaMeta = {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceIds: string[];
  inputFields: string[];
  outputFields: string[];
  scale: ScoreScale;
  confidence: ScoreConfidence;
  notes?: string[];
};

export type ScoreComponent = {
  id: string;
  label: string;
  value: number;
  weight?: number;
  description?: string;
};

export type PlayerDerivedScore = {
  playerId: string;
  formulaId: string;
  sourceIds: string[];
  periodStart?: string;
  periodEnd?: string;
  impact: number;
  clutch: number;
  opening: number;
  awp: number;
  rifle: number;
  consistency: number;
  value?: number;
  components?: ScoreComponent[];
  confidence: ScoreConfidence;
  notes?: string[];
};

export type TeamDerivedScore = {
  teamId: string;
  formulaId: string;
  sourceIds: string[];
  periodStart?: string;
  periodEnd?: string;
  overall: number;
  firepower: number;
  structure: number;
  mapPool: number;
  clutch: number;
  form: number;
  components?: ScoreComponent[];
  confidence: ScoreConfidence;
  notes?: string[];
};

export type MapFitScore = {
  mapId: string;
  entityId: string;
  entityType: "player" | "team" | "roster";
  formulaId: string;
  sourceIds: string[];
  fit: number;
  awpFit?: number;
  entryFit?: number;
  anchorFit?: number;
  lurkFit?: number;
  supportFit?: number;
  components?: ScoreComponent[];
  confidence: ScoreConfidence;
  notes?: string[];
};

export type RosterValueScore = {
  rosterId: string;
  formulaId: string;
  sourceIds: string[];
  playerIds: string[];
  totalCost: number;
  budgetLimit: number;
  value: number;
  roleCoverage: number;
  firepower: number;
  clutch: number;
  mapFit: number;
  balance: number;
  warnings: string[];
  components?: ScoreComponent[];
  confidence: ScoreConfidence;
  notes?: string[];
};

export type DerivedScoreDatasetMeta = {
  version: string;
  status: ScoreDatasetStatus;
  description: string;
  intendedUse: string[];
  nonGoals: string[];
};

export const derivedScoreDatasetMeta: DerivedScoreDatasetMeta = {
  version: "0.1.0",
  status: "planned-schema",
  description:
    "Type-level scaffold for future ClutchLab derived scores. Current UI still uses MVP demo/manual scoring.",
  intendedUse: [
    "separate ClutchLab-calculated scores from raw performance statistics",
    "document formulas and source ids behind future scores",
    "prepare validation for score ranges, formula ids and source references",
  ],
  nonGoals: [
    "official esports rankings",
    "live prediction model",
    "betting advice",
    "automatic player valuation",
  ],
};

export const scoreFormulaScaffolds: ScoreFormulaMeta[] = [
  {
    id: "player-impact-v1",
    name: "Player Impact",
    version: "v1",
    description:
      "Future formula scaffold for combining raw player performance into a 0–100 impact score.",
    sourceIds: ["future-real-player-stats"],
    inputFields: ["rating", "adr", "kd", "kast", "opening", "clutch"],
    outputFields: ["impact", "clutch", "opening", "awp", "rifle", "consistency"],
    scale: "0-100",
    confidence: "low",
    notes: ["Formula scaffold only. Not connected to real-stat rows yet."],
  },
  {
    id: "team-score-v1",
    name: "Team Score",
    version: "v1",
    description:
      "Future formula scaffold for combining raw team performance into a 0–100 team profile.",
    sourceIds: ["future-real-team-stats"],
    inputFields: ["winRate", "roundWinRate", "mapPool", "form"],
    outputFields: ["overall", "firepower", "structure", "mapPool", "clutch", "form"],
    scale: "0-100",
    confidence: "low",
    notes: ["Formula scaffold only. Not connected to real-stat rows yet."],
  },
  {
    id: "map-fit-v1",
    name: "Map Fit",
    version: "v1",
    description:
      "Future formula scaffold for player, team and roster map fit calculations.",
    sourceIds: ["future-real-player-stats", "future-real-team-stats"],
    inputFields: ["mapId", "role", "awpImpact", "openingDuelImpact", "anchorPressure"],
    outputFields: ["fit", "awpFit", "entryFit", "anchorFit", "lurkFit", "supportFit"],
    scale: "0-100",
    confidence: "low",
    notes: ["Formula scaffold only. Not connected to real-stat rows yet."],
  },
  {
    id: "roster-value-v1",
    name: "Roster Value",
    version: "v1",
    description:
      "Future formula scaffold for budget-aware roster scoring and role coverage.",
    sourceIds: ["future-real-player-stats", "future-real-team-stats"],
    inputFields: ["playerIds", "totalCost", "roleCoverage", "mapFit", "firepower"],
    outputFields: ["value", "roleCoverage", "firepower", "clutch", "mapFit", "balance"],
    scale: "0-100",
    confidence: "low",
    notes: ["Formula scaffold only. Current roster builder still uses MVP logic."],
  },
];

export const derivedScoreFieldGroups = {
  player: ["impact", "clutch", "opening", "awp", "rifle", "consistency", "value"],
  team: ["overall", "firepower", "structure", "mapPool", "clutch", "form"],
  mapFit: ["fit", "awpFit", "entryFit", "anchorFit", "lurkFit", "supportFit"],
  roster: ["value", "roleCoverage", "firepower", "clutch", "mapFit", "balance"],
} as const;
