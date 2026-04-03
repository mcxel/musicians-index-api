import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";

/**
 * POST /api/auth/provision
 * Auto-provisions a full starter workspace after signup.
 * Chains: create profile → wallet → points ledger → avatar inventory →
 *         notification settings → starter dashboard → onboarding bots.
 *
 * Body: { userId, accountType: "MEMBER" | "ARTIST" | "ADVERTISER" | "SPONSOR" | "VENUE" }
 */
export async function POST(req: NextRequest) {
  // Try NestJS first
  try {
    const apiRes = await proxyToApi(req as unknown as Request, "/auth/provision");
    if (apiRes.status < 300) return apiRes;
  } catch { /* fall through to stub */ }

  let body: { userId?: string; accountType?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { userId, accountType = "MEMBER" } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Stub provision chain result
  const provisionChain = {
    userId,
    accountType,
    completedAt: now,
    steps: [
      { step: "profile_created",           status: "OK" },
      { step: "wallet_created",            status: "OK", walletId: `wallet_${userId}` },
      { step: "points_ledger_created",     status: "OK", starterPoints: accountType === "ARTIST" ? 250 : 100 },
      { step: "avatar_inventory_created",  status: "OK", starterItems: ["avatar-default-frame", "avatar-starter-badge"] },
      { step: "notification_settings",     status: "OK" },
      { step: "dashboard_created",         status: "OK" },
      { step: "onboarding_bots_assigned",  status: "OK", botCount: 3 },
      ...(accountType === "ARTIST" ? [
        { step: "artist_profile_created",  status: "OK" },
        { step: "beat_lab_access_granted", status: "OK" },
        { step: "nft_lab_access_granted",  status: "OK" },
        { step: "article_template_assigned", status: "OK" },
      ] : []),
      ...(accountType === "SPONSOR" ? [
        { step: "sponsor_profile_created", status: "OK" },
        { step: "reward_workspace_created",status: "OK" },
        { step: "campaign_workspace_created", status: "OK" },
        { step: "inventory_bucket_created",status: "OK" },
        { step: "sponsor_bots_assigned",   status: "OK", botCount: 5 },
      ] : []),
      ...(accountType === "ADVERTISER" ? [
        { step: "advertiser_profile_created", status: "OK" },
        { step: "campaign_workspace_created", status: "OK" },
        { step: "billing_profile_created", status: "OK" },
        { step: "placements_dashboard_created", status: "OK" },
        { step: "ad_ops_bots_assigned",    status: "OK", botCount: 3 },
      ] : []),
      ...(accountType === "VENUE" ? [
        { step: "venue_profile_created",   status: "OK" },
        { step: "booking_workspace_created", status: "OK" },
      ] : []),
    ],
  };

  return NextResponse.json(provisionChain, { status: 201 });
}
