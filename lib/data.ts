// IPL 2026 league data — current standings as of May 17, 2026
// (after match 61: RCB beat PBKS by 23 runs)

export type TeamId =
  | "RCB"
  | "GT"
  | "SRH"
  | "PBKS"
  | "RR"
  | "CSK"
  | "KKR"
  | "DC"
  | "MI"
  | "LSG";

export type Team = {
  id: TeamId;
  name: string;
  shortName: string;
  played: number;
  won: number;
  lost: number;
  noResult: number;
  nrr: number;
  // Brand colors used as accents
  primary: string;
  secondary: string;
};

export type Match = {
  id: number;
  date: string;
  team1: TeamId;
  team2: TeamId;
};

// "Locked-in" current standings from the live points table
// Points = won * 2 + noResult * 1
export const TEAMS: Record<TeamId, Team> = {
  RCB: {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    played: 13,
    won: 9,
    lost: 4,
    noResult: 0,
    nrr: 1.065,
    primary: "#EC1C24",
    secondary: "#000000",
  },
  GT: {
    id: "GT",
    name: "Gujarat Titans",
    shortName: "GT",
    played: 13,
    won: 8,
    lost: 5,
    noResult: 0,
    nrr: 0.4,
    primary: "#0B1E3F",
    secondary: "#C9A24A",
  },
  SRH: {
    id: "SRH",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    played: 12,
    won: 7,
    lost: 5,
    noResult: 0,
    nrr: 0.331,
    primary: "#F26522",
    secondary: "#000000",
  },
  PBKS: {
    id: "PBKS",
    name: "Punjab Kings",
    shortName: "PBKS",
    played: 13,
    won: 6,
    lost: 6,
    noResult: 1,
    nrr: 0.227,
    primary: "#D71920",
    secondary: "#A6A6A6",
  },
  RR: {
    id: "RR",
    name: "Rajasthan Royals",
    shortName: "RR",
    played: 11,
    won: 6,
    lost: 5,
    noResult: 0,
    nrr: 0.082,
    primary: "#EA1A85",
    secondary: "#0033A0",
  },
  CSK: {
    id: "CSK",
    name: "Chennai Super Kings",
    shortName: "CSK",
    played: 12,
    won: 6,
    lost: 6,
    noResult: 0,
    nrr: 0.027,
    primary: "#FFCB05",
    secondary: "#0081C8",
  },
  KKR: {
    id: "KKR",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    played: 12,
    won: 5,
    lost: 6,
    noResult: 1,
    nrr: -0.038,
    primary: "#3A225D",
    secondary: "#D4AF37",
  },
  DC: {
    id: "DC",
    name: "Delhi Capitals",
    shortName: "DC",
    played: 12,
    won: 5,
    lost: 7,
    noResult: 0,
    nrr: -0.993,
    primary: "#17449B",
    secondary: "#EF1B23",
  },
  MI: {
    id: "MI",
    name: "Mumbai Indians",
    shortName: "MI",
    played: 12,
    won: 4,
    lost: 8,
    noResult: 0,
    nrr: -0.504,
    primary: "#005DA0",
    secondary: "#D1AB3E",
  },
  LSG: {
    id: "LSG",
    name: "Lucknow Super Giants",
    shortName: "LSG",
    played: 12,
    won: 4,
    lost: 8,
    noResult: 0,
    nrr: -0.701,
    primary: "#0050A4",
    secondary: "#69D2E7",
  },
};

// Remaining matches in chronological order
export const REMAINING_MATCHES: Match[] = [
  { id: 62, date: "May 17", team1: "RR", team2: "DC" },
  { id: 63, date: "May 18", team1: "SRH", team2: "CSK" },
  { id: 64, date: "May 19", team1: "RR", team2: "LSG" },
  { id: 65, date: "May 20", team1: "KKR", team2: "MI" },
  { id: 66, date: "May 21", team1: "GT", team2: "CSK" },
  { id: 67, date: "May 22", team1: "RCB", team2: "SRH" },
  { id: 68, date: "May 23", team1: "PBKS", team2: "LSG" },
  { id: 69, date: "May 24", team1: "RR", team2: "MI" },
  { id: 70, date: "May 24", team1: "DC", team2: "KKR" },
];

export const TEAM_ORDER: TeamId[] = [
  "RCB",
  "GT",
  "SRH",
  "PBKS",
  "RR",
  "CSK",
  "KKR",
  "DC",
  "MI",
  "LSG",
];

export function basePoints(team: Team): number {
  return team.won * 2 + team.noResult;
}
