"use client";

import { Match, TEAMS, TeamId } from "@/lib/data";
import { TeamBadge } from "./team-badge";

type Pick = TeamId | "TIE" | undefined;

export function MatchCard({
  match,
  pick,
  onPick,
}: {
  match: Match;
  pick: Pick;
  onPick: (id: number, value: Pick) => void;
}) {
  const t1 = TEAMS[match.team1];
  const t2 = TEAMS[match.team2];
  const decided = pick !== undefined;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-zinc-950/60 transition-all ${
        decided
          ? "border-white/15 shadow-lg shadow-black/20"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        <span>Match {match.id}</span>
        <span>{match.date}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3">
        <TeamButton
          teamId={t1.id}
          selected={pick === t1.id}
          onClick={() =>
            onPick(match.id, pick === t1.id ? undefined : t1.id)
          }
          align="left"
        />
        <button
          type="button"
          onClick={() => onPick(match.id, pick === "TIE" ? undefined : "TIE")}
          className={`flex h-9 items-center justify-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            pick === "TIE"
              ? "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/40"
              : "text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
          }`}
          title="Tie / No result"
        >
          NR
        </button>
        <TeamButton
          teamId={t2.id}
          selected={pick === t2.id}
          onClick={() =>
            onPick(match.id, pick === t2.id ? undefined : t2.id)
          }
          align="right"
        />
      </div>
    </div>
  );
}

function TeamButton({
  teamId,
  selected,
  onClick,
  align,
}: {
  teamId: TeamId;
  selected: boolean;
  onClick: () => void;
  align: "left" | "right";
}) {
  const team = TEAMS[teamId];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${
        align === "right" ? "flex-row-reverse text-right" : "text-left"
      } ${
        selected
          ? "bg-white/10 ring-1 ring-white/25"
          : "hover:bg-white/5"
      }`}
      style={
        selected
          ? {
              boxShadow: `inset 0 0 0 1px ${team.primary}, 0 0 24px -8px ${team.primary}`,
            }
          : undefined
      }
    >
      <TeamBadge team={team} size="sm" />
      <div
        className={`flex flex-col ${
          align === "right" ? "items-end" : "items-start"
        }`}
      >
        <span
          className={`text-sm font-semibold ${
            selected ? "text-white" : "text-zinc-300"
          }`}
        >
          {team.shortName}
        </span>
        {selected && (
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: team.primary }}
          >
            Winner
          </span>
        )}
      </div>
    </button>
  );
}
