import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export class VenueEventSeoEngine {
  static buildVenueEventsMetadata(venueSlug: string): Metadata {
    const events = WhatsHappeningTodayEngine.listAll().filter((event) => event.venueSlug === venueSlug);
    const title = `${venueSlug.replace(/-/g, " ")} Events | BernoutGlobal`;
    const description = events.length > 0
      ? `${events.length} upcoming events at ${venueSlug.replace(/-/g, " ")} on The Musician's Index.`
      : "Venue event schedule and live discoverability on The Musician's Index.";

    return {
      title,
      description,
      alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}/venues/${venueSlug}/events` },
      openGraph: {
        title,
        description,
        url: `${SEO_BRAND.ROOT_CANONICAL}/venues/${venueSlug}/events`,
        siteName: "BernoutGlobal",
      },
      twitter: {
        card: "summary",
        title,
        description,
        creator: SEO_BRAND.TWITTER_HANDLE,
      },
    };
  }
}

export default VenueEventSeoEngine;
