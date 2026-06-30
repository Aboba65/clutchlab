export type RatingExplanationItem = {
  label: string;
  explanation: string;
};

export const defaultRatingExplanationItems: RatingExplanationItem[] = [
  {
    label: "Rating",
    explanation:
      "A demo/manual MVP value used to test comparison and roster-building logic. It is not a live official player rating.",
  },
  {
    label: "Price",
    explanation:
      "An internal MVP budget value used by Roster Builder. It is not a transfer value, salary, buyout or market price.",
  },
  {
    label: "Value",
    explanation:
      "A product score that compares MVP usefulness against internal budget cost. It is not an official esports metric.",
  },
  {
    label: "Clutch",
    explanation:
      "A score category for late-round and high-pressure impact. In the current MVP, this is not calculated from live match data.",
  },
  {
    label: "Impact",
    explanation:
      "A broad score category for overall influence. Current public pages still use demo/manual MVP values.",
  },
  {
    label: "Map fit",
    explanation:
      "A product score describing fit for a map. Current public map-fit values are MVP/demo values.",
  },
];

export const defaultRatingExplanationFooter =
  "Current ratings, prices and product scores are demo/manual MVP values, not live official esports statistics.";
