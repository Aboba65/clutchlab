import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  sources: resolve(rootDir, "src", "data", "sources.ts"),
  rawStats: resolve(rootDir, "src", "data", "rawStats.ts"),
  derivedScores: resolve(rootDir, "src", "data", "derivedScores.ts"),
};

const sourceText = {
  sources: readFileSync(files.sources, "utf8"),
  rawStats: readFileSync(files.rawStats, "utf8"),
  derivedScores: readFileSync(files.derivedScores, "utf8"),
};

const allowedRawDatasetStatuses = new Set(["planned-schema", "manual-sample", "active"]);
const allowedScoreDatasetStatuses = new Set([
  "planned-schema",
  "manual-sample",
  "active",
]);
const allowedScoreScales = new Set(["0-100", "0-1", "rank", "label"]);
const allowedScoreConfidence = new Set(["low", "medium", "high"]);

const requiredRawFieldGroups = {
  player: ["rating", "adr", "kd", "kast"],
  team: ["winRate", "roundWinRate"],
  map: ["tRoundWinRate", "ctRoundWinRate"],
  role: ["averageRating", "averageAdr"],
};

const requiredDerivedFieldGroups = {
  player: ["impact", "clutch", "opening", "awp", "rifle", "consistency"],
  team: ["overall", "firepower", "structure", "mapPool", "clutch", "form"],
  mapFit: ["fit"],
  roster: ["value", "roleCoverage", "firepower", "clutch", "mapFit", "balance"],
};

