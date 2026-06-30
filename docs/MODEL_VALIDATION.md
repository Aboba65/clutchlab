# Model Validation

ClutchLab has a source-text validation script for the real-stat model scaffolds.

This validation does not validate live statistics. It checks that the current
source metadata, raw-stat model and derived-score model remain internally
consistent.

## Command

```bash
npm run validate:models
```

## Script

```text
scripts/validate-models.mjs
```

## Files checked

```text
src/data/sources.ts
src/data/rawStats.ts
src/data/derivedScores.ts
```

## What it validates

```text
[✓] rawStatDatasetMeta status is valid
[✓] derivedScoreDatasetMeta status is valid
[✓] rawStatFieldGroups contains required groups
[✓] rawStatFieldGroups contains required baseline fields
[✓] derivedScoreFieldGroups contains required groups
[✓] derivedScoreFieldGroups contains required baseline fields
[✓] scoreFormulaScaffolds is not empty
[✓] score formula ids are unique
[✓] every formula has name, version and description
[✓] every formula has a valid scale
[✓] every formula has valid confidence
[✓] every formula declares sourceIds
[✓] formula sourceIds exist in src/data/sources.ts
[✓] every formula declares inputFields
[✓] every formula declares outputFields
[✓] formula outputFields match derivedScoreFieldGroups where mapped
[✓] low-confidence formulas include notes
```

## Release workflow

Model validation is now part of:

```bash
npm run release:check
```

Release check runs:

```bash
npm run generate:sitemap
npm run validate:data
npm run validate:sources
npm run validate:models
npm run lint
npm run format:check
npm run build
```

## CI workflow

GitHub Actions also runs:

```bash
npm run validate:models
```

Workflow file:

```text
.github/workflows/ci.yml
```

## Why this matters

The project now has a future data architecture:

```text
source metadata → raw stats → derived scores → UI scores
```

The validator guards the model scaffolds so future changes do not silently break
that structure.

## Limitations

The current validator is source-text based, not AST-based.

It is useful for the current TypeScript scaffold, but if the data layer becomes
JSON, a backend or a generated artifact, the validator should be updated to read
from the new canonical source.

## Recommended next step

After this validation step, update project documentation:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```
