import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sql = getDb();
  await sql`UPDATE users SET is_public = true WHERE id = ${userId}`;

  return NextResponse.json({ success: true });
}
