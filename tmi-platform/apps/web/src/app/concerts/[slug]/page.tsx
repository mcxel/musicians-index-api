import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ConcertTicketButton from "@/components/events/ConcertTicketButton";
import {
  parseShowsReleaseRecord,
  toShowsReleasePublicCard,
  SHOWS_RELEASE_FEED_TYPE,
  TMI_LIVE_ONLINE_VENUE_SLUG,
} from "@/lib/events/ScheduledEventRegistry";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ checkout?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Show · ${slug} | TMI Live Online Concerts`,
    description: "Live Online Concert / World Release detail on The Musician's Index.",
  };
}

async function loadEvent(slug: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const feed = await prisma.feedItem.findFirst({
      where: { type: SHOWS_RELEASE_FEED_TYPE, entityId: slug },
      orderBy: { createdAt: "desc" },
    });
    const record = parseShowsReleaseRecord(feed?.data);
    return record ? toShowsReleasePublicCard(record) : null;
  } catch {
    return null;
  }
}

export default async function ConcertPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const card = await loadEvent(slug);

  if (!card) {
    redirect("/concerts");
  }

  const checkout = sp.checkout === "1";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link
          href="/concerts"
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}
        >
          ← LIVE ONLINE CONCERTS
        </Link>
      </div>

      <header style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 40px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            height: 240,
            borderRadius: 16,
            marginBottom: 24,
            background: card.artworkUrl
              ? `center/cover url(${card.artworkUrl})`
              : "linear-gradient(135deg,#FFD70044,#15102a)",
            border: "1px solid rgba(255,215,0,0.25)",
          }}
        />
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", marginBottom: 8 }}>
          {card.publicTypeLabel.toUpperCase()} · {card.cardStatuses[0]?.replace(/_/g, " ")}
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.5rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
          {card.title}
        </h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
          {card.performerName}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
          {card.dayTimeLabel}
        </div>
        {card.description ? (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 620, marginBottom: 32 }}>
            {card.description}
          </p>
        ) : null}

        {card.phase === "LIVE" && !card.ticketRequested ? (
          <Link
            href={card.joinHref}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#050510",
              background: "#00FF88",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            WATCH NOW
          </Link>
        ) : card.ticketRequested ? (
          <ConcertTicketButton
            eventId={card.eventId}
            price={card.requestedPriceUsd ?? 10}
            venueSlug={TMI_LIVE_ONLINE_VENUE_SLUG}
            autoStart={checkout}
          />
        ) : (
          <Link
            href={card.joinHref}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#050510",
              background: "#FFD700",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            GET ACCESS
          </Link>
        )}
      </header>
    </main>
  );
}
