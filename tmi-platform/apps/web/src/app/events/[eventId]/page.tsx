import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LiveEventSeoEngine from "@/lib/seo/LiveEventSeoEngine";
import EventSchemaAuthorityEngine from "@/lib/seo/EventSchemaAuthorityEngine";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

type EventPageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { eventId } = await params;
  return LiveEventSeoEngine.buildEventMetadata(eventId);
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const event = WhatsHappeningTodayEngine.getBySlug(eventId);
  if (!event) notFound();

  const schema = EventSchemaAuthorityEngine.buildEventSchema(event);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "white", padding: "28px 16px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ color: "#AA2DFF", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11 }}>Live Event</p>
        <h1 style={{ fontSize: 42, margin: "8px 0" }}>{event.title}</h1>
        <p style={{ color: "#d4d4ea" }}>{event.city} · {event.venueName} · {event.country}</p>
        <p style={{ color: "#c8c8de" }}>Starts {event.startTime} · Ends {event.endTime} · {event.timezone}</p>

        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href={event.ticketLink} style={{ color: "#FFD700" }}>Tickets</Link>
          <Link href={event.streamLink} style={{ color: "#00FFFF" }}>Stream</Link>
          <Link href={`/venues/${event.venueSlug}`} style={{ color: "#FF2DAA" }}>Venue</Link>
          <Link href={`/billboards/${event.performers[0]}-campaign-01`} style={{ color: "#8fffcf" }}>Linked Billboard</Link>
          <Link href={`/articles/artist/${event.performers[0]}`} style={{ color: "#cda7ff" }}>Magazine coverage</Link>
        </div>
      </div>
    </main>
  );
}
