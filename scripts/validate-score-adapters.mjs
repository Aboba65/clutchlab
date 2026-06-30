import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const rootDir = process.cwd();

const files = {
  scoreAdapters: resolve(rootDir, "src", "data", "scoreAdapters.ts"),
  pagesDir: resolve(rootDir, "src", "pages"),
};

const scoreAdaptersText = readFileSync(files.scoreAdapters, "utf8");

const expectedTypes = [
  "ScoreAdapterSource",
  "ScoreAdapterStatus",
  "ScoreAdapterOptions",
  "ScoreAdapterResult",
];

const expectedSourceValues = ["demo-manual", "sample-derived", "real-derived"];
const expectedStatusValues = ["fallback", "sample", "active"];

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

const expectedGenericHelpers = [
  "resolveScoreAdapterOptions",
  "getPlayerDerivedScore",
  "getTeamDerivedScore",
  "getMapFitScoresForEntity",
  "getMapFitScore",
  "getRosterValueScore",
];

const expectedSampleHelpers = [
  "getSamplePlayerDerivedScore",
  "getSampleTeamDerivedScore",
  "getSampleMapFitScoresForEntity",
  "getSampleMapFitScore",
  "getSampleRosterValueScore",
];

const expectedSupportExports = [
  "defaultScoreAdapterOptions",
  "scoreAdapterLayerMeta",
  "hasSamplePlayerDerivedScore",
  "hasSampleTeamDerivedScore",
  "hasSampleRosterValueScore",
  "hasScoreAdapterValue",
  "getScoreAdapterCoverageSummary",
];

const expectedRealArrays = [
  "realMapFitScores",
  "realPlayerDerivedScores",
  "realRosterValueScores",
  "realTeamDerivedScores",
];

const expectedSampleArrays = [
  "sampleMapFitScores",
  "samplePlayerDerivedScores",
  "sampleRosterValueScores",
  "sampleTeamDerivedScores",
];

const genericHelperRules = [
  {
    name: "getPlayerDerivedScore",
    realArray: "realPlayerDerivedScores",
    sampleArray: "samplePlayerDerivedScores",
    realResult: "createRealResult",
    sampleResult: "createSampleResult",
  },
  {
    name: "getTeamDerivedScore",
    realArray: "realTeamDerivedScores",
    sampleArray: "sampleTeamDerivedScores",
    realResult: "createRealResult",
    sampleResult: "createSampleResult",
  },
  {
    name: "getMapFitScoresForEntity",
    realArray: "realMapFitScores",
    sampleArray: "sampleMapFitScores",
    realResult: "createRealArrayResult",
    sampleResult: "createSampleArrayResult",
  },
  {
    name: "getMapFitScore",
    realArray: "realMapFitScores",
    sampleArray: "sampleMapFitScores",
    realResult: "createRealResult",
    sampleResult: "createSampleResult",
  },
  {
    name: "getRosterValueScore",
    realArray: "realRosterValueScores",
    sampleArray: "sampleRosterValueScores",
    realResult: "createRealResult",
    sampleResult: "createSampleResult",
  },
];

const samplePagePath = "src/pages/SampleDataPage.tsx";

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

function findFunctionStart(text, name) {
  const exportedRegex = new RegExp(
    `(^|\\n)export\\s+function\\s+${name}(?:\\s*<[^>{}]*>)?\\s*\\(`,
  );
  const exportedMatch = exportedRegex.exec(text);

  if (exportedMatch) {
    return exportedMatch.index + exportedMatch[1].length;
  }

  const localRegex = new RegExp(`(^|\\n)function\\s+${name}(?:\\s*<[^>{}]*>)?\\s*\\(`);
  const localMatch = localRegex.exec(text);

  if (localMatch) {
    return localMatch.index + localMatch[1].length;
  }

  return -1;
}

