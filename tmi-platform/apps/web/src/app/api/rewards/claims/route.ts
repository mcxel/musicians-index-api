import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { buildBundle } from "@/lib/rewardBundle";

type LocalClaim = {
  id: string;
  userId: string;
  bundleId: string;
  bundleName: string;
  status: "PENDING" | "CLAIMED";
  createdAt: string;
  claimedAt?: string;
};

const LOCAL_CLAIMS: LocalClaim[] = [
  {
    id: "claim-battle-winner-seed",
    userId: "demo-user",
    bundleId: "bundle-seed-battle-winner",
    bundleName: "Battle Champion Pack",
    status: "PENDING",
    createdAt: "2026-04-20T11:00:00.000Z",
  },
  {
    id: "claim-audience-drop-seed",
    userId: "demo-user",
    bundleId: "bundle-seed-audience-drop",
    bundleName: "Audience Winner Drop",
    status: "PENDING",
    createdAt: "2026-04-21T09:30:00.000Z",
  },
];

function withQuery(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

// GET /api/rewards/claims?userId=demo-user
export async function GET(req: NextRequest) {
  try {
    try {
      const path = withQuery(`/rewards/claims${req.nextUrl.search}`);
      const apiRes = await proxyToApi(req as unknown as Request, path);
      if (apiRes.status < 500) {
        return apiRes;
      }
    } catch {
      // fall through to local fallback
    }

    const userId = req.nextUrl.searchParams.get("userId") ?? "demo-user";
    const claims = LOCAL_CLAIMS
      .filter((claim) => claim.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json(claims);
  } catch (err) {
    console.error("[rewards/claims:get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/rewards/claims { claimId, userId }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { claimId?: string; userId?: string };

    if (!body.claimId) {
      return NextResponse.json({ error: "claimId required" }, { status: 400 });
    }

    try {
      const apiRes = await proxyToApi(req as unknown as Request, "/rewards/claims/redeem");
      if (apiRes.status < 500) {
        return apiRes;
      }
    } catch {
      // fall through to local fallback
    }

    const userId = body.userId ?? "demo-user";
    const claim = LOCAL_CLAIMS.find((entry) => entry.id === body.claimId && entry.userId === userId);
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    if (claim.status === "CLAIMED") {
      return NextResponse.json({ error: "Claim already redeemed" }, { status: 409 });
    }

    claim.status = "CLAIMED";
    claim.claimedAt = new Date().toISOString();

    const fulfillmentBundle =
      claim.bundleName === "Battle Champion Pack"
        ? buildBundle("BATTLE_WINNER")
        : claim.bundleName === "Audience Winner Drop"
          ? buildBundle("AUDIENCE_RANDOM_DROP")
          : buildBundle("CONSOLATION");

    return NextResponse.json({
      claim,
      reward: fulfillmentBundle,
      message: "Reward redeemed successfully",
    });
  } catch (err) {
    console.error("[rewards/claims:post]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
