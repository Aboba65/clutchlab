import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  realDerivedScores: resolve(rootDir, "src", "data", "realDerivedScores.ts"),
  dataIndex: resolve(rootDir, "src", "data", "index.ts"),
  dataCompat: resolve(rootDir, "src", "data.ts"),
  pagesDir: resolve(rootDir, "src", "pages"),
};

const sourceText = {
  realDerivedScores: readFileSync(files.realDerivedScores, "utf8"),
  dataIndex: readFileSync(files.dataIndex, "utf8"),
  dataCompat: readFileSync(files.dataCompat, "utf8"),
};

const expectedExports = [
  "realDerivedScoresMeta",
  "realDerivedScoresSummary",
  "realPlayerDerivedScores",
  "realTeamDerivedScores",
  "realMapFitScores",
  "realRosterValueScores",
];

const expectedTypes = [
  "RealDerivedScoreSource",
  "RealDerivedScoreDatasetStatus",
  "RealDerivedScoresMeta",
];

const expectedMetaFields = [
  "version",
  "status",
  "source",
  "description",
  "formulaVersion",
  "coverage",
  "migrationGate",
  "warnings",
];

const expectedCoverageDerivations = [
  "players: realPlayerDerivedScores.length",
  "teams: realTeamDerivedScores.length",
  "mapFitScores: realMapFitScores.length",
  "rosterValueScores: realRosterValueScores.length",
];

const expectedSummaryDerivations = [
  "playerScores: realPlayerDerivedScores.length",
  "teamScores: realTeamDerivedScores.length",
  "mapFitScores: realMapFitScores.length",
  "rosterValueScores: realRosterValueScores.length",
];

const expectedWarnings = [
  "Do not add fake real-derived rows",
  "Do not wire this file directly into public UI pages",
  "Future UI usage must go through score adapters",
];

