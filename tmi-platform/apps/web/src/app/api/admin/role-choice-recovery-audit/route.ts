import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { countGoogleAutoAssignedFanRecoveryEligible } from "@/lib/auth/countGoogleAutoFanRecoveryEligible";

/**
 * GET /api/admin/role-choice-recovery-audit
 * Counts only (no emails/secrets). Admin/staff only.
 */
export async function GET() {
  const auth = await getTmiAuth();
  const role = (auth?.user?.role ?? "").toUpperCase();
  if (!auth || (role !== "ADMIN" && role !== "STAFF")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const counts = await countGoogleAutoAssignedFanRecoveryEligible();
    return NextResponse.json({ ok: true, counts });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Audit query failed (DB unavailable or schema mismatch)",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    );
  }
}
