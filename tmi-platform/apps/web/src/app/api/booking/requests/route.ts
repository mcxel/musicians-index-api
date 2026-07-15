export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createBookingRequest, listBookingRequests } from "@/lib/booking/bookingMonetizationEngine";

export async function GET() {
  return NextResponse.json({ ok: true, requests: await listBookingRequests() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug : "";
  const artistSlug = typeof body?.artistSlug === "string" ? body.artistSlug : "";
  const offerAmount = typeof body?.offerAmount === "number" ? body.offerAmount : 0;
  const expectedRevenue = typeof body?.expectedRevenue === "number" ? body.expectedRevenue : 0;

  if (!venueSlug && !artistSlug) {
    return NextResponse.json({ ok: false, error: "venueSlug or artistSlug required" }, { status: 400 });
  }

  const request = await createBookingRequest({ venueSlug, artistSlug, offerAmount, expectedRevenue });
  return NextResponse.json({
    ok: true,
    request,
    requests: await listBookingRequests(),
  });
}
