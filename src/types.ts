export type PlayerRole =
  | "AWPer"
  | "Entry"
  | "Star Rifler"
  | "Lurker"
  | "Anchor"
  | "Support"
  | "IGL"
  | "Flex";

export type Region =
  | "Europe"
  | "CIS"
  | "North America"
  | "South America"
  | "Asia"
  | "International";

export type CS2Player = {
  id: string;
  nickname: string;
  country: string;
  teamId: string;
  role: PlayerRole;
  age: number;
  price: number;
  stats: {
    rating: number;
    adr: number;
    kd: number;
    kast: number;
    impact: number;
    clutch: number;
    opening: number;
    awp: number;
    rifle: number;
    consistency: number;
  };
  traits: string[];
};

export type CS2Team = {
  id: string;
  name: string;
  region: Region;
  players: string[];
  scores: {
    firepower: number;
    structure: number;
    mapPool: number;
    clutch: number;
    form: number;
  };
  bestMaps: string[];
};