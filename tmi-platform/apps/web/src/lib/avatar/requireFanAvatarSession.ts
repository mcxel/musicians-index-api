import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { isFanAvatarOwnershipRole } from "@/lib/avatars/fanAvatarOwnership";

export type FanAvatarUser = { id: string; displayName: string; role: string };

/**
 * Session authority for avatar gear, inventory, saved looks and credit-spending
 * unlocks. Rule 26: ownership mutate/load is FAN (plus ADMIN/STAFF QA) — never PERFORMER.
 *
 * Identity comes ONLY from the verified session (getTmiAuth: signed identity
 * cookie + canonical DB row, role read from the database).
 *
 * SECURITY (2026-11-18): this previously resolved the user from the
 * client-settable tmi_user_email / tmi_session_id cookies, and with only a
 * session cookie present it fabricated a user from the tmi_role cookie. Anyone
 * could act as any Fan — read/overwrite their avatar and spend their fan credits.
 * Raw identity cookies are now ignored entirely.
 */
export async function requireFanAvatarSession(
  req: NextRequest,
): Promise<{ user: FanAvatarUser } | { error: NextResponse }> {
  void req; // identity never comes from the request object
  const auth = await getTmiAuth();
  if (!auth) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const role = String(auth.user.role ?? "USER").toUpperCase();
  if (!isFanAvatarOwnershipRole(role)) {
    return {
      error: NextResponse.json({ ok: false, error: "fan_avatar_ownership_required" }, { status: 403 }),
    };
  }
  return { user: { id: auth.user.id, displayName: auth.user.name || "Fan", role } };
}

/**
 * Owner decision 2026-11-19: Performers (and Bands) may keep a PROFILE Mini-Me — saved appearance
 * looks only (`/api/avatar/looks`). This does NOT grant avatar presence anywhere: Performers stay live
 * video in Performer Lobbies and on stages (VideoPanelSpatialContract.presenceModeFor), and every other
 * avatar route (gear, inventory, equip, config, load, credit unlocks) stays on requireFanAvatarSession.
 */
export async function requireProfileMiniMeSession(
  req: NextRequest,
): Promise<{ user: FanAvatarUser } | { error: NextResponse }> {
  void req;
  const auth = await getTmiAuth();
  if (!auth) return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  const role = String(auth.user.role ?? "USER").toUpperCase();
  if (!isFanAvatarOwnershipRole(role) && role !== "PERFORMER" && role !== "BAND") {
    return { error: NextResponse.json({ ok: false, error: "mini_me_profile_role_required" }, { status: 403 }) };
  }
  return { user: { id: auth.user.id, displayName: auth.user.name || "Member", role } };
}
