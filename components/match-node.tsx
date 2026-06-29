"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { type MatchStatus, type BracketState, getTeamByCode } from "@/lib/bracket-logic";
import { TeamHistoryPopup } from "./team-history-popup";
import { CountryFlag } from "./country-flag";
import { teamPrimaryColor, flagColors } from "@/lib/all-teams";

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

function roundLabel(round: string): string {
  if (round.includes("32")) return "R32";
  if (round.includes("16")) return "R16";
  if (round.includes("Quarter")) return "QF";
  if (round.includes("Semi")) return "SF";
  if (round.includes("Final")) return "Final";
  if (round.includes("3rd")) return "3rd Place";
  return round;
}

const sizeConfig = {
  sm:    { width: "w-[120px]", flag: "text-[16px]", name: "text-[12px]", row: "h-[28px] pl-[10px] pr-[8px] py-1", header: "text-[10px]", score: "text-[13px] font-[family-name:var(--font-geist-mono)]" },
  md:    { width: "w-[160px]", flag: "text-[18px]", name: "text-[13px]", row: "h-[30px] pl-[10px] pr-[8px] py-1", header: "text-[10px]", score: "text-[14px] font-[family-name:var(--font-geist-mono)]" },
  lg:    { width: "w-[172px]", flag: "text-[20px]", name: "text-[14px]", row: "h-[32px] pl-[12px] pr-[10px] py-1.5", header: "text-[11px]", score: "text-[15px] font-[family-name:var(--font-geist-mono)]" },
  xl:    { width: "w-[172px]", flag: "text-[20px]", name: "text-[14px]", row: "h-[32px] pl-[12px] pr-[10px] py-1.5", header: "text-[11px]", score: "text-[15px] font-[family-name:var(--font-geist-mono)]" },
  final: { width: "w-[172px]", flag: "text-[20px]", name: "text-[14px] font-semibold", row: "h-[32px] pl-[12px] pr-[10px] py-1.5", header: "text-[11px]", score: "text-[15px] font-[family-name:var(--font-geist-mono)] font-bold" },
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
  onCardClick?: (matchId: number, pos?: { top: number; left: number }) => void;
  onScoreChange?: (matchId: number, scoreA: number, scoreB: number) => void;
  headerLabel?: string;
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
  onScoreChange,
  headerLabel,
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

  const handlePick = (teamCode: string | null, e?: React.MouseEvent) => {
    if (!teamCode) return;
    if (isPlayed) return;
    // If clicking already-selected team, open panel instead
    if (teamCode === predictedWinner && onCardClick) {
      const rect = e?.currentTarget.closest("[data-match-id]")?.getBoundingClientRect();
      if (rect) {
        const midScreen = window.innerWidth / 2;
        const isRightSide = rect.left > midScreen;
        onCardClick(matchId, {
          top: rect.top + rect.height / 2,
          left: isRightSide ? rect.left - 352 : rect.right,
        });
      } else {
        onCardClick(matchId);
      }
      return;
    }
    onPick(matchId, teamCode);
  };

  const hasPrediction = !!predictedWinner;

  const winnerPrimary = (!isFinal && !isThirdPlace && predictedWinner) ? (teamPrimaryColor[predictedWinner] || null) : null;

  const borderClass = isFinal
    ? "border-2 border-[var(--color-gold-border)]"
    : isThirdPlace
    ? "border-2 border-[var(--color-silver-border)]"
    : "border";

  const cardStyle = winnerPrimary
    ? { borderColor: `${winnerPrimary}66` } // 40% opacity — visible in both light & dark
    : { borderColor: "var(--color-border)" };

  return (
    <div
      className={`match-card group bg-[var(--color-surface)] rounded overflow-hidden max-w-full h-fit ${s.width} ${borderClass}`}
      style={cardStyle}
    >
      {/* Header: clickable to open sidebar */}
      <div
        className="group/header flex items-center h-[28px] px-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.closest("[data-match-id]")?.getBoundingClientRect();
          if (rect) {
            const midScreen = window.innerWidth / 2;
            const isRightSide = rect.left > midScreen;
            onCardClick?.(matchId, {
              top: rect.top + rect.height / 2,
              left: isRightSide ? rect.left - 352 : rect.right,
            });
          } else {
            onCardClick?.(matchId);
          }
        }}
      >
        <span className={`${s.header} text-[var(--color-text-muted)] flex-1`}>
          {headerLabel || `${roundLabel(round)} · M${matchId}`}
        </span>
        {/* Info icon: outlined on card hover, filled on header hover */}
        <span className="relative w-4 h-4 shrink-0">
          <svg className="absolute inset-0 w-4 h-4 opacity-0 group-hover:opacity-40 group-hover/header:opacity-0 transition-opacity text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="6" x2="8" y2="6.5" strokeLinecap="round" />
            <line x1="8" y1="8" x2="8" y2="11" strokeLinecap="round" />
          </svg>
          <svg className="absolute inset-0 w-4 h-4 opacity-0 group-hover/header:opacity-100 transition-opacity text-[var(--color-text)]" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM7.25 7.5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3z" clipRule="evenodd" />
          </svg>
        </span>
      </div>

      <div className="flex flex-col">
        <TeamRow
          team={teamA}
          teamCode={teamACode}
          status={getTeamStatus(teamACode)}
          isWinner={actualWinner === teamACode && isPlayed}
          onClick={(e) => handlePick(teamACode, e)}
          disabled={isPlayed || !teamACode || !teamBCode}
          muted={hasPrediction && predictedWinner !== teamACode && !isPlayed}
          goals={scoreGoals?.[0] ?? null}
          isPredicted={!isPlayed && predictedWinner === teamACode}
          size={s}
          sizeLevel={size}
          bracketState={bracketState}
          matchId={matchId}
          onScoreChange={onScoreChange}
        />
        <div className="border-t border-[var(--color-border)]" />
        <TeamRow
          team={teamB}
          teamCode={teamBCode}
          status={getTeamStatus(teamBCode)}
          isWinner={actualWinner === teamBCode && isPlayed}
          onClick={(e) => handlePick(teamBCode, e)}
          disabled={isPlayed || !teamACode || !teamBCode}
          muted={hasPrediction && predictedWinner !== teamBCode && !isPlayed}
          goals={scoreGoals?.[1] ?? null}
          isPredicted={!isPlayed && predictedWinner === teamBCode}
          size={s}
          sizeLevel={size}
          bracketState={bracketState}
          matchId={matchId}
          onScoreChange={onScoreChange}
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
  onScoreChange,
}: {
  team: ReturnType<typeof getTeamByCode> | null;
  teamCode: string | null;
  status: string;
  isWinner: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
  muted: boolean;
  goals: number | null;
  isPredicted: boolean;
  size: (typeof sizeConfig)[SizeLevel];
  sizeLevel: SizeLevel;
  bracketState?: BracketState;
  matchId: number;
  onScoreChange?: (matchId: number, scoreA: number, scoreB: number) => void;
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
    <div
      ref={rowRef}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`team-btn flex items-center gap-[6px] ${s.row} w-full text-left border-l-2 border-transparent ${status} ${muted && !show ? "opacity-50" : ""} ${show && status !== "selected" ? "!bg-[var(--color-surface-hover)]" : ""} ${disabled && !status && !muted ? "opacity-60 cursor-default" : ""}`}
        style={status === "selected" && teamCode ? (() => {
          const colors = flagColors[teamCode];
          const primary = teamPrimaryColor[teamCode];
          if (!colors) return undefined;
          // Use higher opacity for light-colored flags (white-heavy like ARG, ENG)
          const hasWhite = colors.some(c => c.toUpperCase() === "#FFFFFF" || c.toUpperCase() === "#FFF");
          const opacity = hasWhite ? "33" : "1F"; // 20% for white-heavy, 12% for others
          return {
            background: `linear-gradient(135deg, ${colors[0]}${opacity}, ${colors[1]}${opacity}, ${colors[2]}${opacity})`,
            borderLeftColor: primary || undefined,
          };
        })() : undefined}
      >
        <CountryFlag code={team.code} />
        <span className={`${s.name} flex-1 ${isWinner ? "font-bold" : ""}`}>
          {team.code}
        </span>
        {goals !== null ? (
          <span className={`${s.score} w-[12px] text-center ${isWinner ? "text-[var(--color-text)] font-bold" : "text-[var(--color-text-muted)]"}`}>
            {goals}
          </span>
        ) : isPredicted ? (
          <img src="/trionda-cursor.png" alt="" className="inline-block w-3 h-3" />
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
            {/* Triangle arrow pointing toward the row */}
            <div
              className="absolute top-1/2 -translate-y-1/2"
              style={pos.flipped
                ? { right: -6, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "6px solid var(--color-text)" }
                : { left: -6, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "6px solid var(--color-text)" }
              }
            />
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
