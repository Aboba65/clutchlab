# Rating Explanation Plan

This document defines a safe plan for explaining current ClutchLab ratings,
scores and MVP values in simple user-facing language.

It is documentation only.

No UI, routing, scoring, sorting, validation or data behavior is changed by this
document.

## Purpose

ClutchLab currently has useful MVP pages, but many values are still demo/manual
or internal product scores.

Before replacing scores with real-derived data, the product should explain what
current values mean and what they do not mean.

This improves user trust without changing scoring logic.

## Current status

```text
public ratings: demo/manual MVP values
sample scores: preview-only
real-derived scores: planned empty scaffold
generic adapters: implemented
ScorePreviewCard: component foundation only
public scoring migration: not started
```

## Core message

The product should communicate this clearly:

```text
Current ratings and prices are demo/manual MVP values used to test the product.
They are not live official esports statistics.
```

## Non-goals

This plan must not:

```text
[ ] change player ratings
[ ] change team ratings
[ ] change map scores
[ ] change role scores
[ ] change compare logic
[ ] change roster-builder scoring
[ ] change catalog sorting
[ ] use sample-derived rows on public pages
[ ] add fake real-derived rows
[ ] claim current scores are official
```

## Current score surfaces

### Player pages

Likely user-facing values:

```text
rating
role
region
team
price
traits
map fit
form-like display fields
```

Current meaning:

```text
demo/manual profile values for MVP testing
```

### Team pages

Likely user-facing values:

```text
team score
region
ranking-like display
map strengths
style/traits
```

Current meaning:

```text
demo/manual team values for MVP testing
```

### Maps pages

Likely user-facing values:

```text
map difficulty
T/CT balance
role fit
team/player fit notes
```

Current meaning:

```text
manual product values, not live map statistics
```

### Compare pages

Likely user-facing values:

```text
side-by-side player/team comparison
relative strengths
score-like visual comparison
```

Current meaning:

```text
comparison of current MVP values, not official ranking
```

### Roster Builder

Likely user-facing values:

```text
budget
player price
role balance
map fit
value score
warnings
```

Current meaning:

```text
internal MVP scoring for roster-building logic
```

## Terms to explain

### Rating

Suggested copy:

```text
A manual MVP rating used to test player comparison and roster-building logic.
It is not a live official player rating.
```

### Price

Suggested copy:

```text
An internal MVP budget value used by Roster Builder. It is not a transfer value,
salary, buyout or market price.
```

### Value

Suggested copy:

```text
A product score that compares a player's MVP rating and role usefulness against
their internal budget price.
```

### Clutch

Suggested copy:

```text
A score category for late-round and high-pressure impact. In the current MVP,
this is not calculated from live match data.
```

### Impact

Suggested copy:

```text
A broad score category for overall influence. In the current MVP, public pages
still use demo/manual values.
```

### Opening

Suggested copy:

```text
A score category for opening-duel style impact. In the current MVP, this is not
a live stat.
```

### Map fit

Suggested copy:

```text
A product score describing how well a player, team or roster fits a map. Current
public map-fit values are MVP/demo values.
```

### Role fit

Suggested copy:

```text
A product score describing how well a player fits a selected roster role.
```

### Team score

Suggested copy:

```text
A manual MVP score used to compare teams inside the product. It is not an
official world ranking.
```

## User-facing disclaimer patterns

### Short disclaimer

```text
Demo/manual MVP value — not live official statistics.
```

### Medium disclaimer

```text
This value is used for MVP testing and product logic. It is not a live official
CS2 statistic.
```

### Roster Builder disclaimer

```text
Prices and value scores are internal MVP values for roster-building experiments.
They are not market prices, salaries or official ratings.
```

### Compare disclaimer

```text
Comparison uses the current MVP dataset. It should be read as a product preview,
not as an official ranking.
```

## Tooltip plan

Future tooltips should be short, consistent and visible near score labels.

Suggested tooltip component:

```text
src/components/InfoTooltip.tsx
```

Suggested props:

```ts
type InfoTooltipProps = {
  label: string;
  content: string;
};
```

Tooltip rules:

```text
[✓] one sentence if possible
[✓] no long methodology paragraphs
[✓] avoid "official"
[✓] avoid "live" unless saying "not live"
[✓] explain whether the value affects sorting/scoring
```

## Rating explanation card plan

Future component:

