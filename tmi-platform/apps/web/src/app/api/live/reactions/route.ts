export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { submitReaction, getRecentReactions, getCrowdMeter, resetMeter } from "@/lib/live/reactionEngine";
import type { ReactionType } from "@/lib/live/reactionEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const venue = searchParams.get("venue") ?? "default";
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  return NextResponse.json({
    meter: getCrowdMeter(venue),
    recent: getRecentReactions(venue, limit),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, venueSlug, userId, reaction, targetId } = body as {
      action: string;
      venueSlug: string;
      userId?: string;
      reaction?: ReactionType;
      targetId?: string;
    };

    if (!venueSlug) return NextResponse.json({ error: "venueSlug required" }, { status: 400 });

    switch (action) {
      case "react":
        if (!userId || !reaction) return NextResponse.json({ error: "userId and reaction required" }, { status: 400 });
        return NextResponse.json(submitReaction(venueSlug, userId, reaction, targetId ?? null));
      case "reset":
        resetMeter(venueSlug);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