function findMatching(text, startIndex, open = "{", close = "}") {
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

function extractExportedObject(text, name) {
  const marker = `export const ${name}`;
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Missing export: ${name}`);
  }

  const equalsIndex = text.indexOf("=", markerIndex);
  const startIndex = text.indexOf("{", equalsIndex);
  const endIndex = findMatching(text, startIndex, "{", "}");

  if (equalsIndex === -1 || startIndex === -1 || endIndex === -1) {
    throw new Error(`Could not parse exported object: ${name}`);
  }

  return text.slice(startIndex, endIndex + 1);
}

function exportedConstExists(text, name) {
  const regex = new RegExp(`export\\s+const\\s+${name}\\b`);
  return regex.test(text);
}

function exportedTypeExists(text, name) {
  const regex = new RegExp(`export\\s+type\\s+${name}\\b`);
  return regex.test(text);
}

function exportedEmptyArrayExists(text, name) {
  const regex = new RegExp(`export\\s+const\\s+${name}[^=]*=\\s*\\[\\s*\\]`);
  return regex.test(text);
}

function findSourceFiles(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const entryPath = resolve(dir, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      files.push(...findSourceFiles(entryPath));
      continue;
    }

    if (entryPath.endsWith(".ts") || entryPath.endsWith(".tsx")) {
      files.push(entryPath);
    }
  }

  return files;
}

function normalizePath(filePath) {
  return relative(rootDir, filePath).replaceAll("\\", "/");
}

const errors = [];

for (const typeName of expectedTypes) {
  if (!exportedTypeExists(sourceText.realDerivedScores, typeName)) {
    errors.push(`Missing exported type: ${typeName}`);
  }
}

for (const exportName of expectedExports) {
  if (!exportedConstExists(sourceText.realDerivedScores, exportName)) {
    errors.push(`Missing exported const: ${exportName}`);
  }
}

for (const arrayName of [
  "realPlayerDerivedScores",
  "realTeamDerivedScores",
  "realMapFitScores",
  "realRosterValueScores",
]) {
  if (!exportedEmptyArrayExists(sourceText.realDerivedScores, arrayName)) {
    errors.push(`${arrayName} must stay an exported empty array until real rows exist`);
  }
}

const meta = extractExportedObject(sourceText.realDerivedScores, "realDerivedScoresMeta");
const summary = extractExportedObject(
  sourceText.realDerivedScores,
  "realDerivedScoresSummary",
);

for (const field of expectedMetaFields) {
  const fieldRegex = new RegExp(`\\b${field}:`);
  if (!fieldRegex.test(meta)) {
    errors.push(`realDerivedScoresMeta is missing field: ${field}`);
  }
}

if (
  !sourceText.realDerivedScores.includes(
    'export type RealDerivedScoreSource = "real-derived"',
  )
) {
  errors.push('RealDerivedScoreSource must be "real-derived"');
}

for (const status of ["planned", "active", "disabled"]) {
  if (!sourceText.realDerivedScores.includes(`"${status}"`)) {
    errors.push(`RealDerivedScoreDatasetStatus is missing status: ${status}`);
  }
}

if (!meta.includes('status: "planned"')) {
  errors.push('realDerivedScoresMeta.status must be "planned"');
}

if (!meta.includes('source: "real-derived"')) {
  errors.push('realDerivedScoresMeta.source must be "real-derived"');
}

if (!meta.includes("readyForPublicUi: false")) {
  errors.push("realDerivedScoresMeta.migrationGate.readyForPublicUi must be false");
}

if (!meta.includes("intentionally contains no fake real-derived rows")) {
  errors.push(
    "realDerivedScoresMeta.description must state that fake real-derived rows are not included",
  );
}

for (const derivation of expectedCoverageDerivations) {
  if (!meta.includes(derivation)) {
    errors.push(`realDerivedScoresMeta.coverage should derive count from ${derivation}`);
  }
}

for (const derivation of expectedSummaryDerivations) {
  if (!summary.includes(derivation)) {
    errors.push(`realDerivedScoresSummary should derive count from ${derivation}`);
  }
}

if (!summary.includes('status: "planned"')) {
  errors.push('realDerivedScoresSummary.status must be "planned"');
}

if (!summary.includes('source: "real-derived"')) {
  errors.push('realDerivedScoresSummary.source must be "real-derived"');
}

for (const warning of expectedWarnings) {
  if (!meta.includes(warning)) {
    errors.push(`realDerivedScoresMeta warning is missing: ${warning}`);
  }
}

for (const reason of [
  "No validated real-derived score rows exist yet",
  "No real-derived score validation script exists yet",
  "Score adapters do not prefer real-derived rows yet",
  "Public UI routes must keep demo/manual scoring until coverage gates pass",
]) {
  if (!meta.includes(reason)) {
    errors.push(`realDerivedScoresMeta migrationGate reason is missing: ${reason}`);
  }
}

if (!sourceText.dataIndex.includes('export * from "./realDerivedScores"')) {
  errors.push('src/data/index.ts must export from "./realDerivedScores"');
}

if (!sourceText.dataCompat.includes('export * from "./data/realDerivedScores"')) {
  errors.push('src/data.ts must export from "./data/realDerivedScores"');
}

const pageDirectImports = [];

for (const filePath of findSourceFiles(files.pagesDir)) {
  const text = readFileSync(filePath, "utf8");

  if (text.includes("realDerivedScores")) {
    pageDirectImports.push(normalizePath(filePath));
  }
}

for (const pagePath of pageDirectImports) {
  errors.push(`Public page should not import realDerivedScores directly: ${pagePath}`);
}

console.log("ClutchLab real-derived scores validation");
console.log("----------------------------------------");
console.log(`Expected exports:       ${expectedExports.length}`);
console.log(`Expected types:         ${expectedTypes.length}`);
console.log(`Expected meta fields:   ${expectedMetaFields.length}`);
console.log(`Direct page imports:    ${pageDirectImports.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
