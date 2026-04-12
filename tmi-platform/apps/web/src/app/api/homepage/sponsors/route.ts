import { proxyToApi } from "@/lib/apiProxy";
import { sponsorCampaigns } from "@/lib/placeholders/sponsorCampaigns";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const upstream = await proxyToApi(req as unknown as Request, "/sponsors/active");
  if (upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json({
      status: "ok",
      source: "live",
      timestamp: new Date().toISOString(),
      sponsors: Array.isArray(payload) ? payload : payload?.sponsors ?? [],
    });
  }

  return NextResponse.json({
    status: "ok",
    source: "fallback",
    timestamp: new Date().toISOString(),
    sponsors: sponsorCampaigns,
  });
}
