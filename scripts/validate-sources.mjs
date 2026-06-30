import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();
const sourcesPath = resolve(rootDir, "src", "data", "sources.ts");

const source = readFileSync(sourcesPath, "utf8");

const allowedStatuses = new Set(["demo", "manual", "planned-real", "real"]);
const allowedKinds = new Set([
  "identity",
  "raw-performance",
  "derived-score",
  "manual-adjustment",
  "methodology",
]);
const allowedConfidence = new Set(["low", "medium", "high"]);

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

function extractExportedArray(name) {
  const marker = `export const ${name}`;
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Missing export: ${name}`);
  }

  const equalsIndex = source.indexOf("=", markerIndex);
  const startIndex = source.indexOf("[", equalsIndex);
  const endIndex = findMatching(source, startIndex);

  if (equalsIndex === -1 || startIndex === -1 || endIndex === -1) {
    throw new Error(`Could not parse exported array: ${name}`);
  }

  return source.slice(startIndex, endIndex + 1);
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

function validateUnique(values, label, errors) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      errors.push(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }
}

const sourceObjects = extractObjects(extractExportedArray("dataSources"));
const groupObjects = extractObjects(extractExportedArray("sourceGroups"));

const sources = sourceObjects.map((objectSource) => ({
  id: getStringField(objectSource, "id"),
  name: getStringField(objectSource, "name"),
  kind: getStringField(objectSource, "kind"),
  status: getStringField(objectSource, "status"),
  description: getStringField(objectSource, "description"),
  confidence: getStringField(objectSource, "confidence"),
  covers: getStringArrayField(objectSource, "covers"),
}));

const groups = groupObjects.map((objectSource) => ({
  id: getStringField(objectSource, "id"),
  name: getStringField(objectSource, "name"),
  sourceIds: getStringArrayField(objectSource, "sourceIds"),
}));

const errors = [];

validateUnique(sources.map((item) => item.id).filter(Boolean), "source id", errors);
validateUnique(groups.map((item) => item.id).filter(Boolean), "source group id", errors);

for (const item of sources) {
  if (!item.id) {
    errors.push("A source is missing id");
  }

  if (!item.name) {
    errors.push(`Source ${item.id ?? "(missing id)"} is missing name`);
  }

  if (!item.description) {
    errors.push(`Source ${item.id ?? "(missing id)"} is missing description`);
  }

  if (!allowedKinds.has(item.kind)) {
    errors.push(`Source ${item.id ?? "(missing id)"} has invalid kind: ${item.kind}`);
  }

  if (!allowedStatuses.has(item.status)) {
    errors.push(`Source ${item.id ?? "(missing id)"} has invalid status: ${item.status}`);
  }

  if (!allowedConfidence.has(item.confidence)) {
    errors.push(
      `Source ${item.id ?? "(missing id)"} has invalid confidence: ${item.confidence}`,
    );
  }

  if (item.covers.length === 0) {
    errors.push(`Source ${item.id ?? "(missing id)"} must cover at least one area`);
  }
}

const sourceIds = new Set(sources.map((item) => item.id).filter(Boolean));

for (const group of groups) {
  if (!group.id) {
    errors.push("A source group is missing id");
  }

  if (!group.name) {
    errors.push(`Source group ${group.id ?? "(missing id)"} is missing name`);
  }

  if (group.sourceIds.length === 0) {
    errors.push(`Source group ${group.id ?? "(missing id)"} has no sourceIds`);
  }

  for (const sourceId of group.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      errors.push(`Source group ${group.id} references missing source: ${sourceId}`);
    }
  }
}

console.log("ClutchLab source validation");
console.log("---------------------------");
console.log(`Sources parsed: ${sources.length}`);
console.log(`Groups parsed:  ${groups.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
