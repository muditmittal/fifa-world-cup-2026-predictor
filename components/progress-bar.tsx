"use client";

import { type BracketState, getProgress } from "@/lib/bracket-logic";

interface ProgressBarProps {
  state: BracketState;
}

export function ProgressBar({ state }: ProgressBarProps) {
  const { made, total } = getProgress(state);
  const pct = (made / total) * 100;

  const playedCount = Object.values(state.matches).filter((m) => m.isPlayed).length;
  const correctCount = Object.values(state.matches).filter(
    (m) => m.isPlayed && m.actualWinner && m.predictedWinner === m.actualWinner
  ).length;
  const incorrectCount = Object.values(state.matches).filter(
    (m) => m.isPlayed && m.actualWinner && m.predictedWinner && m.predictedWinner !== m.actualWinner
  ).length;

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      {playedCount > 0 && (
        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-correct)]" />
            {correctCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-incorrect)]" />
            {incorrectCount}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9">
          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[var(--color-text-muted)]">
            {made}
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          /{total}
        </span>
      </div>
    </div>
  );
}
