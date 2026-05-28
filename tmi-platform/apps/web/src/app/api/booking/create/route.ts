import { NextResponse } from "next/server";
import { bookingContractEngine, type ContractTerms } from "@/lib/booking/BookingContractEngine";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toSafeNumber(input: unknown, fallback: number): number {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueSlug, artistName, contactEmail, eventDate, eventType, expectedAttendance, additionalRequests, addOns, estimatedTotal } = body;

    if (!venueSlug || !artistName || !contactEmail || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookingId = "BK-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const artistSlug = slugify(String(artistName));

    const contractTerms: ContractTerms = {
      performanceDate: String(eventDate),
      setLengthMinutes: 60,
      guaranteeUsd: Math.max(0, Math.round(toSafeNumber(estimatedTotal, 0))),
      revenueSplitPercent: 70,
      merchandisingRights: true,
      soundcheckIncluded: true,
      hotelIncluded: false,
      travelReimbursementUsd: 0,
      advancePaymentPercent: 20,
      cancellationPolicyDays: 14,
      additionalNotes: String(additionalRequests ?? "").slice(0, 1200),
      riderRequirements: Array.isArray(addOns) ? addOns.map((entry) => String(entry).slice(0, 120)) : [],
      setList: [String(eventType ?? "concert")],
    };

    const contract = bookingContractEngine.createContract(String(venueSlug), artistSlug || bookingId.toLowerCase(), contractTerms, "artist");
    const offer = bookingContractEngine.sendOffer(contract.id);
    if (!offer.success) {
      return NextResponse.json({ error: offer.error ?? "Failed to stage booking contract" }, { status: 500 });
    }

    const bookingAlertEmail = process.env.BOOKING_ALERT_EMAIL?.trim();
    if (bookingAlertEmail) {
      const attendance = Math.max(0, Math.round(toSafeNumber(expectedAttendance, 0)));
      void EmailProviderEngine.sendAsync({
        to: bookingAlertEmail,
        subject: `New booking request ${bookingId} (${venueSlug})`,
        html: `<h2>New booking request</h2><p><strong>Booking:</strong> ${bookingId}</p><p><strong>Venue:</strong> ${venueSlug}</p><p><strong>Artist:</strong> ${artistName}</p><p><strong>Email:</strong> ${contactEmail}</p><p><strong>Date:</strong> ${eventDate}</p><p><strong>Type:</strong> ${eventType ?? "concert"}</p><p><strong>Expected Attendance:</strong> ${attendance}</p><p><strong>Estimated Total:</strong> $${Math.max(0, Math.round(toSafeNumber(estimatedTotal, 0))).toLocaleString()}</p>`,
        text: `New booking request\nBooking: ${bookingId}\nVenue: ${venueSlug}\nArtist: ${artistName}\nEmail: ${contactEmail}\nDate: ${eventDate}\nType: ${eventType ?? "concert"}\nExpected Attendance: ${attendance}\nEstimated Total: $${Math.max(0, Math.round(toSafeNumber(estimatedTotal, 0))).toLocaleString()}`,
        tags: ["booking-request"],
        replyTo: String(contactEmail),
      });
    }

    console.log("[Booking Request]", {
      bookingId,
      contractId: contract.id,
      venueSlug,
      artistName,
      contactEmail,
      eventDate,
      eventType,
      expectedAttendance,
      addOns,
      estimatedTotal,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      contractId: contract.id,
      message: `Booking request ${bookingId} submitted. The venue team will respond within 24 hours.`,
      estimatedTotal: estimatedTotal ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
  }
}
