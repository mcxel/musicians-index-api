import { SEO_BRAND } from "@/lib/seo/SeoBrandConfig";
import { type LiveEventRecord } from "@/lib/events/WhatsHappeningTodayEngine";

export class EventSchemaAuthorityEngine {
  static buildEventSchema(event: LiveEventRecord): Record<string, unknown> {
    return {
      "@context": "https://schema.org",
      "@type": ["Event", "MusicEvent", "LivePerformanceEvent"],
      name: event.title,
      description: `${event.title} hosted by ${event.host} at ${event.venueName}.`,
      startDate: event.startTime,
      endDate: event.endTime,
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      image: [`${SEO_BRAND.ROOT_CANONICAL}${event.posterImage}`],
      location: {
        "@type": "Place",
        name: event.venueName,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressCountry: event.country,
        },
      },
      performer: event.performers.map((slug) => ({
        "@type": "MusicGroup",
        name: slug,
        url: `${SEO_BRAND.ROOT_CANONICAL}/artists/${slug}`,
      })),
      organizer: {
        "@type": "Organization",
        name: SEO_BRAND.ROOT_ORGANIZATION,
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: event.price.replace("$", "") || "0",
        url: `${SEO_BRAND.ROOT_CANONICAL}${event.ticketLink}`,
        availability: "https://schema.org/InStock",
      },
    };
  }
}

export default EventSchemaAuthorityEngine;
