import { NextRequest, NextResponse } from "next/server";
import {
  getAvatarPersistenceSnapshot,
  mintAvatarForUser,
  validateNFTMintEligibility,
} from "@/lib/avatar/avatarPersistence";

type MintBody = {
  userId?: string;
  displayName?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as MintBody;
  const userId = body.userId ?? "demo-user";
  const displayName = body.displayName ?? "MC Charlie";

  if (!validateNFTMintEligibility(userId)) {
    return NextResponse.json({ ok: false, error: "nft_eligibility_failed" }, { status: 422 });
  }

  const record = mintAvatarForUser(userId, displayName);
  return NextResponse.json({
    ok: true,
    userId,
    record,
    ...getAvatarPersistenceSnapshot(userId),
  });
}
