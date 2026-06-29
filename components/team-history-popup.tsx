"use client";

import { getTeamByCode, type BracketState } from "@/lib/bracket-logic";
import { getTeamGroupHistory } from "@/lib/group-matches";
import { bracket, qualifiedTeams, roundLabels } from "@/lib/tournament-data";
import { allTeams } from "@/lib/all-teams";
import { getUnifiedWinPct } from "@/lib/match-odds";
import { getTeamDetail } from "@/lib/team-details";
import { CountryFlag } from "./country-flag";
import { useCrowd } from "@/lib/crowd-context";

interface TeamHistoryPopupProps {
  teamCode: string;
  state: BracketState;
  upToMatchId?: number;
}

export function TeamHistoryPopup({ teamCode, state, upToMatchId }: TeamHistoryPopupProps) {
  const team = getTeamByCode(teamCode);
  if (!team) return null;

  const { crowd } = useCrowd();

  const groupHistory = getTeamGroupHistory(teamCode);
  const knockoutHistory = getKnockoutHistory(teamCode, state, upToMatchId);

  // Compute win probability and opponent for the current match
  const winPct = upToMatchId ? getWinProbability(teamCode, state, upToMatchId) : null;
  const opponentCode = upToMatchId ? getOpponent(teamCode, state, upToMatchId) : null;
  const opponent = opponentCode ? (qualifiedTeams[opponentCode] || allTeams[opponentCode] || null) : null;

  // Crowd picks for this match
  const crowdData = upToMatchId ? crowd[upToMatchId] : null;
  const crowdPct = crowdData && crowdData.total > 0
    ? Math.round(((crowdData.teamA === teamCode ? crowdData.picksA : crowdData.picksB) / crowdData.total) * 100)
    : null;

  const allMatches = [...knockoutHistory, ...groupHistory.map((m) => ({
    ...m,
    round: "Group" as const,
    isPrediction: false,
  }))];

  return (
    <div className="w-[220px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden z-[100]">
      {/* Header: team name */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <CountryFlag code={team.code} />
          <span className="text-sm font-bold">{team.name}</span>
          <span className="text-xs text-[var(--color-text-muted)] ml-auto">Group {team.group}</span>
        </div>
      </div>

      {/* Win probability for current match */}
      {winPct !== null && opponentCode && (
        <div className="px-3 py-1.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-correct)] font-semibold font-[family-name:var(--font-geist-mono)]">{winPct}%</span>
            <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-correct)] rounded-full"
                style={{ width: `${winPct}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">vs {opponentCode}</span>
          </div>
          {crowdPct !== null && (
            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {crowdPct}% of players picked {teamCode}
            </div>
          )}
        </div>
      )}

      {/* Match history */}
      <div className="max-h-[240px] overflow-y-auto">
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
  const opponentData = qualifiedTeams[match.opponent] || allTeams[match.opponent] || { flag: "🏳️", name: match.opponent };

  const resultColor = match.isPrediction
    ? "text-[var(--color-accent)]"
    : match.result === "W"
    ? "text-[var(--color-correct)]"
    : match.result === "L"
    ? "text-[var(--color-incorrect)]"
    : "text-[var(--color-text-muted)]";

  const resultLabel = match.isPrediction ? "P" : match.result;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <CountryFlag code={match.opponent} />
      <span className="text-xs flex-1 truncate">{opponentData.name}</span>
      <span className={`text-xs font-bold w-4 text-center ${resultColor}`}>
        {resultLabel}
      </span>
      {match.isPrediction ? (
        <span className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-accent)] italic w-7 text-right">
          {match.goalsFor > 0 || match.goalsAgainst > 0 ? `${match.goalsFor}-${match.goalsAgainst}` : "–"}
        </span>
      ) : (
        <span className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-text)] w-7 text-right">
          {match.goalsFor}-{match.goalsAgainst}
        </span>
      )}
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
      let goalsFor = 0;
      let goalsAgainst = 0;
      if (matchState.predictedScore) {
        const scores = parseScoreForHistory(matchState.predictedScore);
        if (scores) {
          const isTeamA = teamA === teamCode;
          goalsFor = isTeamA ? scores[0] : scores[1];
          goalsAgainst = isTeamA ? scores[1] : scores[0];
        }
      }
      history.push({
        date: fixture.date,
        opponent,
        goalsFor,
        goalsAgainst,
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

function getWinProbability(teamCode: string, state: BracketState, matchId: number): number | null {
  const { teamA, teamB } = getEffectiveTeamsLocal(state, matchId);
  if (!teamA || !teamB) return null;
  const detailA = getTeamDetail(teamA);
  const detailB = getTeamDetail(teamB);
  if (!detailA || !detailB) return null;

  return getUnifiedWinPct(matchId, teamCode, teamA, teamB, detailA.fifaRanking, detailB.fifaRanking);
}

function getOpponent(teamCode: string, state: BracketState, matchId: number): string | null {
  const { teamA, teamB } = getEffectiveTeamsLocal(state, matchId);
  if (teamA === teamCode) return teamB;
  if (teamB === teamCode) return teamA;
  return null;
}

function getEffectiveTeamsLocal(state: BracketState, matchId: number): { teamA: string | null; teamB: string | null } {
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
