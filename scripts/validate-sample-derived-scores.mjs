import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  players: resolve(rootDir, "src", "data", "players.ts"),
  teams: resolve(rootDir, "src", "data", "teams.ts"),
  maps: resolve(rootDir, "src", "config", "maps.ts"),
  sources: resolve(rootDir, "src", "data", "sources.ts"),
  derivedScores: resolve(rootDir, "src", "data", "derivedScores.ts"),
  sampleDerivedScores: resolve(rootDir, "src", "data", "sampleDerivedScores.ts"),
};

const sourceText = {
  players: readFileSync(files.players, "utf8"),
  teams: readFileSync(files.teams, "utf8"),
  maps: readFileSync(files.maps, "utf8"),
  sources: readFileSync(files.sources, "utf8"),
  derivedScores: readFileSync(files.derivedScores, "utf8"),
  sampleDerivedScores: readFileSync(files.sampleDerivedScores, "utf8"),
};

const allowedConfidence = new Set(["low", "medium", "high"]);
const allowedEntityTypes = new Set(["player", "team", "roster"]);

const scoreFieldsByArray = {
  samplePlayerDerivedScores: [
    "impact",
    "clutch",
    "opening",
    "awp",
    "rifle",
    "consistency",
    "value",
  ],
  sampleTeamDerivedScores: [
    "overall",
    "firepower",
    "structure",
    "mapPool",
    "clutch",
    "form",
  ],
  sampleMapFitScores: ["fit", "awpFit", "entryFit", "anchorFit", "lurkFit", "supportFit"],
  sampleRosterValueScores: [
    "value",
    "roleCoverage",
    "firepower",
    "clutch",
    "mapFit",
    "balance",
  ],
};

const expectedFormulaByArray = {
  samplePlayerDerivedScores: "player-impact-v1",
  sampleTeamDerivedScores: "team-score-v1",
  sampleMapFitScores: "map-fit-v1",
  sampleRosterValueScores: "roster-value-v1",
};

function findMatching(text, startIndex, open = "[", close = "]") {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === open) {
      depth += 1;
    }

    if (char === close) {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function extractExportedValue(text, name, open, close) {
  const marker = `export const ${name}`;
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Missing export: ${name}`);
  }

  const equalsIndex = text.indexOf("=", markerIndex);
  const startIndex = text.indexOf(open, equalsIndex);
  const endIndex = findMatching(text, startIndex, open, close);

  if (equalsIndex === -1 || startIndex === -1 || endIndex === -1) {
    throw new Error(`Could not parse exported value: ${name}`);
  }

  return text.slice(startIndex, endIndex + 1);
}

function extractObjects(arraySource) {
  const objects = [];

  for (let index = 0; index < arraySource.length; index += 1) {
    if (arraySource[index] !== "{") {
      continue;
    }

    const end = findMatching(arraySource, index, "{", "}");

    if (end === -1) {
      throw new Error("Could not parse object in source array");
    }

    objects.push(arraySource.slice(index, end + 1));
    index = end;
  }

  return objects;
}

function getIds(text) {
  return new Set(
    [...text.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((match) => match[1]),
  );
}

function getFormulaIds(text) {
  const formulaSource = extractExportedValue(text, "scoreFormulaScaffolds", "[", "]");
  return new Set(
    extractObjects(formulaSource)
      .map((objectSource) => getStringField(objectSource, "id"))
      .filter(Boolean),
  );
}

function getStringField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*["']([^"']+)["']`);
  return objectSource.match(regex)?.[1];
}

