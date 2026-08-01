export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { upsertYoPhoCard, listYoPhoCards } from "@/lib/yopho/YoPhoCardStore";
import type { PublishedYoPhoCard } from "@/lib/yopho/YoPhoCardRegistry";

export async function GET() {
  return NextResponse.json({ cards: listYoPhoCards(40) });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PublishedYoPhoCard>;
    if (!body.cardId || !body.displayName || !body.subjectUrl) {
      return NextResponse.json(
        { error: "cardId, displayName, and subjectUrl required" },
        { status: 400 },
      );
    }
    const card = upsertYoPhoCard(body as PublishedYoPhoCard);
    return NextResponse.json({ ok: true, card });
  } catch {
    return NextResponse.json({ error: "Invalid card payload" }, { status: 400 });
  }
}
