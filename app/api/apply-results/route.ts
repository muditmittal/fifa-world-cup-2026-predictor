import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { applyActualResults, type BracketState } from "@/lib/bracket-logic";

export async function POST(req: NextRequest) {
  const { adminPin } = await req.json().catch(() => ({}));
  if (adminPin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  // Get all actual results
  const resultsRows = await sql`SELECT match_id, winner, score FROM actual_results ORDER BY match_id`;
  if (resultsRows.length === 0) {
    return NextResponse.json({ message: "No results to apply", updated: 0 });
  }

  const results = resultsRows.map((r) => ({
    matchId: r.match_id as number,
    winner: r.winner as string,
    score: r.score as string,
  }));

  // Get all users with predictions
  const users = await sql`SELECT user_id, bracket_state FROM predictions WHERE bracket_state IS NOT NULL`;

  let updated = 0;
  for (const user of users) {
    const state = user.bracket_state as BracketState;
    if (!state?.matches) continue;

    const newState = applyActualResults(state, results);

    // Only update if something changed
    const changed = JSON.stringify(newState) !== JSON.stringify(state);
    if (changed) {
      await sql`UPDATE predictions SET bracket_state = ${JSON.stringify(newState)}::jsonb, updated_at = NOW() WHERE user_id = ${user.user_id}`;
      updated++;
    }
  }

  return NextResponse.json({ success: true, updated, totalUsers: users.length });
}
