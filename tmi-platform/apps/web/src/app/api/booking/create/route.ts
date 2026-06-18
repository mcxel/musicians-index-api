import { NextResponse } from "next/server";
import { bookingContractEngine, type ContractTerms } from "@/lib/booking/BookingContractEngine";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";
import { VenueBookingRegistry } from "@/lib/registries/VenueBookingRegistry";
import { canonicalEcosystemEngine } from "@/lib/playlists/CanonicalEcosystemEngine";

function titleCase(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

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

    const artistSlug = slugify(String(artistName));
    const attendance = Math.max(0, Math.round(toSafeNumber(expectedAttendance, 0)));
    const totalUsd   = Math.max(0, Math.round(toSafeNumber(estimatedTotal, 0)));

    const contractTerms: ContractTerms = {
      performanceDate:        String(eventDate),
      setLengthMinutes:       60,
      guaranteeUsd:           totalUsd,
      revenueSplitPercent:    70,
      merchandisingRights:    true,
      soundcheckIncluded:     true,
      hotelIncluded:          false,
      travelReimbursementUsd: 0,
      advancePaymentPercent:  20,
      cancellationPolicyDays: 14,
      additionalNotes:        String(additionalRequests ?? "").slice(0, 1200),
      riderRequirements:      Array.isArray(addOns) ? addOns.map((e) => String(e).slice(0, 120)) : [],
      setList:                [String(eventType ?? "concert")],
    };

    const contract = bookingContractEngine.createContract(String(venueSlug), artistSlug, contractTerms, "artist");
    const offer    = bookingContractEngine.sendOffer(contract.id);
    if (!offer.success) {
      return NextResponse.json({ error: offer.error ?? "Failed to stage booking contract" }, { status: 500 });
    }

    // Persist via registry (replaces direct feedItem write)
    let booking;
    try {
      booking = await VenueBookingRegistry.create({
        venueSlug:          String(venueSlug),
        artistName:         String(artistName),
        artistSlug,
        contactEmail:       String(contactEmail),
        eventDate:          String(eventDate),
        eventType:          String(eventType ?? 'concert'),
        expectedAttendance: attendance,
        estimatedTotalUsd:  totalUsd,
        addOns:             Array.isArray(addOns) ? addOns.map(String) : [],
        additionalNotes:    String(additionalRequests ?? "").slice(0, 1200),
        contractId:         contract.id,
      });
    } catch {
      // Registry failure non-fatal — email still fires
    }

    const bookingId = booking?.bookingId ?? `BK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    void canonicalEcosystemEngine.dispatch({
      type:        "BOOKING_COMPLETED",
      artistId:    artistSlug,
      artistName:  String(artistName),
      venueId:     String(venueSlug),
      venueName:   titleCase(String(venueSlug)),
      eventId:     bookingId,
      eventDate:   String(eventDate),
    });

    const alertEmail = process.env.BOOKING_ALERT_EMAIL?.trim();
    if (alertEmail) {
      void EmailProviderEngine.sendAsync({
        to:      alertEmail,
        subject: `New booking request ${bookingId} (${venueSlug})`,
        html:    `<h2>New booking request</h2><p><b>Booking:</b> ${bookingId}</p><p><b>Venue:</b> ${venueSlug}</p><p><b>Artist:</b> ${artistName}</p><p><b>Email:</b> ${contactEmail}</p><p><b>Date:</b> ${eventDate}</p><p><b>Type:</b> ${eventType ?? "concert"}</p><p><b>Attendance:</b> ${attendance}</p><p><b>Total:</b> $${totalUsd.toLocaleString()}</p>`,
        text:    `Booking ${bookingId}\nVenue: ${venueSlug}\nArtist: ${artistName}\nDate: ${eventDate}`,
        tags:    ["booking-request"],
        replyTo: String(contactEmail),
      });
    }

    return NextResponse.json({
      success:        true,
      bookingId,
      contractId:     contract.id,
      message:        `Booking request ${bookingId} submitted. The venue team will respond within 24 hours.`,
      estimatedTotal: totalUsd,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url       = new URL(request.url);
  const venueSlug = url.searchParams.get('venueSlug');
  try {
    const bookings = venueSlug
      ? await VenueBookingRegistry.listByVenue(venueSlug)
      : await VenueBookingRegistry.listAll();
    return NextResponse.json({ success: true, requests: bookings });
  } catch {
    return NextResponse.json({ success: true, requests: [] });
  }
}
