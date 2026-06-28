"use client";

import { type BracketState, getTeamByCode } from "@/lib/bracket-logic";

interface ChampionDisplayProps {
  state: BracketState;
}

export function ChampionDisplay({ state }: ChampionDisplayProps) {
  const finalMatch = state.matches[103];
  const champion = finalMatch?.predictedWinner || finalMatch?.actualWinner;

  if (!champion) return null;

  const team = getTeamByCode(champion);
  if (!team) return null;

  const isActual = finalMatch?.isPlayed && finalMatch?.actualWinner === champion;

  return (
    <div className="text-center py-6 mb-6 bg-gradient-to-r from-transparent via-[var(--color-surface)] to-transparent rounded-xl">
      <div className="text-4xl mb-2">{team.flag}</div>
      <div className="text-lg font-bold">{team.name}</div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">
        {isActual ? "🏆 World Cup Champions" : "Your predicted champion"}
      </div>
    </div>
  );
}
