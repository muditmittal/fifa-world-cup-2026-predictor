/**
 * Actual match results — update this file as real results come in.
 * The "Sync Results" button in the UI reads from this file.
 *
 * Format: { matchId, winner (team code), score (display string) }
 *
 * Match IDs:
 * R32: 73-88  |  R16: 89-96  |  QF: 97-100  |  SF: 101-102  |  F: 103  |  3rd: 104
 */

export interface ActualResult {
  matchId: number;
  winner: string;
  score: string;
}

export const actualResults: ActualResult[] = [
  // Round of 32 results — add as matches are played
  // { matchId: 73, winner: "CAN", score: "2-1" },
  // { matchId: 74, winner: "GER", score: "3-0" },
  // { matchId: 75, winner: "NED", score: "2-1" },
  // { matchId: 76, winner: "BRA", score: "1-0" },
  // { matchId: 77, winner: "FRA", score: "3-1" },
  // { matchId: 78, winner: "CIV", score: "2-1" },
  // { matchId: 79, winner: "MEX", score: "1-0" },
  // { matchId: 80, winner: "ENG", score: "2-0" },
  // { matchId: 81, winner: "USA", score: "2-0" },
  // { matchId: 82, winner: "BEL", score: "3-1" },
  // { matchId: 83, winner: "POR", score: "2-1 (aet)" },
  // { matchId: 84, winner: "ESP", score: "4-0" },
  // { matchId: 85, winner: "SUI", score: "1-1 (5-4 pen)" },
  // { matchId: 86, winner: "ARG", score: "3-0" },
  // { matchId: 87, winner: "COL", score: "2-1" },
  // { matchId: 88, winner: "AUS", score: "1-0" },
];
