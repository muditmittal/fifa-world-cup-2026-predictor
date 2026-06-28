/**
 * Group stage match results for all 72 matches.
 * Used to display team history on hover.
 */

export interface GroupMatch {
  date: string;
  group: string;
  teamA: string; // code
  teamB: string; // code
  scoreA: number;
  scoreB: number;
}

export const groupMatches: GroupMatch[] = [
  // Group A
  { date: "Jun 11", group: "A", teamA: "MEX", teamB: "RSA", scoreA: 2, scoreB: 0 },
  { date: "Jun 11", group: "A", teamA: "KOR", teamB: "CZE", scoreA: 2, scoreB: 1 },
  { date: "Jun 18", group: "A", teamA: "CZE", teamB: "RSA", scoreA: 1, scoreB: 1 },
  { date: "Jun 18", group: "A", teamA: "MEX", teamB: "KOR", scoreA: 1, scoreB: 0 },
  { date: "Jun 24", group: "A", teamA: "MEX", teamB: "CZE", scoreA: 3, scoreB: 0 },
  { date: "Jun 24", group: "A", teamA: "RSA", teamB: "KOR", scoreA: 1, scoreB: 0 },

  // Group B
  { date: "Jun 12", group: "B", teamA: "CAN", teamB: "BIH", scoreA: 1, scoreB: 1 },
  { date: "Jun 13", group: "B", teamA: "SUI", teamB: "QAT", scoreA: 1, scoreB: 1 },
  { date: "Jun 18", group: "B", teamA: "SUI", teamB: "BIH", scoreA: 4, scoreB: 1 },
  { date: "Jun 18", group: "B", teamA: "CAN", teamB: "QAT", scoreA: 6, scoreB: 0 },
  { date: "Jun 24", group: "B", teamA: "SUI", teamB: "CAN", scoreA: 3, scoreB: 1 },
  { date: "Jun 24", group: "B", teamA: "BIH", teamB: "QAT", scoreA: 3, scoreB: 1 },

  // Group C
  { date: "Jun 13", group: "C", teamA: "BRA", teamB: "MAR", scoreA: 1, scoreB: 1 },
  { date: "Jun 13", group: "C", teamA: "SCO", teamB: "HAI", scoreA: 1, scoreB: 0 },
  { date: "Jun 19", group: "C", teamA: "SCO", teamB: "MAR", scoreA: 0, scoreB: 1 },
  { date: "Jun 19", group: "C", teamA: "BRA", teamB: "HAI", scoreA: 3, scoreB: 0 },
  { date: "Jun 24", group: "C", teamA: "SCO", teamB: "BRA", scoreA: 0, scoreB: 3 },
  { date: "Jun 24", group: "C", teamA: "MAR", teamB: "HAI", scoreA: 4, scoreB: 2 },

  // Group D
  { date: "Jun 12", group: "D", teamA: "USA", teamB: "PAR", scoreA: 4, scoreB: 1 },
  { date: "Jun 13", group: "D", teamA: "AUS", teamB: "TUR", scoreA: 2, scoreB: 0 },
  { date: "Jun 19", group: "D", teamA: "USA", teamB: "AUS", scoreA: 2, scoreB: 0 },
  { date: "Jun 19", group: "D", teamA: "TUR", teamB: "PAR", scoreA: 0, scoreB: 1 },
  { date: "Jun 25", group: "D", teamA: "TUR", teamB: "USA", scoreA: 3, scoreB: 2 },
  { date: "Jun 25", group: "D", teamA: "PAR", teamB: "AUS", scoreA: 0, scoreB: 0 },

  // Group E
  { date: "Jun 14", group: "E", teamA: "GER", teamB: "CUW", scoreA: 7, scoreB: 1 },
  { date: "Jun 14", group: "E", teamA: "CIV", teamB: "ECU", scoreA: 1, scoreB: 0 },
  { date: "Jun 20", group: "E", teamA: "GER", teamB: "CIV", scoreA: 2, scoreB: 1 },
  { date: "Jun 20", group: "E", teamA: "ECU", teamB: "CUW", scoreA: 0, scoreB: 0 },
  { date: "Jun 25", group: "E", teamA: "CIV", teamB: "CUW", scoreA: 2, scoreB: 0 },
  { date: "Jun 25", group: "E", teamA: "ECU", teamB: "GER", scoreA: 2, scoreB: 1 },

  // Group F
  { date: "Jun 14", group: "F", teamA: "NED", teamB: "TUN", scoreA: 4, scoreB: 0 },
  { date: "Jun 14", group: "F", teamA: "JPN", teamB: "SWE", scoreA: 1, scoreB: 1 },
  { date: "Jun 20", group: "F", teamA: "NED", teamB: "JPN", scoreA: 1, scoreB: 1 },
  { date: "Jun 20", group: "F", teamA: "SWE", teamB: "TUN", scoreA: 3, scoreB: 0 },
  { date: "Jun 26", group: "F", teamA: "JPN", teamB: "TUN", scoreA: 3, scoreB: 0 },
  { date: "Jun 26", group: "F", teamA: "NED", teamB: "SWE", scoreA: 3, scoreB: 2 },

  // Group G
  { date: "Jun 15", group: "G", teamA: "BEL", teamB: "EGY", scoreA: 1, scoreB: 1 },
  { date: "Jun 16", group: "G", teamA: "IRN", teamB: "NZL", scoreA: 2, scoreB: 2 },
  { date: "Jun 21", group: "G", teamA: "BEL", teamB: "IRN", scoreA: 0, scoreB: 0 },
  { date: "Jun 22", group: "G", teamA: "NZL", teamB: "EGY", scoreA: 1, scoreB: 3 },
  { date: "Jun 27", group: "G", teamA: "EGY", teamB: "IRN", scoreA: 1, scoreB: 1 },
  { date: "Jun 27", group: "G", teamA: "NZL", teamB: "BEL", scoreA: 1, scoreB: 5 },

  // Group H
  { date: "Jun 15", group: "H", teamA: "ESP", teamB: "KSA", scoreA: 3, scoreB: 0 },
  { date: "Jun 15", group: "H", teamA: "CPV", teamB: "URU", scoreA: 1, scoreB: 1 },
  { date: "Jun 21", group: "H", teamA: "ESP", teamB: "CPV", scoreA: 1, scoreB: 1 },
  { date: "Jun 21", group: "H", teamA: "URU", teamB: "KSA", scoreA: 1, scoreB: 1 },
  { date: "Jun 26", group: "H", teamA: "ESP", teamB: "URU", scoreA: 3, scoreB: 1 },
  { date: "Jun 26", group: "H", teamA: "CPV", teamB: "KSA", scoreA: 0, scoreB: 0 },

  // Group I
  { date: "Jun 16", group: "I", teamA: "FRA", teamB: "IRQ", scoreA: 3, scoreB: 0 },
  { date: "Jun 16", group: "I", teamA: "NOR", teamB: "SEN", scoreA: 1, scoreB: 0 },
  { date: "Jun 22", group: "I", teamA: "FRA", teamB: "NOR", scoreA: 2, scoreB: 1 },
  { date: "Jun 22", group: "I", teamA: "SEN", teamB: "IRQ", scoreA: 5, scoreB: 0 },
  { date: "Jun 27", group: "I", teamA: "FRA", teamB: "SEN", scoreA: 3, scoreB: 0 },
  { date: "Jun 27", group: "I", teamA: "NOR", teamB: "IRQ", scoreA: 3, scoreB: 0 },

  // Group J
  { date: "Jun 16", group: "J", teamA: "ARG", teamB: "ALG", scoreA: 4, scoreB: 1 },
  { date: "Jun 17", group: "J", teamA: "AUT", teamB: "JOR", scoreA: 3, scoreB: 1 },
  { date: "Jun 22", group: "J", teamA: "ARG", teamB: "AUT", scoreA: 3, scoreB: 1 },
  { date: "Jun 22", group: "J", teamA: "ALG", teamB: "JOR", scoreA: 1, scoreB: 0 },
  { date: "Jun 27", group: "J", teamA: "ARG", teamB: "JOR", scoreA: 3, scoreB: 1 },
  { date: "Jun 27", group: "J", teamA: "ALG", teamB: "AUT", scoreA: 3, scoreB: 3 },

  // Group K
  { date: "Jun 17", group: "K", teamA: "COL", teamB: "UZB", scoreA: 3, scoreB: 0 },
  { date: "Jun 17", group: "K", teamA: "POR", teamB: "COD", scoreA: 2, scoreB: 0 },
  { date: "Jun 23", group: "K", teamA: "COL", teamB: "POR", scoreA: 2, scoreB: 2 },
  { date: "Jun 23", group: "K", teamA: "COD", teamB: "UZB", scoreA: 1, scoreB: 1 },
  { date: "Jun 27", group: "K", teamA: "POR", teamB: "UZB", scoreA: 2, scoreB: 0 },
  { date: "Jun 27", group: "K", teamA: "COL", teamB: "COD", scoreA: 2, scoreB: 1 },

  // Group L
  { date: "Jun 17", group: "L", teamA: "ENG", teamB: "PAN", scoreA: 3, scoreB: 0 },
  { date: "Jun 18", group: "L", teamA: "CRO", teamB: "GHA", scoreA: 2, scoreB: 1 },
  { date: "Jun 23", group: "L", teamA: "ENG", teamB: "CRO", scoreA: 1, scoreB: 1 },
  { date: "Jun 23", group: "L", teamA: "GHA", teamB: "PAN", scoreA: 2, scoreB: 0 },
  { date: "Jun 27", group: "L", teamA: "ENG", teamB: "GHA", scoreA: 1, scoreB: 0 },
  { date: "Jun 27", group: "L", teamA: "CRO", teamB: "PAN", scoreA: 3, scoreB: 0 },
];

export function getTeamGroupHistory(teamCode: string): {
  date: string;
  opponent: string;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
}[] {
  const history: {
    date: string;
    opponent: string;
    goalsFor: number;
    goalsAgainst: number;
    result: "W" | "D" | "L";
  }[] = [];

  for (const match of groupMatches) {
    if (match.teamA === teamCode) {
      history.push({
        date: match.date,
        opponent: match.teamB,
        goalsFor: match.scoreA,
        goalsAgainst: match.scoreB,
        result: match.scoreA > match.scoreB ? "W" : match.scoreA < match.scoreB ? "L" : "D",
      });
    } else if (match.teamB === teamCode) {
      history.push({
        date: match.date,
        opponent: match.teamA,
        goalsFor: match.scoreB,
        goalsAgainst: match.scoreA,
        result: match.scoreB > match.scoreA ? "W" : match.scoreB < match.scoreA ? "L" : "D",
      });
    }
  }

  return history;
}
