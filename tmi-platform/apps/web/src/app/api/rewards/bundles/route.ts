import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { buildBundle, BUNDLE_TEMPLATES, type RewardTier } from "@/lib/rewardBundle";

// GET /api/rewards/bundles?tier=WINNER&event=BATTLE
export async function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier") as RewardTier | null;
  const eventType = req.nextUrl.searchParams.get("event");

  // Try NestJS first
  try {
    const path = `/rewards/bundles${req.nextUrl.search}`;
    const apiRes = await proxyToApi(req as unknown as Request, path);
    if (apiRes.status === 200) return apiRes;
  } catch { /* fall through */ }

  // Stub: return all templates or filtered
  const templates = Object.entries(BUNDLE_TEMPLATES)
    .filter(([, t]) => {
      if (tier && t.tier !== tier) return false;
      if (eventType && t.eventType !== eventType) return false;
      return true;
    })
    .map(([key, t]) => ({ key, ...t }));

  return NextResponse.json(templates);
}

// POST /api/rewards/bundles  { templateKey, overrides? }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { templateKey: string; overrides?: Record<string, unknown> };

    // Try NestJS first
    try {
      const apiRes = await proxyToApi(req as unknown as Request, "/rewards/bundles");
      if (apiRes.status < 300) return apiRes;
    } catch { /* fall through */ }

    const bundle = buildBundle(
      body.templateKey as keyof typeof BUNDLE_TEMPLATES,
      body.overrides ?? {},
    );
    return NextResponse.json(bundle, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 },
    );
  }
}
