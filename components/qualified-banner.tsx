"use client";

import { StandingRow } from "@/lib/standings";
import { TeamBadge } from "./team-badge";

const POSITION_LABELS = ["1st", "2nd", "3rd", "4th"];

export function QualifiedBanner({ rows }: { rows: StandingRow[] }) {
  const top4 = rows.slice(0, 4);
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-950/40 to-zinc-950/60 shadow-2xl shadow-emerald-900/10 backdrop-blur">
      <div className="flex items-baseline justify-between border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Playoff Picture
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-300">
          Projected Top 4
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        {top4.map((row, idx) => (
          <div
            key={row.team.id}
            className="relative flex flex-col gap-2 rounded-xl border border-white/10 bg-zinc-950/60 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                {POSITION_LABELS[idx]}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                {idx < 2 ? "Qualifier 1" : "Eliminator"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TeamBadge team={row.team} size="md" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {row.team.shortName}
                </div>
                <div className="truncate text-[11px] text-zinc-500">
                  {row.team.name}
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-white/5 pt-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                Points
              </span>
              <span className="text-lg font-semibold tabular-nums text-white">
                {row.points}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
