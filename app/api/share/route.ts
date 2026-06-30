import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, username, avatar } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sql = getDb();

  if (username || avatar !== undefined) {
    await sql`UPDATE users SET is_public = true, username = COALESCE(${username}, username), avatar = ${avatar} WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET is_public = true WHERE id = ${userId}`;
  }

  return NextResponse.json({ success: true });
}
