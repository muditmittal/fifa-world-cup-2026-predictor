import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sql = getDb();
  const result = await sql`
    SELECT bracket_state, updated_at FROM predictions WHERE user_id = ${parseInt(userId)}
  `;

  if (result.length === 0) {
    return NextResponse.json({ bracketState: null });
  }

  return NextResponse.json({ bracketState: result[0].bracket_state, updatedAt: result[0].updated_at });
}

export async function POST(req: NextRequest) {
  const { userId, bracketState } = await req.json();

  if (!userId || !bracketState) {
    return NextResponse.json({ error: "userId and bracketState required" }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    INSERT INTO predictions (user_id, bracket_state, updated_at)
    VALUES (${userId}, ${JSON.stringify(bracketState)}::jsonb, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET bracket_state = ${JSON.stringify(bracketState)}::jsonb, updated_at = NOW()
  `;

  return NextResponse.json({ success: true });
}
