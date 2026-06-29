"use client";

import { useState, useEffect } from "react";
import { CountryFlag } from "./country-flag";

interface LeaderboardEntry {
  id: number;
  username: string;
  avatar: string | null;
  points: number;
  correctWinners: number;
  correctScores: number;
}

interface LeaderboardModalProps {
  currentUserId?: number;
  onClose: () => void;
  onViewBracket: (userId: number, username: string) => void;
}

export function LeaderboardModal({ currentUserId, onClose, onViewBracket }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl w-[420px] max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            <div className="text-base font-bold">Leaderboard</div>
            <div className="text-xs text-[var(--color-text-muted)]">{entries.length} players</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-surface-hover)] rounded">
            <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No players yet</div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {entries.map((entry, idx) => (
                <button
                  key={entry.id}
                  onClick={() => onViewBracket(entry.id, entry.username)}
                  className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  {/* Rank */}
                  <span className={`w-6 text-sm font-bold font-[family-name:var(--font-geist-mono)] ${
                    idx === 0 ? "text-[#FFD700]" : idx === 1 ? "text-[#C0C0C0]" : idx === 2 ? "text-[#CD7F32]" : "text-[var(--color-text-muted)]"
                  }`}>
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                    {entry.avatar?.startsWith("flag:") ? (
                      <CountryFlag code={entry.avatar.replace("flag:", "")} />
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{entry.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${entry.id === currentUserId ? "text-[var(--color-accent)]" : ""}`}>
                      {entry.username}
                      {entry.id === currentUserId && <span className="text-[10px] text-[var(--color-text-muted)] ml-1">(you)</span>}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {entry.correctWinners}W · {entry.correctScores}S
                    </div>
                  </div>

                  {/* Score */}
                  <span className="text-sm font-bold font-[family-name:var(--font-geist-mono)]">
                    {entry.points}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
