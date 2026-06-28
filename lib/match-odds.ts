/**
 * Predicted scorelines for each match.
 * Primary: scraped from betting odds (correct score markets).
 * Fallback: computed from team goal averages in group stage.
 *
 * Sources: Oddschecker, Betfair exchange odds (pre-match correct score markets)
 * Last compiled: June 27, 2026
 */

export interface PredictedScoreline {
  score: string; // "1-0", "2-1", etc. (teamA-teamB)
  probability: number; // 0.0 to 1.0
}

export interface MatchOdds {
  matchId: number;
  scorelines: PredictedScoreline[];
}

export const matchOdds: MatchOdds[] = [
  // R32 — Left side
  { matchId: 73, scorelines: [{ score: "0-1", probability: 0.14 }, { score: "1-1", probability: 0.12 }, { score: "0-2", probability: 0.10 }] }, // RSA vs CAN
  { matchId: 74, scorelines: [{ score: "2-0", probability: 0.15 }, { score: "2-1", probability: 0.13 }, { score: "3-0", probability: 0.09 }] }, // GER vs PAR
  { matchId: 75, scorelines: [{ score: "2-1", probability: 0.14 }, { score: "1-0", probability: 0.13 }, { score: "2-0", probability: 0.11 }] }, // NED vs MAR
  { matchId: 76, scorelines: [{ score: "1-0", probability: 0.14 }, { score: "2-1", probability: 0.12 }, { score: "2-0", probability: 0.10 }] }, // BRA vs JPN
  { matchId: 77, scorelines: [{ score: "2-0", probability: 0.16 }, { score: "2-1", probability: 0.13 }, { score: "3-0", probability: 0.10 }] }, // FRA vs SWE
  { matchId: 78, scorelines: [{ score: "1-1", probability: 0.13 }, { score: "1-0", probability: 0.12 }, { score: "0-1", probability: 0.11 }] }, // CIV vs NOR
  { matchId: 79, scorelines: [{ score: "1-0", probability: 0.15 }, { score: "2-0", probability: 0.12 }, { score: "2-1", probability: 0.11 }] }, // MEX vs ECU
  { matchId: 80, scorelines: [{ score: "2-0", probability: 0.16 }, { score: "1-0", probability: 0.14 }, { score: "3-0", probability: 0.09 }] }, // ENG vs COD

  // R32 — Right side
  { matchId: 81, scorelines: [{ score: "2-0", probability: 0.14 }, { score: "1-0", probability: 0.13 }, { score: "2-1", probability: 0.12 }] }, // USA vs BIH
  { matchId: 82, scorelines: [{ score: "2-0", probability: 0.13 }, { score: "1-0", probability: 0.13 }, { score: "2-1", probability: 0.11 }] }, // BEL vs SEN
  { matchId: 83, scorelines: [{ score: "1-1", probability: 0.13 }, { score: "1-0", probability: 0.12 }, { score: "2-1", probability: 0.11 }] }, // POR vs CRO
  { matchId: 84, scorelines: [{ score: "2-0", probability: 0.15 }, { score: "2-1", probability: 0.12 }, { score: "3-0", probability: 0.10 }] }, // ESP vs AUT
  { matchId: 85, scorelines: [{ score: "1-0", probability: 0.15 }, { score: "2-0", probability: 0.13 }, { score: "2-1", probability: 0.10 }] }, // SUI vs ALG
  { matchId: 86, scorelines: [{ score: "3-0", probability: 0.14 }, { score: "2-0", probability: 0.14 }, { score: "3-1", probability: 0.10 }] }, // ARG vs CPV
  { matchId: 87, scorelines: [{ score: "1-0", probability: 0.14 }, { score: "2-1", probability: 0.12 }, { score: "2-0", probability: 0.11 }] }, // COL vs GHA
  { matchId: 88, scorelines: [{ score: "1-1", probability: 0.13 }, { score: "0-1", probability: 0.12 }, { score: "1-0", probability: 0.11 }] }, // AUS vs EGY
];

/**
 * For knockout matches beyond R32, compute suggested scorelines
 * based on team goal averages from group stage.
 */
export function computeFallbackScorelines(
  teamACode: string,
  teamBCode: string,
  groupGoals: Record<string, { gf: number; ga: number; played: number }>
): PredictedScoreline[] {
  const a = groupGoals[teamACode];
  const b = groupGoals[teamBCode];

  if (!a || !b) {
    return [
      { score: "1-0", probability: 0.13 },
      { score: "2-1", probability: 0.11 },
      { score: "1-1", probability: 0.10 },
    ];
  }

  const avgA = a.gf / a.played;
  const avgB = b.gf / b.played;

  const topScore = `${Math.round(avgA)}-${Math.max(0, Math.round(avgA) - 1)}`;
  const midScore = `${Math.round(avgA)}-${Math.round(avgB)}`;
  const lowScore = `${Math.max(1, Math.round(avgA) - 1)}-${Math.round(avgB)}`;

  return [
    { score: topScore, probability: 0.14 },
    { score: midScore, probability: 0.11 },
    { score: lowScore, probability: 0.10 },
  ];
}

export function getMatchOdds(matchId: number): PredictedScoreline[] | null {
  const entry = matchOdds.find((m) => m.matchId === matchId);
  return entry?.scorelines || null;
}
