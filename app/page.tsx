"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type BracketState,
  createInitialState,
  setPrediction,
  applyActualResults,
  getEffectiveTeams,
  saveState,
  loadState,
} from "@/lib/bracket-logic";
import { bracket } from "@/lib/tournament-data";
import { actualResults } from "@/lib/actual-results";
import { BracketView } from "@/components/bracket-view";
import { GroupStageView } from "@/components/group-stage-view";
import { ProgressBar } from "@/components/progress-bar";
import { SyncButton } from "@/components/sync-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MatchSidebar } from "@/components/match-sidebar";

export default function Home() {
  const [state, setState] = useState<BracketState | null>(null);
  const [view, setView] = useState<"group" | "knockout">("knockout");
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadState();
    setState(saved || createInitialState());
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const handlePick = useCallback(
    (matchId: number, teamCode: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = setPrediction(prev, matchId, teamCode);

        // Auto-set default scoreline (1-0 or 0-1) if no score is set yet
        const currentScore = newState.matches[matchId]?.predictedScore;
        if (!currentScore) {
          const fixture = bracket.find((m) => m.id === matchId);
          if (fixture) {
            const { teamA } = getEffectiveTeams(prev, matchId);
            const isTeamA = teamCode === teamA;
            newState.matches[matchId] = {
              ...newState.matches[matchId],
              predictedScore: isTeamA ? "1-0" : "0-1",
            };
          }
        }

        return newState;
      });
      setSelectedMatchId(matchId);
    },
    []
  );

  const handleSync = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      if (actualResults.length === 0) return prev;
      return applyActualResults(prev, actualResults);
    });
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Reset all predictions? This cannot be undone.")) {
      setState(createInitialState());
      setSelectedMatchId(null);
    }
  }, []);

  const handleScorePredict = useCallback(
    (matchId: number, scoreA: number, scoreB: number, penalties?: boolean) => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = { ...prev, matches: { ...prev.matches } };
        const scoreStr = penalties ? `${scoreA}-${scoreB} (pen)` : `${scoreA}-${scoreB}`;
        newState.matches[matchId] = {
          ...newState.matches[matchId],
          predictedScore: scoreStr,
        };

        // Auto-set winner based on score (if not penalties — for penalties, user picks winner separately)
        if (!penalties && scoreA !== scoreB) {
          const fixture = bracket.find((m) => m.id === matchId);
          if (fixture) {
            const { teamA, teamB } = getEffectiveTeams(prev, matchId);
            const winner = scoreA > scoreB ? teamA : teamB;
            if (winner) {
              newState.matches[matchId] = {
                ...newState.matches[matchId],
                predictedScore: scoreStr,
                predictedWinner: winner,
              };
            }
          }
        }

        return newState;
      });
    },
    []
  );

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Loading bracket...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-[margin] duration-300 ${selectedMatchId ? "mr-[360px]" : ""}`}>
      {/* Header */}
      <header className="bg-[var(--color-bg)]">
        <div className="max-w-[1600px] mx-auto px-4 py-5 text-center">
          <img src="/trionda.png" alt="Trionda" className="w-10 h-10 mx-auto mb-2 rounded-full object-cover" />
          <h1 className="text-lg font-bold">2026 FIFA World Cup Predictor</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4">
        {/* Controls row: toggle left, progress right */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-0.5">
            <button
              onClick={() => setView("group")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "group"
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Group
            </button>
            <button
              onClick={() => setView("knockout")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "knockout"
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Knockout
            </button>
          </div>
          <ProgressBar state={state} />
        </div>

        {view === "knockout" ? (
          <BracketView state={state} onPick={handlePick} onCardClick={(id) => setSelectedMatchId(id)} />
        ) : (
          <GroupStageView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-3 px-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Sources: FIFA.com · Sporting News · Wikipedia
            </span>
            <SyncButton onSync={handleSync} lastSynced={state.lastSynced} />
          </div>
          <button
            onClick={handleReset}
            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors px-2 py-1"
          >
            Reset bracket
          </button>
        </div>
      </footer>

      {/* Match detail sidebar */}
      {selectedMatchId && (
        <MatchSidebar
          matchId={selectedMatchId}
          state={state}
          onClose={() => setSelectedMatchId(null)}
          onScorePredict={handleScorePredict}
        />
      )}
    </div>
  );
}

