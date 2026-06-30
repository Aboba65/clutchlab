# Sample Data Preview Page

ClutchLab includes a product-facing preview page for the manual sample data layer.

## Route

```text
/sample-data
```

## Page file

```text
src/pages/SampleDataPage.tsx
```

## Purpose

The page shows the current manual sample raw stats and manual sample derived
scores in the actual ClutchLab interface without replacing the main demo/manual
player, team, map, compare or roster builder pages.

It is a bridge between the data architecture work and the future UI migration.

## Data shown

Raw sample data:

```text
samplePlayerRawStats
sampleTeamRawStats
sampleRawStatsSummary
sampleRawStatsMeta
```

Derived sample data:

```text
samplePlayerDerivedScores
sampleTeamDerivedScores
sampleMapFitScores
sampleRosterValueScores
sampleDerivedScoresSummary
sampleDerivedScoresMeta
```

## Source imports

The page imports from:

```text
src/data.ts
```

Compatibility exports are expected to include:

```text
samplePlayerRawStats
sampleTeamRawStats
sampleRawStatsSummary
sampleRawStatsMeta
samplePlayerDerivedScores
sampleTeamDerivedScores
sampleMapFitScores
sampleRosterValueScores
sampleDerivedScoresSummary
sampleDerivedScoresMeta
```

## Navigation

The page is linked in:

```text
src/config/navigation.ts
```

Navigation label:

```text
Sample Data
```

## Routing

The page is registered in:

```text
src/App.tsx
```

Route:

```tsx
<Route path="/sample-data" element={<SampleDataPage />} />
```

## SEO metadata

Route title and description are added in:

```text
src/hooks/usePageTitle.ts
```

Title:

```text
Sample Data Preview — ClutchLab
```

## Sitemap

The static route is added to:

```text
scripts/generate-sitemap.mjs
```

The route will appear in:

```text
public/sitemap.xml
```

after running:

```bash
npm run generate:sitemap
```

## Important boundary

This page is intentionally labeled:

```text
Sample only / not live stats
```

The data is not:

```text
[!] live scoring
[!] official esports data
[!] connected to the public player catalog scoring
[!] connected to the roster builder scoring
[!] a betting or prediction feature
```

## Recommended next step

After adding this page, update project documentation:

```text
README.md
CHANGELOG.md
docs/PROJECT_STATUS.md
src/components/Footer.tsx
```

Suggested version:

```text
0.2.3 Sample data preview page
```
