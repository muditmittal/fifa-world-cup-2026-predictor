"use client";

import { groups } from "@/lib/tournament-data";
import { useState } from "react";

export function GroupRecap() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">Group Stage Results</span>
        <span className="text-[var(--color-text-muted)]">({groups.length} groups)</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in">
          {groups.map((group) => (
            <div
              key={group.group}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden"
            >
              <div className="px-3 py-2 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <span className="text-xs font-bold text-[var(--color-accent)]">
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
      )}
    </div>
  );
}
