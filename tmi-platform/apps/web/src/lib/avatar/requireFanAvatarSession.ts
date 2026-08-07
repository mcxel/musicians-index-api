import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/UserStore";

const FAN_ROLES = new Set(["FAN", "USER"]);

export type FanAvatarUser = { id: string; displayName: string; role: string };

/** Rule 26: avatar ownership APIs are Fan-only. No demo-user fallback. */
export function requireFanAvatarSession(
  req: NextRequest,
): { user: FanAvatarUser } | { error: NextResponse } {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const user = getUserByEmail(email);
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const role = (user.role ?? "").toUpperCase();
  if (!FAN_ROLES.has(role)) {
    return {
      error: NextResponse.json(
        { ok: false, error: "Avatar ownership is Fan-only" },
        { status: 403 },
      ),
    };
  }
  return { user: { id: user.id, displayName: user.displayName, role } };
}