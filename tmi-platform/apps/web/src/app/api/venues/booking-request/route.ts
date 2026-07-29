/**
 * POST /api/venues/booking-request — Pass 8.x Venue Concierge booking path.
 *
 * Auth + PERFORMER (or ADMIN/STAFF) required.
 * Persists via VenueBookingRegistry (prisma feedItem VENUE_BOOKING) — Overseer
 * Approve Queue / booking list reads the same registry. Optional BOOKING_ALERT_EMAIL
 * notifies ops (same path as /api/booking/create). No parallel admin UI.
 * Success only when write succeeds — no fake success (Rule 20).
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getVenueBySlug } from "@/lib/venues/VenueRegistry";
import { VenueBookingRegistry } from "@/lib/registries/VenueBookingRegistry";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";

const PERFORMER_ROLES = new Set([
  "PERFORMER",
  "ARTIST",
  "BAND",
  "ADMIN",
  "STAFF",
]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  const sessionToken = req.cookies.get("tmi_session")?.value;
  const role = (req.cookies.get("tmi_role")?.value ?? "").toUpperCase();
  const email = req.cookies.get("tmi_user_email")?.value ?? "";

  if (!sessionId || !sessionToken) {
    return NextResponse.json(
      { ok: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!PERFORMER_ROLES.has(role)) {
    return NextResponse.json(
      { ok: false, error: "Performer role required for venue booking requests" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const venueSlug = typeof body?.venueSlug === "string" ? body.venueSlug.trim() : "";
  const eventDate =
    typeof body?.eventDate === "string" && body.eventDate
      ? body.eventDate
      : new Date().toISOString().slice(0, 10);
  const eventType =
    typeof body?.eventType === "string" ? body.eventType : "concert";
  const notes =
    typeof body?.notes === "string" ? String(body.notes).slice(0, 1200) : "";

  if (!venueSlug) {
    return NextResponse.json(
      { ok: false, error: "venueSlug required" },
      { status: 400 }
    );
  }

  const venue = getVenueBySlug(venueSlug);
  if (!venue) {
    return NextResponse.json(
      { ok: false, error: "Unknown venue" },
      { status: 404 }
    );
  }

  const artistName =
    (typeof body?.artistName === "string" && body.artistName.trim()) ||
    email.split("@")[0] ||
    "Performer";
  const contactEmail =
    (typeof body?.contactEmail === "string" && body.contactEmail.trim()) ||
    email ||
    `${sessionId}@tmi.local`;

  try {
    const booking = await VenueBookingRegistry.create({
      venueSlug,
      artistName,
      artistSlug: slugify(artistName),
      contactEmail,
      eventDate,
      eventType,
      expectedAttendance: 0,
      estimatedTotalUsd: 0,
      addOns: [],
      additionalNotes: notes || "Requested via Venue Concierge",
      userId: sessionId,
    });

    // Notify Overseer / ops via existing booking alert channel (no parallel inbox UI).
    const alertEmail = process.env.BOOKING_ALERT_EMAIL?.trim();
    if (alertEmail) {
      waitUntil(
        EmailProviderEngine.sendAsync({
          to: alertEmail,
          subject: `Overseer booking queue: ${booking.bookingId} (${venueSlug})`,
          html: `<h2>Venue Concierge booking request</h2>
<p><b>Booking:</b> ${booking.bookingId}</p>
<p><b>Venue:</b> ${venue.name} (${venueSlug})</p>
<p><b>Artist:</b> ${artistName}</p>
<p><b>Email:</b> ${contactEmail}</p>
<p><b>Date:</b> ${eventDate}</p>
<p><b>Review:</b> <a href="https://themusiciansindex.com/admin/overseer">Overseer Deck</a></p>`,
          text: `Booking ${booking.bookingId}\nVenue: ${venueSlug}\nArtist: ${artistName}\nDate: ${eventDate}`,
          tags: ["booking-request", "venue-concierge", "overseer-queue"],
          replyTo: contactEmail,
        }).catch(() => undefined)
      );
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.bookingId,
      overseerPath: "/admin/overseer",
      message: `Booking request ${booking.bookingId} recorded for ${venue.name}. Queued for Overseer / venue ops.`,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Booking request could not be persisted. Try again or use the full venue booking page.",
      },
      { status: 503 }
    );
  }
}
