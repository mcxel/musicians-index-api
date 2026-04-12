import { proxyToApi } from "@/lib/apiProxy";
import { gameEntries } from "@/lib/placeholders/gameEntries";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const upstream = await proxyToApi(req as unknown as Request, "/contest/seasons/active");
  if (upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json({
      status: "ok",
      source: "live",
      timestamp: new Date().toISOString(),
      contest: payload,
    });
  }

  return NextResponse.json({
    status: "ok",
    source: "fallback",
    timestamp: new Date().toISOString(),
    contest: {
      active: true,
      seasonName: "Weekly Cypher Crown",
      entries: gameEntries.slice(0, 6),
    },
  });
}
