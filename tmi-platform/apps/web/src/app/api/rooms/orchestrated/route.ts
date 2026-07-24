import { NextRequest, NextResponse } from "next/server";
import { eventOrchestrator } from "@/lib/competition/EventOrchestrator";
import { type BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";

export const dynamic = "force-dynamic";

/**
 * GET /api/rooms/orchestrated?roomId=xyz
 * Returns the current coordinated room state, automatically decrementing countdowns.
 */
export async function GET(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json({ error: "roomId required" }, { status: 400 });
    }

    // Automatically tick countdown by 1s on read if it's currently active
    const ticks = await eventOrchestrator.tickCountdown(roomId);

    // Fetch the resolved state
    const state = await eventOrchestrator.getOrchestratedState(roomId);
    if (!state) {
      return NextResponse.json({ error: "Room event not found" }, { status: 404 });
    }

    // Real PA announcer line (hostEngine's getPA(), not fabricated copy) -
    // only when a paAnnouncer is actually assigned to this show.
    const paLine = state.paAnnouncer
      ? eventOrchestrator.dispatchPAAnnouncement(state.showId, "room-open")
      : null;

    return NextResponse.json({ success: true, event: state, ticks, paLine });
  } catch (error) {
    console.error("Failed to query orchestrated room state:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/rooms/orchestrated
 * Compiles and initializes a coordinated room event.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, showId, format, countdownSeconds, genreId, genreName, title } = body;

    if (!roomId || !showId || !format) {
      return NextResponse.json({ error: "roomId, showId, and format are required" }, { status: 400 });
    }

    const compiled = await eventOrchestrator.compileEvent(
      roomId,
      showId,
      format as BattleFormatType,
      countdownSeconds ?? 0,
      { genreId, genreName, title }
    );

    if (!compiled) {
      return NextResponse.json({ error: "Failed to compile show event" }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: compiled });
  } catch (error) {
    console.error("Failed to compile orchestrated room event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
