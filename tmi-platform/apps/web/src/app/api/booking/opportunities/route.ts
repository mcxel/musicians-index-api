/**
 * GET /api/booking/opportunities — open venue-posted booking opportunities (honest list).
 */

import { NextResponse } from "next/server";
import { BookingOpportunityRegistry } from "@/lib/registries/BookingOpportunityRegistry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const opportunities = await BookingOpportunityRegistry.listOpen();
    return NextResponse.json({ opportunities });
  } catch {
    return NextResponse.json({ opportunities: [], error: "Unable to load" }, { status: 200 });
  }
}
