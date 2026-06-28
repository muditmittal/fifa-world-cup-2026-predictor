"use client";

import { useState, useEffect } from "react";
import { bracket, roundLabels } from "@/lib/tournament-data";
import { type BracketState, getEffectiveTeams } from "@/lib/bracket-logic";
import { getTeamDetail } from "@/lib/team-details";
import { getMatchOdds, computeFallbackScorelines } from "@/lib/match-odds";
import { groups } from "@/lib/tournament-data";

interface MatchSidebarProps {
  matchId: number;
  state: BracketState;
  onClose: () => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
}

export function MatchSidebar({ matchId, state, onClose, onScorePredict }: MatchSidebarProps) {
  const [tab, setTab] = useState<"stats" | "squads">("stats");

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChipClick = (score: string) => {
    const [a, b] = score.split("-").map(Number);
    onScorePredict(matchId, a, b);
  };

  const handlePenalties = () => {
    onScorePredict(matchId, 1, 1, true);
  };

  const handleScoreChange = (newA: number, newB: number) => {
    const clampedA = Math.max(0, Math.min(9, newA));
    const clampedB = Math.max(0, Math.min(9, newB));
    onScorePredict(matchId, clampedA, clampedB);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl z-[9998] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
        <div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">M{matchId}</span>
          <span className="text-xs text-[var(--color-text-muted)] ml-2">{roundLabels[fixture.round]}</span>
          <span className="text-[10px] text-[var(--color-text-muted)] ml-2">{fixture.date} · {fixture.venue}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[var(--color-surface-hover)] rounded transition-colors">
          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Team comparison + Editable Score */}
      <div className="px-4 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between">
          <TeamBadge detail={detailA} />
          <EditableScore
            scoreA={sA ?? 0}
            scoreB={sB ?? 0}
            isPlayed={isPlayed}
            hasScore={sA !== null}
            onChange={handleScoreChange}
          />
          <TeamBadge detail={detailB} align="right" />
        </div>
        <div className="text-center mt-1">
          <span className="text-[8px] text-[var(--color-text-muted)] uppercase">
            {isPlayed ? "Final" : sA !== null ? "Predicted" : ""}
          </span>
        </div>

        {/* Score chips — only when not played */}
        {!isPlayed && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3 justify-center">
            {scorelines.map((s) => (
              <button
                key={s.score}
                onClick={() => handleChipClick(s.score)}
                className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                  matchState?.predictedScore === s.score
                    ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
                }`}
              >
                {s.score}
                <span className="ml-0.5 opacity-60">{Math.round(s.probability * 100)}%</span>
              </button>
            ))}
            <button
              onClick={handlePenalties}
              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                matchState?.predictedScore?.includes("pen")
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
              }`}
            >
              Pen
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setTab("stats")}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${tab === "stats" ? "text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
        >
          Stats
        </button>
        <button
          onClick={() => setTab("squads")}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${tab === "squads" ? "text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
        >
          Squads
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "stats" ? (
          <StatsTab detailA={detailA} detailB={detailB} />
        ) : (
          <SquadsTab detailA={detailA} detailB={detailB} />
        )}
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
}: {
  scoreA: number;
  scoreB: number;
  isPlayed: boolean;
  hasScore: boolean;
  onChange: (a: number, b: number) => void;
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

  return (
    <div
      className="flex items-center gap-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Team A score */}
      <div className="flex items-center gap-0.5">
        {hovered && !isPlayed && (
          <button
            onClick={() => onChange(Math.max(0, scoreA - 1), scoreB)}
            className="w-4 h-4 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]"
          >
            −
          </button>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={scoreA}
          readOnly={isPlayed}
          onKeyDown={(e) => handleKeyDown(e, "a")}
          onChange={() => {}}
          className={`w-7 h-8 text-center text-xl font-bold bg-transparent outline-none ${isPlayed ? "cursor-default" : "cursor-text"} ${!isPlayed ? "text-[var(--color-accent)]" : ""}`}
        />
        {hovered && !isPlayed && (
          <button
            onClick={() => onChange(Math.min(9, scoreA + 1), scoreB)}
            className="w-4 h-4 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]"
          >
            +
          </button>
        )}
      </div>

      <span className="text-sm text-[var(--color-text-muted)] mx-0.5">–</span>

      {/* Team B score */}
      <div className="flex items-center gap-0.5">
        {hovered && !isPlayed && (
          <button
            onClick={() => onChange(scoreA, Math.max(0, scoreB - 1))}
            className="w-4 h-4 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]"
          >
            −
          </button>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={scoreB}
          readOnly={isPlayed}
          onKeyDown={(e) => handleKeyDown(e, "b")}
          onChange={() => {}}
          className={`w-7 h-8 text-center text-xl font-bold bg-transparent outline-none ${isPlayed ? "cursor-default" : "cursor-text"} ${!isPlayed ? "text-[var(--color-accent)]" : ""}`}
        />
        {hovered && !isPlayed && (
          <button
            onClick={() => onChange(scoreA, Math.min(9, scoreB + 1))}
            className="w-4 h-4 flex items-center justify-center text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-surface-hover)]"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function TeamBadge({ detail, align }: { detail: ReturnType<typeof getTeamDetail>; align?: "right" }) {
  if (!detail) return <div className="text-xs text-[var(--color-text-muted)] italic">TBD</div>;
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-2xl">{detail.flag}</span>
      <span className="text-xs font-semibold mt-0.5">{detail.name}</span>
    </div>
  );
}

function StatsTab({ detailA, detailB }: { detailA: ReturnType<typeof getTeamDetail>; detailB: ReturnType<typeof getTeamDetail> }) {
  if (!detailA || !detailB) return <div className="p-4 text-xs text-[var(--color-text-muted)]">Teams not yet determined</div>;

  const rows = [
    { label: "FIFA Ranking", a: `#${detailA.fifaRanking}`, b: `#${detailB.fifaRanking}` },
    { label: "Confederation", a: detailA.confederation, b: detailB.confederation },
    { label: "Coach", a: detailA.coach, b: detailB.coach },
    { label: "WC Appearances", a: String(detailA.wcAppearances), b: String(detailB.wcAppearances) },
    { label: "Best Finish", a: detailA.bestFinish, b: detailB.bestFinish },
    { label: "WC Wins", a: String(detailA.wcRecord.w), b: String(detailB.wcRecord.w) },
    { label: "WC Draws", a: String(detailA.wcRecord.d), b: String(detailB.wcRecord.d) },
    { label: "WC Losses", a: String(detailA.wcRecord.l), b: String(detailB.wcRecord.l) },
  ];

  return (
    <div className="p-3">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
          <span className="text-[10px] text-[var(--color-text)] w-[80px] text-right truncate">{row.a}</span>
          <span className="text-[9px] text-[var(--color-text-muted)] flex-1 text-center">{row.label}</span>
          <span className="text-[10px] text-[var(--color-text)] w-[80px] truncate">{row.b}</span>
        </div>
      ))}
    </div>
  );
}

function SquadsTab({ detailA, detailB }: { detailA: ReturnType<typeof getTeamDetail>; detailB: ReturnType<typeof getTeamDetail> }) {
  return (
    <div className="p-3 space-y-4">
      {detailA && <SquadSection detail={detailA} />}
      {detailB && <SquadSection detail={detailB} />}
    </div>
  );
}

function SquadSection({ detail }: { detail: NonNullable<ReturnType<typeof getTeamDetail>> }) {
  const posOrder = ["GK", "DEF", "MID", "FWD"] as const;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{detail.flag}</span>
        <span className="text-xs font-semibold">{detail.name}</span>
        <span className="text-[9px] text-[var(--color-text-muted)] ml-auto">{detail.coach}</span>
      </div>
      {posOrder.map((pos) => {
        const players = detail.squad.filter((p) => p.pos === pos);
        if (players.length === 0) return null;
        return (
          <div key={pos} className="mb-2">
            <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{pos}</div>
            {players.map((p) => (
              <div key={p.num} className="flex items-center gap-2 py-0.5 text-[10px]">
                <span className="w-4 text-right text-[var(--color-text-muted)] font-mono">{p.num}</span>
                <span className="flex-1">{p.name}</span>
                <span className="text-[var(--color-text-muted)] truncate max-w-[80px]">{p.club}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
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

function parseDisplayScore(score: string | null | undefined): [number | null, number | null] {
  if (!score) return [null, null];
  const match = score.match(/^(\d+)-(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2])];
  return [null, null];
}
