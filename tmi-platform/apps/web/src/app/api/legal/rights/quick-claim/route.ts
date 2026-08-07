export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  isQuickClaimType,
  listQuickClaimTypes,
  rejectForbiddenLicenseClaim,
  submitQuickClaim,
} from "@/lib/legal";
import { getUserByEmail } from "@/lib/auth/UserStore";

/**
 * GET /api/legal/rights/quick-claim — claim type catalog.
 * POST — file CLAIM MY WORK (no ownership transfer, no delete).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    types: listQuickClaimTypes(),
    antiWeaponization: {
      ownershipTransferred: false,
      contentDeleted: false,
      note: "Claims preserve evidence and open review — they never instantly seize or delete.",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      assetId?: string;
      assetKind?: "SONG" | "VIDEO" | "BEAT" | "MEDIA";
      claimantUserId?: string;
      claimType?: string;
      statement?: string;
      contentRef?: string;
      isOriginalUploader?: boolean;
      hasVerifiedRightsOnFile?: boolean;
    };

    const email = req.cookies.get("tmi_user_email")?.value ?? "";
    const sessionUser = email ? getUserByEmail(email) : null;
    const claimantUserId =
      body.claimantUserId?.trim() ||
      sessionUser?.id ||
      sessionUser?.email ||
      "";

    if (!claimantUserId) {
      return NextResponse.json(
        { error: "Sign in or provide claimantUserId to file a Quick Claim" },
        { status: 401 },
      );
    }
    if (!body.assetId?.trim()) {
      return NextResponse.json({ error: "assetId is required" }, { status: 400 });
    }
    if (!body.claimType || !isQuickClaimType(body.claimType)) {
      return NextResponse.json({ error: "Valid claimType is required" }, { status: 400 });
    }

    const banned = rejectForbiddenLicenseClaim(body.statement ?? "");
    if (!banned.ok) {
      return NextResponse.json({ error: banned.error }, { status: 400 });
    }

    const result = submitQuickClaim({
      assetId: body.assetId,
      assetKind: body.assetKind,
      claimantUserId,
      claimType: body.claimType,
      statement: body.statement,
      contentRef: body.contentRef,
      isOriginalUploader: Boolean(body.isOriginalUploader),
      hasVerifiedRightsOnFile: Boolean(body.hasVerifiedRightsOnFile),
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      claim: result,
      message:
        "Quick Claim filed. Ownership not transferred. Content not deleted. Outcome: " +
        result.outcome,
    });
  } catch (err) {
    console.error("[legal/rights/quick-claim]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Quick Claim failed" },
      { status: 500 },
    );
  }
}
