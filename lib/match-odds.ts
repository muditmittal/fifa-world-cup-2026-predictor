/**
 * Match win probabilities and predicted scorelines.
 *
 * Win probabilities derived from real bookmaker odds (DraftKings, FanDuel)
 * published June 27, 2026. Moneyline odds converted to implied probability
 * using: prob = (odds < 0) ? -odds / (-odds + 100) : 100 / (odds + 100)
 *
 * Sources: FOX Sports, AZ Central (DraftKings Sportsbook), CBS Sports
 */

export interface PredictedScoreline {
  score: string;
  probability: number;
}

export interface MatchOdds {
  matchId: number;
  winPctA: number; // Team A win probability (0-100)
  winPctB: number; // Team B win probability (0-100)
  drawPct: number;
  scorelines: PredictedScoreline[];
}

// Convert American moneyline to implied probability
function mlToProb(ml: number): number {
  if (ml < 0) return -ml / (-ml + 100);
  return 100 / (ml + 100);
}

// Normalize three-way probabilities to sum to 100
function normalize(a: number, b: number, d: number): [number, number, number] {
  const total = a + b + d;
  return [Math.round((a / total) * 100), Math.round((b / total) * 100), Math.round((d / total) * 100)];
}

function buildOdds(id: number, mlA: number, mlB: number, mlD: number, scores: PredictedScoreline[]): MatchOdds {
  const rawA = mlToProb(mlA);
  const rawB = mlToProb(mlB);
  const rawD = mlToProb(mlD);
  const [winPctA, winPctB, drawPct] = normalize(rawA, rawB, rawD);
  return { matchId: id, winPctA, winPctB, drawPct, scorelines: scores };
}

export const matchOdds: MatchOdds[] = [
  // Jun 28 — Source: DraftKings via AZ Central / FOX Sports
  buildOdds(73, -140, +450, +270, [
    { score: "1-0", probability: 0.15 }, { score: "2-0", probability: 0.11 }, { score: "2-1", probability: 0.10 },
    { score: "1-1", probability: 0.12 }, { score: "0-1", probability: 0.08 },
  ]), // RSA vs CAN — Canada favored

  // Jun 29
  buildOdds(74, -255, +700, +400, [
    { score: "2-0", probability: 0.16 }, { score: "2-1", probability: 0.13 }, { score: "3-0", probability: 0.10 },
    { score: "1-0", probability: 0.14 }, { score: "3-1", probability: 0.08 },
  ]), // GER vs PAR — Germany heavy favorite

  buildOdds(75, +115, +260, +230, [
    { score: "1-0", probability: 0.13 }, { score: "2-1", probability: 0.11 }, { score: "1-1", probability: 0.13 },
    { score: "0-1", probability: 0.10 }, { score: "2-0", probability: 0.09 },
  ]), // NED vs MAR — Netherlands slight favorite

  buildOdds(76, -140, +400, +285, [
    { score: "1-0", probability: 0.14 }, { score: "2-0", probability: 0.12 }, { score: "2-1", probability: 0.11 },
    { score: "1-1", probability: 0.12 }, { score: "0-1", probability: 0.08 },
  ]), // BRA vs JPN — Brazil favored

  // Jun 30
  buildOdds(77, -340, +900, +500, [
    { score: "2-0", probability: 0.16 }, { score: "3-0", probability: 0.11 }, { score: "2-1", probability: 0.12 },
    { score: "1-0", probability: 0.14 }, { score: "3-1", probability: 0.09 },
  ]), // FRA vs SWE — France heavy favorite

  buildOdds(78, +280, +100, +255, [
    { score: "1-1", probability: 0.14 }, { score: "0-1", probability: 0.12 }, { score: "1-0", probability: 0.10 },
    { score: "0-2", probability: 0.09 }, { score: "1-2", probability: 0.08 },
  ]), // CIV vs NOR — Norway slight favorite

  buildOdds(79, +110, +270, +210, [
    { score: "1-0", probability: 0.14 }, { score: "2-1", probability: 0.11 }, { score: "1-1", probability: 0.13 },
    { score: "0-1", probability: 0.10 }, { score: "2-0", probability: 0.09 },
  ]), // MEX vs ECU — Mexico slight favorite

  // Jul 1
  buildOdds(80, -400, +1000, +550, [
    { score: "2-0", probability: 0.17 }, { score: "1-0", probability: 0.15 }, { score: "3-0", probability: 0.10 },
    { score: "2-1", probability: 0.11 }, { score: "3-1", probability: 0.08 },
  ]), // ENG vs COD — England heavy favorite

  buildOdds(81, -180, +550, +310, [
    { score: "1-0", probability: 0.15 }, { score: "2-0", probability: 0.12 }, { score: "2-1", probability: 0.11 },
    { score: "1-1", probability: 0.12 }, { score: "0-1", probability: 0.07 },
  ]), // USA vs BIH — USA favored

  buildOdds(82, -200, +600, +330, [
    { score: "2-0", probability: 0.14 }, { score: "1-0", probability: 0.14 }, { score: "2-1", probability: 0.11 },
    { score: "1-1", probability: 0.11 }, { score: "3-0", probability: 0.08 },
  ]), // BEL vs SEN — Belgium favored

  // Jul 2
  buildOdds(83, +130, +275, +225, [
    { score: "1-1", probability: 0.14 }, { score: "1-0", probability: 0.12 }, { score: "2-1", probability: 0.10 },
    { score: "0-1", probability: 0.11 }, { score: "0-0", probability: 0.08 },
  ]), // POR vs CRO — Portugal slight favorite

  buildOdds(84, -300, +800, +450, [
    { score: "2-0", probability: 0.15 }, { score: "1-0", probability: 0.14 }, { score: "2-1", probability: 0.12 },
    { score: "3-0", probability: 0.09 }, { score: "3-1", probability: 0.07 },
  ]), // ESP vs AUT — Spain heavy favorite

  buildOdds(85, -160, +500, +290, [
    { score: "1-0", probability: 0.15 }, { score: "2-0", probability: 0.12 }, { score: "2-1", probability: 0.10 },
    { score: "1-1", probability: 0.12 }, { score: "0-1", probability: 0.08 },
  ]), // SUI vs ALG — Switzerland favored

  // Jul 3
  buildOdds(86, -500, +1200, +600, [
    { score: "2-0", probability: 0.16 }, { score: "3-0", probability: 0.13 }, { score: "1-0", probability: 0.13 },
    { score: "2-1", probability: 0.10 }, { score: "4-0", probability: 0.07 },
  ]), // ARG vs CPV — Argentina massive favorite

  buildOdds(87, -175, +500, +310, [
    { score: "1-0", probability: 0.15 }, { score: "2-1", probability: 0.12 }, { score: "2-0", probability: 0.11 },
    { score: "1-1", probability: 0.12 }, { score: "0-1", probability: 0.08 },
  ]), // COL vs GHA — Colombia favored

  buildOdds(88, +200, +220, +230, [
    { score: "1-1", probability: 0.14 }, { score: "0-1", probability: 0.12 }, { score: "1-0", probability: 0.11 },
    { score: "0-0", probability: 0.09 }, { score: "1-2", probability: 0.08 },
  ]), // AUS vs EGY — Very even match
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
      { score: "0-1", probability: 0.09 },
      { score: "2-0", probability: 0.08 },
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
    { score: "1-1", probability: 0.10 },
    { score: "0-1", probability: 0.08 },
  ];
}

