import { redirect } from "next/navigation";

/**
 * Legacy /venue/:slug → canonical venue profile.
 *
 * CRITICAL: never `redirect(/venue/${slug})` — that is a self-loop.
 * Production symptom (pre-fix): `/venue/preview` matched this dynamic route,
 * emitted NEXT_REDIRECT → /venue/preview + meta refresh, and flickered forever
 * (X-Matched-Path: /venue/[slug]). Static `/venue/preview` owns that path when
 * deployed; this branch is the escape hatch when it does not.
 */

const RESERVED_VENUE_SEGMENTS = new Set([
  "preview",
  "tickets",
  "rooms",
  "seating",
  "bookings",
  "analytics",
  "sponsors",
  "settings",
  "dashboard",
  "profile",
]);

interface Props {
  params: { slug: string };
}

export default function VenueSlugPage({ params }: Props) {
  const slug = (params.slug || "").trim();
  const key = slug.toLowerCase();

  // Escape hatch — never bounce reserved static segments back onto themselves.
  if (key === "preview") {
    redirect("/hub/performer");
  }
  if (RESERVED_VENUE_SEGMENTS.has(key)) {
    redirect("/hub/venue");
  }

  redirect(`/profile/venue/${encodeURIComponent(slug)}`);
}
