"use client";

import type { ReactNode } from "react";
import { bracket, roundLabels } from "@/lib/tournament-data";
import {
  type BracketState,
  getMatchStatus,
  getEffectiveTeams,
  getTeamByCode,
} from "@/lib/bracket-logic";
import { MatchNode, type SizeLevel } from "./match-node";

interface BracketViewProps {
  state: BracketState;
  onPick: (matchId: number, teamCode: string) => void;
  onCardClick?: (matchId: number) => void;
}

export function BracketView({ state, onPick, onCardClick }: BracketViewProps) {
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

  const renderMatch = (fixture: (typeof bracket)[0], size: SizeLevel, isFinalMatch?: boolean, isThird?: boolean) => {
    const matchState = state.matches[fixture.id];
    const status = getMatchStatus(state, fixture.id);
    const { teamA, teamB } = getEffectiveTeams(state, fixture.id);

    return (
      <MatchNode
        key={fixture.id}
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
        size={size}
        isFinal={isFinalMatch || false}
        isThirdPlace={isThird || false}
        bracketState={state}
      />
    );
  };

  // Get predicted champion for the spotlight
  const finalState = state.matches[103];
  const champion = finalState?.predictedWinner || finalState?.actualWinner;
  const championTeam = champion ? getTeamByCode(champion) : null;

  return (
    <div className="bracket-scroll">
      <div className="min-w-[960px] py-4 px-2">
        {/* Bracket body */}
        <div className="flex items-stretch" style={{ minHeight: 640 }}>
          {/* Left R32 */}
          <MatchColumn matches={leftR32} renderMatch={(m) => renderMatch(m, "sm")} />

          <ConnectorCol pairs={4} direction="right" />

          {/* Left R16 */}
          <MatchColumn matches={leftR16} renderMatch={(m) => renderMatch(m, "sm")} />

          <ConnectorCol pairs={2} direction="right" />

          {/* Left QF */}
          <MatchColumn matches={leftQF} renderMatch={(m) => renderMatch(m, "sm")} />

          {/* Connector QF → SF (left) */}
          <ConnectorCol pairs={1} direction="right" />

          {/* CENTER: SF + Final + 3rd */}
          <div className="flex-[2] flex flex-col items-center justify-center py-2">
            {/* Top group: Final + 3rd Place */}
            <div className="flex-none flex flex-col items-center gap-3 mb-8">
              {/* Champion name */}
              {championTeam && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{championTeam.flag}</span>
                  <span className="text-sm font-bold text-[var(--color-gold)]">{championTeam.name}</span>
                </div>
              )}
              {/* Final */}
              <div className="flex-none">
                <div className="text-center mb-1"><span className="text-lg">🏆</span></div>
                {final.map((m) => renderMatch(m, "lg", true))}
              </div>
              {/* 3rd Place */}
              <div className="flex-none">
                <div className="text-center mb-0.5">
                  <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">3rd Place</span>
                </div>
                {thirdPlace.map((m) => renderMatch(m, "lg", false, true))}
              </div>
            </div>

            {/* Bottom group: Semi-finals */}
            <div className="flex-none flex flex-col items-center gap-3">
              {leftSF.map((m) => renderMatch(m, "lg"))}
              {rightSF.map((m) => renderMatch(m, "lg"))}
            </div>
          </div>

          {/* Connector QF → SF (right) */}
          <ConnectorCol pairs={1} direction="left" />

          {/* Right QF */}
          <MatchColumn matches={rightQF} renderMatch={(m) => renderMatch(m, "sm")} />

          <ConnectorCol pairs={2} direction="left" />

          {/* Right R16 */}
          <MatchColumn matches={rightR16} renderMatch={(m) => renderMatch(m, "sm")} />

          <ConnectorCol pairs={4} direction="left" />

          {/* Right R32 */}
          <MatchColumn matches={rightR32} renderMatch={(m) => renderMatch(m, "sm")} />
        </div>
      </div>
    </div>
  );
}

function MatchColumn({
  matches,
  renderMatch,
}: {
  matches: (typeof bracket)[number][];
  renderMatch: (f: (typeof bracket)[number]) => ReactNode;
}) {
  return (
    <div className="flex flex-col justify-around flex-1 gap-1 py-1">
      {matches.map((m) => (
        <div key={m.id} className="flex items-center justify-center">
          {renderMatch(m)}
        </div>
      ))}
    </div>
  );
}

function ConnectorCol({
  pairs,
  direction,
}: {
  pairs: number;
  direction: "left" | "right";
}) {
  return (
    <div className="w-5 flex flex-col justify-around py-1">
      {Array.from({ length: pairs }).map((_, i) => (
        <BracketConnector key={i} direction={direction} />
      ))}
    </div>
  );
}

function BracketConnector({ direction }: { direction: "left" | "right" }) {
  const isRight = direction === "right";

  return (
    <svg
      viewBox="0 0 20 100"
      preserveAspectRatio="none"
      className="block w-full flex-1"
      style={{ minHeight: 40 }}
    >
      {isRight ? (
        <>
          <line x1="0" y1="25" x2="10" y2="25" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="75" x2="10" y2="75" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="25" x2="10" y2="75" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="50" x2="20" y2="50" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </>
      ) : (
        <>
          <line x1="20" y1="25" x2="10" y2="25" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="20" y1="75" x2="10" y2="75" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="25" x2="10" y2="75" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="50" x2="0" y2="50" stroke="var(--color-border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}
