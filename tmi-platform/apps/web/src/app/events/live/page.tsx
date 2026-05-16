import type { Metadata } from "next";
import Link from "next/link";
import { LiveEventSeoEngine } from "@/lib/seo/LiveEventSeoEngine";
import { EventDiscoveryEngine } from "@/lib/events/EventDiscoveryEngine";
import { EventRankingEngine } from "@/lib/events/EventRankingEngine";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  return LiveEventSeoEngine.buildEventsIndexMetadata("/events/live");
}

export default function EventsLivePage() {
  const liveNow = EventDiscoveryEngine.discover({ liveNow: true, streamingNow: true });
  const ranked = EventRankingEngine.rankEvents(liveNow, 8);

  return (
    <main style={{ minHeight: "100vh", background: "#04040d", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Live Right Now</h1>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/events" style={{ color: "#00FFFF", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>All Events</Link>
          <Link href="/events/today" style={{ color: "#FF2DAA", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Today</Link>
          <Link href="/events/trending" style={{ color: "#FFD700", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Trending</Link>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {ranked.map(({ event, score }) => (
            <Link key={event.slug} href={`/events/${event.slug}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(0,255,255,0.34)", borderRadius: 10, padding: 10, background: "rgba(0,255,255,0.06)" }}>
              <strong>{event.title}</strong>
              <div style={{ color: "#9ee", fontSize: 13 }}>{event.city} · {event.genre} · Rank Score {score}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
