import type { PlayerRole } from "../types";

export type RoleConfig = {
  id: string;
  role: PlayerRole;
  title: string;
  identity: string;
  description: string;
  needs: string[];
  bestUse: string[];
  rosterAdvice: string;
};

export const roleConfigs: RoleConfig[] = [
  {
    id: "awper",
    role: "AWPer",
    title: "AWPer",
    identity: "angle control, opening picks, late-round stability",
    description:
      "The AWPer controls long sightlines, punishes dry peeks and changes how opponents path around the map. In roster construction, this is usually a premium slot that needs structure and trading support around it.",
    needs: ["Strong angle discipline", "Reliable first contact", "Late-round composure", "Space from riflers"],
    bestUse: ["Give them clear protocols", "Pair with a high-pressure rifler", "Avoid overpaying for a second pure AWP"],
    rosterAdvice:
      "Build around one primary AWPer, then spend the remaining budget on entry pressure, structure and at least one stable anchor.",
  },
  {
    id: "entry",
    role: "Entry",
    title: "Entry",
    identity: "space creation, first contact, T-side pressure",
    description:
      "Entry players create space by taking the first fight and forcing rotations. Their value is not only K/D: a good entry makes the next duel easier for the whole pack.",
    needs: ["Trading support", "Utility behind them", "Confidence in first contact", "A structured caller"],
    bestUse: ["Pair with star riflers", "Do not judge only by deaths", "Use them on high-entry maps"],
    rosterAdvice:
      "A strong roster usually needs at least one real entry profile. Pair entry pressure with a trader and a structured IGL.",
  },
  {
    id: "star-rifler",
    role: "Star Rifler",
    title: "Star Rifler",
    identity: "rifle carry, multi-kill threat, damage engine",
    description:
      "Star riflers are the main rifle damage engine. They must convert space into kills, win hard duels and stay valuable across both sides.",
    needs: ["Space from entries", "Good trade spacing", "Freedom in mid-rounds", "Utility support"],
    bestUse: ["Use as a core damage piece", "Pair with a lower-cost support", "Give them maps with rifle pressure"],
    rosterAdvice:
      "A star rifler is worth paying for if the roster still has enough budget for AWP, IGL and anchor stability.",
  },
  {
    id: "lurker",
    role: "Lurker",
    title: "Lurker",
    identity: "timings, map pressure, late-round punishment",
    description:
      "Lurkers punish rotations, preserve pressure away from the pack and create late-round options. Their best rounds often start before the final duel happens.",
    needs: ["Patience", "Map awareness", "Late-round clutch value", "Clear team spacing"],
    bestUse: ["Use on rotation-heavy maps", "Pair with active pack players", "Avoid too many passive profiles together"],
    rosterAdvice:
      "A lurker fits best when the team already has entry pressure and needs map control, timings and late-round value.",
  },
  {
    id: "anchor",
    role: "Anchor",
    title: "Anchor",
    identity: "site defense, CT stability, low-mistake play",
    description:
      "Anchors hold difficult sites, absorb pressure and reduce chaos on CT side. The role is not always flashy, but it determines whether the team collapses under executes.",
    needs: ["Utility discipline", "Survival under pressure", "Good positioning", "Reliable communication"],
    bestUse: ["Prioritize on CT-sided maps", "Pair with aggressive rotators", "Do not overload roster with greedy stars"],
    rosterAdvice:
      "A stable anchor is a good budget/value slot when the rest of the roster already has firepower and opening pressure.",
  },
  {
    id: "support",
    role: "Support",
    title: "Support",
    identity: "utility, trading setup, star enablement",
    description:
      "Support players make stars easier to use. They flash entries, stabilize executes, trade correctly and keep the team functional when raw firepower is not enough.",
    needs: ["Utility knowledge", "Team-first decisions", "Trading discipline", "High KAST value"],
    bestUse: ["Pair with premium stars", "Use to fix greedy rosters", "Value KAST and consistency over raw rating"],
    rosterAdvice:
      "Support is a strong balancing role. Add it when the roster has enough star power but lacks structure and utility discipline.",
  },
  {
    id: "igl",
    role: "IGL",
    title: "IGL",
    identity: "calling, structure, tempo control",
    description:
      "The IGL sets the pace, controls mid-round decisions and gives the roster an actual operating system. Rating matters, but structure is the core value.",
    needs: ["Mid-round clarity", "Role management", "Map pool understanding", "Enough firepower around them"],
    bestUse: ["Pair with stars", "Do not overvalue raw stats", "Use to raise structure score"],
    rosterAdvice:
      "Most roster-builder lineups need one IGL. If you skip the role, the team may look strong on firepower but weak on structure.",
  },
  {
    id: "flex",
    role: "Flex",
    title: "Flex",
    identity: "adaptability, secondary roles, roster glue",
    description:
      "Flex players patch holes. They can cover multiple roles, adjust to maps and give the roster more room to spend elsewhere.",
    needs: ["Adaptability", "Good baseline mechanics", "Role discipline", "Map-to-map flexibility"],
    bestUse: ["Use to complete role balance", "Pair with specialists", "Value consistency and hybrid weapon profile"],
    rosterAdvice:
      "Flex is best as the final roster piece when you already know what the team lacks: rifle output, secondary AWP, CT stability or clutch value.",
  },
];