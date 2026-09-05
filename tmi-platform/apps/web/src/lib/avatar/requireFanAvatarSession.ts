import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserById } from "@/lib/auth/UserStore";
import { isFanAvatarOwnershipRole } from "@/lib/avatars/fanAvatarOwnership";

export type FanAvatarUser = { id: string; displayName: string; role: string };

function rejectNonFanOwnership(role: string): { error: NextResponse } | null {
  if (isFanAvatarOwnershipRole(role)) return null;
  return {
    error: NextResponse.json(
      { ok: false, error: "fan_avatar_ownership_required" },
      { status: 403 },
    ),
  };
}

/**
 * Session authority for avatar gear & inventory endpoints.
 * Resolves authenticated user via tmi_user_email or tmi_session_id cookies.
 * Rule 26: ownership mutate/load is FAN (plus ADMIN/STAFF QA) — never PERFORMER.
 */
export function requireFanAvatarSession(
  req: NextRequest,
): { user: FanAvatarUser } | { error: NextResponse } {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  const sessionId = req.cookies.get("tmi_session_id")?.value ?? "";
  const sessionToken = req.cookies.get("tmi_session")?.value ?? "";

  let user = email ? getUserByEmail(email) : null;
  if (!user && sessionId) {
    user = getUserById(sessionId);
  }

  if (!user && (sessionId || sessionToken)) {
    // Session token exists — construct fallback user identity from cookies
    const cookieRole = (req.cookies.get("tmi_role")?.value ?? "USER").toUpperCase();
    const blocked = rejectNonFanOwnership(cookieRole);
    if (blocked) return blocked;
    return {
      user: {
        id: sessionId || "session-active-user",
        displayName: email ? email.split("@")[0] : "Authenticated Member",
        role: cookieRole,
      },
    };
  }

  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }

  const role = (user.role ?? "USER").toUpperCase();
  const blocked = rejectNonFanOwnership(role);
  if (blocked) return blocked;
  return { user: { id: user.id, displayName: user.displayName, role } };
}