"use client";

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import { bracket, roundLabels } from "@/lib/tournament-data";
import {
  type BracketState,
  getMatchStatus,
  getEffectiveTeams,
  getTeamByCode,
} from "@/lib/bracket-logic";
import { MatchNode, type SizeLevel } from "./match-node";
import { teamPrimaryColor } from "@/lib/all-teams";

interface BracketViewProps {
  state: BracketState;
  onPick: (matchId: number, teamCode: string) => void;
  onCardClick?: (matchId: number, pos?: { top: number; left: number }) => void;
  onScoreChange?: (matchId: number, scoreA: number, scoreB: number) => void;
}

interface ConnectorLine {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
}

function buildRoundedPath(x1: number, y1: number, midX: number, y2: number, x2: number, r: number): string {
  // Path: horizontal from x1 to midX, vertical from y1 to y2, horizontal from midX to x2
  // With rounded corners (radius r) at the two bends
  const dy = y2 - y1;
  const signY = dy > 0 ? 1 : -1;
  const absR = Math.min(r, Math.abs(dy) / 2, Math.abs(midX - x1) / 2, Math.abs(x2 - midX) / 2);

  if (absR < 1) {
    return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
  }

  const goingRight = x2 > x1;

  if (goingRight) {
    return `M ${x1} ${y1} H ${midX - absR} Q ${midX} ${y1} ${midX} ${y1 + signY * absR} V ${y2 - signY * absR} Q ${midX} ${y2} ${midX + absR} ${y2} H ${x2}`;
  } else {
    return `M ${x1} ${y1} H ${midX + absR} Q ${midX} ${y1} ${midX} ${y1 + signY * absR} V ${y2 - signY * absR} Q ${midX} ${y2} ${midX - absR} ${y2} H ${x2}`;
  }
}

