import type { Metadata } from "next";
import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export class LiveEventSeoEngine {
  static buildEventsIndexMetadata(path: "/events" | "/events/today" | "/events/live"): Metadata {
    const map: Record<string, string> = {
      "/events": "Live Music Events | BernoutGlobal",
      "/events/today": "What's Happening Today | BernoutGlobal",
      "/events/live": "Live Right Now | BernoutGlobal",
    };

    return {
      title: map[path],
      description: "Discover battles, cyphers, shows, and live music events on The Musician's Index.",
      alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}${path}` },
      openGraph: {
        title: map[path],
        description: "Real-time event discovery for BernoutGlobal and The Musician's Index.",
        url: `${SEO_BRAND.ROOT_CANONICAL}${path}`,
        siteName: "BernoutGlobal",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: map[path],
        description: "Live event discovery and ticket routes.",
        creator: SEO_BRAND.TWITTER_HANDLE,
      },
    };
  }

  static buildEventMetadata(slug: string): Metadata {
    const event = WhatsHappeningTodayEngine.getBySlug(slug);
    const title = event ? `${event.title} | BernoutGlobal` : "Event | BernoutGlobal";
    const description = event
      ? `${event.title} at ${event.venueName}, ${event.city}. Tickets and stream links available on The Musician's Index.`
      : "Live event details, tickets, and stream links on The Musician's Index.";

    return {
      title,
      description,
      alternates: { canonical: `${SEO_BRAND.ROOT_CANONICAL}/events/${slug}` },
      openGraph: {
        title,
        description,
        url: `${SEO_BRAND.ROOT_CANONICAL}/events/${slug}`,
        siteName: "BernoutGlobal",
        type: "website",
        images: event ? [{ url: `${SEO_BRAND.ROOT_CANONICAL}${event.posterImage}`, alt: event.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        creator: SEO_BRAND.TWITTER_HANDLE,
      },
    };
  }
}

export default LiveEventSeoEngine;
