"use client";

import { type BracketState, getProgress } from "@/lib/bracket-logic";
import { calculateScore } from "@/lib/scoring";

interface ProgressBarProps {
  state: BracketState;
  username?: string;
}

export function ProgressBar({ state, username }: ProgressBarProps) {
  const { made, total } = getProgress(state);
  const remaining = total - made;
  const pct = (made / total) * 100;
  const score = calculateScore(state);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-11 h-11">
        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          <circle
            cx="22"
            cy="22"
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
        <img
          src="/trionda-cursor.png"
          alt=""
          className="absolute inset-0 m-auto w-5 h-5"
        />
      </div>
      <span className="font-bold font-[family-name:var(--font-geist-mono)] text-xs text-[var(--color-text)] px-1.5 py-0.5 border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">{username && <>{username} · </>}{score.totalPoints} pts</span>
    </div>
  );
}
