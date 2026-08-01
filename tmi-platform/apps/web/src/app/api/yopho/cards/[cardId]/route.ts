export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getYoPhoCard } from "@/lib/yopho/YoPhoCardStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: { cardId: string } },
) {
  const card = getYoPhoCard(params.cardId);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  return NextResponse.json({ card });
}
