import { bracket, qualifiedTeams, type MatchFixture } from "./tournament-data";

export type MatchStatus = "unplayed" | "correct" | "incorrect" | "reevaluate";

export interface MatchState {
  matchId: number;
  predictedWinner: string | null;
  predictedScore: string | null; // e.g., "2-1" (user's predicted scoreline)
  actualWinner: string | null;
  actualScore: string | null; // e.g., "2-1" or "1-1 (4-3 pen)"
  isPlayed: boolean;
}

export interface BracketState {
  matches: Record<number, MatchState>;
  lastSynced: string | null;
}

export function createInitialState(): BracketState {
  const matches: Record<number, MatchState> = {};
  for (const fixture of bracket) {
    matches[fixture.id] = {
      matchId: fixture.id,
      predictedWinner: null,
      predictedScore: null,
      actualWinner: null,
      actualScore: null,
      isPlayed: false,
    };
  }
  return { matches, lastSynced: null };
}

export function getMatchStatus(state: BracketState, matchId: number): MatchStatus {
  const match = state.matches[matchId];
  if (!match) return "unplayed";

  if (match.isPlayed && match.actualWinner) {
    if (!match.predictedWinner) return "unplayed";
    return match.predictedWinner === match.actualWinner ? "correct" : "incorrect";
  }

  if (needsReevaluation(state, matchId)) {
    return "reevaluate";
  }

  return "unplayed";
}

function needsReevaluation(state: BracketState, matchId: number): boolean {
  const fixture = bracket.find((m) => m.id === matchId);
  if (!fixture) return false;

  const match = state.matches[matchId];
  if (!match?.predictedWinner) return false;
  if (match.isPlayed) return false;

  const feeders = bracket.filter(
    (m) => m.nextMatchId === matchId
  );

  for (const feeder of feeders) {
    const feederState = state.matches[feeder.id];
    if (feederState?.isPlayed && feederState.actualWinner) {
      const predictedTeamInSlot = getTeamInSlot(state, matchId, feeder.nextSlot!);
      if (predictedTeamInSlot && predictedTeamInSlot !== feederState.actualWinner) {
        return true;
      }
    }
  }

  return false;
}

function getTeamInSlot(state: BracketState, matchId: number, slot: "A" | "B"): string | null {
  const feeders = bracket.filter(
    (m) => m.nextMatchId === matchId && m.nextSlot === slot
  );
  if (feeders.length === 0) return null;

  const feeder = feeders[0];
  const feederState = state.matches[feeder.id];
  return feederState?.predictedWinner || null;
}

export function getEffectiveTeams(
  state: BracketState,
  matchId: number
): { teamA: string | null; teamB: string | null } {
  const fixture = bracket.find((m) => m.id === matchId)!;

  if (fixture.round === "R32") {
    return { teamA: fixture.teamACode, teamB: fixture.teamBCode };
  }

  // 3rd place match gets the LOSERS of the two semi-finals
  if (fixture.round === "3RD") {
    const sf1 = bracket.find((m) => m.id === 101);
    const sf2 = bracket.find((m) => m.id === 102);
    const sf1State = state.matches[101];
    const sf2State = state.matches[102];

    let teamA: string | null = null;
    let teamB: string | null = null;

    if (sf1 && sf1State) {
      const sf1Winner = sf1State.actualWinner || sf1State.predictedWinner;
      if (sf1Winner) {
        const { teamA: sf1A, teamB: sf1B } = getEffectiveTeams(state, 101);
        teamA = sf1A === sf1Winner ? sf1B : sf1A;
      }
    }
    if (sf2 && sf2State) {
      const sf2Winner = sf2State.actualWinner || sf2State.predictedWinner;
      if (sf2Winner) {
        const { teamA: sf2A, teamB: sf2B } = getEffectiveTeams(state, 102);
        teamB = sf2A === sf2Winner ? sf2B : sf2A;
      }
    }

    return { teamA, teamB };
  }

  const feeders = bracket.filter((m) => m.nextMatchId === matchId);
  let teamA: string | null = fixture.teamACode;
  let teamB: string | null = fixture.teamBCode;

  for (const feeder of feeders) {
    const feederState = state.matches[feeder.id];
    const winner = feederState?.actualWinner || feederState?.predictedWinner || null;
    if (feeder.nextSlot === "A") teamA = winner;
    if (feeder.nextSlot === "B") teamB = winner;
  }

  return { teamA, teamB };
}

