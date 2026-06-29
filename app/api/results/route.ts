import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const sql = getDb();
  const results = await sql`SELECT match_id, winner, score FROM actual_results ORDER BY match_id`;
  return NextResponse.json({ results });
}

export async function POST(req: NextRequest) {
  const { matchId, winner, score, adminPin } = await req.json();

  if (adminPin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!matchId || !winner || !score) {
    return NextResponse.json({ error: "matchId, winner, and score required" }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    INSERT INTO actual_results (match_id, winner, score, updated_at)
    VALUES (${matchId}, ${winner}, ${score}, NOW())
    ON CONFLICT (match_id)
    DO UPDATE SET winner = ${winner}, score = ${score}, updated_at = NOW()
  `;

  return NextResponse.json({ success: true });
}
