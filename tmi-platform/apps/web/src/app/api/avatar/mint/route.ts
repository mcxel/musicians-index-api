export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getAvatarPersistenceSnapshot,
  mintAvatarForUser,
  validateNFTMintEligibility,
} from "@/lib/avatar/avatarPersistence";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

type MintBody = {
  displayName?: string;
};

export async function POST(req: NextRequest) {
  const auth = requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as MintBody;
  const userId = auth.user.id;
  const displayName = body.displayName?.trim() || auth.user.displayName;

  if (!(await validateNFTMintEligibility(userId))) {
    return NextResponse.json({ ok: false, error: "nft_eligibility_failed" }, { status: 422 });
  }

  const record = await mintAvatarForUser(userId, displayName);
  return NextResponse.json({
    ok: true,
    userId,
    record,
    ...(await getAvatarPersistenceSnapshot(userId)),
  });
}