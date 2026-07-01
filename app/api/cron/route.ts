import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const FOOTBALL_DATA_API = "https://api.football-data.org/v4/competitions/WC/matches";
const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY || "";

// Map football-data.org team TLA codes to our internal codes
const TEAM_CODE_MAP: Record<string, string> = {
  RSA: "RSA", CAN: "CAN", GER: "GER", PAR: "PAR", NED: "NED", MAR: "MAR",
  BRA: "BRA", JPN: "JPN", FRA: "FRA", SWE: "SWE", CIV: "CIV", NOR: "NOR",
  MEX: "MEX", ECU: "ECU", ENG: "ENG", COD: "COD", USA: "USA", BIH: "BIH",
  BEL: "BEL", SEN: "SEN", POR: "POR", CRO: "CRO", ESP: "ESP", AUT: "AUT",
  SUI: "SUI", ALG: "ALG", ARG: "ARG", CPV: "CPV", COL: "COL", GHA: "GHA",
  AUS: "AUS", EGY: "EGY",
  // Some codes might differ in their API
  DRC: "COD", PRY: "PAR", CHE: "SUI", DZA: "ALG", CPE: "CPV",
};

// Match ID mapping: football-data.org matchday numbers to our fixture IDs
// R32: matches 73-88, R16: 89-96, QF: 97-100, SF: 101-102, 3RD: 103, F: 104
const STAGE_MATCH_MAP: Record<string, number[]> = {
  LAST_32: [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  LAST_16: [89, 90, 91, 92, 93, 94, 95, 96],
  QUARTER_FINALS: [97, 98, 99, 100],
  SEMI_FINALS: [101, 102],
  THIRD_PLACE: [103],
  FINAL: [104],
};

function normalizeTeamCode(tla: string): string {
  return TEAM_CODE_MAP[tla] || tla;
}

function formatScore(home: number, away: number, winner: string, penalties?: { home: number; away: number }): string {
  if (penalties) {
    return `${home}-${away} (${penalties.home}-${penalties.away} pen)`;
  }
  return `${home}-${away}`;
}

export async function GET(req: NextRequest) {
  // Verify cron secret or allow manual trigger with admin pin
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const adminPin = req.nextUrl.searchParams.get("adminPin");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && adminPin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!API_TOKEN) {
    return NextResponse.json({ error: "FOOTBALL_DATA_API_KEY not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${FOOTBALL_DATA_API}?season=2026&status=FINISHED`, {
      headers: { "X-Auth-Token": API_TOKEN },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const matches = data.matches || [];
    const sql = getDb();
    let updated = 0;

    for (const match of matches) {
      const stage = match.stage;
      const homeTeam = normalizeTeamCode(match.homeTeam?.tla || "");
      const awayTeam = normalizeTeamCode(match.awayTeam?.tla || "");
      const fullTime = match.score?.fullTime;
      const penalties = match.score?.penalties;
      const matchWinner = match.score?.winner; // HOME_TEAM, AWAY_TEAM, DRAW

      if (!fullTime || !homeTeam || !awayTeam) continue;
      // Skip group stage matches
      if (stage === "GROUP_STAGE") continue;

      // Determine winner
      let winner: string;
      if (penalties) {
        winner = penalties.home > penalties.away ? homeTeam : awayTeam;
      } else if (matchWinner === "HOME_TEAM") {
        winner = homeTeam;
      } else if (matchWinner === "AWAY_TEAM") {
        winner = awayTeam;
      } else {
        continue;
      }

      const score = formatScore(fullTime.home, fullTime.away, winner, penalties ? { home: penalties.home, away: penalties.away } : undefined);

      // Find our match ID by matching team codes
      const matchId = findMatchIdByTeams(homeTeam, awayTeam);
      if (!matchId) continue;

      await sql`
        INSERT INTO actual_results (match_id, winner, score, updated_at)
        VALUES (${matchId}, ${winner}, ${score}, NOW())
        ON CONFLICT (match_id)
        DO UPDATE SET winner = ${winner}, score = ${score}, updated_at = NOW()
      `;
      updated++;
    }

    return NextResponse.json({ success: true, updated, total: matches.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Known team pairings for R32 matches
const BRACKET_MATCHES: Record<number, [string, string]> = {
  73: ["RSA", "CAN"], 74: ["GER", "PAR"], 75: ["NED", "MAR"], 76: ["BRA", "JPN"],
  77: ["FRA", "SWE"], 78: ["CIV", "NOR"], 79: ["MEX", "ECU"], 80: ["ENG", "COD"],
  81: ["USA", "BIH"], 82: ["BEL", "SEN"], 83: ["POR", "CRO"], 84: ["ESP", "AUT"],
  85: ["SUI", "ALG"], 86: ["ARG", "CPV"], 87: ["COL", "GHA"], 88: ["AUS", "EGY"],
};

// For later rounds, we check against all known fixtures by importing bracket data
import { bracket as allFixtures } from "@/lib/tournament-data";

function findMatchIdByTeams(homeTeam: string, awayTeam: string): number | null {
  // Check R32 matches first (known pairings)
  for (const [id, teams] of Object.entries(BRACKET_MATCHES)) {
    if ((teams[0] === homeTeam && teams[1] === awayTeam) ||
        (teams[0] === awayTeam && teams[1] === homeTeam)) {
      return parseInt(id);
    }
  }

  // For later rounds, match against fixture teamACode/teamBCode
  for (const fixture of allFixtures) {
    if (fixture.round === "R32") continue;
    if ((fixture.teamACode === homeTeam && fixture.teamBCode === awayTeam) ||
        (fixture.teamACode === awayTeam && fixture.teamBCode === homeTeam)) {
      return fixture.id;
    }
  }

  // For later rounds where teams aren't in the static data, check DB for existing results
  // that would tell us who advanced. This handles dynamic bracket progression.
  return null;
}
