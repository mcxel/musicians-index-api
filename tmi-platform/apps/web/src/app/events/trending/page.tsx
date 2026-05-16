import type { Metadata } from "next";
import Link from "next/link";
import { LiveEventSeoEngine } from "@/lib/seo/LiveEventSeoEngine";
import { EventRankingEngine } from "@/lib/events/EventRankingEngine";
import { EventFreshnessEngine } from "@/lib/events/EventFreshnessEngine";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  return LiveEventSeoEngine.buildEventsIndexMetadata("/events");
}

export default function EventsTrendingPage() {
  const ranked = EventRankingEngine.rankEvents(undefined, 12);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42 }}>Trending Events</h1>
        <p style={{ color: "#bdbdd3", marginTop: 8 }}>Ranked by live momentum, freshness, popularity, and start window.</p>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/events" style={{ color: "#00FFFF", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>All Events</Link>
          <Link href="/events/today" style={{ color: "#FF2DAA", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Today</Link>
          <Link href="/events/live" style={{ color: "#FFD700", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>Live</Link>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {ranked.map(({ event, score, factors }, index) => {
            const freshness = EventFreshnessEngine.scoreEvent(event);
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid rgba(255,215,0,0.34)",
                  borderRadius: 10,
                  padding: 12,
                  background: "rgba(255,215,0,0.06)",
                }}
              >
                <strong style={{ color: "#FFD700" }}>#{index + 1} {event.title}</strong>
                <div style={{ color: "#ddd", fontSize: 13, marginTop: 4 }}>{event.city} · {event.country} · {event.genre}</div>
                <div style={{ color: "#bdbdd3", fontSize: 12, marginTop: 4 }}>
                  Score {score} · Freshness {freshness.freshnessScore} · Live {factors.liveNow}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
