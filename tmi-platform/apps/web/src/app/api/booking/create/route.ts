import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueSlug, artistName, contactEmail, eventDate, eventType, expectedAttendance, additionalRequests, addOns, estimatedTotal } = body;

    if (!venueSlug || !artistName || !contactEmail || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookingId = "BK-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    // TODO: Wire to BookingContractEngine, send notification to venue
    console.log("[Booking Request]", { bookingId, venueSlug, artistName, contactEmail, eventDate, eventType, expectedAttendance, addOns, estimatedTotal });

    return NextResponse.json({
      success: true,
      bookingId,
      message: `Booking request ${bookingId} submitted. The venue team will respond within 24 hours.`,
      estimatedTotal: estimatedTotal ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
  }
}
