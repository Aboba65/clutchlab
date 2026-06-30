import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  scoreAdapters: resolve(rootDir, "src", "data", "scoreAdapters.ts"),
  sampleDerivedScores: resolve(rootDir, "src", "data", "sampleDerivedScores.ts"),
  pagesDir: resolve(rootDir, "src", "pages"),
};

const sourceText = {
  scoreAdapters: readFileSync(files.scoreAdapters, "utf8"),
  sampleDerivedScores: readFileSync(files.sampleDerivedScores, "utf8"),
};

const expectedHelpers = [
  "scoreAdapterLayerMeta",
  "getSamplePlayerDerivedScore",
  "getSampleTeamDerivedScore",
  "getSampleMapFitScoresForEntity",
  "getSampleMapFitScore",
  "getSampleRosterValueScore",
  "hasSamplePlayerDerivedScore",
  "hasSampleTeamDerivedScore",
  "hasSampleRosterValueScore",
  "getScoreAdapterCoverageSummary",
];

const expectedResultFields = [
  "value",
  "source",
  "status",
  "confidence",
  "formulaId",
  "sourceIds",
  "periodStart",
  "periodEnd",
  "reason",
];

const expectedSourceValues = ["demo-manual", "sample-derived", "real-derived"];
const expectedStatusValues = ["fallback", "sample", "active"];

const expectedSampleImports = [
  "sampleMapFitScores",
  "samplePlayerDerivedScores",
  "sampleRosterValueScores",
  "sampleTeamDerivedScores",
];

const expectedFallbackMessages = [
  "No sample player derived score",
  "No sample team derived score",
  "No sample map fit scores",
  "No sample map fit score",
  "No sample roster value score",
];

const expectedCoverageDerivations = [
  "playerScores: samplePlayerDerivedScores.length",
  "teamScores: sampleTeamDerivedScores.length",
  "mapFitScores: sampleMapFitScores.length",
  "rosterValueScores: sampleRosterValueScores.length",
];

const allowedPageAdapterImports = new Set(["src/pages/SampleDataPage.tsx"]);

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

function exportedFunctionExists(text, name) {
  const regex = new RegExp(`export\\s+function\\s+${name}\\s*\\(`);
  return regex.test(text);
}

function exportedConstExists(text, name) {
  const regex = new RegExp(`export\\s+const\\s+${name}\\b`);
  return regex.test(text);
}

function exportedTypeExists(text, name) {
  const regex = new RegExp(`export\\s+type\\s+${name}\\b`);
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

if (!exportedTypeExists(sourceText.scoreAdapters, "ScoreAdapterSource")) {
  errors.push("Missing exported type: ScoreAdapterSource");
}

if (!exportedTypeExists(sourceText.scoreAdapters, "ScoreAdapterStatus")) {
  errors.push("Missing exported type: ScoreAdapterStatus");
}

if (!exportedTypeExists(sourceText.scoreAdapters, "ScoreAdapterResult")) {
  errors.push("Missing exported type: ScoreAdapterResult");
}

for (const value of expectedSourceValues) {
  if (!sourceText.scoreAdapters.includes(`"${value}"`)) {
    errors.push(`ScoreAdapterSource is missing value: ${value}`);
  }
}

for (const value of expectedStatusValues) {
  if (!sourceText.scoreAdapters.includes(`"${value}"`)) {
    errors.push(`ScoreAdapterStatus is missing value: ${value}`);
  }
}

for (const field of expectedResultFields) {
  const fieldRegex = new RegExp(`\\b${field}\\??:`);
  if (!fieldRegex.test(sourceText.scoreAdapters)) {
    errors.push(`ScoreAdapterResult is missing field: ${field}`);
  }
}

for (const helper of expectedHelpers) {
  const exists =
    helper === "scoreAdapterLayerMeta"
      ? exportedConstExists(sourceText.scoreAdapters, helper)
      : exportedFunctionExists(sourceText.scoreAdapters, helper);

  if (!exists) {
    errors.push(`Missing adapter export: ${helper}`);
  }
}

for (const sampleImport of expectedSampleImports) {
  if (!sourceText.scoreAdapters.includes(sampleImport)) {
    errors.push(`scoreAdapters.ts does not reference ${sampleImport}`);
  }
}

const adapterMeta = extractExportedObject(
  sourceText.scoreAdapters,
  "scoreAdapterLayerMeta",
);

if (!adapterMeta.includes('status: "sample-only"')) {
  errors.push('scoreAdapterLayerMeta.status must be "sample-only"');
}

if (!adapterMeta.includes("does not change public UI scoring")) {
  errors.push(
    "scoreAdapterLayerMeta should state that it does not change public UI scoring",
  );
}

for (const warning of [
  "Sample derived scores are not live official statistics",
  "Do not use these helpers to rank public pages",
  "Keep demo/manual fallbacks",
]) {
  if (!adapterMeta.includes(warning)) {
    errors.push(`scoreAdapterLayerMeta warning is missing: ${warning}`);
  }
}

for (const fallbackMessage of expectedFallbackMessages) {
  if (!sourceText.scoreAdapters.includes(fallbackMessage)) {
    errors.push(`Missing fallback message: ${fallbackMessage}`);
  }
}

for (const coverageDerivation of expectedCoverageDerivations) {
  if (!sourceText.scoreAdapters.includes(coverageDerivation)) {
    errors.push(`Coverage summary should derive count from ${coverageDerivation}`);
  }
}

if (!sourceText.scoreAdapters.includes('source: "demo-manual"')) {
  errors.push('Fallback result should set source: "demo-manual"');
}

if (!sourceText.scoreAdapters.includes('status: "fallback"')) {
  errors.push('Fallback result should set status: "fallback"');
}

if (!sourceText.scoreAdapters.includes('source: "sample-derived"')) {
  errors.push('Sample result should set source: "sample-derived"');
}

if (!sourceText.scoreAdapters.includes('status: "sample"')) {
  errors.push('Sample result should set status: "sample"');
}

const pageAdapterImports = [];

for (const filePath of findSourceFiles(files.pagesDir)) {
  const text = readFileSync(filePath, "utf8");

  if (text.includes("scoreAdapters")) {
    pageAdapterImports.push(normalizePath(filePath));
  }
}

const blockedPageAdapterImports = pageAdapterImports.filter(
  (pagePath) => !allowedPageAdapterImports.has(pagePath),
);

for (const pagePath of blockedPageAdapterImports) {
  errors.push(
    `Public page should not import scoreAdapters yet: ${pagePath}. Allowed exception: src/pages/SampleDataPage.tsx`,
  );
}

console.log("ClutchLab score adapters validation");
console.log("-----------------------------------");
console.log(`Expected helpers:        ${expectedHelpers.length}`);
console.log(`Expected result fields:  ${expectedResultFields.length}`);
console.log(`Source values:           ${expectedSourceValues.length}`);
console.log(`Status values:           ${expectedStatusValues.length}`);
console.log(`Page adapter imports:    ${pageAdapterImports.length}`);
console.log(`Allowed page imports:    ${allowedPageAdapterImports.size}`);
console.log(`Blocked page imports:    ${blockedPageAdapterImports.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