const formulaGroupById = {
  "player-impact-v1": "player",
  "team-score-v1": "team",
  "map-fit-v1": "mapFit",
  "roster-value-v1": "roster",
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

function getStringField(objectSource, field) {
  const regex = new RegExp(`\\b${field}:\\s*["']([^"']+)["']`);
  return objectSource.match(regex)?.[1];
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

function parseFieldGroups(objectSource) {
  const groups = {};

  for (const match of objectSource.matchAll(/\b([A-Za-z][A-Za-z0-9]*):\s*\[/g)) {
    const key = match[1];
    const startIndex = objectSource.indexOf("[", match.index);
    const endIndex = findMatching(objectSource, startIndex);

    if (startIndex === -1 || endIndex === -1) {
      continue;
    }

    const arraySource = objectSource.slice(startIndex, endIndex + 1);
    groups[key] = [...arraySource.matchAll(/["']([^"']+)["']/g)].map((item) => item[1]);
  }

  return groups;
}

function ensureUnique(values, label, errors) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      errors.push(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }
}

function ensureRequiredFields(groups, requirements, label, errors) {
  for (const [groupName, requiredFields] of Object.entries(requirements)) {
    const fields = groups[groupName];

    if (!fields) {
      errors.push(`Missing ${label} group: ${groupName}`);
      continue;
    }

    if (fields.length === 0) {
      errors.push(`${label} group ${groupName} must not be empty`);
    }

    ensureUnique(fields, `${label} field in ${groupName}`, errors);

    for (const field of requiredFields) {
      if (!fields.includes(field)) {
        errors.push(`${label} group ${groupName} is missing required field: ${field}`);
      }
    }
  }
}

function parseSources() {
  const sourceArray = extractExportedValue(sourceText.sources, "dataSources", "[", "]");
  return extractObjects(sourceArray).map((objectSource) => ({
    id: getStringField(objectSource, "id"),
  }));
}

function parseDatasetStatus(text, exportName) {
  const objectSource = extractExportedValue(text, exportName, "{", "}");
  return getStringField(objectSource, "status");
}

function parseScoreFormulas() {
  const formulasSource = extractExportedValue(
    sourceText.derivedScores,
    "scoreFormulaScaffolds",
    "[",
    "]",
  );

  return extractObjects(formulasSource).map((objectSource) => ({
    id: getStringField(objectSource, "id"),
    name: getStringField(objectSource, "name"),
    version: getStringField(objectSource, "version"),
    description: getStringField(objectSource, "description"),
    scale: getStringField(objectSource, "scale"),
    confidence: getStringField(objectSource, "confidence"),
    sourceIds: getStringArrayField(objectSource, "sourceIds"),
    inputFields: getStringArrayField(objectSource, "inputFields"),
    outputFields: getStringArrayField(objectSource, "outputFields"),
    notes: getStringArrayField(objectSource, "notes"),
  }));
}

const errors = [];

const sourceIds = new Set(
  parseSources()
    .map((source) => source.id)
    .filter(Boolean),
);

const rawDatasetStatus = parseDatasetStatus(sourceText.rawStats, "rawStatDatasetMeta");
const derivedDatasetStatus = parseDatasetStatus(
  sourceText.derivedScores,
  "derivedScoreDatasetMeta",
);

if (!allowedRawDatasetStatuses.has(rawDatasetStatus)) {
  errors.push(`Invalid rawStatDatasetMeta status: ${rawDatasetStatus}`);
}

if (!allowedScoreDatasetStatuses.has(derivedDatasetStatus)) {
  errors.push(`Invalid derivedScoreDatasetMeta status: ${derivedDatasetStatus}`);
}

const rawFieldGroups = parseFieldGroups(
  extractExportedValue(sourceText.rawStats, "rawStatFieldGroups", "{", "}"),
);
const derivedFieldGroups = parseFieldGroups(
  extractExportedValue(sourceText.derivedScores, "derivedScoreFieldGroups", "{", "}"),
);

ensureRequiredFields(
  rawFieldGroups,
  requiredRawFieldGroups,
  "rawStatFieldGroups",
  errors,
);
ensureRequiredFields(
  derivedFieldGroups,
  requiredDerivedFieldGroups,
  "derivedScoreFieldGroups",
  errors,
);

const formulas = parseScoreFormulas();

if (formulas.length === 0) {
  errors.push("scoreFormulaScaffolds must contain at least one formula");
}

ensureUnique(formulas.map((formula) => formula.id).filter(Boolean), "formula id", errors);

for (const formula of formulas) {
  if (!formula.id) {
    errors.push("A score formula is missing id");
  }

  if (!formula.name) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} is missing name`);
  }

  if (!formula.version) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} is missing version`);
  }

  if (!formula.description) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} is missing description`);
  }

  if (!allowedScoreScales.has(formula.scale)) {
    errors.push(
      `Formula ${formula.id ?? "(missing id)"} has invalid scale: ${formula.scale}`,
    );
  }

  if (!allowedScoreConfidence.has(formula.confidence)) {
    errors.push(
      `Formula ${formula.id ?? "(missing id)"} has invalid confidence: ${formula.confidence}`,
    );
  }

  if (formula.sourceIds.length === 0) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} must declare sourceIds`);
  }

  for (const sourceId of formula.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`Formula ${formula.id} references missing sourceId: ${sourceId}`);
    }
  }

  if (formula.inputFields.length === 0) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} must declare inputFields`);
  }

  if (formula.outputFields.length === 0) {
    errors.push(`Formula ${formula.id ?? "(missing id)"} must declare outputFields`);
  }

  ensureUnique(formula.inputFields, `input field for formula ${formula.id}`, errors);
  ensureUnique(formula.outputFields, `output field for formula ${formula.id}`, errors);

  const groupName = formulaGroupById[formula.id];

  if (groupName) {
    const allowedOutputs = new Set(derivedFieldGroups[groupName] ?? []);

    for (const outputField of formula.outputFields) {
      if (!allowedOutputs.has(outputField)) {
        errors.push(
          `Formula ${formula.id} output field is not listed in derivedScoreFieldGroups.${groupName}: ${outputField}`,
        );
      }
    }
  }

  if (formula.confidence === "low" && formula.notes.length === 0) {
    errors.push(`Low-confidence formula ${formula.id} should include notes`);
  }
}

console.log("ClutchLab model validation");
console.log("--------------------------");
console.log(`Source ids parsed:       ${sourceIds.size}`);
console.log(`Raw field groups:        ${Object.keys(rawFieldGroups).length}`);
console.log(`Derived field groups:    ${Object.keys(derivedFieldGroups).length}`);
console.log(`Formula scaffolds:       ${formulas.length}`);
console.log(`Raw dataset status:      ${rawDatasetStatus}`);
console.log(`Derived dataset status:  ${derivedDatasetStatus}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
