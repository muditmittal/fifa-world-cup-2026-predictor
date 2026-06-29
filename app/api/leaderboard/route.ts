import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calculateScore } from "@/lib/scoring";
import { type BracketState } from "@/lib/bracket-logic";

export async function GET() {
  const sql = getDb();

  const rows = await sql`
    SELECT u.id, u.username, u.avatar, p.bracket_state
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    ORDER BY u.created_at
  `;

  const leaderboard = rows
    .map((row) => {
      const state = row.bracket_state as BracketState | null;
      const score = state ? calculateScore(state) : { totalPoints: 0, correctWinners: 0, correctScores: 0, matchesPlayed: 0 };
      return {
        id: row.id,
        username: row.username,
        avatar: row.avatar,
        points: score.totalPoints,
        correctWinners: score.correctWinners,
        correctScores: score.correctScores,
      };
    })
    .sort((a, b) => b.points - a.points || b.correctWinners - a.correctWinners || b.correctScores - a.correctScores);

  return NextResponse.json({ leaderboard });
}
