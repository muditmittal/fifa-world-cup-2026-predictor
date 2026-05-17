import {
  basePoints,
  Match,
  REMAINING_MATCHES,
  Team,
  TEAMS,
  TEAM_ORDER,
  TeamId,
} from "./data";

export type Predictions = Record<number, TeamId | "TIE" | undefined>;

export type StandingRow = {
  team: Team;
  played: number;
  won: number;
  lost: number;
  noResult: number;
  points: number;
  nrr: number;
  // Bonus info for the UI
  remaining: number;
  predicted: number; // wins added by predictions
  rank: number;
  qualified: boolean;
};

export function computeStandings(predictions: Predictions): StandingRow[] {
  const rows = TEAM_ORDER.map<Omit<StandingRow, "rank" | "qualified">>(
    (id) => {
      const team = TEAMS[id];
      const remainingForTeam = REMAINING_MATCHES.filter(
        (m) => m.team1 === id || m.team2 === id
      );
      let predictedWins = 0;
      let predictedLosses = 0;
      let predictedNR = 0;
      for (const m of remainingForTeam) {
        const pick = predictions[m.id];
        if (!pick) continue;
        if (pick === "TIE") {
          predictedNR += 1;
        } else if (pick === id) {
          predictedWins += 1;
        } else {
          predictedLosses += 1;
        }
      }
      const won = team.won + predictedWins;
      const lost = team.lost + predictedLosses;
      const noResult = team.noResult + predictedNR;
      const played = won + lost + noResult;
      const points = won * 2 + noResult;
      return {
        team,
        played,
        won,
        lost,
        noResult,
        points,
        nrr: team.nrr,
        remaining: remainingForTeam.length,
        predicted: predictedWins,
      };
    }
  );

  // Sort: points desc, then NRR desc, then current points desc as final tiebreak
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.nrr !== a.nrr) return b.nrr - a.nrr;
    return basePoints(b.team) - basePoints(a.team);
  });

  return rows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
    qualified: idx < 4,
  }));
}

export function totalCompletedPredictions(predictions: Predictions): number {
  return Object.values(predictions).filter((v) => v !== undefined).length;
}

export function getMatch(id: number): Match | undefined {
  return REMAINING_MATCHES.find((m) => m.id === id);
}
