"use client";

import { Match, TeamId } from "@/lib/data";
import { Predictions } from "@/lib/standings";
import { MatchCard } from "./match-card";

export function MatchesPanel({
  matches,
  predictions,
  onPick,
  onReset,
  onRandomize,
  onFavouriteWins,
}: {
  matches: Match[];
  predictions: Predictions;
  onPick: (id: number, value: TeamId | "TIE" | undefined) => void;
  onReset: () => void;
  onRandomize: () => void;
  onFavouriteWins: () => void;
}) {
  const completed = Object.values(predictions).filter(
    (v) => v !== undefined
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-zinc-900/60 to-zinc-950/60 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Remaining Matches
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {completed} of {matches.length} predicted
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onFavouriteWins}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10"
            title="Pick the higher-ranked team in every remaining match"
          >
            Higher seed wins
          </button>
          <button
            type="button"
            onClick={onRandomize}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Randomize
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            pick={predictions[match.id]}
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}