export function BracketView({ state, onPick, onCardClick, onScoreChange }: BracketViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<ConnectorLine[]>([]);

  const leftR32 = bracket.filter((m) => m.round === "R32" && m.bracketSide === "left");
  const rightR32 = bracket.filter((m) => m.round === "R32" && m.bracketSide === "right");
  const leftR16 = bracket.filter((m) => m.round === "R16" && m.bracketSide === "left");
  const rightR16 = bracket.filter((m) => m.round === "R16" && m.bracketSide === "right");
  const leftQF = bracket.filter((m) => m.round === "QF" && m.bracketSide === "left");
  const rightQF = bracket.filter((m) => m.round === "QF" && m.bracketSide === "right");
  const leftSF = bracket.filter((m) => m.round === "SF" && m.bracketSide === "left");
  const rightSF = bracket.filter((m) => m.round === "SF" && m.bracketSide === "right");
  const final = bracket.filter((m) => m.round === "F");
  const thirdPlace = bracket.filter((m) => m.round === "3RD");

  const computeLines = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLines: ConnectorLine[] = [];

    for (const fixture of bracket) {
      if (!fixture.nextMatchId) continue;
      // Skip connectors to Final and 3rd Place — those are wrapped in a decorative container
      if (fixture.nextMatchId === 103 || fixture.nextMatchId === 104) continue;

      const sourceEl = container.querySelector(`[data-match-id="${fixture.id}"]`);
      const targetEl = container.querySelector(`[data-match-id="${fixture.nextMatchId}"]`);
      if (!sourceEl || !targetEl) continue;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const isLeftSide = fixture.bracketSide === "left";

      const winner = state.matches[fixture.id]?.predictedWinner || state.matches[fixture.id]?.actualWinner;
      const { teamA: sourceTeamA } = getEffectiveTeams(state, fixture.id);

      // Source Y: if winner selected, start from middle of that team's row
      // If no winner, start from middle of header
      let y1: number;
      if (winner) {
        const isWinnerTopRow = winner === sourceTeamA;
        // Header 28px, row 28px each, 1px border between rows
        y1 = sourceRect.top - containerRect.top + (isWinnerTopRow ? 42 : 71);
      } else {
        y1 = sourceRect.top - containerRect.top + 14;
      }

      const x1 = isLeftSide
        ? sourceRect.right - containerRect.left
        : sourceRect.left - containerRect.left;

      // Target: center of header (14px from top), with 2px gap between the two feeder lines
      const slotGap = fixture.nextSlot === "A" ? -2 : 2;
      const x2 = isLeftSide
        ? targetRect.left - containerRect.left
        : targetRect.right - containerRect.left;
      const y2 = targetRect.top - containerRect.top + 14 + slotGap;

      const color = winner ? (teamPrimaryColor[winner] || "var(--color-border)") : "var(--color-border)";

      newLines.push({ x1, y1, x2, y2, color });
    }

    setLines(newLines);
  }, [state]);

  useEffect(() => {
    computeLines();
    window.addEventListener("resize", computeLines);
    return () => window.removeEventListener("resize", computeLines);
  }, [computeLines]);

  // Recompute after DOM settles
  useEffect(() => {
    const timer = setTimeout(computeLines, 100);
    return () => clearTimeout(timer);
  }, [state, computeLines]);

  const renderMatch = (fixture: (typeof bracket)[0], size: SizeLevel, isFinalMatch?: boolean, isThird?: boolean, label?: string) => {
    const matchState = state.matches[fixture.id];
    const status = getMatchStatus(state, fixture.id);
    const { teamA, teamB } = getEffectiveTeams(state, fixture.id);

    return (
      <div key={fixture.id} data-match-id={fixture.id} className="flex items-center justify-center">
        <MatchNode
          matchId={fixture.id}
          round={roundLabels[fixture.round] || fixture.round}
          date={fixture.date}
          venue={fixture.venue}
          teamACode={teamA}
          teamBCode={teamB}
          predictedWinner={matchState?.predictedWinner || null}
          predictedScore={matchState?.predictedScore || null}
          actualWinner={matchState?.actualWinner || null}
          actualScore={matchState?.actualScore || null}
          isPlayed={matchState?.isPlayed || false}
          status={status}
          onPick={onPick}
          onCardClick={onCardClick}
          onScoreChange={onScoreChange}
          headerLabel={label}
          size={size}
          isFinal={isFinalMatch || false}
          isThirdPlace={isThird || false}
          bracketState={state}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="w-full flex-1 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center" ref={containerRef}>
        {/* SVG overlay for connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: "visible" }}>
          {lines.map((line, i) => {
            const midX = (line.x1 + line.x2) / 2;
            const isColored = line.color !== "var(--color-border)";
            const r = 4; // border radius
            const d = buildRoundedPath(line.x1, line.y1, midX, line.y2, line.x2, r);
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={line.color}
                strokeWidth={1}
                opacity={isColored ? 0.5 : 0.25}
              />
            );
          })}
        </svg>

        {/* Bracket body */}
        <div className="flex items-stretch relative z-10 h-full">
          {/* Left R32 */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {leftR32.map((m) => renderMatch(m, "sm"))}
          </div>

          {/* Spacer — flex 2 (ratio 80) */}
          <div className="flex-[2] min-w-[clamp(16px,3vw,48px)]" />

          {/* Left R16 */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {leftR16.map((m) => renderMatch(m, "sm"))}
          </div>

          {/* Spacer — flex 2 (ratio 80) */}
          <div className="flex-[2] min-w-[clamp(16px,3vw,48px)]" />

          {/* Left QF */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {leftQF.map((m, i) => renderMatch(m, "md", false, false, `QF${i + 1}`))}
          </div>

          {/* Spacer — flex 3 (ratio 120, extended for finals) */}
          <div className="flex-[3] min-w-[clamp(24px,4vw,64px)]" />

          {/* CENTER: SF + Final + 3rd */}
          <div className="flex flex-col items-center justify-center py-2">
            {/* Finals container with colored border */}
            <div className="flex-none relative mb-6">
              <div className="absolute -inset-3 rounded-lg border-2 border-[var(--color-gold-border)] opacity-60" />
              <div className="relative flex flex-col items-center gap-4 px-3 py-3">
                <div className="flex-none">
                  <div className="flex items-center justify-center gap-2 mb-6">
                  <img src="/FIFA World Cup Trophy.png" alt="Trophy" className="h-8" />
                  {(() => {
                    const finalState = state.matches[104];
                    const champion = finalState?.predictedWinner || finalState?.actualWinner;
                    if (!champion) return null;
                    const team = getTeamByCode(champion);
                    return team ? <span className="text-lg font-bold uppercase">{team.name}</span> : null;
                  })()}
                </div>
                  {final.map((m) => renderMatch(m, "lg", true, false, "Final"))}
                </div>
              <div className="flex-none">
                {thirdPlace.map((m) => renderMatch(m, "lg", false, true, "3rd Place"))}
              </div>
              </div>
            </div>

            {/* Semi-finals */}
            <div className="flex-none flex flex-col items-center gap-3">
              {leftSF.map((m, i) => renderMatch(m, "lg", false, false, `SF${i + 1}`))}
              {rightSF.map((m, i) => renderMatch(m, "lg", false, false, `SF${i + 1 + leftSF.length}`))}
            </div>
          </div>

          {/* Spacer — flex 3 (ratio 120, extended for finals) */}
          <div className="flex-[3] min-w-[clamp(24px,4vw,64px)]" />

          {/* Right QF */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {rightQF.map((m, i) => renderMatch(m, "md", false, false, `QF${i + 1 + leftQF.length}`))}
          </div>

          {/* Spacer — flex 2 (ratio 80) */}
          <div className="flex-[2] min-w-[clamp(16px,3vw,48px)]" />

          {/* Right R16 */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {rightR16.map((m) => renderMatch(m, "sm"))}
          </div>

          {/* Spacer — flex 2 (ratio 80) */}
          <div className="flex-[2] min-w-[clamp(16px,3vw,48px)]" />

          {/* Right R32 */}
          <div className="flex flex-col justify-around gap-[clamp(8px,1.5vh,20px)] py-[clamp(6px,1vh,16px)]">
            {rightR32.map((m) => renderMatch(m, "sm"))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
