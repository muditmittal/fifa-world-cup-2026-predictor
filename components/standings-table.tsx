"use client";

import { StandingRow } from "@/lib/standings";
import { TeamBadge } from "./team-badge";

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="border-b border-white/10 bg-gradient-to-r from-zinc-900/60 to-zinc-950/60 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Projected Standings
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            Top 4 qualify
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[28px_minmax(0,1fr)_36px_28px_28px_28px_42px_56px] items-center gap-x-3 border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <span>#</span>
        <span>Team</span>
        <span className="text-right">P</span>
        <span className="text-right">W</span>
        <span className="text-right">L</span>
        <span className="text-right">NR</span>
        <span className="text-right">Pts</span>
        <span className="text-right">NRR</span>
      </div>
      <ul>
        {rows.map((row) => (
          <li
            key={row.team.id}
            className={`relative grid grid-cols-[28px_minmax(0,1fr)_36px_28px_28px_28px_42px_56px] items-center gap-x-3 border-b border-white/5 px-5 py-3 text-sm transition-colors last:border-b-0 ${
              row.qualified ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"
            }`}
          >
            {row.qualified && (
              <span
                aria-hidden
                className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-emerald-400"
              />
            )}
            <span
              className={`text-xs font-semibold ${
                row.qualified ? "text-emerald-300" : "text-zinc-500"
              }`}
            >
              {row.rank}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              <TeamBadge team={row.team} size="sm" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-white">
                  {row.team.shortName}
                </span>
                <span className="truncate text-[11px] text-zinc-500">
                  {row.team.name}
                </span>
              </div>
              {row.qualified && (
                <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                  Q
                </span>
              )}
            </div>
            <span className="text-right tabular-nums text-zinc-300">
              {row.played}
            </span>
            <span className="text-right tabular-nums text-zinc-300">
              {row.won}
            </span>
            <span className="text-right tabular-nums text-zinc-400">
              {row.lost}
            </span>
            <span className="text-right tabular-nums text-zinc-400">
              {row.noResult}
            </span>
            <span className="text-right tabular-nums font-semibold text-white">
              {row.points}
            </span>
            <span
              className={`text-right tabular-nums text-xs ${
                row.nrr >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {row.nrr >= 0 ? "+" : ""}
              {row.nrr.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 bg-black/20 px-5 py-3 text-[11px] text-zinc-500">
        Sorted by Points → NRR → Current Points. NRR held constant from live table.
      </div>
    </div>
  );
}
