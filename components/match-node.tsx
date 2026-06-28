"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { type MatchStatus, type BracketState, getTeamByCode } from "@/lib/bracket-logic";
import { TeamHistoryPopup } from "./team-history-popup";

export type SizeLevel = "sm" | "md" | "lg" | "xl" | "final";

function roundShort(round: string): string {
  if (round.includes("32")) return "R32";
  if (round.includes("16")) return "R16";
  if (round.includes("Quarter")) return "QF";
  if (round.includes("Semi")) return "SF";
  if (round.includes("Final")) return "F";
  if (round.includes("3rd")) return "3rd";
  return round;
}

const sizeConfig = {
  sm:    { width: "min-w-[100px] flex-1", flag: "text-sm",   name: "text-[11px]", row: "h-[26px] px-1.5 py-1",   header: "text-[8px]", score: "text-[10px]" },
  md:    { width: "min-w-[130px] w-[150px]", flag: "text-lg", name: "text-[13px]", row: "h-[32px] px-2 py-1.5", header: "text-[9px]", score: "text-[11px]" },
  lg:    { width: "min-w-[150px] w-[180px]", flag: "text-xl", name: "text-sm",     row: "h-[36px] px-2.5 py-2",   header: "text-[9px]", score: "text-xs" },
  xl:    { width: "min-w-[145px] w-[150px]", flag: "text-lg", name: "text-[13px]", row: "h-[32px] px-2 py-1.5", header: "text-[9px]", score: "text-[11px]" },
  final: { width: "min-w-[145px] w-[160px]", flag: "text-xl", name: "text-sm font-semibold", row: "h-[34px] px-2.5 py-2", header: "text-[9px]", score: "text-xs font-bold" },
};

interface MatchNodeProps {
  matchId: number;
  round: string;
  date: string;
  venue: string;
  teamACode: string | null;
  teamBCode: string | null;
  predictedWinner: string | null;
  predictedScore: string | null;
  actualWinner: string | null;
  actualScore: string | null;
  isPlayed: boolean;
  status: MatchStatus;
  onPick: (matchId: number, teamCode: string) => void;
  onCardClick?: (matchId: number) => void;
  size?: SizeLevel;
  isFinal?: boolean;
  isThirdPlace?: boolean;
  bracketState?: BracketState;
}

export function MatchNode({
  matchId,
  round,
  date,
  venue,
  teamACode,
  teamBCode,
  predictedWinner,
  predictedScore,
  actualWinner,
  actualScore,
  isPlayed,
  status,
  onPick,
  onCardClick,
  size = "md",
  isFinal = false,
  isThirdPlace = false,
  bracketState,
}: MatchNodeProps) {
  const teamA = teamACode ? getTeamByCode(teamACode) : null;
  const teamB = teamBCode ? getTeamByCode(teamBCode) : null;
  const s = sizeConfig[size];

  // Show actual score if played, predicted score otherwise
  const scoreGoals = parseScore(isPlayed ? actualScore : predictedScore);

  const getTeamStatus = (teamCode: string | null): string => {
    if (!teamCode) return "";
    if (isPlayed && actualWinner) {
      if (predictedWinner === teamCode && actualWinner === teamCode) return "correct";
      if (predictedWinner === teamCode && actualWinner !== teamCode) return "incorrect";
    }
    if (status === "reevaluate" && predictedWinner === teamCode) return "reevaluate";
    if (predictedWinner === teamCode) return "selected";
    return "";
  };

  const handlePick = (teamCode: string | null) => {
    if (!teamCode) return;
    if (isPlayed) return;
    onPick(matchId, teamCode);
  };

  const hasPrediction = !!predictedWinner;

  const borderClass = isFinal
    ? "border-2 border-[var(--color-gold-border)] shadow-[0_0_12px_var(--color-gold-bg)]"
    : isThirdPlace
    ? "border-2 border-[var(--color-silver-border)] shadow-[0_0_8px_var(--color-silver-bg)]"
    : "border border-[var(--color-border)]";

  return (
    <div
      className={`match-card group bg-[var(--color-surface)] rounded-lg overflow-hidden max-w-full h-fit ${s.width} ${borderClass} cursor-pointer`}
      onClick={() => onCardClick?.(matchId)}
    >
      {/* Header: M{id} + round by default, date + venue on hover */}
      <div className="relative flex items-center justify-between px-1.5 py-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <span className={`${s.header} text-[var(--color-text-muted)] font-mono group-hover:opacity-0 transition-opacity`}>
          M{matchId}
        </span>
        <span className={`${s.header} text-[var(--color-text-muted)] group-hover:opacity-0 transition-opacity`}>
          {roundShort(round)}
        </span>
        <span className={`absolute inset-0 flex items-center justify-between ${s.header} text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity px-1.5`}>
          <span>{date}</span>
          <span className="truncate ml-1">{venue}</span>
        </span>
      </div>

      <div className="flex flex-col">
        <TeamRow
          team={teamA}
          teamCode={teamACode}
          status={getTeamStatus(teamACode)}
          isWinner={actualWinner === teamACode && isPlayed}
          onClick={() => handlePick(teamACode)}
          disabled={isPlayed || !teamACode || !teamBCode}
          muted={hasPrediction && predictedWinner !== teamACode && !isPlayed}
          goals={scoreGoals?.[0] ?? null}
          isPredicted={!isPlayed && predictedWinner === teamACode}
          size={s}
          sizeLevel={size}
          bracketState={bracketState}
          matchId={matchId}
        />
        <div className="border-t border-[var(--color-border)]" />
        <TeamRow
          team={teamB}
          teamCode={teamBCode}
          status={getTeamStatus(teamBCode)}
          isWinner={actualWinner === teamBCode && isPlayed}
          onClick={() => handlePick(teamBCode)}
          disabled={isPlayed || !teamACode || !teamBCode}
          muted={hasPrediction && predictedWinner !== teamBCode && !isPlayed}
          goals={scoreGoals?.[1] ?? null}
          isPredicted={!isPlayed && predictedWinner === teamBCode}
          size={s}
          sizeLevel={size}
          bracketState={bracketState}
          matchId={matchId}
        />
      </div>

      {status === "reevaluate" && (
        <div className="px-1.5 py-0.5 border-t border-[var(--color-reevaluate)] bg-[var(--color-reevaluate-bg)] text-center">
          <span className={`${s.header} text-[var(--color-reevaluate)] font-medium`}>
            ⚠ Re-evaluate
          </span>
        </div>
      )}
    </div>
  );
}

