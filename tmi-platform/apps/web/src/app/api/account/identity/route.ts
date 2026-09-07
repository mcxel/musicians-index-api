import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { resolveActiveProfileIdentity } from "@/lib/account/resolveActiveProfileIdentity";

/**
 * GET /api/account/identity
 *
 * The one canonical source for the Universal Account header shell's
 * identity data -- avatar/initials, active role, owned roles, and the
 * current-schema-era classification (ACCOUNT_FALLBACK today; FAN_PROFILE /
 * PERFORMER_PROFILE once Rule 31's schema migration lands). See
 * resolveActiveProfileIdentity.ts for the compatibility contract.
 *
 * Server-derived userId only -- never trusts a client-supplied id, so a
 * signed-in user can only ever resolve their own identity here.
 *
 * Response: { identity: ActiveProfileIdentity } on success.
 * A stale/invalid session (account deleted/revoked) returns 401 with
 * invalidSession: true -- callers must treat this as "sign in again," never
 * render a fabricated identity. A DB-unavailable degrade returns a
 * `degraded: true` flag so it is never mistaken for a verified identity.
 */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await resolveActiveProfileIdentity(auth.user.id, {
    role: auth.user.role,
    activeRole: auth.user.role,
    displayName: auth.user.name,
  });

  if (result.status === "INVALID_ACCOUNT") {
    return NextResponse.json(
      { error: "Account not found", invalidSession: true },
      { status: 401 },
    );
  }

  if (result.status === "DB_UNAVAILABLE") {
    return NextResponse.json(
      { identity: result.identity, degraded: true, reason: "database_unavailable" },
      { status: result.identity ? 200 : 503 },
    );
  }

  return NextResponse.json({ identity: result.identity });
}