```text
src/components/RatingExplanationCard.tsx
```

Suggested props:

```ts
type RatingExplanationCardProps = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    explanation: string;
  }>;
};
```

Suggested use:

```text
player detail pages
team detail pages
roster-builder sidebar
about/methodology page
```

## Recommended route order

### First safe route

```text
/about
```

Reason:

```text
Methodology/explanation content belongs there and has low risk.
```

### Second safe route

```text
/roster-builder
```

Reason:

```text
Budget and price misunderstandings are likely. A small explanation block would
help users understand that values are internal MVP values.
```

### Third safe route

```text
/players/:playerId
```

Reason:

```text
Player detail pages are safer than catalog pages because they do not drive global
sorting.
```

### Later routes

```text
/teams/:teamId
/maps/:mapId
/compare
/team-compare
```

### Last routes

```text
/players
/teams
/maps
```

Reason:

```text
Catalog pages have sorting/filtering context. Explanations should not imply that
sorting is official ranking.
```

## About page methodology section

Recommended section title:

```text
How to read current ratings
```

Recommended copy:

```text
ClutchLab currently uses demo/manual MVP values to test navigation, comparison,
roster-building and score display. These values are not live official esports
statistics. Future real-derived scores will be shown with source, period,
confidence and fallback metadata.
```

Recommended bullets:

```text
ratings are MVP values
prices are internal budget values
sample-derived scores are preview-only
real-derived scores are planned
public scoring will not change until coverage gates pass
```

## Roster Builder explanation section

Recommended section title:

```text
How budget values work
```

Recommended copy:

```text
Player prices and roster value scores are internal MVP values. They help test
budget and role-balance logic, but they do not represent real salaries, buyouts
or transfer values.
```

## Player detail explanation section

Recommended section title:

```text
How to read this player rating
```

Recommended copy:

```text
This player rating is a demo/manual MVP value. It helps test comparison and
roster-building features. It is not a live official rating.
```

## Team detail explanation section

Recommended section title:

```text
How to read this team score
```

Recommended copy:

```text
This team score is a manual MVP value used for product testing. It is not an
official world ranking.
```

## Copy rules

Avoid:

```text
official rating
live ranking
real score
market price
salary
buyout
guaranteed best
```

Prefer:

```text
MVP value
demo/manual value
product score
internal budget value
preview score
not live official statistics
```

## Visual rules

Explanation UI should be:

```text
subtle
short
near the score it explains
consistent across routes
not visually louder than the primary page content
```

Good UI patterns:

```text
small info icon
compact explanation card
collapsible methodology note
footer methodology link
```

Bad UI patterns:

```text
large warning banner on every card
long paragraphs inside catalogs
blocking modals
red error-style warnings
```

## Validation expectations

Later validation can check that explanation copy exists in key files.

Possible future checks:

```text
[ ] About page includes "demo/manual"
[ ] About page includes "not live official"
[ ] Roster Builder includes "internal MVP values"
[ ] public pages do not say "official rating"
[ ] public pages do not say "market price"
[ ] public pages do not say "salary"
```

## Relationship to ScorePreviewCard

`ScorePreviewCard` explains adapter-derived preview data.

Rating explanation work explains existing MVP/manual values.

They are related but not the same:

```text
ScorePreviewCard → future derived score source/status/fallback metadata
RatingExplanationCard → current MVP/manual rating and price explanations
```

## Relationship to real-derived scores

When real-derived scores exist, explanation copy should evolve from:

```text
demo/manual MVP value
```

to:

```text
derived score with source, period and confidence metadata
```

Do not remove demo/manual explanations until public pages are fully migrated.

## Safe implementation checklist

Before adding explanation UI:

```text
[ ] choose one low-risk route
[ ] use short copy
[ ] do not alter score calculations
[ ] do not alter sorting
[ ] do not alter roster-builder value logic
[ ] avoid official/live wording
[ ] run release:check
```

## Suggested first implementation

First implementation should add only:

```text
src/components/RatingExplanationCard.tsx
```

and optionally mount it on:

```text
/about
```

Do not mount it on catalog pages first.

## Recommended versioning

This is still part of the infrastructure/explanation layer:

```text
0.2.11 — Rating explanation foundation
```

A future `0.3.0` should be reserved for the first public detail-page derived
preview block or another clearly visible product-facing scoring milestone.
