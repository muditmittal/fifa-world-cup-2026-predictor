"use client";

import { useState, useRef } from "react";
import { type ScoreSummary } from "@/lib/scoring";
import { type BracketState, getEffectiveTeams } from "@/lib/bracket-logic";
import { CountryFlag } from "./country-flag";
import { bracket, roundLabels, qualifiedTeams } from "@/lib/tournament-data";
import { flagColors, teamPrimaryColor, allTeams } from "@/lib/all-teams";
import { getUnifiedWinPct } from "@/lib/match-odds";
import { getTeamDetail } from "@/lib/team-details";
import { getTeamGroupHistory } from "@/lib/group-matches";

const PLAYER_WIKI: Record<string, string> = {
  messi: "Lionel_Messi", mbappe: "Kylian_Mbappé", haaland: "Erling_Haaland",
  vinicius: "Vinícius_Júnior", bellingham: "Jude_Bellingham", salah: "Mohamed_Salah",
  debruyne: "Kevin_De_Bruyne", rodri: "Rodri_(footballer,_born_1996)", saka: "Bukayo_Saka",
  yamal: "Lamine_Yamal", palmer: "Cole_Palmer", wirtz: "Florian_Wirtz",
  pedri: "Pedri", osimhen: "Victor_Osimhen", hakimi: "Achraf_Hakimi",
  martinez: "Emiliano_Martínez", james: "James_Rodríguez", pulisic: "Christian_Pulisic",
  davies: "Alphonso_Davies", ronaldo: "Cristiano_Ronaldo", neymar: "Neymar",
  modric: "Luka_Modrić", gakpo: "Cody_Gakpo", raphinha: "Raphinha",
  kane: "Harry_Kane", lewandowski: "Robert_Lewandowski",
  diaz: "Luis_Díaz_(Colombian_footballer)", alvarez: "Julián_Álvarez",
  muller: "Thomas_Müller", son: "Son_Heung-min",
};

function getPlayerAvatarUrl(playerId: string): string {
  const wiki = PLAYER_WIKI[playerId];
  if (wiki) return `/api/avatar?wiki=${encodeURIComponent(wiki)}`;
  return `https://ui-avatars.com/api/?name=${playerId}&size=40&background=eee&color=555&bold=true&format=svg`;
}

interface ScoreModalProps {
  summary: ScoreSummary;
  state: BracketState;
  onClose: () => void;
  onSync?: () => void | Promise<void>;
  onPickWinner: (matchId: number, teamCode: string) => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
  username?: string;
  avatar?: string | null;
  onLogout?: () => void;
  embedded?: boolean;
}

