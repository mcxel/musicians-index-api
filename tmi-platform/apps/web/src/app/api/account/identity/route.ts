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
 * Response: { identity: ActiveProfileIdentity }
 */
export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const identity = await resolveActiveProfileIdentity(auth.user.id);
  if (!identity) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ identity });
}
