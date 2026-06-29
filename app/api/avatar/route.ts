import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wiki = req.nextUrl.searchParams.get("wiki");
  if (!wiki) {
    return NextResponse.json({ error: "wiki param required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`, {
      headers: { "User-Agent": "FIFA26Predictor/1.0" },
    });

    if (!res.ok) {
      return NextResponse.redirect(`https://ui-avatars.com/api/?name=${wiki.split("_").pop()}&size=96&background=eee&color=555&bold=true&format=png`);
    }

    const data = await res.json();
    const imageUrl = data.thumbnail?.source;

    if (!imageUrl) {
      return NextResponse.redirect(`https://ui-avatars.com/api/?name=${wiki.split("_").pop()}&size=96&background=eee&color=555&bold=true&format=png`);
    }

    return NextResponse.redirect(imageUrl);
  } catch {
    return NextResponse.redirect(`https://ui-avatars.com/api/?name=${wiki.split("_").pop()}&size=96&background=eee&color=555&bold=true&format=png`);
  }
}
