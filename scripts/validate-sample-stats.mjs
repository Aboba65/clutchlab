import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  players: resolve(rootDir, "src", "data", "players.ts"),
  teams: resolve(rootDir, "src", "data", "teams.ts"),
  sources: resolve(rootDir, "src", "data", "sources.ts"),
  sampleRawStats: resolve(rootDir, "src", "data", "sampleRawStats.ts"),
};

const sourceText = {
  players: readFileSync(files.players, "utf8"),
  teams: readFileSync(files.teams, "utf8"),
  sources: readFileSync(files.sources, "utf8"),
  sampleRawStats: readFileSync(files.sampleRawStats, "utf8"),
};

const percentageFields = new Set([
  "kast",
  "openingDuelWinRate",
  "clutchWinRate",
  "headshotRate",
  "winRate",
  "roundWinRate",
  "tRoundWinRate",
  "ctRoundWinRate",
  "pistolRoundWinRate",
  "conversionRate",
  "retakeWinRate",
]);

const nonNegativeFields = new Set([
  "mapsPlayed",
  "roundsPlayed",
  "rating",
  "adr",
  "kd",
  "openingAttempts",
  "openingSuccess",
  "clutchAttempts",
  "clutchWins",
  "awpKills",
  "rifleKills",
  "firstKills",
  "firstDeaths",
]);

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

function getStringField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*["']([^"']+)["']`);
  return objectSource.match(regex)?.[1];
}

function getIdentifierField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*([A-Za-z_$][A-Za-z0-9_$]*)`);
  return objectSource.match(regex)?.[1];
}

