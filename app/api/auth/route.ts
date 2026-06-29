import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("wc_session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const { id } = JSON.parse(sessionCookie);
    const sql = getDb();
    const result = await sql`SELECT id, username, avatar, is_public FROM users WHERE id = ${id}`;
    if (result.length === 0) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: result[0] });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: NextRequest) {
  const { action, username, pin, avatar } = await req.json();
  const sql = getDb();

  if (action === "signup") {
    if (!username || !pin || pin.length !== 4) {
      return NextResponse.json({ error: "Username and 4-digit PIN required" }, { status: 400 });
    }

    try {
      const result = await sql`
        INSERT INTO users (username, pin, avatar) VALUES (${username.toLowerCase().trim()}, ${pin}, ${avatar || null})
        RETURNING id, username, avatar
      `;
      const user = result[0];
      const response = NextResponse.json({ user });
      response.cookies.set("wc_session", JSON.stringify({ id: user.id }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: "/",
      });
      return response;
    } catch (e: any) {
      if (e.message?.includes("unique") || e.code === "23505") {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }
  }

  if (action === "login") {
    if (!username || !pin) {
      return NextResponse.json({ error: "Username and PIN required" }, { status: 400 });
    }

    const result = await sql`
      SELECT id, username, avatar, is_public FROM users WHERE username = ${username.toLowerCase().trim()} AND pin = ${pin}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid username or PIN" }, { status: 401 });
    }

    const user = result[0];
    const response = NextResponse.json({ user });
    response.cookies.set("wc_session", JSON.stringify({ id: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
    return response;
  }

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("wc_session");
    return response;
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
