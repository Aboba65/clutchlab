import type { PlayerRole } from "../types";

export type CS2MapProfile = {
  id: string;
  name: string;
  identity: string;
  sideProfile: "CT-sided" | "T-sided" | "Balanced";
  tSideDifficulty: number;
  ctSideStrength: number;
  awpValue: number;
  entryValue: number;
  anchorPressure: number;
  bestRoles: PlayerRole[];
  summary: string;
};

export const maps: CS2MapProfile[] = [
  {
    id: "mirage",
    name: "Mirage",
    identity: "default-heavy, mid-control, aim-duel map",
    sideProfile: "Balanced",
    tSideDifficulty: 66,
    ctSideStrength: 68,
    awpValue: 82,
    entryValue: 78,
    anchorPressure: 70,
    bestRoles: ["AWPer", "Entry", "Star Rifler"],
    summary:
      "Mirage rewards mid control, AWP presence and strong trading. It is the easiest map to understand visually, but elite teams separate themselves through timings, connector control and late-round discipline.",
  },
  {
    id: "nuke",
    name: "Nuke",
    identity: "rotation-heavy, vertical, CT-structure map",
    sideProfile: "CT-sided",
    tSideDifficulty: 84,
    ctSideStrength: 90,
    awpValue: 74,
    entryValue: 72,
    anchorPressure: 91,
    bestRoles: ["Anchor", "IGL", "AWPer"],
    summary:
      "Nuke is built around rotations, information denial and layered CT setups. Teams need structure, disciplined anchors and confident ramp/outside protocols.",
  },
  {
    id: "inferno",
    name: "Inferno",
    identity: "utility-heavy, banana-control, late-round map",
    sideProfile: "Balanced",
    tSideDifficulty: 78,
    ctSideStrength: 80,
    awpValue: 68,
    entryValue: 75,
    anchorPressure: 88,
    bestRoles: ["Support", "Anchor", "IGL"],
    summary:
      "Inferno is utility economy, banana control and late-round spacing. It punishes impatient entries and rewards support players who create clean executes.",
  },
  {
    id: "ancient",
    name: "Ancient",
    identity: "mid pressure, fast trades, compact rotations",
    sideProfile: "CT-sided",
    tSideDifficulty: 80,
    ctSideStrength: 86,
    awpValue: 76,
    entryValue: 83,
    anchorPressure: 84,
    bestRoles: ["Entry", "Anchor", "Star Rifler"],
    summary:
      "Ancient emphasizes mid pressure, cave control and fast trading. Teams with explosive riflers can create strong T-side pressure despite CT-favored zones.",
  },
  {
    id: "anubis",
    name: "Anubis",
    identity: "T-pressure, canal fights, retake-heavy sites",
    sideProfile: "T-sided",
    tSideDifficulty: 58,
    ctSideStrength: 64,
    awpValue: 70,
    entryValue: 86,
    anchorPressure: 82,
    bestRoles: ["Entry", "Star Rifler", "Support"],
    summary:
      "Anubis gives attackers many pressure points and rewards proactive entries. CT sides need retake structure, strong utility and anchors who survive first contact.",
  },
  {
    id: "dust2",
    name: "Dust2",
    identity: "long-range duels, AWP control, simple spacing",
    sideProfile: "Balanced",
    tSideDifficulty: 63,
    ctSideStrength: 67,
    awpValue: 91,
    entryValue: 82,
    anchorPressure: 72,
    bestRoles: ["AWPer", "Entry", "Star Rifler"],
    summary:
      "Dust2 is the classic duel map. AWP control, long fights and clean trading matter more than complex macro layers.",
  },
  {
    id: "train",
    name: "Train",
    identity: "long angles, utility layering, site anchors",
    sideProfile: "CT-sided",
    tSideDifficulty: 86,
    ctSideStrength: 88,
    awpValue: 88,
    entryValue: 70,
    anchorPressure: 90,
    bestRoles: ["AWPer", "Anchor", "IGL"],
    summary:
      "Train rewards long-angle discipline, strong AWP protocols and precise utility. T sides need patience and well-timed site splits.",
  },
];