import { type BracketState } from "./bracket-logic";
import { bracket, roundLabels } from "./tournament-data";

export interface MatchScore {
  matchId: number;
  round: string;
  teamA: string | null;
  teamB: string | null;
  predictedWinner: string | null;
  predictedScore: string | null;
  actualWinner: string | null;
  actualScore: string | null;
  winnerCorrect: boolean;
  scoreCorrect: boolean;
  points: number;
}

export interface ScoreSummary {
  totalPoints: number;
  matchesPlayed: number;
  correctWinners: number;
  correctScores: number;
  matchScores: MatchScore[];
}

export function calculateScore(state: BracketState): ScoreSummary {
  const matchScores: MatchScore[] = [];
  let totalPoints = 0;
  let matchesPlayed = 0;
  let correctWinners = 0;
  let correctScores = 0;

  for (const fixture of bracket) {
    const matchState = state.matches[fixture.id];
    if (!matchState || !matchState.isPlayed || !matchState.actualWinner) continue;

    matchesPlayed++;

    const winnerCorrect = matchState.predictedWinner === matchState.actualWinner;
    const scoreCorrect = winnerCorrect && !!matchState.predictedScore && !!matchState.actualScore &&
      normalizeScore(matchState.predictedScore) === normalizeScore(matchState.actualScore);

    let points = 0;
    if (winnerCorrect) {
      points += 10;
      correctWinners++;
    }
    if (scoreCorrect) {
      points += 10;
      correctScores++;
    }

    totalPoints += points;

    matchScores.push({
      matchId: fixture.id,
      round: roundLabels[fixture.round] || fixture.round,
      teamA: fixture.teamACode,
      teamB: fixture.teamBCode,
      predictedWinner: matchState.predictedWinner,
      predictedScore: matchState.predictedScore,
      actualWinner: matchState.actualWinner,
      actualScore: matchState.actualScore,
      winnerCorrect,
      scoreCorrect,
      points,
    });
  }

  return { totalPoints, matchesPlayed, correctWinners, correctScores, matchScores };
}

function normalizeScore(score: string): string {
  // Strip extra info like "(pen)" for comparison, just keep the numbers
  const match = score.match(/^(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return score;
  return `${match[1]}-${match[2]}`;
}
