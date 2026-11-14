import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

/**
 * Production admin gate — no fail-open for anonymous or non-admin callers.
 *
 * SECURITY (2026-09-23, Batch 2): identity and role now come exclusively
 * from getTmiAuth() — the HMAC-signed tmi_uid_sig cookie plus a fresh DB
 * role read. Previously this function trusted `tmi_user_email` (matched
 * against a real user by email, or against a hardcoded-admin list) and/or
 * raw `tmi_role`/`tmi_roles` cookies with zero cryptographic verification —
 * any HTTP client could set `tmi_session` to a non-empty value plus
 * `tmi_user_email` to a real admin's address, or simply `tmi_role=ADMIN`,
 * and pass this gate. 39 admin API routes call this function; none of them
 * were actually enforcing admin authority against a verified identity.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? "").toUpperCase();
  if (auth && ADMIN_ROLES.has(role)) {
    return null;
  }
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}

export type AdminActor = {
  actorId: string;
  email: string;
  role: string;
};

/**
 * Authenticated Admin actor for audit fields.
 * Never trust client-supplied submittedBy — use this.
 */
export async function resolveAdminActor(
  request: NextRequest,
): Promise<{ ok: true; actor: AdminActor } | { ok: false; response: NextResponse }> {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? "").toUpperCase();
  if (!auth || !ADMIN_ROLES.has(role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    actor: { actorId: auth.user.id, email: auth.user.email, role },
  };
}