export function ScoreModal({ summary, state, onClose, onSync, onPickWinner, onScorePredict, username, avatar, onLogout, embedded }: ScoreModalProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  return (
    <div className={embedded ? "" : "fixed inset-0 z-[99999] flex items-center justify-center"}>
      {!embedded && <div className="absolute inset-0 bg-black/40" onClick={onClose} />}
      <div className={embedded ? "" : "relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl w-[540px] max-h-[80vh] flex flex-col overflow-hidden"}>
      {/* Header: avatar + username + actions — hidden when embedded */}
      <div className={`flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] ${embedded ? "hidden" : ""}`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
            {avatar?.startsWith("flag:") ? (
              <CountryFlag code={avatar.replace("flag:", "")} />
            ) : avatar?.startsWith("player:") ? (
              <img
                src={getPlayerAvatarUrl(avatar.replace("player:", ""))}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${avatar.replace("player:", "")}&size=40&background=eee&color=555&bold=true&format=svg`; }}
              />
            ) : (
              <span className="text-sm font-bold text-[var(--color-text-muted)]">{username?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold">{username || "Player"}</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              {summary.matchesPlayed} / 32 matches completed
              {onLogout && (
                <> · <button onClick={() => { onLogout(); onClose(); }} className="hover:text-[var(--color-incorrect)] transition-colors underline">Sign out</button></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded">
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6.5" />
                <line x1="8" y1="6" x2="8" y2="6.5" strokeLinecap="round" />
                <line x1="8" y1="8" x2="8" y2="11" strokeLinecap="round" />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-1 w-[220px] p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 text-left">
                <div className="text-xs font-bold mb-2">How to Play</div>
                <div className="space-y-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <div className="flex gap-2">
                    <span className="font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)] shrink-0">+10</span>
                    <span>Correct winner</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)] shrink-0">+10</span>
                    <span>Exact scoreline bonus</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold font-[family-name:var(--font-geist-mono)] shrink-0">640</span>
                    <span>Max possible (32 × 20)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!embedded && (
            <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded">
              <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

        {/* Stats summary: pts | correct winners | correct scores — hidden when embedded (pill shows score) */}
        <div className={`flex items-center px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] ${embedded ? "hidden" : ""}`}>
          {(() => {
            const allFixtures = bracket;
            const winnerPicks = allFixtures.filter(f => state.matches[f.id]?.predictedWinner).length;
            const scorePicks = allFixtures.filter(f => state.matches[f.id]?.predictedScore).length;
            return (
              <>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)]">{summary.totalPoints}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Points</div>
                </div>
                <div className="text-center flex-1 border-l border-[var(--color-border)] hidden md:block">
                  <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)]">{summary.correctWinners} <span className="text-[var(--color-text-muted)] font-normal text-sm">/ {winnerPicks}</span></div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Winners</div>
                </div>
                <div className="text-center flex-1 border-l border-[var(--color-border)] hidden md:block">
                  <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)]">{summary.correctScores} <span className="text-[var(--color-text-muted)] font-normal text-sm">/ {scorePicks}</span></div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Scores</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Column headers */}
        {/* Column headers — hidden on mobile when only showing match column */}
        <div className="hidden md:flex items-center px-5 py-2 border-b border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
          <div className="w-8">#</div>
          <div className="flex-1">Match</div>
          <div className="w-14 text-center">Winner</div>
          <div className="w-14 text-center">Score</div>
          <div className="w-10 text-right">Pts</div>
        </div>

        {/* Match list — all 32 games grouped by round */}
        <div className={embedded ? "" : "flex-1 overflow-y-auto"}>
          <div className="divide-y divide-[var(--color-border-light)]">
            {(() => {
              const fixtures = bracket;
              let lastRound = "";
              const elements: React.ReactNode[] = [];

              for (const fixture of fixtures) {
                const displayRound = fixture.round === "3RD" ? "F" : fixture.round;
                if (displayRound !== lastRound) {
                  lastRound = displayRound;
                  elements.push(
                    <div key={`round-${displayRound}`} className="px-5 py-2 bg-[var(--color-surface)] sticky top-0 z-[1]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        {displayRound === "F" ? "Finals" : (roundLabels[displayRound] || displayRound)}
                      </span>
                    </div>
                  );
                }
                elements.push(
                  <MatchRow
                    key={fixture.id}
                    fixtureId={fixture.id}
                    state={state}
                    summary={summary}
                    onPickWinner={onPickWinner}
                    onScorePredict={onScorePredict}
                    embedded={embedded}
                    expanded={expandedMatchId === fixture.id}
                    onToggleExpand={() => setExpandedMatchId(expandedMatchId === fixture.id ? null : fixture.id)}
                  />
                );
              }
              return elements;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchRow({ fixtureId, state, summary, onPickWinner, onScorePredict, embedded, expanded, onToggleExpand }: {
  fixtureId: number;
  state: BracketState;
  summary: ScoreSummary;
  onPickWinner: (matchId: number, teamCode: string) => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
  embedded?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const ms = state.matches[fixtureId];
  const { teamA, teamB } = getEffectiveTeams(state, fixtureId);
  const matchScore = summary.matchScores.find(s => s.matchId === fixtureId);
  const isPlayed = ms?.isPlayed ?? false;
  const predictedWinner = ms?.predictedWinner || null;
  const predictedScore = ms?.predictedScore || null;
  const bothTeamsKnown = !!teamA && !!teamB;

  const handleScoreClick = () => {
    if (isPlayed) return;
    if (!bothTeamsKnown) return;

    // If no winner selected yet, pick left team
    if (!predictedWinner && teamA) {
      onPickWinner(fixtureId, teamA);
    }

    // If no score yet, set a default first, then enter edit mode
    if (!predictedScore) {
      const winner = predictedWinner || teamA;
      const winnerIsA = winner === teamA;
      onScorePredict(fixtureId, winnerIsA ? 1 : 0, winnerIsA ? 0 : 1);
    }
    setEditing(true);
  };

  const submitScore = (a: number, b: number) => {
    const clampedA = Math.max(0, Math.min(9, a));
    const clampedB = Math.max(0, Math.min(9, b));
    const isPen = clampedA === clampedB;
    onScorePredict(fixtureId, clampedA, clampedB, isPen);
    setEditing(false);
  };

  // Completed match: show actual result on left, prediction accuracy on right
  if (isPlayed) {
    return (
      <div ref={rowRef}>
      <div className="flex items-center justify-center md:justify-start px-3 md:px-5 py-3 md:py-3 min-h-[60px] md:h-12">
        <div className="w-8 text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-text-muted)] hidden md:block">
          {fixtureId}
        </div>
        <div className="flex items-center min-w-0 gap-4 md:flex-1">
          <TeamPill code={teamA} isSelected={ms?.actualWinner === teamA} isMuted={ms?.actualWinner !== teamA} isPlayed={true} />
          <div className="w-24 h-11 md:w-14 md:h-7 flex flex-col items-center justify-center shrink-0">
            <ScoreDisplay score={ms?.actualScore || "–"} />
          </div>
          <TeamPill code={teamB} isSelected={ms?.actualWinner === teamB} isMuted={ms?.actualWinner !== teamB} isPlayed={true} />
        </div>
        <div className="w-14 text-center hidden md:block">
          {matchScore?.winnerCorrect ? (
            <span className="text-xs font-bold text-[var(--color-correct)]">✓</span>
          ) : (
            <span className="text-xs font-bold text-[var(--color-incorrect)]">✗</span>
          )}
        </div>
        <div className="w-14 text-center hidden md:block">
          {matchScore?.scoreCorrect ? (
            <span className="text-xs font-bold text-[var(--color-correct)]">✓</span>
          ) : predictedScore ? (
            <span className="text-xs font-bold text-[var(--color-incorrect)]">✗</span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">—</span>
          )}
        </div>
        <div className="w-10 text-right hidden md:block">
          <span className={`text-xs font-bold font-[family-name:var(--font-geist-mono)] ${(matchScore?.points ?? 0) > 0 ? "text-[var(--color-correct)]" : "text-[var(--color-incorrect)]"}`}>
            {matchScore?.points ?? 0}
          </span>
        </div>

        {/* Expand button — mobile only */}
        {/* Expand button — mobile only */}
        {embedded && onToggleExpand && (
          <button
            onClick={() => {
              onToggleExpand();
              if (!expanded) setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
            className="ml-1 p-1 md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded inline panel — mobile only */}
      {expanded && embedded && teamA && teamB && (
        <div className="px-4 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] md:hidden max-w-[360px] mx-auto">
          <ExpandedMatchDetail
            matchId={fixtureId}
            state={state}
            teamA={teamA}
            teamB={teamB}
            predictedWinner={predictedWinner}
            onPickWinner={onPickWinner}
            onScorePredict={onScorePredict}
          />
        </div>
      )}
      </div>
    );
  }

  // Unplayed match: interactive
  return (
    <div ref={rowRef}>
    <div className="flex items-center justify-center md:justify-start px-3 md:px-5 py-3 md:py-3 min-h-[60px] md:h-12">
      <div className="w-8 text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-text-muted)] hidden md:block">
        {fixtureId}
      </div>
      <div className="flex items-center min-w-0 gap-4 md:flex-1">
        <TeamPill
          code={teamA}
          isSelected={predictedWinner === teamA}
          isMuted={!!predictedWinner && predictedWinner !== teamA}
          isPlayed={false}
          canSelect={bothTeamsKnown}
          onClick={() => teamA && onPickWinner(fixtureId, teamA)}
        />

        {/* Score between flags — fixed width to prevent shifting */}
        <div className="w-24 h-11 md:w-14 md:h-7 flex items-center justify-center shrink-0 rounded bg-[var(--color-surface)]">
          {editing ? (
            <ScoreEditor
              score={predictedScore}
              winnerIsA={predictedWinner === teamA}
              onSubmit={submitScore}
              onCancel={() => setEditing(false)}
            />
          ) : predictedScore ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full h-full flex items-center justify-center text-xs font-bold font-[family-name:var(--font-geist-mono)] hover:bg-[var(--color-surface-hover)] rounded transition-colors"
            >
              {predictedScore}
            </button>
          ) : (
            <button
              onClick={handleScoreClick}
              className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] rounded transition-colors font-bold"
            >
              +
            </button>
          )}
        </div>

        <TeamPill
          code={teamB}
          isSelected={predictedWinner === teamB}
          isMuted={!!predictedWinner && predictedWinner !== teamB}
          isPlayed={false}
          canSelect={bothTeamsKnown}
          onClick={() => teamB && onPickWinner(fixtureId, teamB)}
        />
      </div>

      {/* Prediction status columns — hidden on mobile */}
      <div className="w-14 text-center hidden md:block">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>
      <div className="w-14 text-center hidden md:block">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>
      <div className="w-10 text-right hidden md:block">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>

      {/* Expand button — mobile only */}
      {embedded && onToggleExpand && (
        <button
          onClick={() => {
            onToggleExpand();
            if (!expanded) setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }}
          className="ml-1 p-1 md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>

    {/* Expanded inline panel — mobile only */}
    {expanded && embedded && teamA && teamB && (
      <div className="px-4 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] md:hidden max-w-[360px] mx-auto">
        <ExpandedMatchDetail
          matchId={fixtureId}
          state={state}
          teamA={teamA}
          teamB={teamB}
          predictedWinner={predictedWinner}
          onPickWinner={onPickWinner}
          onScorePredict={onScorePredict}
        />
      </div>
    )}
    </div>
  );
}

function TeamPill({ code, isSelected, isPlayed, isMuted, canSelect, onClick }: {
  code: string | null;
  isSelected: boolean;
  isPlayed: boolean;
  isMuted?: boolean;
  canSelect?: boolean;
  onClick?: () => void;
}) {
  if (!code) {
    return <span className="text-xs text-[var(--color-text-muted)] px-2.5 py-1">TBD</span>;
  }

  const interactive = canSelect && !isPlayed && onClick;
  const colors = flagColors[code];
  const primary = teamPrimaryColor[code];

  const selectedStyle = isSelected && colors ? {
    background: `linear-gradient(135deg, ${colors[0]}1F, ${colors[1]}1A, ${colors[2]}1F)`,
    borderColor: primary || "var(--color-accent)",
  } : undefined;

  return (
    <button
      onClick={interactive ? onClick : undefined}
      className={`flex items-center gap-1.5 px-4 h-11 md:px-2.5 md:h-auto md:py-1 rounded-full text-sm md:text-xs font-medium transition-all border ${
        isSelected
          ? ""
          : "border-transparent"
      } ${isMuted ? "opacity-50" : ""} ${interactive ? "cursor-pointer hover:bg-[var(--color-surface-hover)]" : "cursor-default"}`}
      style={selectedStyle}
    >
      <CountryFlag code={code} />
      <span>{code}</span>
    </button>
  );
}

function ScoreEditor({ score, winnerIsA, onSubmit, onCancel }: {
  score: string | null;
  winnerIsA: boolean;
  onSubmit: (a: number, b: number) => void;
  onCancel: () => void;
}) {
  const [sA, sB] = parseScore(score, winnerIsA);

  const handleFirstInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const el = e.target as HTMLInputElement;
      el.value = e.key;
      // Immediately focus the second input
      const bInput = el.nextElementSibling?.nextElementSibling as HTMLInputElement;
      if (bInput) {
        bInput.focus();
        bInput.select();
      }
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const a = parseInt((e.target as HTMLInputElement).value) || 0;
      const bInput = (e.target as HTMLInputElement).nextElementSibling?.nextElementSibling as HTMLInputElement;
      const b = parseInt(bInput?.value) || 0;
      onSubmit(a, b);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleSecondInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const el = e.target as HTMLInputElement;
      el.value = e.key;
      // Submit immediately after second digit
      const aInput = el.previousElementSibling?.previousElementSibling as HTMLInputElement;
      const a = parseInt(aInput?.value) || 0;
      onSubmit(a, parseInt(e.key));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const b = parseInt((e.target as HTMLInputElement).value) || 0;
      const aInput = (e.target as HTMLInputElement).previousElementSibling?.previousElementSibling as HTMLInputElement;
      const a = parseInt(aInput?.value) || 0;
      onSubmit(a, b);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Only cancel if focus moved outside the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onCancel();
    }
  };

  return (
    <div className="flex items-center justify-center gap-px" onBlur={handleBlur}>
      <input
        type="text"
        inputMode="numeric"
        defaultValue={sA}
        maxLength={1}
        className="w-8 h-8 md:w-5 md:h-6 text-center text-sm md:text-xs font-[family-name:var(--font-geist-mono)] font-bold bg-transparent border border-[var(--color-border)] rounded outline-none focus:border-[var(--color-accent)]"
        autoFocus
        onFocus={(e) => e.target.select()}
        onKeyDown={handleFirstInput}
        onChange={() => {}}
      />
      <span className="text-[10px] text-[var(--color-text-muted)] mx-px">-</span>
      <input
        type="text"
        inputMode="numeric"
        defaultValue={sB}
        maxLength={1}
        className="w-8 h-8 md:w-5 md:h-6 text-center text-sm md:text-xs font-[family-name:var(--font-geist-mono)] font-bold bg-transparent border border-[var(--color-border)] rounded outline-none focus:border-[var(--color-accent)]"
        onFocus={(e) => e.target.select()}
        onKeyDown={handleSecondInput}
        onChange={() => {}}
      />
    </div>
  );
}

function parseScore(score: string | null, winnerIsA: boolean): [number, number] {
  if (!score) return winnerIsA ? [1, 0] : [0, 1];
  const match = score.match(/^(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return winnerIsA ? [1, 0] : [0, 1];
  return [parseInt(match[1]), parseInt(match[2])];
}

function ExpandedMatchDetail({ matchId, state, teamA, teamB, predictedWinner, onPickWinner, onScorePredict }: {
  matchId: number;
  state: BracketState;
  teamA: string;
  teamB: string;
  predictedWinner: string | null;
  onPickWinner: (matchId: number, teamCode: string) => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
}) {
  const ms = state.matches[matchId];
  const fixture = bracket.find(f => f.id === matchId);
  const detailA = getTeamDetail(teamA);
  const detailB = getTeamDetail(teamB);

  // Win probability
  const pctA = detailA && detailB
    ? getUnifiedWinPct(matchId, teamA, teamA, teamB, detailA.fifaRanking, detailB.fifaRanking)
    : 50;
  const pctB = 100 - pctA;

  return (
    <div className="space-y-4">
      {/* Match info */}
      <div className="text-center text-[11px] text-[var(--color-text-muted)]">
        {fixture?.date} · {fixture?.venue}
      </div>

      {/* Win probability bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-[family-name:var(--font-geist-mono)] font-bold text-[var(--color-correct)]">{teamA} {pctA}%</span>
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase">Win Prob.</span>
          <span className="font-[family-name:var(--font-geist-mono)] font-bold text-[var(--color-text-muted)]">{pctB}% {teamB}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          <div className="bg-[var(--color-correct)] rounded-l-full" style={{ width: `${pctA}%` }} />
          <div className="bg-[var(--color-border)] rounded-r-full" style={{ width: `${pctB}%` }} />
        </div>
      </div>

      {/* Quick score chips */}
      {predictedWinner && (
        <div className="flex flex-wrap gap-2 justify-center">
          {getQuickScores(predictedWinner === teamA).map((s, i) => (
            <button
              key={i}
              onClick={() => {
                const [a, b] = s.split("-").map(Number);
                onScorePredict(matchId, a, b);
              }}
              className={`px-3 py-2 text-xs font-[family-name:var(--font-geist-mono)] rounded-lg border transition-colors ${
                ms?.predictedScore === s
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => onScorePredict(matchId, 1, 1, true)}
            className={`px-3 py-2 text-xs font-[family-name:var(--font-geist-mono)] rounded-lg border transition-colors ${
              ms?.predictedScore?.includes("pen")
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            Pen
          </button>
        </div>
      )}

      {/* Team A journey */}
      <MobileJourneySection teamCode={teamA} state={state} currentMatchId={matchId} />

      {/* Team B journey */}
      <MobileJourneySection teamCode={teamB} state={state} currentMatchId={matchId} />

      {/* World Cup Stats */}
      {detailA && detailB && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">World Cup Stats</div>
          {[
            { label: "Ranking", a: `#${detailA.fifaRanking}`, b: `#${detailB.fifaRanking}` },
            { label: "Appearances", a: String(detailA.wcAppearances), b: String(detailB.wcAppearances) },
            { label: "Best", a: abbreviateFinish(detailA.bestFinish), b: abbreviateFinish(detailB.bestFinish) },
            { label: "W-D-L", a: `${detailA.wcRecord.w}-${detailA.wcRecord.d}-${detailA.wcRecord.l}`, b: `${detailB.wcRecord.w}-${detailB.wcRecord.d}-${detailB.wcRecord.l}` },
          ].map((row) => (
            <div key={row.label} className="flex items-center h-7 border-b border-[var(--color-border-light)] last:border-0">
              <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)] w-12 text-left">{row.a}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] flex-1 text-center uppercase">{row.label}</span>
              <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)] w-12 text-right">{row.b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileJourneySection({ teamCode, state, currentMatchId }: { teamCode: string; state: BracketState; currentMatchId: number }) {
  const team = qualifiedTeams[teamCode] || allTeams[teamCode];
  if (!team) return null;

  const groupHistory = getTeamGroupHistory(teamCode);
  const knockoutHistory = getKnockoutHistoryForMobile(teamCode, state, currentMatchId);

  const allMatches = [...knockoutHistory, ...groupHistory.map((m) => ({
    ...m,
    round: "Group" as const,
    isPrediction: false,
  }))];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <CountryFlag code={teamCode} />
        <span className="text-xs font-bold">{team.name}</span>
      </div>
      {allMatches.length === 0 ? (
        <div className="text-[11px] text-[var(--color-text-muted)] italic">No matches yet</div>
      ) : (
        allMatches.map((match, i) => {
          const opponentData = qualifiedTeams[match.opponent] || allTeams[match.opponent] || { name: match.opponent };
          const resultColor = match.isPrediction
            ? "text-[var(--color-accent)]"
            : match.result === "W" ? "text-[var(--color-correct)]"
            : match.result === "L" ? "text-[var(--color-incorrect)]"
            : "text-[var(--color-text-muted)]";

          return (
            <div key={i} className="flex items-center gap-1.5 h-6">
              <CountryFlag code={match.opponent} />
              <span className="text-xs flex-1 truncate">{opponentData.name}</span>
              <span className={`text-xs font-bold w-3 text-center ${resultColor}`}>{match.isPrediction ? "P" : match.result}</span>
              <span className="text-xs font-[family-name:var(--font-geist-mono)] w-7 text-right">
                {match.goalsFor > 0 || match.goalsAgainst > 0 ? `${match.goalsFor}-${match.goalsAgainst}` : "–"}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

function getKnockoutHistoryForMobile(teamCode: string, state: BracketState, currentMatchId: number) {
  const history: { date: string; opponent: string; goalsFor: number; goalsAgainst: number; result: "W" | "D" | "L"; round: string; isPrediction: boolean }[] = [];
  const roundOrder = ["R32", "R16", "QF", "SF", "F", "3RD"];
  const currentFixture = bracket.find((m) => m.id === currentMatchId);
  const currentRoundIdx = currentFixture ? roundOrder.indexOf(currentFixture.round) : roundOrder.length;

  for (const fixture of bracket) {
    const fixtureRoundIdx = roundOrder.indexOf(fixture.round);
    if (fixtureRoundIdx >= currentRoundIdx) continue;
    const matchState = state.matches[fixture.id];
    if (!matchState) continue;

    const { teamA: fA, teamB: fB } = getEffectiveTeams(state, fixture.id);
    if (fA !== teamCode && fB !== teamCode) continue;
    const opponent = fA === teamCode ? fB : fA;
    if (!opponent) continue;

    if (matchState.isPlayed && matchState.actualScore) {
      const scores = matchState.actualScore.match(/^(\d+)\s*[-–]\s*(\d+)/);
      const isTeamA = fA === teamCode;
      const gf = isTeamA ? parseInt(scores?.[1] || "0") : parseInt(scores?.[2] || "0");
      const ga = isTeamA ? parseInt(scores?.[2] || "0") : parseInt(scores?.[1] || "0");
      history.push({ date: fixture.date, opponent, goalsFor: gf, goalsAgainst: ga, result: matchState.actualWinner === teamCode ? "W" : gf === ga ? "D" : "L", round: roundLabels[fixture.round] || fixture.round, isPrediction: false });
    } else if (matchState.predictedWinner) {
      let gf = 0, ga = 0;
      if (matchState.predictedScore) {
        const scores = matchState.predictedScore.match(/^(\d+)\s*[-–]\s*(\d+)/);
        if (scores) { const isTeamA = fA === teamCode; gf = isTeamA ? parseInt(scores[1]) : parseInt(scores[2]); ga = isTeamA ? parseInt(scores[2]) : parseInt(scores[1]); }
      }
      history.push({ date: fixture.date, opponent, goalsFor: gf, goalsAgainst: ga, result: matchState.predictedWinner === teamCode ? "W" : "L", round: roundLabels[fixture.round] || fixture.round, isPrediction: true });
    }
  }
  return history;
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

function getQuickScores(winnerIsA: boolean): string[] {
  return winnerIsA
    ? ["1-0", "2-0", "2-1", "3-1"]
    : ["0-1", "0-2", "1-2", "1-3"];
}

function ScoreDisplay({ score }: { score: string }) {
  const penMatch = score.match(/^(\d+\s*[-–]\s*\d+)\s*\((.+?)\)$/);
  if (penMatch) {
    return (
      <>
        <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)]">{penMatch[1]}</span>
        <span className="text-[9px] text-[var(--color-text-muted)] font-[family-name:var(--font-geist-mono)]">{penMatch[2]}</span>
      </>
    );
  }
  return <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)]">{score}</span>;
}
