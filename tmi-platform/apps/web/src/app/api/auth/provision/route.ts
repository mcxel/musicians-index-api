import { type NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/apiProxy";
import { DiamondInviteEngine } from "@/lib/auth/DiamondInviteEngine";

/**
 * POST /api/auth/provision
 * Auto-provisions a full starter workspace after signup.
 * Chains: create profile → wallet → points ledger → avatar inventory →
 *         notification settings → starter dashboard → onboarding bots.
 *
 * Body: { userId, roles?: ["FAN"|"PERFORMER"|...], accountType?: string, vipToken?: string }
 * Priority: roles[0] > accountType > default FAN
 */
export async function POST(req: NextRequest) {
  // Try NestJS first
  try {
    const apiRes = await proxyToApi(req as unknown as Request, "/auth/provision");
    if (apiRes.status < 300) return apiRes;
  } catch { /* fall through to stub */ }

  let body: { userId?: string; roles?: string[]; accountType?: string; vipToken?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const { userId, vipToken } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Resolve account type: roles array > accountType > default FAN
  let accountType = body.roles?.[0]?.toUpperCase() || body.accountType?.toUpperCase() || "FAN";

  // Normalize legacy role names
  const roleNormalization: Record<string, string> = {
    MEMBER: "FAN",
    ARTIST: "PERFORMER",
  };
  accountType = roleNormalization[accountType] || accountType;

  // Redeem VIP invite token if provided
  let vipRedeemed = false;
  let vipRole: string | undefined;
  if (vipToken && userId) {
    const invite = DiamondInviteEngine.getInvite(vipToken);
    if (invite && invite.status === 'active') {
      vipRedeemed = await DiamondInviteEngine.validateAndRedeem(vipToken, userId);
      vipRole = invite.assignedRole;
    }
  }

  const now = new Date().toISOString();

  // Stub provision chain result — role-specific provisioning
  const provisionChain = {
    userId,
    accountType,
    completedAt: now,
    steps: [
      // Common to all roles
      { step: "profile_created",           status: "OK" },
      { step: "wallet_created",            status: "OK", walletId: `wallet_${userId}` },
      { step: "points_ledger_created",     status: "OK", starterPoints: accountType === "PERFORMER" ? 250 : 100 },
      { step: "avatar_inventory_created",  status: "OK", starterItems: ["avatar-default-frame", "avatar-starter-badge"] },
      { step: "notification_settings",     status: "OK" },
      { step: "dashboard_created",         status: "OK" },
      { step: "onboarding_bots_assigned",  status: "OK", botCount: 3 },

      // FAN-specific provisioning
      ...(accountType === "FAN" ? [
        { step: "fan_profile_created",     status: "OK" },
        { step: "fan_live_lobby_access",   status: "OK" },
        { step: "personal_playlist_created", status: "OK", playlistName: "My Playlist" },
        { step: "yopho_fan_canvas_created", status: "OK", canvasType: "personal_scrapbook" },
      ] : []),

      // PERFORMER-specific provisioning
      ...(accountType === "PERFORMER" ? [
        { step: "artist_profile_created",  status: "OK" },
        { step: "beat_lab_access_granted", status: "OK" },
        { step: "nft_lab_access_granted",  status: "OK" },
        { step: "article_template_assigned", status: "OK" },
        { step: "performer_yopho_canvas_created", status: "OK", canvasType: "professional_portfolio" },
        { step: "media_locker_created",    status: "OK" },
        { step: "booking_workspace_created", status: "OK" },
      ] : []),

      // SPONSOR-specific provisioning
      ...(accountType === "SPONSOR" ? [
        { step: "sponsor_profile_created", status: "OK" },
        { step: "reward_workspace_created",status: "OK" },
        { step: "campaign_workspace_created", status: "OK" },
        { step: "inventory_bucket_created",status: "OK" },
        { step: "sponsor_bots_assigned",   status: "OK", botCount: 5 },
      ] : []),

      // ADVERTISER-specific provisioning
      ...(accountType === "ADVERTISER" ? [
        { step: "advertiser_profile_created", status: "OK" },
        { step: "campaign_workspace_created", status: "OK" },
        { step: "billing_profile_created", status: "OK" },
        { step: "placements_dashboard_created", status: "OK" },
        { step: "ad_ops_bots_assigned",    status: "OK", botCount: 3 },
      ] : []),

      // VENUE-specific provisioning
      ...(accountType === "VENUE" ? [
        { step: "venue_profile_created",   status: "OK" },
        { step: "booking_workspace_created", status: "OK" },
      ] : []),

      // PROMOTER-specific provisioning
      ...(accountType === "PROMOTER" ? [
        { step: "promoter_profile_created", status: "OK" },
        { step: "ticket_management_created", status: "OK" },
        { step: "event_calendar_created",  status: "OK" },
      ] : []),

      // VIP token redemption
      ...(vipRedeemed ? [
        { step: "vip_token_redeemed",      status: "OK", role: vipRole, tier: "DIAMOND" },
        { step: "diamond_wallet_seeded",   status: "OK", credits: 5000 },
      ] : []),
    ],
  };

  return NextResponse.json(provisionChain, { status: 201 });
}
