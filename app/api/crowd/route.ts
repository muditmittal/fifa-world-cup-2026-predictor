import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { bracket } from "@/lib/tournament-data";
import { type BracketState, getEffectiveTeams } from "@/lib/bracket-logic";

export async function GET() {
  const sql = getDb();

  const rows = await sql`
    SELECT bracket_state FROM predictions WHERE bracket_state IS NOT NULL
  `;

  const totalUsers = rows.length;
  if (totalUsers === 0) {
    return NextResponse.json({ crowd: {}, totalUsers: 0 });
  }

  // For each match, count how many users picked each team
  const crowd: Record<number, { teamA: string | null; teamB: string | null; picksA: number; picksB: number; total: number }> = {};

  for (const fixture of bracket) {
    let picksA = 0;
    let picksB = 0;

    for (const row of rows) {
      const state = row.bracket_state as BracketState;
      if (!state?.matches) continue;

      const { teamA, teamB } = getEffectiveTeams(state, fixture.id);
      const pick = state.matches[fixture.id]?.predictedWinner;

      if (pick === teamA) picksA++;
      else if (pick === teamB) picksB++;
    }

    // Get team codes from first user's state that has them
    let teamACd: string | null = null;
    let teamBCd: string | null = null;
    if (fixture.teamACode) {
      teamACd = fixture.teamACode;
      teamBCd = fixture.teamBCode;
    } else {
      for (const row of rows) {
        const state = row.bracket_state as BracketState;
        const { teamA, teamB } = getEffectiveTeams(state, fixture.id);
        if (teamA && teamB) {
          teamACd = teamA;
          teamBCd = teamB;
          break;
        }
      }
    }

    crowd[fixture.id] = {
      teamA: teamACd,
      teamB: teamBCd,
      picksA,
      picksB,
      total: picksA + picksB,
    };
  }

  return NextResponse.json({ crowd, totalUsers });
}
