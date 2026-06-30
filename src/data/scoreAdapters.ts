import type {
  MapFitScore,
  PlayerDerivedScore,
  RosterValueScore,
  ScoreConfidence,
  TeamDerivedScore,
} from "./derivedScores";
import {
  realMapFitScores,
  realPlayerDerivedScores,
  realRosterValueScores,
  realTeamDerivedScores,
} from "./realDerivedScores";
import {
  sampleMapFitScores,
  samplePlayerDerivedScores,
  sampleRosterValueScores,
  sampleTeamDerivedScores,
} from "./sampleDerivedScores";

export type ScoreAdapterSource = "demo-manual" | "sample-derived" | "real-derived";

export type ScoreAdapterStatus = "fallback" | "sample" | "active";

export type ScoreAdapterOptions = {
  allowSample?: boolean;
  preferReal?: boolean;
};

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

export const defaultScoreAdapterOptions: Required<ScoreAdapterOptions> = {
  allowSample: false,
  preferReal: true,
};

export const scoreAdapterLayerMeta = {
  version: "0.2.0",
  status: "sample-only",
  description:
    "Read-only lookup helpers for sample derived scores plus generic adapters prepared for future real-derived scores. This layer does not change public UI scoring.",
  publicUiBehavior:
    "Current player, team, map and roster pages should keep their demo/manual scoring until real derived data coverage is ready.",
  genericDefaults: defaultScoreAdapterOptions,
  priority: ["real-derived", "sample-derived", "demo-manual"] as const,
  warnings: [
    "Sample derived scores are not live official statistics.",
    "Do not use these helpers to rank public pages unless a validated real-derived coverage gate has passed.",
    "Keep demo/manual fallbacks until real derived score coverage is complete.",
  ],
} as const;

export function resolveScoreAdapterOptions(
  options: ScoreAdapterOptions = {},
): Required<ScoreAdapterOptions> {
  return {
    allowSample: options.allowSample ?? defaultScoreAdapterOptions.allowSample,
    preferReal: options.preferReal ?? defaultScoreAdapterOptions.preferReal,
  };
}

export function getPlayerDerivedScore(
  playerId: string,
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<PlayerDerivedScore> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRow = realPlayerDerivedScores.find((score) => score.playerId === playerId);

    if (realRow) {
      return createRealResult(realRow);
    }
  }

  if (resolved.allowSample) {
    const sampleRow = samplePlayerDerivedScores.find(
      (score) => score.playerId === playerId,
    );

    if (sampleRow) {
      return createSampleResult(
        sampleRow,
        `No sample player derived score for ${playerId}.`,
      );
    }
  }

  return createFallbackResult(`No real-derived score for player ${playerId}.`);
}

export function getTeamDerivedScore(
  teamId: string,
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<TeamDerivedScore> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRow = realTeamDerivedScores.find((score) => score.teamId === teamId);

    if (realRow) {
      return createRealResult(realRow);
    }
  }

  if (resolved.allowSample) {
    const sampleRow = sampleTeamDerivedScores.find((score) => score.teamId === teamId);

    if (sampleRow) {
      return createSampleResult(sampleRow, `No sample team derived score for ${teamId}.`);
    }
  }

  return createFallbackResult(`No real-derived score for team ${teamId}.`);
}

export function getMapFitScoresForEntity(
  entityId: string,
  entityType: MapFitScore["entityType"],
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<MapFitScore[]> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRows = realMapFitScores.filter(
      (score) => score.entityId === entityId && score.entityType === entityType,
    );

    if (realRows.length > 0) {
      return createRealArrayResult(realRows);
    }
  }

  if (resolved.allowSample) {
    const sampleRows = sampleMapFitScores.filter(
      (score) => score.entityId === entityId && score.entityType === entityType,
    );

    if (sampleRows.length > 0) {
      return createSampleArrayResult(
        sampleRows,
        `No sample map fit scores for ${entityType} ${entityId}.`,
      );
    }
  }

  return createFallbackResult(
    `No real-derived map fit scores for ${entityType} ${entityId}.`,
  );
}

export function getMapFitScore(
  {
    mapId,
    entityId,
    entityType,
  }: {
    mapId: string;
    entityId: string;
    entityType: MapFitScore["entityType"];
  },
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<MapFitScore> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRow = realMapFitScores.find(
      (score) =>
        score.mapId === mapId &&
        score.entityId === entityId &&
        score.entityType === entityType,
    );

    if (realRow) {
      return createRealResult(realRow);
    }
  }

  if (resolved.allowSample) {
    const sampleRow = sampleMapFitScores.find(
      (score) =>
        score.mapId === mapId &&
        score.entityId === entityId &&
        score.entityType === entityType,
    );

    if (sampleRow) {
      return createSampleResult(
        sampleRow,
        `No sample map fit score for ${entityType} ${entityId} on ${mapId}.`,
      );
    }
  }

  return createFallbackResult(
    `No real-derived map fit score for ${entityType} ${entityId} on ${mapId}.`,
  );
}

