export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getMessagingEligibility } from "@/lib/messaging/MessagingEligibility";
import { REQUIRED_MESSAGING_POLICIES } from "@/lib/messaging/PolicyAcceptance";

export async function GET() {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const eligibility = await getMessagingEligibility(auth.user.id);
  return NextResponse.json({
    eligibility,
    requiredPolicies: REQUIRED_MESSAGING_POLICIES,
  });
}
