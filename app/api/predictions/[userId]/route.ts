import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const sql = getDb();

  const result = await sql`
    SELECT u.username, u.avatar, p.bracket_state
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    WHERE u.id = ${parseInt(userId)}
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    username: result[0].username,
    avatar: result[0].avatar,
    bracketState: result[0].bracket_state,
  });
}
