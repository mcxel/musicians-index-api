import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, resolveHardcodedTierRole } from "@/lib/auth/UserStore";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

/** Production admin gate — no fail-open. Cookie tmi_role alone is never enough. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const email = request.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Check hardcoded admin/staff list first — works on Vercel cold starts
  // before the async DB → STORE hydration has completed.
  const hardcoded = resolveHardcodedTierRole(email);
  if (hardcoded && ADMIN_ROLES.has(hardcoded.role.toUpperCase())) {
    return null;
  }

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const role = (user.role ?? "").toUpperCase();
  if (!ADMIN_ROLES.has(role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

