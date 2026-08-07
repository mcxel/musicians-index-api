import { NextRequest, NextResponse } from "next/server";
import { getArtistPayoutStatus } from "@/lib/commerce/InstantPayoutEngine";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const status = await getArtistPayoutStatus(userId);
  return NextResponse.json(status);
}