export function getRosterValueScore(
  rosterId: string,
  options?: ScoreAdapterOptions,
): ScoreAdapterResult<RosterValueScore> {
  const resolved = resolveScoreAdapterOptions(options);

  if (resolved.preferReal) {
    const realRow = realRosterValueScores.find((score) => score.rosterId === rosterId);

    if (realRow) {
      return createRealResult(realRow);
    }
  }

  if (resolved.allowSample) {
    const sampleRow = sampleRosterValueScores.find(
      (score) => score.rosterId === rosterId,
    );

    if (sampleRow) {
      return createSampleResult(
        sampleRow,
        `No sample roster value score for ${rosterId}.`,
      );
    }
  }

  return createFallbackResult(`No real-derived roster value score for ${rosterId}.`);
}

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

export function hasScoreAdapterValue<T>(
  result: ScoreAdapterResult<T>,
): result is ScoreAdapterResult<T> & { value: T } {
  return result.value !== undefined;
}

export function getScoreAdapterCoverageSummary() {
  return {
    status: scoreAdapterLayerMeta.status,
    playerScores: samplePlayerDerivedScores.length,
    teamScores: sampleTeamDerivedScores.length,
    mapFitScores: sampleMapFitScores.length,
    rosterValueScores: sampleRosterValueScores.length,
    realPlayerScores: realPlayerDerivedScores.length,
    realTeamScores: realTeamDerivedScores.length,
    realMapFitScores: realMapFitScores.length,
    realRosterValueScores: realRosterValueScores.length,
  } as const;
}

function createFallbackResult<T>(reason: string): ScoreAdapterResult<T> {
  return {
    value: undefined,
    source: "demo-manual",
    status: "fallback",
    reason,
  };
}

function createRealResult<T extends ScoreRowMetadata>(row: T): ScoreAdapterResult<T> {
  return {
    value: row,
    source: "real-derived",
    status: "active",
    confidence: row.confidence,
    formulaId: row.formulaId,
    sourceIds: row.sourceIds ? [...row.sourceIds] : undefined,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
  };
}

function createSampleResult<T extends ScoreRowMetadata>(
  row: T | undefined,
  fallbackReason: string,
): ScoreAdapterResult<T> {
  if (!row) {
    return createFallbackResult<T>(fallbackReason);
  }

  return {
    value: row,
    source: "sample-derived",
    status: "sample",
    confidence: row.confidence,
    formulaId: row.formulaId,
    sourceIds: row.sourceIds ? [...row.sourceIds] : undefined,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
  };
}

function createRealArrayResult<T extends ScoreRowMetadata>(
  rows: T[],
): ScoreAdapterResult<T[]> {
  return {
    value: rows,
    source: "real-derived",
    status: "active",
    confidence: getLowestConfidence(rows),
    formulaId: getFormulaIdSummary(rows),
    sourceIds: getSourceIdSummary(rows),
    periodStart: getFirstValue(rows, "periodStart"),
    periodEnd: getFirstValue(rows, "periodEnd"),
  };
}

function createSampleArrayResult<T extends ScoreRowMetadata>(
  rows: T[],
  fallbackReason: string,
): ScoreAdapterResult<T[]> {
  if (rows.length === 0) {
    return createFallbackResult<T[]>(fallbackReason);
  }

  return {
    value: rows,
    source: "sample-derived",
    status: "sample",
    confidence: getLowestConfidence(rows),
    formulaId: getFormulaIdSummary(rows),
    sourceIds: getSourceIdSummary(rows),
    periodStart: getFirstValue(rows, "periodStart"),
    periodEnd: getFirstValue(rows, "periodEnd"),
  };
}

function getFormulaIdSummary<T extends ScoreRowMetadata>(rows: T[]) {
  return uniqueStrings(rows.map((row) => row.formulaId)).join(", ");
}

function getSourceIdSummary<T extends ScoreRowMetadata>(rows: T[]) {
  const sourceIds = uniqueStrings(rows.flatMap((row) => row.sourceIds ?? []));

  return sourceIds.length > 0 ? sourceIds : undefined;
}

function getFirstValue<T extends ScoreRowMetadata>(
  rows: T[],
  key: "periodStart" | "periodEnd",
) {
  return rows.find((row) => row[key] !== undefined)?.[key];
}

function getLowestConfidence<T extends ScoreRowMetadata>(
  rows: T[],
): ScoreConfidence | undefined {
  const confidences = rows
    .map((row) => row.confidence)
    .filter((confidence): confidence is ScoreConfidence => Boolean(confidence));

  if (confidences.length === 0) {
    return undefined;
  }

  const confidenceRank: Record<ScoreConfidence, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  return confidences.reduce((lowest, current) =>
    confidenceRank[current] < confidenceRank[lowest] ? current : lowest,
  );
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}
