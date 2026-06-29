"use client";

import { useState, useEffect, useRef } from "react";
import { bracket, roundLabels, qualifiedTeams } from "@/lib/tournament-data";
import { type BracketState, getEffectiveTeams } from "@/lib/bracket-logic";
import { getTeamDetail } from "@/lib/team-details";
import { getMatchOdds, getUnifiedWinPct, computeFallbackScorelines } from "@/lib/match-odds";
import { getTeamGroupHistory } from "@/lib/group-matches";
import { groups } from "@/lib/tournament-data";
import { CountryFlag } from "./country-flag";
import { flagColors, teamPrimaryColor, allTeams } from "@/lib/all-teams";

interface MatchSidebarProps {
  matchId: number;
  state: BracketState;
  onClose: () => void;
  onPickWinner: (matchId: number, teamCode: string) => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
  position?: { top: number; left: number } | null;
}

export function MatchSidebar({ matchId, state, onClose, onPickWinner, onScorePredict, position }: MatchSidebarProps) {

  const fixture = bracket.find((m) => m.id === matchId);
  if (!fixture) return null;

  const matchState = state.matches[matchId];
  const { teamA, teamB } = getEffectiveTeams(state, matchId);
  const detailA = teamA ? getTeamDetail(teamA) : null;
  const detailB = teamB ? getTeamDetail(teamB) : null;
  const isPlayed = matchState?.isPlayed || false;

  const displayScore = isPlayed ? matchState?.actualScore : matchState?.predictedScore;
  const [sA, sB] = parseDisplayScore(displayScore);

  const oddsScorelines = getMatchOdds(matchId);
  const fallbackScorelines = teamA && teamB ? computeFallbackScorelines(teamA, teamB, buildGroupGoals()) : null;
  const scorelines = oddsScorelines || fallbackScorelines || [
    { score: "1-0", probability: 0.13 },
    { score: "2-1", probability: 0.11 },
    { score: "1-1", probability: 0.10 },
  ];

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handlePickWinner = (winnerCode: string) => {
    onPickWinner(matchId, winnerCode);
  };

  const handleChipClick = (score: string) => {
    // Toggle off if same chip clicked again
    if (matchState?.predictedScore === score) {
      // Clear the score but keep the winner
      onScorePredict(matchId, -2, -2); // Signal to clear score only
      return;
    }
    const [a, b] = score.split("-").map(Number);
    onScorePredict(matchId, a, b);
  };

  const handlePenalties = () => {
    // Set equal score — use the winning team's current score or default to 1-1
    const currentScore = matchState?.predictedScore;
    let tiedGoals = 1;
    if (currentScore && !currentScore.includes("pen")) {
      const parts = currentScore.split("-").map(Number);
      if (parts.length === 2) {
        tiedGoals = Math.max(parts[0], parts[1]) || 1;
      }
    }
    onScorePredict(matchId, tiedGoals, tiedGoals, true);
  };

  const handleScoreChange = (newA: number, newB: number) => {
    const clampedA = Math.max(0, Math.min(9, newA));
    const clampedB = Math.max(0, Math.min(9, newB));

    const winnerIsA = matchState?.predictedWinner === teamA;

    if (winnerIsA) {
      // Winner is team A: A's score must be >= B's score
      if (clampedB > clampedA) return; // Block: can't make loser score higher
      if (clampedA === clampedB) {
        // Equal = penalty
        onScorePredict(matchId, clampedA, clampedB, true);
      } else {
        onScorePredict(matchId, clampedA, clampedB);
      }
    } else {
      // Winner is team B: B's score must be >= A's score
      if (clampedA > clampedB) return; // Block: can't make loser score higher
      if (clampedA === clampedB) {
        // Equal = penalty
        onScorePredict(matchId, clampedA, clampedB, true);
      } else {
        onScorePredict(matchId, clampedA, clampedB);
      }
    }
  };

  const handleReset = () => {
    // Clear prediction for this match — need a dedicated callback
    onScorePredict(matchId, -1, -1); // Signal to clear
  };

  return (
    <div
      ref={panelRef}
      className="fixed w-[340px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-2xl z-[9998] flex flex-col overflow-hidden"
      style={(() => {
        const desiredTop = position ? Math.max(20, position.top - 60) : 20;
        const topClamped = Math.min(desiredTop, window.innerHeight - 300);
        const finalTop = Math.max(20, topClamped);
        return {
          top: finalTop,
          maxHeight: `calc(100vh - ${finalTop + 20}px)`,
          left: position ? Math.max(12, Math.min(position.left + 12, window.innerWidth - 360)) : "auto",
          right: position ? "auto" : "20px",
        };
      })()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div>
          <div className="text-base font-bold">{roundLabels[fixture.round]}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{fixture.date} · {fixture.venue}</div>
        </div>
        <div className="flex items-center gap-2">
          {matchState?.predictedWinner && !isPlayed && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded hover:border-[var(--color-incorrect)] hover:text-[var(--color-incorrect)] transition-colors"
            >
              Reset
            </button>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded transition-colors">
            <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Prediction section */}
      <div className="px-4 py-4 bg-[var(--color-surface)]">
        {/* Match title */}
        <div className="text-center text-sm font-semibold text-[var(--color-text)] mb-3">
          {detailA?.name || "TBD"} vs {detailB?.name || "TBD"}
        </div>
        {/* Team badges with clickable winner selector */}
        <div className="flex items-center justify-between">
          <WinnerBadge
            code={teamA}
            detail={detailA}
            isSelected={matchState?.predictedWinner === teamA}
            isPlayed={isPlayed}
            onClick={() => !isPlayed && teamA && handlePickWinner(teamA)}
          />

          {sA !== null ? (
            <EditableScore
              scoreA={sA}
              scoreB={sB ?? 0}
              isPlayed={isPlayed}
              hasScore={true}
              onChange={handleScoreChange}
              winnerIsA={matchState?.predictedWinner === teamA}
            />
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] italic">
              {matchState?.predictedWinner ? "Predict score" : ""}
            </span>
          )}

          <WinnerBadge
            code={teamB}
            detail={detailB}
            isSelected={matchState?.predictedWinner === teamB}
            isPlayed={isPlayed}
            onClick={() => !isPlayed && teamB && handlePickWinner(teamB)}
          />
        </div>

        {/* Score chips — only when a winner is selected, always respect the winner */}
        {!isPlayed && matchState?.predictedWinner && teamA && teamB && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3 justify-center">
            {getWinnerScorelines(matchState.predictedWinner === teamA, matchId).map((item, idx) => (
              <button
                key={`${item.score}-${idx}`}
                onClick={() => handleChipClick(item.score)}
                className="px-2.5 py-1 text-xs font-[family-name:var(--font-geist-mono)] rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {item.score}{item.pct > 0 && <span className="ml-1 opacity-60">{item.pct}%</span>}
              </button>
            ))}
            <button
              onClick={handlePenalties}
              className="px-2.5 py-1 text-xs font-[family-name:var(--font-geist-mono)] rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Pen
            </button>
          </div>
        )}

        {/* Odds bar */}
        {detailA && detailB && !isPlayed && (
          <div className="mt-3">
            <OddsBar detailA={detailA} detailB={detailB} teamACode={teamA} teamBCode={teamB} matchId={matchId} />
          </div>
        )}
      </div>

      {/* All content in a single scrollable stack */}
      <div className="flex-1 overflow-y-auto">
        {teamA && <JourneySection teamCode={teamA} state={state} currentMatchId={matchId} />}
        {teamB && <JourneySection teamCode={teamB} state={state} currentMatchId={matchId} />}
        <StatsTab detailA={detailA} detailB={detailB} />
      </div>
    </div>
  );
}