function extractFunction(text, name) {
  const markerIndex = findFunctionStart(text, name);

  if (markerIndex === -1) {
    throw new Error(`Missing function: ${name}`);
  }

  const paramsStartIndex = text.indexOf("(", markerIndex);

  if (paramsStartIndex === -1) {
    throw new Error(`Could not find parameter list for function: ${name}`);
  }

  const paramsEndIndex = findMatching(text, paramsStartIndex, "(", ")");

  if (paramsEndIndex === -1) {
    throw new Error(`Could not parse parameter list for function: ${name}`);
  }

  const startIndex = text.indexOf("{", paramsEndIndex);
  const endIndex = findMatching(text, startIndex, "{", "}");

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Could not parse function body: ${name}`);
  }

  return text.slice(markerIndex, endIndex + 1);
}

function exportedTypeExists(text, name) {
  const regex = new RegExp(`export\\s+type\\s+${name}\\b`);
  return regex.test(text);
}

function exportedConstExists(text, name) {
  const regex = new RegExp(`export\\s+const\\s+${name}\\b`);
  return regex.test(text);
}

function exportedFunctionExists(text, name) {
  const regex = new RegExp(`export\\s+function\\s+${name}(?:\\s*<[^>{}]*>)?\\s*\\(`);
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
  if (!exportedTypeExists(scoreAdaptersText, typeName)) {
    errors.push(`Missing exported type: ${typeName}`);
  }
}

for (const value of expectedSourceValues) {
  if (!scoreAdaptersText.includes(`"${value}"`)) {
    errors.push(`ScoreAdapterSource is missing value: ${value}`);
  }
}

for (const value of expectedStatusValues) {
  if (!scoreAdaptersText.includes(`"${value}"`)) {
    errors.push(`ScoreAdapterStatus is missing value: ${value}`);
  }
}

for (const field of expectedResultFields) {
  const fieldRegex = new RegExp(`\\b${field}\\??:`);
  if (!fieldRegex.test(scoreAdaptersText)) {
    errors.push(`ScoreAdapterResult is missing field: ${field}`);
  }
}

for (const exportName of expectedSupportExports) {
  if (
    !exportedConstExists(scoreAdaptersText, exportName) &&
    !exportedFunctionExists(scoreAdaptersText, exportName)
  ) {
    errors.push(`Missing support export: ${exportName}`);
  }
}

for (const helper of [...expectedGenericHelpers, ...expectedSampleHelpers]) {
  if (!exportedFunctionExists(scoreAdaptersText, helper)) {
    errors.push(`Missing adapter helper export: ${helper}`);
  }
}

for (const arrayName of expectedRealArrays) {
  if (!scoreAdaptersText.includes(arrayName)) {
    errors.push(`scoreAdapters.ts must reference ${arrayName}`);
  }
}

for (const arrayName of expectedSampleArrays) {
  if (!scoreAdaptersText.includes(arrayName)) {
    errors.push(`scoreAdapters.ts must reference ${arrayName}`);
  }
}

const defaultOptions = extractExportedObject(
  scoreAdaptersText,
  "defaultScoreAdapterOptions",
);

if (!defaultOptions.includes("allowSample: false")) {
  errors.push("defaultScoreAdapterOptions.allowSample must be false");
}

if (!defaultOptions.includes("preferReal: true")) {
  errors.push("defaultScoreAdapterOptions.preferReal must be true");
}

const meta = extractExportedObject(scoreAdaptersText, "scoreAdapterLayerMeta");

if (!meta.includes('status: "sample-only"')) {
  errors.push('scoreAdapterLayerMeta.status must stay "sample-only" for now');
}

if (!meta.includes("genericDefaults: defaultScoreAdapterOptions")) {
  errors.push("scoreAdapterLayerMeta should expose genericDefaults");
}

if (
  !meta.includes('"real-derived"') ||
  !meta.includes('"sample-derived"') ||
  !meta.includes('"demo-manual"')
) {
  errors.push(
    "scoreAdapterLayerMeta.priority should include real-derived, sample-derived and demo-manual",
  );
}

const resolveOptions = extractFunction(scoreAdaptersText, "resolveScoreAdapterOptions");

if (!resolveOptions.includes("defaultScoreAdapterOptions.allowSample")) {
  errors.push(
    "resolveScoreAdapterOptions must default allowSample from defaultScoreAdapterOptions",
  );
}

if (!resolveOptions.includes("defaultScoreAdapterOptions.preferReal")) {
  errors.push(
    "resolveScoreAdapterOptions must default preferReal from defaultScoreAdapterOptions",
  );
}

for (const rule of genericHelperRules) {
  const functionText = extractFunction(scoreAdaptersText, rule.name);

  if (!functionText.includes("resolveScoreAdapterOptions")) {
    errors.push(`${rule.name} must resolve ScoreAdapterOptions`);
  }

  if (!functionText.includes("resolved.preferReal")) {
    errors.push(`${rule.name} must gate real-derived lookup behind preferReal`);
  }

  if (!functionText.includes("resolved.allowSample")) {
    errors.push(`${rule.name} must gate sample-derived lookup behind allowSample`);
  }

  if (!functionText.includes(rule.realArray)) {
    errors.push(`${rule.name} must reference ${rule.realArray}`);
  }

  if (!functionText.includes(rule.sampleArray)) {
    errors.push(`${rule.name} must reference ${rule.sampleArray}`);
  }

  if (!functionText.includes(rule.realResult)) {
    errors.push(`${rule.name} must return ${rule.realResult} for real rows`);
  }

  if (!functionText.includes(rule.sampleResult)) {
    errors.push(`${rule.name} must return ${rule.sampleResult} for sample rows`);
  }

  if (!functionText.includes("createFallbackResult")) {
    errors.push(`${rule.name} must return createFallbackResult when no safe row exists`);
  }
}

const createFallbackResult = extractFunction(scoreAdaptersText, "createFallbackResult");
const createRealResult = extractFunction(scoreAdaptersText, "createRealResult");
const createSampleResult = extractFunction(scoreAdaptersText, "createSampleResult");
const createRealArrayResult = extractFunction(scoreAdaptersText, "createRealArrayResult");
const createSampleArrayResult = extractFunction(
  scoreAdaptersText,
  "createSampleArrayResult",
);

if (!createFallbackResult.includes('source: "demo-manual"')) {
  errors.push('createFallbackResult must use source: "demo-manual"');
}

if (!createFallbackResult.includes('status: "fallback"')) {
  errors.push('createFallbackResult must use status: "fallback"');
}

for (const [name, functionText] of [
  ["createRealResult", createRealResult],
  ["createRealArrayResult", createRealArrayResult],
]) {
  if (!functionText.includes('source: "real-derived"')) {
    errors.push(`${name} must use source: "real-derived"`);
  }

  if (!functionText.includes('status: "active"')) {
    errors.push(`${name} must use status: "active"`);
  }
}

for (const [name, functionText] of [
  ["createSampleResult", createSampleResult],
  ["createSampleArrayResult", createSampleArrayResult],
]) {
  if (!functionText.includes('source: "sample-derived"')) {
    errors.push(`${name} must use source: "sample-derived"`);
  }

  if (!functionText.includes('status: "sample"')) {
    errors.push(`${name} must use status: "sample"`);
  }
}

const coverageSummary = extractFunction(
  scoreAdaptersText,
  "getScoreAdapterCoverageSummary",
);

for (const requiredCoverage of [
  "playerScores: samplePlayerDerivedScores.length",
  "teamScores: sampleTeamDerivedScores.length",
  "mapFitScores: sampleMapFitScores.length",
  "rosterValueScores: sampleRosterValueScores.length",
  "realPlayerScores: realPlayerDerivedScores.length",
  "realTeamScores: realTeamDerivedScores.length",
  "realMapFitScores: realMapFitScores.length",
  "realRosterValueScores: realRosterValueScores.length",
]) {
  if (!coverageSummary.includes(requiredCoverage)) {
    errors.push(`getScoreAdapterCoverageSummary should include ${requiredCoverage}`);
  }
}

const pageAdapterImports = [];
const blockedAllowSamplePages = [];
const blockedSampleHelperPages = [];
const blockedDirectDataPages = [];

for (const filePath of findSourceFiles(files.pagesDir)) {
  const text = readFileSync(filePath, "utf8");
  const pagePath = normalizePath(filePath);

  if (text.includes("scoreAdapters")) {
    pageAdapterImports.push(pagePath);
  }

  if (pagePath !== samplePagePath && /allowSample\s*:\s*true/.test(text)) {
    blockedAllowSamplePages.push(pagePath);
  }

  if (pagePath !== samplePagePath && /\bgetSample[A-Z]\w*\s*\(/.test(text)) {
    blockedSampleHelperPages.push(pagePath);
  }

  if (
    pagePath !== samplePagePath &&
    (text.includes("sampleDerivedScores") || text.includes("realDerivedScores"))
  ) {
    blockedDirectDataPages.push(pagePath);
  }
}

for (const pagePath of blockedAllowSamplePages) {
  errors.push(`Public page must not pass allowSample: true: ${pagePath}`);
}

for (const pagePath of blockedSampleHelperPages) {
  errors.push(`Public page must not call getSample* helpers: ${pagePath}`);
}

for (const pagePath of blockedDirectDataPages) {
  errors.push(`Public page must not import derived score arrays directly: ${pagePath}`);
}

console.log("ClutchLab score adapters validation");
console.log("-----------------------------------");
console.log(`Expected generic helpers: ${expectedGenericHelpers.length}`);
console.log(`Expected sample helpers:  ${expectedSampleHelpers.length}`);
console.log(`Expected result fields:  ${expectedResultFields.length}`);
console.log(`Page adapter imports:    ${pageAdapterImports.length}`);
console.log(`allowSample violations:  ${blockedAllowSamplePages.length}`);
console.log(`getSample violations:    ${blockedSampleHelperPages.length}`);
console.log(`direct data violations:  ${blockedDirectDataPages.length}`);

if (errors.length > 0) {
  console.error("\nValidation failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("\nValidation passed.");
