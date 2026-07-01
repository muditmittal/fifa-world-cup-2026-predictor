/**
 * FIFA World Cup 2026 Tournament Data
 *
 * Sources:
 * - FIFA.com official match schedule & results
 * - Sporting News (sportingnews.com) — group standings & knockout bracket
 * - NBC Sports — final group stage tables
 * - Wikipedia — 2026 FIFA World Cup knockout stage
 *
 * Last updated: June 27, 2026
 */

export interface Team {
  name: string;
  code: string;
  flag: string;
  group: string;
  groupPosition: number; // 1=winner, 2=runner-up, 3=third
}

export interface GroupStanding {
  group: string;
  teams: {
    name: string;
    code: string;
    flag: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
    qualified: boolean;
    position: number;
  }[];
}

export interface BracketMatch {
  id: number;
  round: "R32" | "R16" | "QF" | "SF" | "F" | "3RD";
  date: string;
  venue: string;
  teamA: Team | null;
  teamB: Team | null;
  feedsInto: number | null; // match ID this winner feeds into
  feedsIntoSlot: "A" | "B" | null;
}

export const groups: GroupStanding[] = [
  {
    group: "A",
    teams: [
      { name: "Mexico", code: "MEX", flag: "🇲🇽", played: 3, won: 3, drawn: 0, lost: 0, gf: 6, ga: 0, gd: 6, points: 9, qualified: true, position: 1 },
      { name: "South Africa", code: "RSA", flag: "🇿🇦", played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, points: 4, qualified: true, position: 2 },
      { name: "South Korea", code: "KOR", flag: "🇰🇷", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 3, gd: -1, points: 3, qualified: false, position: 3 },
      { name: "Czechia", code: "CZE", flag: "🇨🇿", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 6, gd: -4, points: 1, qualified: false, position: 4 },
    ],
  },
  {
    group: "B",
    teams: [
      { name: "Switzerland", code: "SUI", flag: "🇨🇭", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 3, gd: 4, points: 7, qualified: true, position: 1 },
      { name: "Canada", code: "CAN", flag: "🇨🇦", played: 3, won: 1, drawn: 1, lost: 1, gf: 8, ga: 3, gd: 5, points: 4, qualified: true, position: 2 },
      { name: "Bosnia & Herzegovina", code: "BIH", flag: "🇧🇦", played: 3, won: 1, drawn: 1, lost: 1, gf: 5, ga: 6, gd: -1, points: 4, qualified: true, position: 3 },
      { name: "Qatar", code: "QAT", flag: "🇶🇦", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 10, gd: -8, points: 1, qualified: false, position: 4 },
    ],
  },
  {
    group: "C",
    teams: [
      { name: "Brazil", code: "BRA", flag: "🇧🇷", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 1, gd: 6, points: 7, qualified: true, position: 1 },
      { name: "Morocco", code: "MAR", flag: "🇲🇦", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 3, gd: 3, points: 7, qualified: true, position: 2 },
      { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", played: 3, won: 1, drawn: 0, lost: 2, gf: 1, ga: 4, gd: -3, points: 3, qualified: false, position: 3 },
      { name: "Haiti", code: "HAI", flag: "🇭🇹", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 8, gd: -6, points: 0, qualified: false, position: 4 },
    ],
  },
  {
    group: "D",
    teams: [
      { name: "United States", code: "USA", flag: "🇺🇸", played: 3, won: 2, drawn: 0, lost: 1, gf: 8, ga: 4, gd: 4, points: 6, qualified: true, position: 1 },
      { name: "Australia", code: "AUS", flag: "🇦🇺", played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0, points: 4, qualified: true, position: 2 },
      { name: "Paraguay", code: "PAR", flag: "🇵🇾", played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 4, gd: -2, points: 4, qualified: true, position: 3 },
      { name: "Turkey", code: "TUR", flag: "🇹🇷", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, gd: -2, points: 3, qualified: false, position: 4 },
    ],
  },
  {
    group: "E",
    teams: [
      { name: "Germany", code: "GER", flag: "🇩🇪", played: 3, won: 2, drawn: 0, lost: 1, gf: 10, ga: 4, gd: 6, points: 6, qualified: true, position: 1 },
      { name: "Ivory Coast", code: "CIV", flag: "🇨🇮", played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 2, gd: 2, points: 6, qualified: true, position: 2 },
      { name: "Ecuador", code: "ECU", flag: "🇪🇨", played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0, points: 4, qualified: true, position: 3 },
      { name: "Curaçao", code: "CUW", flag: "🇨🇼", played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 9, gd: -8, points: 1, qualified: false, position: 4 },
    ],
  },
  {
    group: "F",
    teams: [
      { name: "Netherlands", code: "NED", flag: "🇳🇱", played: 3, won: 2, drawn: 1, lost: 0, gf: 8, ga: 2, gd: 6, points: 7, qualified: true, position: 1 },
      { name: "Japan", code: "JPN", flag: "🇯🇵", played: 3, won: 1, drawn: 2, lost: 0, gf: 5, ga: 1, gd: 4, points: 5, qualified: true, position: 2 },
      { name: "Sweden", code: "SWE", flag: "🇸🇪", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, gd: 0, points: 4, qualified: true, position: 3 },
      { name: "Tunisia", code: "TUN", flag: "🇹🇳", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 10, gd: -10, points: 0, qualified: false, position: 4 },
    ],
  },
  {
    group: "G",
    teams: [
      { name: "Belgium", code: "BEL", flag: "🇧🇪", played: 3, won: 1, drawn: 2, lost: 0, gf: 6, ga: 3, gd: 3, points: 5, qualified: true, position: 1 },
      { name: "Egypt", code: "EGY", flag: "🇪🇬", played: 3, won: 1, drawn: 2, lost: 0, gf: 5, ga: 3, gd: 2, points: 5, qualified: true, position: 2 },
      { name: "Iran", code: "IRN", flag: "🇮🇷", played: 3, won: 0, drawn: 3, lost: 0, gf: 3, ga: 3, gd: 0, points: 3, qualified: false, position: 3 },
      { name: "New Zealand", code: "NZL", flag: "🇳🇿", played: 3, won: 0, drawn: 1, lost: 2, gf: 4, ga: 9, gd: -5, points: 1, qualified: false, position: 4 },
    ],
  },
  {
    group: "H",
    teams: [
      { name: "Spain", code: "ESP", flag: "🇪🇸", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2, gd: 5, points: 7, qualified: true, position: 1 },
      { name: "Cape Verde", code: "CPV", flag: "🇨🇻", played: 3, won: 0, drawn: 3, lost: 0, gf: 2, ga: 2, gd: 0, points: 3, qualified: true, position: 2 },
      { name: "Uruguay", code: "URU", flag: "🇺🇾", played: 3, won: 0, drawn: 2, lost: 1, gf: 2, ga: 3, gd: -1, points: 2, qualified: false, position: 3 },
      { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", played: 3, won: 0, drawn: 2, lost: 1, gf: 1, ga: 5, gd: -4, points: 2, qualified: false, position: 4 },
    ],
  },
  {
    group: "I",
    teams: [
      { name: "France", code: "FRA", flag: "🇫🇷", played: 3, won: 3, drawn: 0, lost: 0, gf: 8, ga: 0, gd: 8, points: 9, qualified: true, position: 1 },
      { name: "Norway", code: "NOR", flag: "🇳🇴", played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd: 1, points: 6, qualified: true, position: 2 },
      { name: "Senegal", code: "SEN", flag: "🇸🇳", played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 6, gd: -1, points: 3, qualified: true, position: 3 },
      { name: "Iraq", code: "IRQ", flag: "🇮🇶", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 8, gd: -8, points: 0, qualified: false, position: 4 },
    ],
  },
  {
    group: "J",
    teams: [
      { name: "Argentina", code: "ARG", flag: "🇦🇷", played: 3, won: 3, drawn: 0, lost: 0, gf: 10, ga: 3, gd: 7, points: 9, qualified: true, position: 1 },
      { name: "Austria", code: "AUT", flag: "🇦🇹", played: 3, won: 1, drawn: 1, lost: 1, gf: 6, ga: 6, gd: 0, points: 4, qualified: true, position: 2 },
      { name: "Algeria", code: "ALG", flag: "🇩🇿", played: 3, won: 1, drawn: 1, lost: 1, gf: 5, ga: 7, gd: -2, points: 4, qualified: true, position: 3 },
      { name: "Jordan", code: "JOR", flag: "🇯🇴", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 7, gd: -5, points: 0, qualified: false, position: 4 },
    ],
  },
  {
    group: "K",
    teams: [
      { name: "Colombia", code: "COL", flag: "🇨🇴", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, gd: 3, points: 7, qualified: true, position: 1 },
      { name: "Portugal", code: "POR", flag: "🇵🇹", played: 3, won: 1, drawn: 2, lost: 0, gf: 6, ga: 1, gd: 5, points: 5, qualified: true, position: 2 },
      { name: "DR Congo", code: "COD", flag: "🇨🇩", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, gd: 0, points: 4, qualified: true, position: 3 },
      { name: "Uzbekistan", code: "UZB", flag: "🇺🇿", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 5, gd: -5, points: 0, qualified: false, position: 4 },
    ],
  },
  {
    group: "L",
    teams: [
      { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, gd: 4, points: 7, qualified: true, position: 1 },
      { name: "Croatia", code: "CRO", flag: "🇭🇷", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, gd: 2, points: 6, qualified: true, position: 2 },
      { name: "Ghana", code: "GHA", flag: "🇬🇭", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, gd: 0, points: 4, qualified: true, position: 3 },
      { name: "Panama", code: "PAN", flag: "🇵🇦", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 6, gd: -6, points: 0, qualified: false, position: 4 },
    ],
  },
];

function t(name: string, code: string, flag: string, group: string, pos: number): Team {
  return { name, code, flag, group, groupPosition: pos };
}

export const qualifiedTeams: Record<string, Team> = {
  MEX: t("Mexico", "MEX", "🇲🇽", "A", 1),
  RSA: t("South Africa", "RSA", "🇿🇦", "A", 2),
  SUI: t("Switzerland", "SUI", "🇨🇭", "B", 1),
  CAN: t("Canada", "CAN", "🇨🇦", "B", 2),
  BIH: t("Bosnia & Herzegovina", "BIH", "🇧🇦", "B", 3),
  BRA: t("Brazil", "BRA", "🇧🇷", "C", 1),
  MAR: t("Morocco", "MAR", "🇲🇦", "C", 2),
  USA: t("United States", "USA", "🇺🇸", "D", 1),
  AUS: t("Australia", "AUS", "🇦🇺", "D", 2),
  PAR: t("Paraguay", "PAR", "🇵🇾", "D", 3),
  GER: t("Germany", "GER", "🇩🇪", "E", 1),
  CIV: t("Ivory Coast", "CIV", "🇨🇮", "E", 2),
  ECU: t("Ecuador", "ECU", "🇪🇨", "E", 3),
  NED: t("Netherlands", "NED", "🇳🇱", "F", 1),
  JPN: t("Japan", "JPN", "🇯🇵", "F", 2),
  SWE: t("Sweden", "SWE", "🇸🇪", "F", 3),
  BEL: t("Belgium", "BEL", "🇧🇪", "G", 1),
  EGY: t("Egypt", "EGY", "🇪🇬", "G", 2),
  ESP: t("Spain", "ESP", "🇪🇸", "H", 1),
  CPV: t("Cape Verde", "CPV", "🇨🇻", "H", 2),
  FRA: t("France", "FRA", "🇫🇷", "I", 1),
  NOR: t("Norway", "NOR", "🇳🇴", "I", 2),
  SEN: t("Senegal", "SEN", "🇸🇳", "I", 3),
  ALG: t("Algeria", "ALG", "🇩🇿", "J", 3),
  COD: t("DR Congo", "COD", "🇨🇩", "K", 3),
  ARG: t("Argentina", "ARG", "🇦🇷", "J", 1),
  AUT: t("Austria", "AUT", "🇦🇹", "J", 2),
  COL: t("Colombia", "COL", "🇨🇴", "K", 1),
  POR: t("Portugal", "POR", "🇵🇹", "K", 2),
  ENG: t("England", "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "L", 1),
  CRO: t("Croatia", "CRO", "🇭🇷", "L", 2),
  GHA: t("Ghana", "GHA", "🇬🇭", "L", 3),
};

export interface MatchFixture {
  id: number;
  round: "R32" | "R16" | "QF" | "SF" | "F" | "3RD";
  date: string;
  venue: string;
  teamACode: string | null;
  teamBCode: string | null;
  nextMatchId: number | null;
  nextSlot: "A" | "B" | null;
  bracketSide: "left" | "right";
}

export const bracket: MatchFixture[] = [
  // Round of 32 — Left side (ordered by R16 pairing adjacency)
  { id: 74, round: "R32", date: "Jun 29", venue: "Boston", teamACode: "GER", teamBCode: "PAR", nextMatchId: 89, nextSlot: "A", bracketSide: "left" },
  { id: 77, round: "R32", date: "Jun 30", venue: "New York", teamACode: "FRA", teamBCode: "SWE", nextMatchId: 89, nextSlot: "B", bracketSide: "left" },
  { id: 73, round: "R32", date: "Jun 28", venue: "Los Angeles", teamACode: "RSA", teamBCode: "CAN", nextMatchId: 90, nextSlot: "A", bracketSide: "left" },
  { id: 75, round: "R32", date: "Jun 29", venue: "Monterrey", teamACode: "NED", teamBCode: "MAR", nextMatchId: 90, nextSlot: "B", bracketSide: "left" },
  { id: 76, round: "R32", date: "Jun 29", venue: "Houston", teamACode: "BRA", teamBCode: "JPN", nextMatchId: 91, nextSlot: "A", bracketSide: "left" },
  { id: 78, round: "R32", date: "Jun 30", venue: "Dallas", teamACode: "CIV", teamBCode: "NOR", nextMatchId: 91, nextSlot: "B", bracketSide: "left" },
  { id: 79, round: "R32", date: "Jun 30", venue: "Mexico City", teamACode: "MEX", teamBCode: "ECU", nextMatchId: 92, nextSlot: "A", bracketSide: "left" },
  { id: 80, round: "R32", date: "Jul 1", venue: "Atlanta", teamACode: "ENG", teamBCode: "COD", nextMatchId: 92, nextSlot: "B", bracketSide: "left" },

  // Round of 32 — Right side (ordered by R16 pairing adjacency)
  { id: 83, round: "R32", date: "Jul 2", venue: "Toronto", teamACode: "POR", teamBCode: "CRO", nextMatchId: 93, nextSlot: "A", bracketSide: "right" },
  { id: 84, round: "R32", date: "Jul 2", venue: "Los Angeles", teamACode: "ESP", teamBCode: "AUT", nextMatchId: 93, nextSlot: "B", bracketSide: "right" },
  { id: 81, round: "R32", date: "Jul 1", venue: "San Francisco", teamACode: "USA", teamBCode: "BIH", nextMatchId: 94, nextSlot: "A", bracketSide: "right" },
  { id: 82, round: "R32", date: "Jul 1", venue: "Seattle", teamACode: "BEL", teamBCode: "SEN", nextMatchId: 94, nextSlot: "B", bracketSide: "right" },
  { id: 86, round: "R32", date: "Jul 3", venue: "Miami", teamACode: "ARG", teamBCode: "CPV", nextMatchId: 95, nextSlot: "A", bracketSide: "right" },
  { id: 88, round: "R32", date: "Jul 3", venue: "Dallas", teamACode: "AUS", teamBCode: "EGY", nextMatchId: 95, nextSlot: "B", bracketSide: "right" },
  { id: 85, round: "R32", date: "Jul 2", venue: "Vancouver", teamACode: "SUI", teamBCode: "ALG", nextMatchId: 96, nextSlot: "A", bracketSide: "right" },
  { id: 87, round: "R32", date: "Jul 3", venue: "Kansas City", teamACode: "COL", teamBCode: "GHA", nextMatchId: 96, nextSlot: "B", bracketSide: "right" },

  // Round of 16
  { id: 89, round: "R16", date: "Jul 4", venue: "Philadelphia", teamACode: null, teamBCode: null, nextMatchId: 97, nextSlot: "A", bracketSide: "left" },
  { id: 90, round: "R16", date: "Jul 4", venue: "Houston", teamACode: null, teamBCode: null, nextMatchId: 97, nextSlot: "B", bracketSide: "left" },
  { id: 91, round: "R16", date: "Jul 5", venue: "New York", teamACode: null, teamBCode: null, nextMatchId: 99, nextSlot: "A", bracketSide: "left" },
  { id: 92, round: "R16", date: "Jul 5", venue: "Mexico City", teamACode: null, teamBCode: null, nextMatchId: 99, nextSlot: "B", bracketSide: "left" },
  { id: 93, round: "R16", date: "Jul 6", venue: "Dallas", teamACode: null, teamBCode: null, nextMatchId: 98, nextSlot: "A", bracketSide: "right" },
  { id: 94, round: "R16", date: "Jul 6", venue: "Seattle", teamACode: null, teamBCode: null, nextMatchId: 98, nextSlot: "B", bracketSide: "right" },
  { id: 95, round: "R16", date: "Jul 7", venue: "Atlanta", teamACode: null, teamBCode: null, nextMatchId: 100, nextSlot: "A", bracketSide: "right" },
  { id: 96, round: "R16", date: "Jul 7", venue: "Vancouver", teamACode: null, teamBCode: null, nextMatchId: 100, nextSlot: "B", bracketSide: "right" },

  // Quarter-finals
  { id: 97, round: "QF", date: "Jul 9", venue: "Boston", teamACode: null, teamBCode: null, nextMatchId: 101, nextSlot: "A", bracketSide: "left" },
  { id: 98, round: "QF", date: "Jul 10", venue: "Los Angeles", teamACode: null, teamBCode: null, nextMatchId: 101, nextSlot: "B", bracketSide: "right" },
  { id: 99, round: "QF", date: "Jul 11", venue: "Miami", teamACode: null, teamBCode: null, nextMatchId: 102, nextSlot: "A", bracketSide: "left" },
  { id: 100, round: "QF", date: "Jul 11", venue: "Kansas City", teamACode: null, teamBCode: null, nextMatchId: 102, nextSlot: "B", bracketSide: "right" },

  // Semi-finals
  { id: 101, round: "SF", date: "Jul 14", venue: "New York", teamACode: null, teamBCode: null, nextMatchId: 104, nextSlot: "A", bracketSide: "left" },
  { id: 102, round: "SF", date: "Jul 15", venue: "Dallas", teamACode: null, teamBCode: null, nextMatchId: 104, nextSlot: "B", bracketSide: "right" },

  // Third-place playoff
  { id: 103, round: "3RD", date: "Jul 18", venue: "Miami", teamACode: null, teamBCode: null, nextMatchId: null, nextSlot: null, bracketSide: "left" },

  // Final
  { id: 104, round: "F", date: "Jul 19", venue: "New York", teamACode: null, teamBCode: null, nextMatchId: null, nextSlot: null, bracketSide: "left" },
];

export const roundLabels: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-Finals",
  SF: "Semi-Finals",
  F: "Final",
  "3RD": "3rd Place",
};