export function setPrediction(
  state: BracketState,
  matchId: number,
  winnerCode: string
): BracketState {
  const currentPick = state.matches[matchId]?.predictedWinner;

  // If same team is already selected, just return current state (opens sidebar instead)
  if (currentPick === winnerCode) {
    return state;
  }

  const newState = { ...state, matches: { ...state.matches } };
  newState.matches[matchId] = {
    ...newState.matches[matchId],
    predictedWinner: winnerCode,
  };

  clearDownstreamPredictions(newState, matchId, winnerCode);

  return newState;
}

export function clearPrediction(
  state: BracketState,
  matchId: number
): BracketState {
  const newState = { ...state, matches: { ...state.matches } };
  const oldWinner = newState.matches[matchId]?.predictedWinner;

  newState.matches[matchId] = {
    ...newState.matches[matchId],
    predictedWinner: null,
  };

  if (oldWinner) {
    const fixture = bracket.find((m) => m.id === matchId)!;
    if (fixture.nextMatchId) {
      removeTeamDownstream(newState, fixture.nextMatchId, oldWinner);
    }
  }

  return newState;
}

function removeTeamDownstream(state: BracketState, matchId: number, team: string): void {
  const match = state.matches[matchId];
  if (!match) return;

  if (match.predictedWinner === team) {
    state.matches[matchId] = { ...match, predictedWinner: null };
  }

  const fixture = bracket.find((m) => m.id === matchId)!;
  if (fixture.nextMatchId) {
    removeTeamDownstream(state, fixture.nextMatchId, team);
  }
}

function clearDownstreamPredictions(
  state: BracketState,
  matchId: number,
  _newWinner: string
): void {
  const fixture = bracket.find((m) => m.id === matchId)!;
  if (!fixture.nextMatchId) return;

  const nextMatch = state.matches[fixture.nextMatchId];
  if (!nextMatch) return;

  const previousWinner = state.matches[matchId]?.predictedWinner;
  if (previousWinner && previousWinner !== _newWinner) {
    if (nextMatch.predictedWinner === previousWinner) {
      state.matches[fixture.nextMatchId] = {
        ...nextMatch,
        predictedWinner: null,
      };
      clearDownstreamPredictions(state, fixture.nextMatchId, "");
    }

    propagateClear(state, fixture.nextMatchId, previousWinner);
  }
}

function propagateClear(state: BracketState, matchId: number, eliminatedTeam: string): void {
  const fixture = bracket.find((m) => m.id === matchId)!;
  if (!fixture.nextMatchId) return;

  const nextState = state.matches[fixture.nextMatchId];
  if (nextState?.predictedWinner === eliminatedTeam) {
    state.matches[fixture.nextMatchId] = {
      ...nextState,
      predictedWinner: null,
    };
    propagateClear(state, fixture.nextMatchId, eliminatedTeam);
  }
}

export function applyActualResults(
  state: BracketState,
  results: { matchId: number; winner: string; score: string }[]
): BracketState {
  const newState = { ...state, matches: { ...state.matches }, lastSynced: new Date().toISOString() };

  for (const result of results) {
    newState.matches[result.matchId] = {
      ...newState.matches[result.matchId],
      actualWinner: result.winner,
      actualScore: result.score,
      isPlayed: true,
    };
  }

  return newState;
}

export function getProgress(state: BracketState): { made: number; total: number } {
  const totalMatches = bracket.length;
  let made = 0;
  for (const fixture of bracket) {
    if (state.matches[fixture.id]?.predictedWinner) {
      made++;
    }
  }
  return { made, total: totalMatches };
}

export function getTeamByCode(code: string) {
  return qualifiedTeams[code] || null;
}

export const STORAGE_KEY = "fifa2026-bracket-predictions";

export function saveState(state: BracketState): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadState(): BracketState | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
