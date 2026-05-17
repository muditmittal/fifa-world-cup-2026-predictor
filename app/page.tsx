"use client";

import { useMemo, useState } from "react";

import { MatchesPanel } from "@/components/matches-panel";
import { QualifiedBanner } from "@/components/qualified-banner";
import { StandingsTable } from "@/components/standings-table";
import {
  REMAINING_MATCHES,
  TEAMS,
  TEAM_ORDER,
  TeamId,
  basePoints,
} from "@/lib/data";
import { computeStandings, Predictions } from "@/lib/standings";

export default function Home() {
  const [predictions, setPredictions] = useState<Predictions>({});

  const standings = useMemo(() => computeStandings(predictions), [predictions]);

  const completed = Object.values(predictions).filter(
    (v) => v !== undefined
  ).length;
  const total = REMAINING_MATCHES.length;

  function pick(id: number, value: TeamId | "TIE" | undefined) {
    setPredictions((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[id];
      } else {
        next[id] = value;
      }
      return next;
    });
  }

  function reset() {
    setPredictions({});
  }

  function randomize() {
    const next: Predictions = {};
    for (const m of REMAINING_MATCHES) {
      next[m.id] = Math.random() < 0.5 ? m.team1 : m.team2;
    }
    setPredictions(next);
  }

  function favouriteWins() {
    // Use the live (pre-prediction) ranking to decide the "higher seed"
    const rank: Record<TeamId, number> = {} as Record<TeamId, number>;
    const sorted = TEAM_ORDER.map((id) => TEAMS[id]).sort((a, b) => {
      if (basePoints(b) !== basePoints(a)) return basePoints(b) - basePoints(a);
      return b.nrr - a.nrr;
    });
    sorted.forEach((t, i) => {
      rank[t.id] = i;
    });
    const next: Predictions = {};
    for (const m of REMAINING_MATCHES) {
      next[m.id] = rank[m.team1] < rank[m.team2] ? m.team1 : m.team2;
    }
    setPredictions(next);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08)_0%,_rgba(0,0,0,0)_55%),_radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.06)_0%,_rgba(0,0,0,0)_50%),_#0a0a0c] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-full bg-amber-500/15 px-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 ring-1 ring-inset ring-amber-500/30">
                IPL 2026
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                Mar 28 — May 31 · 74 T20s
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Playoff Simulator
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-zinc-400">
              Predict the winner of each remaining league match. The standings
              update live to show who clinches a top‑4 playoff spot.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Stat label="Predicted" value={`${completed}/${total}`} />
            <Stat
              label="Top 4 set"
              value={completed === total ? "Locked" : "Live"}
              accent={completed === total}
            />
          </div>
        </header>

        <div className="mb-6">
          <QualifiedBanner rows={standings} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <StandingsTable rows={standings} />
          <MatchesPanel
            matches={REMAINING_MATCHES}
            predictions={predictions}
            onPick={pick}
            onReset={reset}
            onRandomize={randomize}
            onFavouriteWins={favouriteWins}
          />
        </div>

        <footer className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-zinc-600">
          Built for what-if scenarios. Live points + NRR snapshot taken after
          Match 61 (RCB beat PBKS by 23 runs, May 17, 2026).
        </footer>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-end rounded-xl border px-3 py-2 ${
        accent
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <span
        className={`text-sm font-bold tabular-nums ${
          accent ? "text-emerald-200" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