function EditableScore({
  scoreA,
  scoreB,
  isPlayed,
  hasScore,
  onChange,
  winnerIsA,
}: {
  scoreA: number;
  scoreB: number;
  isPlayed: boolean;
  hasScore: boolean;
  onChange: (a: number, b: number) => void;
  winnerIsA?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  if (!hasScore && !isPlayed) {
    return <span className="text-sm text-[var(--color-text-muted)]">vs</span>;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, side: "a" | "b") => {
    const key = e.key;
    if (key >= "0" && key <= "9") {
      e.preventDefault();
      const val = parseInt(key);
      if (side === "a") onChange(val, scoreB);
      else onChange(scoreA, val);
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      if (side === "a") onChange(Math.min(9, scoreA + 1), scoreB);
      else onChange(scoreA, Math.min(9, scoreB + 1));
    }
    if (key === "ArrowDown") {
      e.preventDefault();
      if (side === "a") onChange(Math.max(0, scoreA - 1), scoreB);
      else onChange(scoreA, Math.max(0, scoreB - 1));
    }
  };

  // Determine which +/- buttons should be disabled
  const canIncA = winnerIsA !== false || scoreA < scoreB; // A can go up if A is winner, or if still less than B
  const canDecA = scoreA > 0 && (winnerIsA === true || scoreA - 1 >= scoreB || scoreA > scoreB); // A can go down unless it would make A < B when A is winner
  const canIncB = winnerIsA !== true || scoreB < scoreA; // B can go up if B is winner, or still less than A
  const canDecB = scoreB > 0 && (winnerIsA === false || scoreB - 1 >= scoreA || scoreB > scoreA);

  // Simplified: loser can't go above winner
  const loserCanIncA = winnerIsA === false ? scoreA < scoreB : true; // if B wins, A can only go up to B's level
  const loserCanIncB = winnerIsA === true ? scoreB < scoreA : true; // if A wins, B can only go up to A's level

  return (
    <div
      className="flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Team A score */}
      <div className="flex flex-col items-center h-[72px] justify-center">
        <button
          onClick={() => loserCanIncA && onChange(Math.min(9, scoreA + 1), scoreB)}
          className={`w-6 h-5 flex items-center justify-center text-xs rounded transition-all ${
            hovered && !isPlayed ? (loserCanIncA ? "opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]" : "opacity-30 cursor-not-allowed text-[var(--color-text-muted)]") : "opacity-0"
          }`}
          tabIndex={-1}
        >
          +
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={scoreA}
          readOnly={isPlayed}
          onKeyDown={(e) => handleKeyDown(e, "a")}
          onChange={() => {}}
          className={`w-8 h-10 text-center text-2xl font-bold bg-transparent outline-none font-[family-name:var(--font-geist-mono)] ${isPlayed ? "cursor-default" : "cursor-text"} ${!isPlayed ? "text-[var(--color-accent)]" : ""}`}
        />
        <button
          onClick={() => onChange(Math.max(0, scoreA - 1), scoreB)}
          className={`w-6 h-5 flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded hover:bg-[var(--color-surface-hover)] transition-all ${hovered && !isPlayed ? "opacity-100" : "opacity-0"}`}
          tabIndex={-1}
        >
          −
        </button>
      </div>

      <span className="text-sm text-[var(--color-text-muted)]">–</span>

      {/* Team B score */}
      <div className="flex flex-col items-center h-[72px] justify-center">
        <button
          onClick={() => loserCanIncB && onChange(scoreA, Math.min(9, scoreB + 1))}
          className={`w-6 h-5 flex items-center justify-center text-xs rounded transition-all ${
            hovered && !isPlayed ? (loserCanIncB ? "opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]" : "opacity-30 cursor-not-allowed text-[var(--color-text-muted)]") : "opacity-0"
          }`}
          tabIndex={-1}
        >
          +
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={scoreB}
          readOnly={isPlayed}
          onKeyDown={(e) => handleKeyDown(e, "b")}
          onChange={() => {}}
          className={`w-8 h-10 text-center text-2xl font-bold bg-transparent outline-none font-[family-name:var(--font-geist-mono)] ${isPlayed ? "cursor-default" : "cursor-text"} ${!isPlayed ? "text-[var(--color-accent)]" : ""}`}
        />
        <button
          onClick={() => onChange(scoreA, Math.max(0, scoreB - 1))}
          className={`w-6 h-5 flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] rounded hover:bg-[var(--color-surface-hover)] transition-all ${hovered && !isPlayed ? "opacity-100" : "opacity-0"}`}
          tabIndex={-1}
        >
          −
        </button>
      </div>
    </div>
  );
}

function TeamBadge({ detail, align }: { detail: ReturnType<typeof getTeamDetail>; align?: "right" }) {
  if (!detail) return <div className="text-xs text-[var(--color-text-muted)] italic w-[60px] text-center">TBD</div>;
  return (
    <div className="flex flex-col items-center w-[60px]">
      <CountryFlag code={detail.code} className="!w-[46px] !h-[32px]" />
      <span className="text-2xl font-bold mt-1">{detail.code}</span>
    </div>
  );
}

function abbreviateFinish(finish: string): string {
  if (finish.includes("Champion")) return "1st";
  if (finish.includes("Runner")) return "2nd";
  if (finish.includes("3rd") || finish.includes("Third")) return "3rd";
  if (finish.includes("Quarter")) return "QF";
  if (finish.includes("Semi")) return "SF";
  if (finish.includes("Round of 32")) return "R32";
  if (finish.includes("Round of 16")) return "R16";
  if (finish.includes("Group") || finish.includes("Debut")) return "GS";
  return finish.slice(0, 4);
}

function StatsTab({ detailA, detailB }: { detailA: ReturnType<typeof getTeamDetail>; detailB: ReturnType<typeof getTeamDetail> }) {
  if (!detailA || !detailB) return <div className="p-4 text-sm text-[var(--color-text-muted)]">Teams not yet determined</div>;

  const rows = [
    { label: "Ranking", a: `#${detailA.fifaRanking}`, b: `#${detailB.fifaRanking}`, isNum: true },
    { label: "Appearances", a: String(detailA.wcAppearances), b: String(detailB.wcAppearances), isNum: true },
    { label: "Best Finish", a: abbreviateFinish(detailA.bestFinish), b: abbreviateFinish(detailB.bestFinish), isNum: false },
    { label: "Wins", a: String(detailA.wcRecord.w), b: String(detailB.wcRecord.w), isNum: true },
    { label: "Draws", a: String(detailA.wcRecord.d), b: String(detailB.wcRecord.d), isNum: true },
    { label: "Losses", a: String(detailA.wcRecord.l), b: String(detailB.wcRecord.l), isNum: true },
  ];

  return (
    <div className="p-4 border-t border-[var(--color-border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">World Cup Stats</div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center h-7 border-b border-[var(--color-border-light)] last:border-0">
          <span className={`text-sm w-[60px] text-left ${row.isNum ? "font-[family-name:var(--font-geist-mono)] font-bold" : "font-semibold"}`}>{row.a}</span>
          <span className="text-xs text-[var(--color-text-muted)] flex-1 text-center uppercase tracking-wider">{row.label}</span>
          <span className={`text-sm w-[60px] text-right ${row.isNum ? "font-[family-name:var(--font-geist-mono)] font-bold" : "font-semibold"}`}>{row.b}</span>
        </div>
      ))}
    </div>
  );
}

