import type { Metadata } from "next";
import Link from "next/link";
import { LiveEventSeoEngine } from "@/lib/seo/LiveEventSeoEngine";
import { TodayEventIndexEngine } from "@/lib/seo/TodayEventIndexEngine";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";
import { EventDiscoveryEngine } from "@/lib/events/EventDiscoveryEngine";
import { EventRankingEngine } from "@/lib/events/EventRankingEngine";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return LiveEventSeoEngine.buildEventsIndexMetadata("/events/today");
}

export default function EventsTodayPage() {
  const events = EventDiscoveryEngine.discover({ today: true, ticketAvailable: true });
  const fallbackEvents = EventDiscoveryEngine.discoverWithFallback("us", 4);
  const trending = EventRankingEngine.getTrending(3);
  const index = TodayEventIndexEngine.build();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>What&apos;s Happening Today</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>Live Right Now: {index.liveRightNow.length} · Tonight&apos;s Battles: {index.tonightBattles.length}</p>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/events" style={{ color: "#00FFFF", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>All Events</Link>
          <Link href="/events/live" style={{ color: "#FF2DAA", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Live Now</Link>
          <Link href="/events/trending" style={{ color: "#FFD700", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Trending</Link>
        </div>
        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {events.map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(255,45,170,0.34)", borderRadius: 10, padding: 10, background: "rgba(255,45,170,0.06)" }}>
              <strong>{event.title}</strong>
              <div style={{ color: "#ccc", fontSize: 13 }}>{event.city} · {event.venueName} · {event.country}</div>
            </Link>
          ))}
        </div>
        <h2 style={{ marginTop: 22, fontSize: 24, color: "#FFD700" }}>Country Fallback</h2>
        <p style={{ color: "#9fa0b8", marginTop: 6 }}>If your local timeline is quiet, active countries are automatically surfaced.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {fallbackEvents.map((event) => (
            <Link key={`fallback-${event.slug}`} href={`/events/${event.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(0,255,255,0.28)", borderRadius: 10, padding: 10, background: "rgba(0,255,255,0.06)" }}>
              <strong>{event.title}</strong>
              <div style={{ color: "#9ee", fontSize: 13 }}>{event.city} · {event.country} · {event.genre}</div>
            </Link>
          ))}
        </div>
        <h2 style={{ marginTop: 22, fontSize: 24, color: "#AA2DFF" }}>Trending Today</h2>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {trending.map((event) => (
            <Link key={`trend-${event.slug}`} href={`/events/${event.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(170,45,255,0.34)", borderRadius: 10, padding: 10, background: "rgba(170,45,255,0.08)" }}>
              <strong>{event.title}</strong>
              <div style={{ color: "#cab2ff", fontSize: 13 }}>{event.city} · {event.genre}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
