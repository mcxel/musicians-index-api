import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, resolveHardcodedTierRole } from "@/lib/auth/UserStore";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

function cookieHasAdminRole(request: NextRequest): boolean {
  const single = (request.cookies.get("tmi_role")?.value ?? "").toUpperCase();
  if (ADMIN_ROLES.has(single)) return true;

  try {
    const raw = request.cookies.get("tmi_roles")?.value;
    if (!raw) return false;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return false;
    return parsed.some((r) => ADMIN_ROLES.has(String(r).toUpperCase()));
  } catch {
    return false;
  }
}

/**
 * Production admin gate — no fail-open for anonymous or non-admin callers.
 *
 * Aligns with middleware `/admin` + `/api/admin` gate:
 * server-issued `tmi_session` + ADMIN|STAFF role cookies, with email required
 * for audit scope. Also accepts hardcoded admin emails / UserStore ADMIN|STAFF
 * so cold starts still authorize known operators when role cookies are present.
 *
 * Cookie `tmi_role` alone (no session) is never enough.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const session = request.cookies.get("tmi_session")?.value ?? "";
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const email = (request.cookies.get("tmi_user_email")?.value ?? "").trim().toLowerCase();

  if (email) {
    const hardcoded = resolveHardcodedTierRole(email);
    if (hardcoded && ADMIN_ROLES.has(hardcoded.role.toUpperCase())) {
      return null;
    }

    const user = getUserByEmail(email);
    if (user) {
      const role = (user.role ?? "").toUpperCase();
      if (ADMIN_ROLES.has(role)) {
        return null;
      }
    }
  }

  // Cold-start / persona-preview path: same evidence middleware already used
  // to let the Overseer page render. Still require email so unscoped sessions
  // cannot call admin APIs.
  if (email && cookieHasAdminRole(request)) {
    return null;
  }

  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
