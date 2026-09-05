export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getPersistedSeatMap,
  savePersistedSeatMap,
  updateSeatStates,
  type SeatPricingZone,
} from "@/lib/tickets/SeatMapPersistence";
import type { SeatStatus } from "@/lib/tickets/VenueSeatMapEngine";

export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venueId")?.trim() || "main-venue";
  const eventId = req.nextUrl.searchParams.get("eventId")?.trim() || "";
  try {
    const config = await getPersistedSeatMap(venueId, eventId);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "load_failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const venueId = typeof body?.venueId === "string" ? body.venueId.trim() : "";
  if (!venueId) {
    return NextResponse.json({ error: "venueId_required" }, { status: 400 });
  }

  const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
  const action = typeof body?.action === "string" ? body.action : "save";

  try {
    if (action === "seat_states") {
      const updates = Array.isArray(body.updates)
        ? (body.updates as Array<{ seatId: string; status: SeatStatus }>)
        : [];
      const config = await updateSeatStates(venueId, updates, eventId);
      return NextResponse.json({ ok: true, config });
    }

    const zones = Array.isArray(body.zones) ? (body.zones as SeatPricingZone[]) : [];
    const config = await savePersistedSeatMap({
      venueId,
      eventId,
      venueName: typeof body.venueName === "string" ? body.venueName : undefined,
      zones,
    });
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "save_failed" },
      { status: 400 },
    );
  }
}