function getNumberField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*(-?\\d+(?:\\.\\d+)?)`);
  const value = objectSource.match(regex)?.[1];

  return value === undefined ? undefined : Number(value);
}

function getStringArrayField(objectSource, field) {
  const marker = `${field}:`;
  const markerIndex = objectSource.indexOf(marker);

  if (markerIndex === -1) {
    return [];
  }

  const startIndex = objectSource.indexOf("[", markerIndex);
  const endIndex = findMatching(objectSource, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const arraySource = objectSource.slice(startIndex, endIndex + 1);
  return [...arraySource.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

function isValidDate(value) {
  if (value === undefined) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function ensureScoreRange({ rowLabel, row, fields, errors }) {
  for (const field of fields) {
    const value = getNumberField(row, field);

    if (value === undefined) {
      continue;
    }

    if (value < 0 || value > 100) {
      errors.push(`${rowLabel} ${field} must be between 0 and 100`);
    }
  }
}

function validateCommonScoreRow({
  row,
  rowLabel,
  formulaIds,
  sourceIds,
  expectedFormulaId,
  errors,
}) {
  const formulaId = getStringField(row, "formulaId");
  const rowSourceIds = getStringArrayField(row, "sourceIds");
  const confidence = getStringField(row, "confidence");
  const notes = getStringArrayField(row, "notes");
  const periodStart = getStringField(row, "periodStart");
  const periodEnd = getStringField(row, "periodEnd");

  if (!formulaId) {
    errors.push(`${rowLabel} is missing formulaId`);
  } else {
    if (!formulaIds.has(formulaId)) {
      errors.push(`${rowLabel} references missing formulaId: ${formulaId}`);
    }

    if (formulaId !== expectedFormulaId) {
      errors.push(
        `${rowLabel} expected formulaId ${expectedFormulaId}; found ${formulaId}`,
      );
    }
  }

  if (rowSourceIds.length === 0) {
    errors.push(`${rowLabel} must declare sourceIds`);
  }

  for (const sourceId of rowSourceIds) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`${rowLabel} references missing sourceId: ${sourceId}`);
    }
  }

  if (!allowedConfidence.has(confidence)) {
    errors.push(`${rowLabel} has invalid confidence: ${confidence ?? "(missing)"}`);
  }

  if (confidence === "low" && notes.length === 0) {
    errors.push(`${rowLabel} has low confidence and should include notes`);
  }

  if (!isValidDate(periodStart)) {
    errors.push(`${rowLabel} has invalid periodStart: ${periodStart}`);
  }

  if (!isValidDate(periodEnd)) {
    errors.push(`${rowLabel} has invalid periodEnd: ${periodEnd}`);
  }

  if (isValidDate(periodStart) && isValidDate(periodEnd) && periodStart && periodEnd) {
    const startDate = new Date(`${periodStart}T00:00:00.000Z`);
    const endDate = new Date(`${periodEnd}T00:00:00.000Z`);

    if (startDate > endDate) {
      errors.push(`${rowLabel} periodStart must be before or equal to periodEnd`);
    }
  }
}

function validatePlayerScores({ rows, playerIds, formulaIds, sourceIds, errors }) {
  for (const [index, row] of rows.entries()) {
    const rowLabel = `samplePlayerDerivedScores[${index}]`;
    const playerId = getStringField(row, "playerId");

    if (!playerId) {
      errors.push(`${rowLabel} is missing playerId`);
    } else if (!playerIds.has(playerId)) {
      errors.push(`${rowLabel} references missing playerId: ${playerId}`);
    }

    validateCommonScoreRow({
      row,
      rowLabel,
      formulaIds,
      sourceIds,
      expectedFormulaId: expectedFormulaByArray.samplePlayerDerivedScores,
      errors,
    });

    ensureScoreRange({
      rowLabel,
      row,
      fields: scoreFieldsByArray.samplePlayerDerivedScores,
      errors,
    });
  }
}

function validateTeamScores({ rows, teamIds, formulaIds, sourceIds, errors }) {
  for (const [index, row] of rows.entries()) {
    const rowLabel = `sampleTeamDerivedScores[${index}]`;
    const teamId = getStringField(row, "teamId");

    if (!teamId) {
      errors.push(`${rowLabel} is missing teamId`);
    } else if (!teamIds.has(teamId)) {
      errors.push(`${rowLabel} references missing teamId: ${teamId}`);
    }

    validateCommonScoreRow({
      row,
      rowLabel,
      formulaIds,
      sourceIds,
      expectedFormulaId: expectedFormulaByArray.sampleTeamDerivedScores,
      errors,
    });

    ensureScoreRange({
      rowLabel,
      row,
      fields: scoreFieldsByArray.sampleTeamDerivedScores,
      errors,
    });
  }
}

function validateMapFitScores({
  rows,
  playerIds,
  teamIds,
  mapIds,
  formulaIds,
  sourceIds,
  errors,
}) {
  for (const [index, row] of rows.entries()) {
    const rowLabel = `sampleMapFitScores[${index}]`;
    const mapId = getStringField(row, "mapId");
    const entityId = getStringField(row, "entityId");
    const entityType = getStringField(row, "entityType");

    if (!mapId) {
      errors.push(`${rowLabel} is missing mapId`);
    } else if (!mapIds.has(mapId)) {
      errors.push(`${rowLabel} references missing mapId: ${mapId}`);
    }

    if (!allowedEntityTypes.has(entityType)) {
      errors.push(`${rowLabel} has invalid entityType: ${entityType ?? "(missing)"}`);
    }

    if (!entityId) {
      errors.push(`${rowLabel} is missing entityId`);
    } else if (entityType === "player" && !playerIds.has(entityId)) {
      errors.push(`${rowLabel} references missing player entityId: ${entityId}`);
    } else if (entityType === "team" && !teamIds.has(entityId)) {
      errors.push(`${rowLabel} references missing team entityId: ${entityId}`);
    }

    validateCommonScoreRow({
      row,
      rowLabel,
      formulaIds,
      sourceIds,
      expectedFormulaId: expectedFormulaByArray.sampleMapFitScores,
      errors,
    });

    ensureScoreRange({
      rowLabel,
      row,
      fields: scoreFieldsByArray.sampleMapFitScores,
      errors,
    });
  }
}

function validateRosterScores({ rows, playerIds, formulaIds, sourceIds, errors }) {
  for (const [index, row] of rows.entries()) {
    const rowLabel = `sampleRosterValueScores[${index}]`;
    const rosterId = getStringField(row, "rosterId");
    const playerIdsInRoster = getStringArrayField(row, "playerIds");
    const totalCost = getNumberField(row, "totalCost");
    const budgetLimit = getNumberField(row, "budgetLimit");
    const warnings = getStringArrayField(row, "warnings");

    if (!rosterId) {
      errors.push(`${rowLabel} is missing rosterId`);
    }

    if (playerIdsInRoster.length === 0) {
      errors.push(`${rowLabel} must include playerIds`);
    }

    for (const playerId of playerIdsInRoster) {
      if (!playerIds.has(playerId)) {
        errors.push(`${rowLabel} references missing playerId: ${playerId}`);
      }
    }

    if (totalCost === undefined || totalCost < 0) {
      errors.push(`${rowLabel} totalCost must be non-negative`);
    }

    if (budgetLimit === undefined || budgetLimit <= 0) {
      errors.push(`${rowLabel} budgetLimit must be positive`);
    }

    if (
      totalCost !== undefined &&
      budgetLimit !== undefined &&
      budgetLimit > 0 &&
      totalCost > budgetLimit
    ) {
      errors.push(`${rowLabel} totalCost must not exceed budgetLimit`);
    }

    if (warnings.length === 0) {
      errors.push(`${rowLabel} should include warnings for a partial sample roster`);
    }

    validateCommonScoreRow({
      row,
      rowLabel,
      formulaIds,
      sourceIds,
      expectedFormulaId: expectedFormulaByArray.sampleRosterValueScores,
      errors,
    });

    ensureScoreRange({
      rowLabel,
      row,
      fields: scoreFieldsByArray.sampleRosterValueScores,
      errors,
    });
  }
}

const errors = [];

const playerIds = getIds(sourceText.players);
const teamIds = getIds(sourceText.teams);
const mapIds = getIds(sourceText.maps);
const sourceIds = getIds(sourceText.sources);
const formulaIds = getFormulaIds(sourceText.derivedScores);

const playerRows = extractObjects(
  extractExportedValue(
    sourceText.sampleDerivedScores,
    "samplePlayerDerivedScores",
    "[",
    "]",
  ),
);
const teamRows = extractObjects(
  extractExportedValue(
    sourceText.sampleDerivedScores,
    "sampleTeamDerivedScores",
    "[",
    "]",
  ),
);
const mapFitRows = extractObjects(
  extractExportedValue(sourceText.sampleDerivedScores, "sampleMapFitScores", "[", "]"),
);
const rosterRows = extractObjects(
  extractExportedValue(
    sourceText.sampleDerivedScores,
    "sampleRosterValueScores",
    "[",
    "]",
  ),
);
const summary = extractExportedValue(
  sourceText.sampleDerivedScores,
  "sampleDerivedScoresSummary",
  "{",
  "}",
);

validatePlayerScores({ rows: playerRows, playerIds, formulaIds, sourceIds, errors });
validateTeamScores({ rows: teamRows, teamIds, formulaIds, sourceIds, errors });
validateMapFitScores({
  rows: mapFitRows,
  playerIds,
  teamIds,
  mapIds,
  formulaIds,
  sourceIds,
  errors,
});
validateRosterScores({ rows: rosterRows, playerIds, formulaIds, sourceIds, errors });

if (!summary.includes("playerScores: samplePlayerDerivedScores.length")) {
  errors.push(
    "sampleDerivedScoresSummary.playerScores should be derived from samplePlayerDerivedScores.length",
  );
}

if (!summary.includes("teamScores: sampleTeamDerivedScores.length")) {
  errors.push(
    "sampleDerivedScoresSummary.teamScores should be derived from sampleTeamDerivedScores.length",
  );
}

if (!summary.includes("mapFitScores: sampleMapFitScores.length")) {
  errors.push(
    "sampleDerivedScoresSummary.mapFitScores should be derived from sampleMapFitScores.length",
  );
}

if (!summary.includes("rosterValueScores: sampleRosterValueScores.length")) {
  errors.push(
    "sampleDerivedScoresSummary.rosterValueScores should be derived from sampleRosterValueScores.length",
  );
}

if (!summary.includes("status: sampleDerivedScoresMeta.status")) {
  errors.push(
    "sampleDerivedScoresSummary.status should be derived from sampleDerivedScoresMeta.status",
  );
}

console.log("ClutchLab sample derived scores validation");
console.log("------------------------------------------");
console.log(`Player ids available:   ${playerIds.size}`);
console.log(`Team ids available:     ${teamIds.size}`);
console.log(`Map ids available:      ${mapIds.size}`);
console.log(`Source ids available:   ${sourceIds.size}`);
console.log(`Formula ids available:  ${formulaIds.size}`);
console.log(`Player score rows:      ${playerRows.length}`);
console.log(`Team score rows:        ${teamRows.length}`);
console.log(`Map fit rows:           ${mapFitRows.length}`);
console.log(`Roster value rows:      ${rosterRows.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
