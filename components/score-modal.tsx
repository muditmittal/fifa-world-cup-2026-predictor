"use client";

import { useState } from "react";
import { type ScoreSummary } from "@/lib/scoring";
import { type BracketState, getEffectiveTeams } from "@/lib/bracket-logic";
import { CountryFlag } from "./country-flag";
import { bracket, roundLabels } from "@/lib/tournament-data";
import { flagColors, teamPrimaryColor } from "@/lib/all-teams";

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
}

export function ScoreModal({ summary, state, onClose, onSync, onPickWinner, onScorePredict, username, avatar, onLogout }: ScoreModalProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl w-[540px] max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header: avatar + username + actions */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
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
          {onSync && (
            <button
              onClick={onSync}
              className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
              title="Sync results"
            >
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
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
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded">
            <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

        {/* Stats summary: pts | correct winners | correct scores */}
        <div className="flex items-center px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
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
                <div className="text-center flex-1 border-l border-[var(--color-border)]">
                  <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)]">{summary.correctWinners} <span className="text-[var(--color-text-muted)] font-normal text-sm">/ {winnerPicks}</span></div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Winners</div>
                </div>
                <div className="text-center flex-1 border-l border-[var(--color-border)]">
                  <div className="text-lg font-bold font-[family-name:var(--font-geist-mono)] text-[var(--color-correct)]">{summary.correctScores} <span className="text-[var(--color-text-muted)] font-normal text-sm">/ {scorePicks}</span></div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Scores</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Column headers */}
        <div className="flex items-center px-5 py-2 border-b border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
          <div className="w-8">#</div>
          <div className="flex-1">Match</div>
          <div className="w-14 text-center">Winner</div>
          <div className="w-14 text-center">Score</div>
          <div className="w-10 text-right">Pts</div>
        </div>

        {/* Match list — all 32 games grouped by round */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-[var(--color-border)]">
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

function MatchRow({ fixtureId, state, summary, onPickWinner, onScorePredict }: {
  fixtureId: number;
  state: BracketState;
  summary: ScoreSummary;
  onPickWinner: (matchId: number, teamCode: string) => void;
  onScorePredict: (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
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
      <div className="flex items-center px-5 py-3 h-12">
        <div className="w-8 text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-text-muted)]">
          {fixtureId}
        </div>
        <div className="flex-1 flex items-center min-w-0 gap-4">
          <TeamPill code={teamA} isSelected={ms?.actualWinner === teamA} isMuted={ms?.actualWinner !== teamA} isPlayed={true} />
          <div className="w-14 h-7 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold font-[family-name:var(--font-geist-mono)]">
              {ms?.actualScore || "–"}
            </span>
          </div>
          <TeamPill code={teamB} isSelected={ms?.actualWinner === teamB} isMuted={ms?.actualWinner !== teamB} isPlayed={true} />
        </div>
        <div className="w-14 text-center">
          {matchScore?.winnerCorrect ? (
            <span className="text-xs font-bold text-[var(--color-correct)]">✓</span>
          ) : (
            <span className="text-xs font-bold text-[var(--color-incorrect)]">✗</span>
          )}
        </div>
        <div className="w-14 text-center">
          {matchScore?.scoreCorrect ? (
            <span className="text-xs font-bold text-[var(--color-correct)]">✓</span>
          ) : predictedScore ? (
            <span className="text-xs font-bold text-[var(--color-incorrect)]">✗</span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">—</span>
          )}
        </div>
        <div className="w-10 text-right">
          <span className={`text-xs font-bold font-[family-name:var(--font-geist-mono)] ${(matchScore?.points ?? 0) > 0 ? "text-[var(--color-correct)]" : "text-[var(--color-incorrect)]"}`}>
            {matchScore?.points ?? 0}
          </span>
        </div>
      </div>
    );
  }

  // Unplayed match: interactive
  return (
    <div className="flex items-center px-5 py-3 h-12">
      <div className="w-8 text-xs font-[family-name:var(--font-geist-mono)] text-[var(--color-text-muted)]">
        {fixtureId}
      </div>
      <div className="flex-1 flex items-center min-w-0 gap-4">
        <TeamPill
          code={teamA}
          isSelected={predictedWinner === teamA}
          isMuted={!!predictedWinner && predictedWinner !== teamA}
          isPlayed={false}
          canSelect={bothTeamsKnown}
          onClick={() => teamA && onPickWinner(fixtureId, teamA)}
        />

        {/* Score between flags — fixed width to prevent shifting */}
        <div className="w-14 h-7 flex items-center justify-center shrink-0 rounded bg-[var(--color-surface)]">
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

      {/* Prediction status columns — empty until match is played */}
      <div className="w-14 text-center">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>
      <div className="w-14 text-center">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>
      <div className="w-10 text-right">
        <span className="text-xs text-[var(--color-text-muted)]">—</span>
      </div>
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
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
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
        className="w-5 h-6 text-center text-xs font-[family-name:var(--font-geist-mono)] font-bold bg-transparent border border-[var(--color-border)] rounded outline-none focus:border-[var(--color-accent)]"
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
        className="w-5 h-6 text-center text-xs font-[family-name:var(--font-geist-mono)] font-bold bg-transparent border border-[var(--color-border)] rounded outline-none focus:border-[var(--color-accent)]"
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
