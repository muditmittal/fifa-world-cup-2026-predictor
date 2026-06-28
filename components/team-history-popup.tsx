"use client";

import { getTeamByCode, type BracketState } from "@/lib/bracket-logic";
import { getTeamGroupHistory } from "@/lib/group-matches";
import { bracket, qualifiedTeams, roundLabels } from "@/lib/tournament-data";
import { allTeams } from "@/lib/all-teams";

interface TeamHistoryPopupProps {
  teamCode: string;
  state: BracketState;
  upToMatchId?: number;
}

export function TeamHistoryPopup({ teamCode, state, upToMatchId }: TeamHistoryPopupProps) {
  const team = getTeamByCode(teamCode);
  if (!team) return null;

  const groupHistory = getTeamGroupHistory(teamCode);
  const knockoutHistory = getKnockoutHistory(teamCode, state, upToMatchId);

  const allMatches = [...knockoutHistory, ...groupHistory.map((m) => ({
    ...m,
    round: "Group" as const,
    isPrediction: false,
  }))];

  return (
    <div className="w-[220px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden z-[100]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <span className="text-base">{team.flag}</span>
          <span className="text-xs font-semibold">{team.name}</span>
          <span className="text-[9px] text-[var(--color-text-muted)] ml-auto">Group {team.group}</span>
        </div>
      </div>

      {/* Match list */}
      <div className="max-h-[280px] overflow-y-auto">
        {allMatches.length === 0 ? (
          <div className="px-3 py-3 text-[10px] text-[var(--color-text-muted)] text-center italic">
            No matches played yet
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {allMatches.map((match, i) => (
              <HistoryRow key={i} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ match }: { match: MatchHistoryEntry }) {
  const opponent = qualifiedTeams[match.opponent] || allTeams[match.opponent] || { flag: "🏳️", name: match.opponent };

  const resultColor = match.isPrediction
    ? "text-[var(--color-accent)]"
    : match.result === "W"
    ? "text-[var(--color-correct)]"
    : match.result === "L"
    ? "text-[var(--color-incorrect)]"
    : "text-[var(--color-text-muted)]";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className={`text-[10px] font-bold w-4 text-center ${resultColor}`}>
        {match.isPrediction ? "P" : match.result}
      </span>
      <span className="text-xs">{opponent.flag}</span>
      <span className="text-[10px] flex-1 truncate">{opponent.name}</span>
      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
        {match.isPrediction ? "—" : `${match.goalsFor}-${match.goalsAgainst}`}
      </span>
      <span className="text-[8px] text-[var(--color-text-muted)] w-8 text-right truncate">
        {match.date}
      </span>
    </div>
  );
}

interface MatchHistoryEntry {
  date: string;
  opponent: string;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  round: string;
  isPrediction: boolean;
}

function getKnockoutHistory(teamCode: string, state: BracketState, upToMatchId?: number): MatchHistoryEntry[] {
  const history: MatchHistoryEntry[] = [];
  const roundOrder = ["R32", "R16", "QF", "SF", "F", "3RD"];

  // Determine which match IDs are "before" the current one based on round order
  const currentFixture = upToMatchId ? bracket.find((m) => m.id === upToMatchId) : null;
  const currentRoundIdx = currentFixture ? roundOrder.indexOf(currentFixture.round) : roundOrder.length;

  for (const fixture of bracket) {
    // Only show matches from earlier rounds (strictly before this stage)
    const fixtureRoundIdx = roundOrder.indexOf(fixture.round);
    if (fixtureRoundIdx >= currentRoundIdx) continue;

    const matchState = state.matches[fixture.id];
    if (!matchState) continue;

    const { teamA, teamB } = getEffectiveTeamsForHistory(state, fixture.id);
    if (teamA !== teamCode && teamB !== teamCode) continue;

    const opponent = teamA === teamCode ? teamB : teamA;
    if (!opponent) continue;

    if (matchState.isPlayed && matchState.actualWinner && matchState.actualScore) {
      const scores = parseScoreForHistory(matchState.actualScore);
      const isTeamA = teamA === teamCode;
      const goalsFor = isTeamA ? (scores?.[0] ?? 0) : (scores?.[1] ?? 0);
      const goalsAgainst = isTeamA ? (scores?.[1] ?? 0) : (scores?.[0] ?? 0);

      history.push({
        date: fixture.date,
        opponent,
        goalsFor,
        goalsAgainst,
        result: matchState.actualWinner === teamCode ? "W" : goalsFor === goalsAgainst ? "D" : "L",
        round: roundLabels[fixture.round] || fixture.round,
        isPrediction: false,
      });
    } else if (matchState.predictedWinner) {
      history.push({
        date: fixture.date,
        opponent,
        goalsFor: 0,
        goalsAgainst: 0,
        result: matchState.predictedWinner === teamCode ? "W" : "L",
        round: roundLabels[fixture.round] || fixture.round,
        isPrediction: true,
      });
    }
  }

  history.sort((a, b) => {
    const aIdx = roundOrder.indexOf(getShortRound(a.round));
    const bIdx = roundOrder.indexOf(getShortRound(b.round));
    return bIdx - aIdx;
  });

  return history;
}

function getShortRound(round: string): string {
  for (const [key, label] of Object.entries(roundLabels)) {
    if (label === round) return key;
  }
  return round;
}

function getEffectiveTeamsForHistory(
  state: BracketState,
  matchId: number
): { teamA: string | null; teamB: string | null } {
  const fixture = bracket.find((m) => m.id === matchId)!;

  if (fixture.round === "R32") {
    return { teamA: fixture.teamACode, teamB: fixture.teamBCode };
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

function parseScoreForHistory(score: string): [number, number] | null {
  const match = score.match(/^(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}