function JourneySection({ teamCode, state, currentMatchId }: { teamCode: string; state: BracketState; currentMatchId: number }) {
  const team = qualifiedTeams[teamCode] || allTeams[teamCode];
  if (!team) return null;

  const groupHistory = getTeamGroupHistory(teamCode);
  const knockoutHistory = getKnockoutHistoryForPanel(teamCode, state, currentMatchId);

  const allMatches = [...knockoutHistory, ...groupHistory.map((m) => ({
    ...m,
    round: "Group" as const,
    isPrediction: false,
  }))];

  return (
    <div className="px-4 py-3 border-t border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-2">
        <CountryFlag code={teamCode} />
        <span className="text-sm font-bold">{team.name}</span>
        <span className="text-xs text-[var(--color-text-muted)] ml-auto uppercase tracking-wider">2026 so far</span>
      </div>
      {allMatches.length === 0 ? (
        <div className="text-xs text-[var(--color-text-muted)] italic py-1">No matches played yet</div>
      ) : (
        <div className="space-y-0">
          {allMatches.map((match, i) => {
            const opponentData = qualifiedTeams[match.opponent] || allTeams[match.opponent] || { name: match.opponent };
            const resultColor = match.isPrediction
              ? "text-[var(--color-accent)]"
              : match.result === "W"
              ? "text-[var(--color-correct)]"
              : match.result === "L"
              ? "text-[var(--color-incorrect)]"
              : "text-[var(--color-text-muted)]";
            const resultLabel = match.isPrediction ? "P" : match.result;

            return (
              <div key={i} className="flex items-center gap-1.5 h-7 border-b border-[var(--color-border-light)] last:border-0">
                <CountryFlag code={match.opponent} />
                <span className="text-sm flex-1 truncate">{opponentData.name}</span>
                <span className={`text-sm font-bold w-4 text-center ${resultColor}`}>{resultLabel}</span>
                <span className={`text-sm font-[family-name:var(--font-geist-mono)] font-bold w-8 text-right ${match.isPrediction ? "text-[var(--color-accent)] italic" : ""}`}>
                  {match.goalsFor > 0 || match.goalsAgainst > 0 ? `${match.goalsFor}-${match.goalsAgainst}` : "–"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getKnockoutHistoryForPanel(teamCode: string, state: BracketState, currentMatchId: number): {
  date: string; opponent: string; goalsFor: number; goalsAgainst: number; result: "W" | "D" | "L"; round: string; isPrediction: boolean;
}[] {
  const history: { date: string; opponent: string; goalsFor: number; goalsAgainst: number; result: "W" | "D" | "L"; round: string; isPrediction: boolean }[] = [];
  const roundOrder = ["R32", "R16", "QF", "SF", "F", "3RD"];

  const currentFixture = bracket.find((m) => m.id === currentMatchId);
  const currentRoundIdx = currentFixture ? roundOrder.indexOf(currentFixture.round) : roundOrder.length;

  for (const fixture of bracket) {
    const fixtureRoundIdx = roundOrder.indexOf(fixture.round);
    if (fixtureRoundIdx >= currentRoundIdx) continue;

    const matchState = state.matches[fixture.id];
    if (!matchState) continue;

    const { teamA, teamB } = getEffectiveTeamsForPanel(state, fixture.id);
    if (teamA !== teamCode && teamB !== teamCode) continue;

    const opponent = teamA === teamCode ? teamB : teamA;
    if (!opponent) continue;

    if (matchState.isPlayed && matchState.actualWinner && matchState.actualScore) {
      const scores = parseScoreLocal(matchState.actualScore);
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
        const scores = parseScoreLocal(matchState.predictedScore);
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
    const roundOrder = ["R32", "R16", "QF", "SF", "F", "3RD"];
    const aIdx = roundOrder.indexOf(getShortRoundLabel(a.round));
    const bIdx = roundOrder.indexOf(getShortRoundLabel(b.round));
    return bIdx - aIdx;
  });

  return history;
}

function getShortRoundLabel(round: string): string {
  for (const [key, label] of Object.entries(roundLabels)) {
    if (label === round) return key;
  }
  return round;
}

function getEffectiveTeamsForPanel(state: BracketState, matchId: number): { teamA: string | null; teamB: string | null } {
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

function parseScoreLocal(score: string): [number, number] | null {
  const match = score.match(/^(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

function buildGroupGoals(): Record<string, { gf: number; ga: number; played: number }> {
  const result: Record<string, { gf: number; ga: number; played: number }> = {};
  for (const group of groups) {
    for (const team of group.teams) {
      result[team.code] = { gf: team.gf, ga: team.ga, played: team.played };
    }
  }
  return result;
}

function getWinnerScorelines(winnerIsTeamA: boolean, matchId?: number): { score: string; pct: number }[] {
  const odds = getMatchOdds(matchId || 0);
  const seen = new Set<string>();
  const results: { score: string; pct: number }[] = [];

  if (odds) {
    // First: collect scorelines where the predicted winner wins
    const winningScores = odds
      .filter((s) => {
        const [a, b] = s.score.split("-").map(Number);
        return winnerIsTeamA ? a > b : b > a;
      })
      .sort((a, b) => b.probability - a.probability);

    for (const s of winningScores) {
      if (results.length >= 3) break;
      if (!seen.has(s.score)) {
        seen.add(s.score);
        results.push({ score: s.score, pct: Math.round(s.probability * 100) });
      }
    }

    // If not enough, flip losing scorelines
    if (results.length < 3) {
      const flipped = odds
        .filter((s) => {
          const [a, b] = s.score.split("-").map(Number);
          return winnerIsTeamA ? a < b : b < a;
        })
        .sort((a, b) => b.probability - a.probability);

      for (const s of flipped) {
        if (results.length >= 3) break;
        const flippedScore = s.score.split("-").reverse().join("-");
        if (!seen.has(flippedScore)) {
          seen.add(flippedScore);
          results.push({ score: flippedScore, pct: Math.round(s.probability * 100) });
        }
      }
    }
  }

  // Fallback if still not enough
  if (results.length < 3) {
    const fallback = winnerIsTeamA ? ["1-0", "2-0", "2-1"] : ["0-1", "0-2", "1-2"];
    for (const s of fallback) {
      if (results.length >= 3) break;
      if (!seen.has(s)) {
        seen.add(s);
        results.push({ score: s, pct: 0 });
      }
    }
  }

  return results;
}

function getOrientedScorelines(
  scorelines: { score: string; probability: number }[],
  flipForTeamB: boolean
): { score: string; probability: number }[] {
  if (!flipForTeamB) return scorelines.slice(0, 5);

  return scorelines.slice(0, 5).map((s) => {
    const parts = s.score.split("-");
    return { score: `${parts[1]}-${parts[0]}`, probability: s.probability };
  });
}

function parseDisplayScore(score: string | null | undefined): [number | null, number | null] {
  if (!score) return [null, null];
  const match = score.match(/^(\d+)-(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2])];
  return [null, null];
}

function OddsBar({ detailA, detailB, teamACode, teamBCode, matchId }: {
  detailA: NonNullable<ReturnType<typeof getTeamDetail>>;
  detailB: NonNullable<ReturnType<typeof getTeamDetail>>;
  teamACode: string | null;
  teamBCode: string | null;
  matchId: number;
}) {
  const pctA = teamACode
    ? getUnifiedWinPct(matchId, teamACode, teamACode, teamBCode, detailA.fifaRanking, detailB.fifaRanking)
    : 50;
  const pctB = 100 - pctA;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-[family-name:var(--font-geist-mono)] font-bold text-[var(--color-correct)]">{teamACode} {pctA}%</span>
        <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">Win Prob.</span>
        <span className="font-[family-name:var(--font-geist-mono)] font-bold text-[var(--color-text-muted)]">{pctB}% {teamBCode}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        <div className="bg-[var(--color-correct)] rounded-l-full" style={{ width: `${pctA}%` }} />
        <div className="bg-[var(--color-border)] rounded-r-full" style={{ width: `${pctB}%` }} />
      </div>
    </div>
  );
}

function WinnerBadge({ code, detail, isSelected, isPlayed, onClick }: {
  code: string | null;
  detail: ReturnType<typeof getTeamDetail>;
  isSelected: boolean;
  isPlayed: boolean;
  onClick: () => void;
}) {
  const colors = code ? flagColors[code] : null;
  const primary = code ? teamPrimaryColor[code] : null;

  const selectedStyle = isSelected && colors ? {
    background: `linear-gradient(135deg, ${colors[0]}1F, ${colors[1]}1A, ${colors[2]}1F)`,
    borderColor: primary || undefined,
  } : undefined;

  return (
    <button
      onClick={onClick}
      disabled={isPlayed}
      className={`flex flex-col items-center w-[60px] rounded-lg p-1.5 transition-colors border-2 ${
        isSelected
          ? ""
          : "border-transparent hover:bg-[var(--color-surface-hover)]"
      } ${isPlayed ? "cursor-default" : "cursor-pointer"}`}
      style={selectedStyle}
    >
      {detail && <CountryFlag code={detail.code} className="!w-[46px] !h-[32px]" />}
      <span className="text-2xl font-bold mt-1">{detail?.code || "TBD"}</span>
    </button>
  );
}
