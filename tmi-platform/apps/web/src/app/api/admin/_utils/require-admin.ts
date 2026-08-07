import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth/UserStore";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

/** Production admin gate — no fail-open. Cookie tmi_role alone is never enough. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const email = request.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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

