"use client";

import { groups } from "@/lib/tournament-data";

export function GroupStageView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map((group) => (
        <div
          key={group.group}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-bold">
              Group {group.group}
            </span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                <th className="text-left px-3 py-1.5 font-medium">Team</th>
                <th className="px-1 py-1.5 font-medium">P</th>
                <th className="px-1 py-1.5 font-medium">W</th>
                <th className="px-1 py-1.5 font-medium">D</th>
                <th className="px-1 py-1.5 font-medium">L</th>
                <th className="px-1 py-1.5 font-medium">GD</th>
                <th className="px-1.5 py-1.5 font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.teams.map((team) => (
                <tr
                  key={team.code}
                  className={`border-t border-[var(--color-border)] ${
                    team.qualified ? "" : "opacity-50"
                  }`}
                >
                  <td className={`py-1.5 pl-3 pr-1 border-l-2 ${team.qualified ? "border-l-[var(--color-accent)]" : "border-l-transparent"}`}>
                    <span className="flex items-center gap-1.5">
                      <span>{team.flag}</span>
                      <span className={team.qualified ? "font-medium" : ""}>
                        {team.name}
                      </span>
                    </span>
                  </td>
                  <td className="text-center px-1 py-1.5">{team.played}</td>
                  <td className="text-center px-1 py-1.5">{team.won}</td>
                  <td className="text-center px-1 py-1.5">{team.drawn}</td>
                  <td className="text-center px-1 py-1.5">{team.lost}</td>
                  <td className="text-center px-1 py-1.5">
                    <span className={team.gd > 0 ? "text-[var(--color-correct)]" : team.gd < 0 ? "text-[var(--color-incorrect)]" : ""}>
                      {team.gd > 0 ? `+${team.gd}` : team.gd}
                    </span>
                  </td>
                  <td className="text-center px-1.5 py-1.5 font-bold">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