function TeamRow({
  team,
  teamCode,
  status,
  isWinner,
  onClick,
  disabled,
  muted,
  goals,
  isPredicted,
  size: s,
  sizeLevel,
  bracketState,
  matchId,
}: {
  team: ReturnType<typeof getTeamByCode> | null;
  teamCode: string | null;
  status: string;
  isWinner: boolean;
  onClick: () => void;
  disabled: boolean;
  muted: boolean;
  goals: number | null;
  isPredicted: boolean;
  size: (typeof sizeConfig)[SizeLevel];
  sizeLevel: SizeLevel;
  bracketState?: BracketState;
  matchId: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, flipped: false });

  useEffect(() => {
    if (!show || !rowRef.current) return;
    const el = rowRef.current;
    const rect = el.getBoundingClientRect();
    const flipped = rect.right + 230 > window.innerWidth;
    setPos({
      top: rect.top + rect.height / 2,
      left: flipped ? rect.left : rect.right,
      flipped,
    });
  }, [show]);

  if (!team || !teamCode) {
    return (
      <div className={`flex items-center gap-1.5 ${s.row} opacity-30`}>
        <span className={`${s.name} text-[var(--color-text-muted)] italic`}>TBD</span>
      </div>
    );
  }

  return (
    <div ref={rowRef} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`team-btn flex items-center gap-1.5 ${s.row} w-full text-left border-l-2 border-transparent ${status} ${muted && !show ? "opacity-30" : ""} ${show ? "!bg-[var(--color-surface-hover)]" : ""} ${disabled && !status && !muted ? "opacity-60 cursor-default" : ""}`}
      >
        <span className={s.flag}>{team.flag}</span>
        <span className={`${s.name} flex-1 truncate ${isWinner ? "font-bold" : ""}`}>
          {team.name}
        </span>
        {goals !== null ? (
          <span className={`${s.score} font-mono font-bold ${isWinner ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
            {goals}
          </span>
        ) : isPredicted ? (
          <img src="/trionda-cursor.png" alt="" className={`inline-block ${sizeLevel === "lg" || sizeLevel === "final" ? "w-5 h-5" : "w-3 h-3"}`} />
        ) : null}
        {status === "correct" && <span className="text-[var(--color-correct)] text-[10px]">✓</span>}
        {status === "incorrect" && <span className="text-[var(--color-incorrect)] text-[10px]">✗</span>}
        {status === "reevaluate" && <span className="text-[var(--color-reevaluate)] text-[10px]">!</span>}
      </button>

      {show && bracketState && typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.flipped ? pos.left - 8 : pos.left + 8,
              transform: pos.flipped ? "translate(-100%, -50%)" : "translateY(-50%)",
              zIndex: 99999,
              pointerEvents: "none",
            }}
          >
            <TeamHistoryPopup teamCode={teamCode} state={bracketState} upToMatchId={matchId} />
          </div>,
          document.body
        )
      }
    </div>
  );
}

function parseScore(score: string | null): [number, number] | null {
  if (!score) return null;
  // Handles "2-1", "1-1 (4-3 pen)", "2-1 (aet)"
  const match = score.match(/^(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}