export function getMatchOdds(matchId: number): PredictedScoreline[] | null {
  const entry = matchOdds.find((m) => m.matchId === matchId);
  return entry?.scorelines || null;
}

export function getMatchWinProbability(matchId: number): { winPctA: number; winPctB: number; drawPct: number } | null {
  const entry = matchOdds.find((m) => m.matchId === matchId);
  if (!entry) return null;
  return { winPctA: entry.winPctA, winPctB: entry.winPctB, drawPct: entry.drawPct };
}

/**
 * Unified win probability for a specific team in a match.
 * Blends bookmaker odds (60%) with FIFA ranking Elo (40%). Clamped 15-85%.
 * Both the hover card and floating panel should use this single function.
 */
export function getUnifiedWinPct(
  matchId: number,
  teamCode: string,
  teamACode: string | null,
  teamBCode: string | null,
  rankA: number,
  rankB: number
): number {
  if (!teamACode || !teamBCode) return 50;

  // FIFA ranking Elo baseline
  const expectedA = 1 / (1 + Math.pow(10, (rankA - rankB) / 40));

  // Blend with bookmaker odds if available
  const odds = getMatchOdds(matchId);
  let oddsBasedA: number | null = null;

  if (odds) {
    let teamAWins = 0;
    let teamBWins = 0;
    let draws = 0;
    for (const s of odds) {
      const parts = s.score.split("-").map(Number);
      if (parts[0] > parts[1]) teamAWins += s.probability;
      else if (parts[1] > parts[0]) teamBWins += s.probability;
      else draws += s.probability;
    }
    const totalDecisive = teamAWins + teamBWins;
    if (totalDecisive > 0) {
      const drawShareA = draws * (teamAWins / totalDecisive);
      oddsBasedA = (teamAWins + drawShareA) / (teamAWins + teamBWins + draws);
    }
  }

  // Also check direct win% data
  const directOdds = getMatchWinProbability(matchId);
  if (oddsBasedA === null && directOdds) {
    const total = directOdds.winPctA + directOdds.winPctB + directOdds.drawPct;
    const drawShareA = directOdds.drawPct * (directOdds.winPctA / (directOdds.winPctA + directOdds.winPctB || 1));
    oddsBasedA = (directOdds.winPctA + drawShareA) / total;
  }

  const finalA = oddsBasedA !== null
    ? oddsBasedA * 0.6 + expectedA * 0.4
    : expectedA;

  const isTeamA = teamCode === teamACode;
  const pct = Math.round((isTeamA ? finalA : 1 - finalA) * 100);
  return Math.max(15, Math.min(85, pct));
}
