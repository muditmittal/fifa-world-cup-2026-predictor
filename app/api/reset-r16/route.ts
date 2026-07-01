import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { type BracketState } from "@/lib/bracket-logic";

const R16_PLUS_IDS = [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104];

export async function POST(req: NextRequest) {
  const { adminPin } = await req.json().catch(() => ({}));
  if (adminPin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const users = await sql`SELECT user_id, bracket_state FROM predictions WHERE bracket_state IS NOT NULL`;

  let updated = 0;
  for (const user of users) {
    const state = user.bracket_state as BracketState;
    if (!state?.matches) continue;

    let changed = false;
    for (const matchId of R16_PLUS_IDS) {
      if (state.matches[matchId]?.predictedWinner || state.matches[matchId]?.predictedScore) {
        state.matches[matchId] = {
          matchId,
          predictedWinner: null,
          predictedScore: null,
          actualWinner: null,
          actualScore: null,
          isPlayed: false,
        };
        changed = true;
      }
    }

    if (changed) {
      await sql`UPDATE predictions SET bracket_state = ${JSON.stringify(state)}::jsonb, updated_at = NOW() WHERE user_id = ${user.user_id}`;
      updated++;
    }
  }

  return NextResponse.json({ success: true, updated, totalUsers: users.length });
}
