"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { LeaderboardModal } from "@/components/leaderboard-modal";
import { ShareModal } from "@/components/share-modal";
import { CrowdProvider } from "@/lib/crowd-context";
import { MatchSidebar } from "@/components/match-sidebar";
import { ScoreModal } from "@/components/score-modal";
import { AuthModal } from "@/components/auth-modal";
import { calculateScore } from "@/lib/scoring";
import { useIsMobile } from "@/lib/use-mobile";

interface User {
  id: number;
  username: string;
  avatar?: string | null;
  is_public?: boolean;
}

export default function Home() {
  const isMobile = useIsMobile();
  const [state, setState] = useState<BracketState | null>(null);
  const [view, setView] = useState<"group" | "knockout">("knockout");
  const [showMobileList, setShowMobileList] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [viewingBracket, setViewingBracket] = useState<{ userId: number; username: string } | null>(null);
  const [viewingState, setViewingState] = useState<BracketState | null>(null);
  const [didLogout, setDidLogout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for existing session on mount (cookie + localStorage fallback)
  useEffect(() => {
    async function checkSession() {
      // Try server-side cookie session first
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("wc_user", JSON.stringify(data.user));
          await loadUserPredictions(data.user.id);
          return;
        }
      } catch {}

      // Fallback to localStorage
      const stored = localStorage.getItem("wc_user");
      if (stored) {
        try {
          const u = JSON.parse(stored) as User;
          setUser(u);
          await loadUserPredictions(u.id);
          return;
        } catch {}
      }

      // No session found
      setState(loadState() || createInitialState());
      setAuthChecked(true);
    }
    checkSession();
  }, []);

  const loadUserPredictions = async (userId: number) => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      if (data.bracketState) {
        setState(data.bracketState);
      } else {
        const local = loadState();
        setState(local || createInitialState());
      }
    } catch {
      // DB unreachable or user doesn't exist — fall back to local
      const local = loadState();
      setState(local || createInitialState());
    }
    setAuthChecked(true);
  };

  const handleAuth = (u: User) => {
    setUser(u);
    loadUserPredictions(u.id);
  };

  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    if (!user) return;
    setShowShareModal(true);
  };

  const confirmShare = async (newUsername: string, newAvatar: string | null) => {
    if (!user) return;
    try {
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, username: newUsername, avatar: newAvatar }),
      });
      const updatedUser = { ...user, username: newUsername, avatar: newAvatar, is_public: true };
      setUser(updatedUser);
      localStorage.setItem("wc_user", JSON.stringify(updatedUser));
      setShowShareModal(false);
      setShowLeaderboard(true);
    } catch {}
  };

  const handleLogout = async () => {
    localStorage.removeItem("wc_user");
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }).catch(() => {});
    setUser(null);
    setDidLogout(true);
  };

  // Load another user's bracket for viewing
  useEffect(() => {
    if (!viewingBracket) {
      setViewingState(null);
      return;
    }
    fetch(`/api/predictions/${viewingBracket.userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.bracketState) setViewingState(data.bracketState);
      })
      .catch(() => setViewingBracket(null));
  }, [viewingBracket]);

  // Save to localStorage immediately, debounce DB save
  useEffect(() => {
    if (state) {
      saveState(state);

      if (user) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, bracketState: state }),
          }).catch(() => {});
        }, 2000);
      }
    }
  }, [state, user]);

  const handlePick = useCallback(
    (matchId: number, teamCode: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const newState = setPrediction(prev, matchId, teamCode);

        // If a score already exists and winner changed, flip it
        const { teamA } = getEffectiveTeams(prev, matchId);
        const isTeamA = teamCode === teamA;
        const currentScore = newState.matches[matchId]?.predictedScore;

        if (currentScore && !currentScore.includes("pen")) {
          const parts = currentScore.split("-").map(Number);
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const [a, b] = parts;
            const scoreIndicatesTeamA = a > b;
            if (isTeamA && !scoreIndicatesTeamA) {
              newState.matches[matchId] = { ...newState.matches[matchId], predictedScore: `${b}-${a}` };
            } else if (!isTeamA && scoreIndicatesTeamA) {
              newState.matches[matchId] = { ...newState.matches[matchId], predictedScore: `${b}-${a}` };
            }
          }
        }

        return newState;
      });
    },
    []
  );

  const handleSync = useCallback(async () => {
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const results = data.results.map((r: { match_id: number; winner: string; score: string }) => ({
          matchId: r.match_id,
          winner: r.winner,
          score: r.score,
        }));
        setState((prev) => {
          if (!prev) return prev;
          return applyActualResults(prev, results);
        });
      }
    } catch {
      // Fallback to static results
      setState((prev) => {
        if (!prev) return prev;
        if (actualResults.length === 0) return prev;
        return applyActualResults(prev, actualResults);
      });
    }
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

        // Full reset signal (winner + score)
        if (scoreA === -1 && scoreB === -1) {
          const { clearPrediction } = require("@/lib/bracket-logic");
          return clearPrediction(prev, matchId);
        }

        // Clear score only (keep winner)
        if (scoreA === -2 && scoreB === -2) {
          newState.matches[matchId] = {
            ...newState.matches[matchId],
            predictedScore: null,
          };
          return newState;
        }

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

  if (!authChecked || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Loading bracket...</div>
      </div>
    );
  }

  return (
    <CrowdProvider>
    <>
    {!user && <AuthModal onAuth={handleAuth} defaultMode={didLogout ? "login" : "signup"} />}
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--color-bg)] shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-2 md:py-4 flex items-center justify-between">
          {/* Left: score pill — on mobile opens bracket, on desktop opens modal */}
          <button className="flex items-center gap-2" onClick={() => {
            if (viewingBracket) return;
            if (isMobile) { setShowMobileList(true); } else { setShowScoreModal(true); }
          }}>
            <ProgressBar
              state={viewingBracket && viewingState ? viewingState : state}
              username={viewingBracket ? viewingBracket.username : user?.username}
            />
          </button>

          {/* Center: logo on desktop, close button on mobile when in bracket */}
          <img src="/App Logo Black.png" alt="World Cup Predictor" className="h-16 logo-light hidden md:block" />
          <img src="/App Logo White.png" alt="World Cup Predictor" className="h-16 logo-dark hidden md:block" />
          {isMobile && showMobileList && (
            <button
              onClick={() => setShowMobileList(false)}
              className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] transition-colors md:hidden"
            >
              <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Right: share/leaderboard + toggle */}
          <div className="flex items-center gap-3">
          {user?.is_public ? (
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-2.5 py-1 text-xs font-medium border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Leaderboard
            </button>
          ) : (
            <button
              onClick={handleShare}
              className="px-2.5 py-1 text-xs font-bold border border-[var(--color-correct)] text-[var(--color-correct)] rounded hover:bg-[var(--color-correct)]/10 transition-colors"
            >
              Share
            </button>
          )}
          <div className="hidden md:flex items-center gap-1 bg-[var(--color-surface)] rounded-lg p-0.5">
            <button
              onClick={() => setView("group")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "group"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Group
            </button>
            <button
              onClick={() => setView("knockout")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "knockout"
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Knockout
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-2 md:px-4 overflow-hidden flex flex-col">
        {/* Viewing banner */}
        {viewingBracket && (
          <div className="flex items-center justify-between px-4 py-2 mb-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shrink-0">
            <span className="text-xs text-[var(--color-text-muted)]">
              Viewing <span className="font-bold text-[var(--color-text)]">{viewingBracket.username}</span>&apos;s bracket
            </span>
            <button
              onClick={() => setViewingBracket(null)}
              className="text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              Back to mine
            </button>
          </div>
        )}

        {/* Mobile: show list view by default */}
        {isMobile && !showMobileList ? (
          <div className="flex-1 overflow-y-auto max-w-[480px] mx-auto w-full">
            <ScoreModal
              summary={calculateScore(viewingBracket && viewingState ? viewingState : state)}
              state={viewingBracket && viewingState ? viewingState : state}
              onClose={() => {}}
              onSync={handleSync}
              onPickWinner={viewingBracket ? () => {} : handlePick}
              onScorePredict={viewingBracket ? () => {} : handleScorePredict}
              username={viewingBracket ? viewingBracket.username : user?.username}
              avatar={user?.avatar}
              onLogout={handleLogout}
              embedded
            />
            {/* Mobile footer — scrolls with content */}
            <div className="flex items-center justify-between px-4 py-4 mt-2 border-t border-[var(--color-border-light)]">
              <ThemeToggle showLabel />
              <button
                onClick={handleReset}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        ) : view === "knockout" ? (
          <div className="flex-1 overflow-auto">
            {viewingBracket && viewingState ? (
              <BracketView state={viewingState} onPick={() => {}} onCardClick={() => {}} onScoreChange={() => {}} />
            ) : (
              <BracketView state={state} onPick={handlePick} onCardClick={(id, pos) => { setSelectedMatchId(id); setPanelPos(pos || null); }} onScoreChange={(id, a, b) => handleScorePredict(id, a, b)} />
            )}
          </div>
        ) : (
          <GroupStageView />
        )}

      </main>

      {/* Footer — hidden on mobile */}
      <footer className="shrink-0 py-2 px-4 hidden md:block">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <ThemeToggle showLabel />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">
              Sources: FIFA.com · Sporting News · Wikipedia
            </span>
            <SyncButton onSync={handleSync} lastSynced={state.lastSynced} />
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-incorrect)] transition-colors px-2 py-1 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset bracket
          </button>
        </div>
      </footer>

      {/* Match detail floating panel */}
      {selectedMatchId && (
        <MatchSidebar
          matchId={selectedMatchId}
          state={state}
          onClose={() => { setSelectedMatchId(null); setPanelPos(null); }}
          onPickWinner={handlePick}
          onScorePredict={handleScorePredict}
          position={panelPos}
        />
      )}

      {/* Score modal */}
      {showScoreModal && (
        <ScoreModal
          summary={calculateScore(state)}
          state={state}
          onClose={() => setShowScoreModal(false)}
          onSync={handleSync}
          onPickWinner={handlePick}
          onScorePredict={handleScorePredict}
          username={user?.username}
          avatar={user?.avatar}
          onLogout={handleLogout}
        />
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <LeaderboardModal
          currentUserId={user?.id}
          onClose={() => setShowLeaderboard(false)}
          onViewBracket={(userId, username) => {
            setShowLeaderboard(false);
            setViewingBracket({ userId, username });
          }}
        />
      )}

      {/* Share modal */}
      {showShareModal && user && (
        <ShareModal
          username={user.username}
          avatar={user.avatar || null}
          onConfirm={confirmShare}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
    </>
    </CrowdProvider>
  );
}

