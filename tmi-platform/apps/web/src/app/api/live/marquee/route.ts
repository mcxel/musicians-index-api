import { NextResponse } from "next/server";
import { buildMarqueeEvents } from "@/lib/live/LivingRoomEngine";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * GET /api/live/marquee
 * Returns the live marquee ticker data: upcoming competitions across all channels.
 * Used by LiveMarqueeTicker.tsx platform-wide.
 */
export async function GET() {
  try {
    const events = buildMarqueeEvents();
    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("[/api/live/marquee] error:", err);
    return NextResponse.json({ events: [] }, { status: 200 });
  }
}
