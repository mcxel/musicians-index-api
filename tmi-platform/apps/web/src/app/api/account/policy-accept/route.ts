export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  acceptAllRequiredPolicies,
  recordPolicyAcceptances,
  REQUIRED_MESSAGING_POLICIES,
  type PolicyId,
  hasRequiredPolicyAcceptances,
} from "@/lib/messaging/PolicyAcceptance";
import { getMessagingEligibility } from "@/lib/messaging/MessagingEligibility";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    policyIds?: string[];
    acceptAll?: boolean;
    liabilityAcknowledged?: boolean;
  };

  if (body.acceptAll) {
    if (body.liabilityAcknowledged !== true) {
      return NextResponse.json(
        { ok: false, error: "Liability acknowledgment required", code: "POLICY_ACCEPTANCE_REQUIRED" },
        { status: 400 },
      );
    }
    await acceptAllRequiredPolicies(auth.user.id);
  } else {
    const ids = (body.policyIds ?? []).filter((id): id is PolicyId =>
      REQUIRED_MESSAGING_POLICIES.some((p) => p.policyId === id),
    );
    if (ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid policyIds", code: "MISSING_FIELDS" },
        { status: 400 },
      );
    }
    if (ids.includes("LIABILITY_ACK") && body.liabilityAcknowledged !== true && !ids.includes("LIABILITY_ACK")) {
      /* no-op */
    }
    if (ids.includes("LIABILITY_ACK") && body.liabilityAcknowledged !== true) {
      return NextResponse.json(
        { ok: false, error: "Liability acknowledgment checkbox required", code: "POLICY_ACCEPTANCE_REQUIRED" },
        { status: 400 },
      );
    }
    await recordPolicyAcceptances(auth.user.id, ids);
  }

  try {
    await prisma.user.update({
      where: { id: auth.user.id },
      data: { termsAccepted: true },
    });
  } catch {
    /* non-fatal */
  }

  const policies = await hasRequiredPolicyAcceptances(auth.user.id);
  const eligibility = await getMessagingEligibility(auth.user.id);
  return NextResponse.json({
    ok: true,
    complete: policies.complete,
    missing: policies.missing,
    eligibility,
  });
}
