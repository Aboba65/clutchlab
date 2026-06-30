import type {
  MapFitScore,
  PlayerDerivedScore,
  RosterValueScore,
  ScoreConfidence,
  TeamDerivedScore,
} from "./derivedScores";
import {
  sampleMapFitScores,
  samplePlayerDerivedScores,
  sampleRosterValueScores,
  sampleTeamDerivedScores,
} from "./sampleDerivedScores";

export type ScoreAdapterSource = "demo-manual" | "sample-derived" | "real-derived";

export type ScoreAdapterStatus = "fallback" | "sample" | "active";

export type ScoreAdapterResult<T> = {
  value: T | undefined;
  source: ScoreAdapterSource;
  status: ScoreAdapterStatus;
  confidence?: ScoreConfidence;
  formulaId?: string;
  sourceIds?: string[];
  periodStart?: string;
  periodEnd?: string;
  reason?: string;
};

type ScoreRowMetadata = {
  formulaId: string;
  confidence?: ScoreConfidence;
  sourceIds?: string[];
  periodStart?: string;
  periodEnd?: string;
};

export const scoreAdapterLayerMeta = {
  version: "0.1.0",
  status: "sample-only",
  description:
    "Read-only lookup helpers for sample derived scores. This layer does not change public UI scoring yet.",
  publicUiBehavior:
    "Current player, team, map and roster pages should keep their demo/manual scoring until real derived data coverage is ready.",
  warnings: [
    "Sample derived scores are not live official statistics.",
    "Do not use these helpers to rank public pages without explicit sample/preview labeling.",
    "Keep demo/manual fallbacks until real derived score coverage is complete.",
  ],
} as const;

export function getSamplePlayerDerivedScore(
  playerId: string,
): ScoreAdapterResult<PlayerDerivedScore> {
  const row = samplePlayerDerivedScores.find((score) => score.playerId === playerId);

  return createSampleResult(row, `No sample player derived score for ${playerId}.`);
}

export function getSampleTeamDerivedScore(
  teamId: string,
): ScoreAdapterResult<TeamDerivedScore> {
  const row = sampleTeamDerivedScores.find((score) => score.teamId === teamId);

  return createSampleResult(row, `No sample team derived score for ${teamId}.`);
}

export function getSampleMapFitScoresForEntity(
  entityId: string,
  entityType: MapFitScore["entityType"],
): ScoreAdapterResult<MapFitScore[]> {
  const rows = sampleMapFitScores.filter(
    (score) => score.entityId === entityId && score.entityType === entityType,
  );

  return createSampleArrayResult(
    rows,
    `No sample map fit scores for ${entityType} ${entityId}.`,
  );
}

export function getSampleMapFitScore({
  mapId,
  entityId,
  entityType,
}: {
  mapId: string;
  entityId: string;
  entityType: MapFitScore["entityType"];
}): ScoreAdapterResult<MapFitScore> {
  const row = sampleMapFitScores.find(
    (score) =>
      score.mapId === mapId &&
      score.entityId === entityId &&
      score.entityType === entityType,
  );

  return createSampleResult(
    row,
    `No sample map fit score for ${entityType} ${entityId} on ${mapId}.`,
  );
}

export function getSampleRosterValueScore(
  rosterId: string,
): ScoreAdapterResult<RosterValueScore> {
  const row = sampleRosterValueScores.find((score) => score.rosterId === rosterId);

  return createSampleResult(row, `No sample roster value score for ${rosterId}.`);
}

export function hasSamplePlayerDerivedScore(playerId: string) {
  return getSamplePlayerDerivedScore(playerId).value !== undefined;
}

export function hasSampleTeamDerivedScore(teamId: string) {
  return getSampleTeamDerivedScore(teamId).value !== undefined;
}

export function hasSampleRosterValueScore(rosterId: string) {
  return getSampleRosterValueScore(rosterId).value !== undefined;
}

export function getScoreAdapterCoverageSummary() {
  return {
    status: scoreAdapterLayerMeta.status,
    playerScores: samplePlayerDerivedScores.length,
    teamScores: sampleTeamDerivedScores.length,
    mapFitScores: sampleMapFitScores.length,
    rosterValueScores: sampleRosterValueScores.length,
  } as const;
}

function createSampleResult<T extends ScoreRowMetadata>(
  row: T | undefined,
  fallbackReason: string,
): ScoreAdapterResult<T> {
  if (!row) {
    return {
      value: undefined,
      source: "demo-manual",
      status: "fallback",
      reason: fallbackReason,
    };
  }

  return {
    value: row,
    source: "sample-derived",
    status: "sample",
    confidence: row.confidence,
    formulaId: row.formulaId,
    sourceIds: row.sourceIds,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
  };
}

function createSampleArrayResult<T extends ScoreRowMetadata>(
  rows: T[],
  fallbackReason: string,
): ScoreAdapterResult<T[]> {
  if (rows.length === 0) {
    return {
      value: undefined,
      source: "demo-manual",
      status: "fallback",
      reason: fallbackReason,
    };
  }

  const firstRow = rows[0];

  return {
    value: rows,
    source: "sample-derived",
    status: "sample",
    confidence: firstRow.confidence,
    formulaId: firstRow.formulaId,
    sourceIds: [...new Set(rows.flatMap((row) => row.sourceIds ?? []))],
    periodStart: firstRow.periodStart,
    periodEnd: firstRow.periodEnd,
  };
}