function getNumberField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*(-?\\d+(?:\\.\\d+)?)`);
  const value = objectSource.match(regex)?.[1];

  return value === undefined ? undefined : Number(value);
}

function getAllNumberFields(objectSource) {
  const fields = {};

  for (const match of objectSource.matchAll(
    /\b([A-Za-z][A-Za-z0-9]*):\s*(-?\d+(?:\.\d+)?)/g,
  )) {
    fields[match[1]] = Number(match[2]);
  }

  return fields;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function validateWindow(name, objectSource, sourceIds, errors) {
  const sourceId = getStringField(objectSource, "sourceId");
  const periodStart = getStringField(objectSource, "periodStart");
  const periodEnd = getStringField(objectSource, "periodEnd");
  const retrievedAt = getStringField(objectSource, "retrievedAt");
  const eventScope = getStringField(objectSource, "eventScope");
  const minimumMaps = getNumberField(objectSource, "minimumMaps");
  const minimumRounds = getNumberField(objectSource, "minimumRounds");

  if (!sourceId) {
    errors.push(`${name} is missing sourceId`);
  } else if (!sourceIds.has(sourceId)) {
    errors.push(`${name} references missing sourceId: ${sourceId}`);
  }

  if (!eventScope) {
    errors.push(`${name} is missing eventScope`);
  }

  if (!isValidDate(periodStart)) {
    errors.push(`${name} has invalid periodStart: ${periodStart}`);
  }

  if (!isValidDate(periodEnd)) {
    errors.push(`${name} has invalid periodEnd: ${periodEnd}`);
  }

  if (retrievedAt && !isValidDate(retrievedAt)) {
    errors.push(`${name} has invalid retrievedAt: ${retrievedAt}`);
  }

  if (isValidDate(periodStart) && isValidDate(periodEnd)) {
    const startDate = new Date(`${periodStart}T00:00:00.000Z`);
    const endDate = new Date(`${periodEnd}T00:00:00.000Z`);

    if (startDate > endDate) {
      errors.push(`${name} periodStart must be before or equal to periodEnd`);
    }
  }

  if (minimumMaps !== undefined && minimumMaps < 0) {
    errors.push(`${name} minimumMaps must be non-negative`);
  }

  if (minimumRounds !== undefined && minimumRounds < 0) {
    errors.push(`${name} minimumRounds must be non-negative`);
  }
}

function validateRows({ label, rows, idField, validIds, expectedWindow, errors }) {
  for (const [index, row] of rows.entries()) {
    const rowLabel = `${label}[${index}]`;
    const id = getStringField(row, idField);
    const window = getIdentifierField(row, "window");
    const mapsPlayed = getNumberField(row, "mapsPlayed");
    const roundsPlayed = getNumberField(row, "roundsPlayed");

    if (!id) {
      errors.push(`${rowLabel} is missing ${idField}`);
    } else if (!validIds.has(id)) {
      errors.push(`${rowLabel} references missing ${idField}: ${id}`);
    }

    if (window !== expectedWindow) {
      errors.push(
        `${rowLabel} must use ${expectedWindow}; found ${window ?? "(missing)"}`,
      );
    }

    if (mapsPlayed === undefined || mapsPlayed <= 0) {
      errors.push(`${rowLabel} mapsPlayed must be positive`);
    }

    if (roundsPlayed === undefined || roundsPlayed <= 0) {
      errors.push(`${rowLabel} roundsPlayed must be positive`);
    }

    const numberFields = getAllNumberFields(row);

    for (const [field, value] of Object.entries(numberFields)) {
      if (nonNegativeFields.has(field) && value < 0) {
        errors.push(`${rowLabel} ${field} must be non-negative`);
      }

      if (percentageFields.has(field) && (value < 0 || value > 100)) {
        errors.push(`${rowLabel} ${field} must be between 0 and 100`);
      }
    }
  }
}

const errors = [];

const playerIds = getIds(sourceText.players);
const teamIds = getIds(sourceText.teams);
const sourceIds = getIds(sourceText.sources);

const playerWindow = extractExportedValue(
  sourceText.sampleRawStats,
  "samplePlayerStatWindow",
  "{",
  "}",
);
const teamWindow = extractExportedValue(
  sourceText.sampleRawStats,
  "sampleTeamStatWindow",
  "{",
  "}",
);
const playerRows = extractObjects(
  extractExportedValue(sourceText.sampleRawStats, "samplePlayerRawStats", "[", "]"),
);
const teamRows = extractObjects(
  extractExportedValue(sourceText.sampleRawStats, "sampleTeamRawStats", "[", "]"),
);
const summary = extractExportedValue(
  sourceText.sampleRawStats,
  "sampleRawStatsSummary",
  "{",
  "}",
);

validateWindow("samplePlayerStatWindow", playerWindow, sourceIds, errors);
validateWindow("sampleTeamStatWindow", teamWindow, sourceIds, errors);

validateRows({
  label: "samplePlayerRawStats",
  rows: playerRows,
  idField: "playerId",
  validIds: playerIds,
  expectedWindow: "samplePlayerStatWindow",
  errors,
});

validateRows({
  label: "sampleTeamRawStats",
  rows: teamRows,
  idField: "teamId",
  validIds: teamIds,
  expectedWindow: "sampleTeamStatWindow",
  errors,
});

if (!summary.includes("players: samplePlayerRawStats.length")) {
  errors.push(
    "sampleRawStatsSummary.players should be derived from samplePlayerRawStats.length",
  );
}

if (!summary.includes("teams: sampleTeamRawStats.length")) {
  errors.push(
    "sampleRawStatsSummary.teams should be derived from sampleTeamRawStats.length",
  );
}

if (!summary.includes("status: sampleRawStatsMeta.status")) {
  errors.push(
    "sampleRawStatsSummary.status should be derived from sampleRawStatsMeta.status",
  );
}

const windows = getNumberField(summary, "windows");

if (windows !== 2) {
  errors.push(`sampleRawStatsSummary.windows should be 2; found ${windows}`);
}

console.log("ClutchLab sample stats validation");
console.log("---------------------------------");
console.log(`Player ids available: ${playerIds.size}`);
console.log(`Team ids available:   ${teamIds.size}`);
console.log(`Source ids available: ${sourceIds.size}`);
console.log(`Player sample rows:   ${playerRows.length}`);
console.log(`Team sample rows:     ${teamRows.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
