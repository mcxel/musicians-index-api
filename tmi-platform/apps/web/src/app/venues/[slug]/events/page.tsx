import type { Metadata } from "next";
import Link from "next/link";
import { VenueEventSeoEngine } from "@/lib/seo/VenueEventSeoEngine";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return VenueEventSeoEngine.buildVenueEventsMetadata(slug);
}

export default async function VenueEventsPage({ params }: Props) {
  const { slug } = await params;
  const events = WhatsHappeningTodayEngine.listAll().filter((event) => event.venueSlug === slug);

  return (
    <main style={{ minHeight: "100vh", background: "#04040d", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 38 }}>{slug.replace(/-/g, " ")} events</h1>
        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {events.map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: 10 }}>
              <strong>{event.title}</strong>
              <div style={{ color: "#d0cc9f", fontSize: 13 }}>{event.startTime}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
