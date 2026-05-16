import { NextResponse } from "next/server";
import { createBookingRequest, listBookingRequests } from "@/lib/booking/bookingMonetizationEngine";

export async function GET() {
  return NextResponse.json({ ok: true, requests: listBookingRequests() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug : "test-venue";
  const artistSlug = typeof body?.artistSlug === "string" ? body.artistSlug : "ray-journey";
  const offerAmount = typeof body?.offerAmount === "number" ? body.offerAmount : 3500;
  const expectedRevenue = typeof body?.expectedRevenue === "number" ? body.expectedRevenue : 12000;

  return NextResponse.json({
    ok: true,
    request: createBookingRequest({ venueSlug, artistSlug, offerAmount, expectedRevenue }),
    requests: listBookingRequests(),
  });
}
