import type {
  MapFitScore,
  PlayerDerivedScore,
  RosterValueScore,
  TeamDerivedScore,
} from "./derivedScores";

export type SampleDerivedScoresMeta = {
  version: string;
  status: "manual-sample";
  description: string;
  formulaIds: string[];
  sourceNotes: string[];
  nonGoals: string[];
};

export const sampleDerivedScoresMeta: SampleDerivedScoresMeta = {
  version: "0.1.0",
  status: "manual-sample",
  description:
    "Small manually entered derived-score sample used to test the future ClutchLab scoring shape. It is not connected to the public UI scoring yet.",
  formulaIds: ["player-impact-v1", "team-score-v1", "map-fit-v1", "roster-value-v1"],
  sourceNotes: [
    "Rows use formula scaffolds from src/data/derivedScores.ts.",
    "Rows reference future real-stat source placeholders from src/data/sources.ts.",
    "Values are example/sample rows for model integration and validation planning.",
    "This file must not be presented as live, official or complete esports statistics.",
  ],
  nonGoals: [
    "replace current demo/manual UI scores",
    "provide live player rankings",
    "provide official tournament statistics",
    "power betting or prediction features",
  ],
};

export const samplePlayerDerivedScores: PlayerDerivedScore[] = [
  {
    playerId: "zywoo",
    formulaId: "player-impact-v1",
    sourceIds: ["future-real-player-stats"],
    periodStart: "2026-01-01",
    periodEnd: "2026-06-28",
    impact: 94,
    clutch: 92,
    opening: 88,
    awp: 96,
    rifle: 86,
    consistency: 93,
    value: 91,
    components: [
      {
        id: "rating",
        label: "Rating baseline",
        value: 95,
        weight: 0.3,
        description: "Sample component based on future raw rating input.",
      },
      {
        id: "clutch",
        label: "Clutch pressure",
        value: 92,
        weight: 0.2,
        description: "Sample component based on future clutch input.",
      },
      {
        id: "role-fit",
        label: "Role fit",
        value: 91,
        weight: 0.2,
        description: "Sample component for AWP identity and team fit.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample derived score. Not connected to current UI scoring."],
  },
  {
    playerId: "donk",
    formulaId: "player-impact-v1",
    sourceIds: ["future-real-player-stats"],
    periodStart: "2026-01-01",
    periodEnd: "2026-06-28",
    impact: 95,
    clutch: 84,
    opening: 94,
    awp: 24,
    rifle: 98,
    consistency: 89,
    value: 93,
    components: [
      {
        id: "entry-pressure",
        label: "Entry pressure",
        value: 96,
        weight: 0.35,
        description: "Sample component for opening pressure and rifle impact.",
      },
      {
        id: "rifle-output",
        label: "Rifle output",
        value: 98,
        weight: 0.3,
        description: "Sample component based on future rifle output input.",
      },
      {
        id: "consistency",
        label: "Consistency",
        value: 89,
        weight: 0.2,
        description: "Sample component for stable round-to-round output.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample derived score. Not connected to current UI scoring."],
  },
  {
    playerId: "monesy",
    formulaId: "player-impact-v1",
    sourceIds: ["future-real-player-stats"],
    periodStart: "2026-01-01",
    periodEnd: "2026-06-28",
    impact: 91,
    clutch: 90,
    opening: 87,
    awp: 95,
    rifle: 78,
    consistency: 88,
    value: 89,
    components: [
      {
        id: "awp-impact",
        label: "AWP impact",
        value: 95,
        weight: 0.35,
        description: "Sample component for future AWP impact calculation.",
      },
      {
        id: "opening",
        label: "Opening contribution",
        value: 87,
        weight: 0.2,
        description: "Sample component for first-kill pressure.",
      },
      {
        id: "clutch",
        label: "Clutch conversion",
        value: 90,
        weight: 0.2,
        description: "Sample component for late-round conversion.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample derived score. Not connected to current UI scoring."],
  },
];

export const sampleTeamDerivedScores: TeamDerivedScore[] = [
  {
    teamId: "vitality",
    formulaId: "team-score-v1",
    sourceIds: ["future-real-team-stats"],
    periodStart: "2026-01-01",
    periodEnd: "2026-06-28",
    overall: 91,
    firepower: 92,
    structure: 88,
    mapPool: 89,
    clutch: 90,
    form: 91,
    components: [
      {
        id: "firepower",
        label: "Firepower",
        value: 92,
        weight: 0.3,
        description: "Sample component for team damage and conversion profile.",
      },
      {
        id: "structure",
        label: "Structure",
        value: 88,
        weight: 0.25,
        description: "Sample component for team spacing and round stability.",
      },
      {
        id: "map-pool",
        label: "Map pool",
        value: 89,
        weight: 0.2,
        description: "Sample component for map coverage.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample team score. Not connected to current UI scoring."],
  },
  {
    teamId: "spirit",
    formulaId: "team-score-v1",
    sourceIds: ["future-real-team-stats"],
    periodStart: "2026-01-01",
    periodEnd: "2026-06-28",
    overall: 90,
    firepower: 94,
    structure: 85,
    mapPool: 87,
    clutch: 86,
    form: 92,
    components: [
      {
        id: "firepower",
        label: "Firepower",
        value: 94,
        weight: 0.35,
        description: "Sample component for elite rifle pressure.",
      },
      {
        id: "form",
        label: "Form",
        value: 92,
        weight: 0.25,
        description: "Sample component for recent sample-window form.",
      },
      {
        id: "structure",
        label: "Structure",
        value: 85,
        weight: 0.2,
        description: "Sample component for round stability.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample team score. Not connected to current UI scoring."],
  },
];

export const sampleMapFitScores: MapFitScore[] = [
  {
    mapId: "mirage",
    entityId: "zywoo",
    entityType: "player",
    formulaId: "map-fit-v1",
    sourceIds: ["future-real-player-stats"],
    fit: 92,
    awpFit: 95,
    entryFit: 84,
    anchorFit: 78,
    lurkFit: 82,
    supportFit: 76,
    components: [
      {
        id: "awp-fit",
        label: "AWP fit",
        value: 95,
        weight: 0.4,
        description: "Sample component for AWP lane impact on Mirage.",
      },
      {
        id: "mid-round",
        label: "Mid-round value",
        value: 88,
        weight: 0.25,
        description: "Sample component for mid-round flexibility.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample map fit score. Not connected to current UI scoring."],
  },
  {
    mapId: "nuke",
    entityId: "spirit",
    entityType: "team",
    formulaId: "map-fit-v1",
    sourceIds: ["future-real-team-stats"],
    fit: 89,
    awpFit: 82,
    entryFit: 93,
    anchorFit: 87,
    lurkFit: 84,
    supportFit: 85,
    components: [
      {
        id: "entry-fit",
        label: "Entry fit",
        value: 93,
        weight: 0.3,
        description: "Sample component for opening pressure on Nuke.",
      },
      {
        id: "anchor-fit",
        label: "Anchor fit",
        value: 87,
        weight: 0.25,
        description: "Sample component for defensive hold quality.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample map fit score. Not connected to current UI scoring."],
  },
];

export const sampleRosterValueScores: RosterValueScore[] = [
  {
    rosterId: "sample-star-core-v1",
    formulaId: "roster-value-v1",
    sourceIds: ["future-real-player-stats", "future-real-team-stats"],
    playerIds: ["zywoo", "donk", "monesy"],
    totalCost: 43.5,
    budgetLimit: 50,
    value: 88,
    roleCoverage: 72,
    firepower: 98,
    clutch: 91,
    mapFit: 86,
    balance: 74,
    warnings: [
      "Sample roster is intentionally star-heavy.",
      "Role coverage is incomplete because this sample has only three players.",
    ],
    components: [
      {
        id: "firepower",
        label: "Firepower",
        value: 98,
        weight: 0.35,
        description: "Sample component for combined star output.",
      },
      {
        id: "budget",
        label: "Budget use",
        value: 81,
        weight: 0.2,
        description: "Sample component for cost efficiency.",
      },
      {
        id: "role-coverage",
        label: "Role coverage",
        value: 72,
        weight: 0.25,
        description: "Sample component for role completeness.",
      },
    ],
    confidence: "low",
    notes: ["Manual sample roster value score. Not connected to current roster builder."],
  },
];

export const sampleDerivedScoresSummary = {
  playerScores: samplePlayerDerivedScores.length,
  teamScores: sampleTeamDerivedScores.length,
  mapFitScores: sampleMapFitScores.length,
  rosterValueScores: sampleRosterValueScores.length,
  status: sampleDerivedScoresMeta.status,
} as const;
