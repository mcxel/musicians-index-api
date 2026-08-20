"use client";

/**
 * ShowsReleasesMarquee — premium horizontal Live Online Concerts / World Releases strip.
 * Artwork-first cards. No viewer counts. Mount on Home + /concerts.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WorldMiniBadge } from "@/components/live/WorldMiniBadge";
import type { ShowsReleasePublicCard } from "@/lib/events/ScheduledEventRegistry";
import { TMI_LIVE_ONLINE_VENUE_SLUG } from "@/lib/events/ScheduledEventRegistry";

type FilterRail = "ALL" | "LIVE_NOW" | "TODAY" | "COMING_SOON";

const STATUS_COLOR: Record<string, string> = {
  LIVE_NOW: "#00FF88",
  STARTING_SOON: "#FFD700",
  TODAY: "#00FFFF",
  UPCOMING: "#AA2DFF",
  SOLD_OUT: "#FF3B5C",
  FREE: "#00FF88",
  TICKET_REQUIRED: "#FFD700",
  ENDED: "#6b7280",
  REPLAY: "#AA2DFF",
};

async function startTicketCheckout(card: ShowsReleasePublicCard): Promise<void> {
  const res = await fetch("/api/tickets/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      eventSlug: card.eventId,
      eventId: card.eventId,
      venueSlug: TMI_LIVE_ONLINE_VENUE_SLUG,
      tier: "STANDARD",
      quantity: 1,
      faceValue: card.requestedPriceUsd ?? 10,
      successUrl: `${window.location.origin}/concerts/${encodeURIComponent(card.eventId)}?status=success`,
      cancelUrl: `${window.location.origin}/concerts/${encodeURIComponent(card.eventId)}?status=cancelled`,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) {
    window.location.href = `/auth?next=/concerts/${encodeURIComponent(card.eventId)}`;
    return;
  }
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "checkout_unavailable");
  }
  window.location.href = data.url;
}

function ShowCard({
  card,
  onTicket,
}: {
  card: ShowsReleasePublicCard;
  onTicket: (c: ShowsReleasePublicCard) => void;
}) {
  const live = card.phase === "LIVE";
  const primaryStatus = card.cardStatuses[0] ?? "UPCOMING";
  const accent = STATUS_COLOR[primaryStatus] ?? "#00FFFF";

  const ctaLabel =
    card.primaryCta === "WATCH_NOW"
      ? "WATCH NOW"
      : card.primaryCta === "GET_TICKET"
        ? "GET TICKET"
        : card.primaryCta === "GET_ACCESS"
          ? "GET ACCESS"
          : card.primaryCta === "REPLAY"
            ? "REPLAY"
            : card.primaryCta === "STARTING_SOON"
              ? "STARTING SOON"
              : "VIEW";

  const handleCta = () => {
    if (card.primaryCta === "GET_TICKET" || (card.ticketRequested && card.phase !== "LIVE")) {
      onTicket(card);
      return;
    }
    window.location.href = card.joinHref;
  };

  return (
    <article
      style={{
        flexShrink: 0,
        width: 220,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${accent}44`,
        background: "linear-gradient(160deg, rgba(12,8,28,0.98), rgba(5,5,16,0.98))",
        boxShadow: live ? `0 0 24px ${accent}33` : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 132,
          background: card.artworkUrl
            ? `center/cover no-repeat url(${card.artworkUrl})`
            : `linear-gradient(135deg, ${accent}33, #15102a)`,
        }}
      >
        {live && card.previewUrl ? (
          <video
            src={card.previewUrl}
            muted
            autoPlay
            loop
            playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(5,5,16,0.92), transparent 55%)",
          }}
        />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <WorldMiniBadge authority={card.authority} size="xs" />
          {card.cardStatuses.slice(0, 2).map((s) => (
            <span
              key={s}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: STATUS_COLOR[s] ?? "#fff",
                background: "rgba(0,0,0,0.55)",
                border: `1px solid ${(STATUS_COLOR[s] ?? "#fff")}55`,
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 12px 14px" }}>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", color: accent, marginBottom: 4 }}>
          {card.publicTypeLabel.toUpperCase()}
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.25, marginBottom: 4 }}>
          {card.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
          {card.performerName}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
          {card.dayTimeLabel}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: card.priceLabel === "FREE" ? "#00FF88" : "#FFD700" }}>
            {card.priceLabel}
          </span>
          {live && !card.ticketRequested ? (
            <Link
              href={card.joinHref}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "#050510",
                background: accent,
                padding: "7px 10px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleCta}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                color: "#050510",
                background: accent,
                padding: "7px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ShowsReleasesMarquee({
  zone = "home",
  title = "SHOWS & RELEASES",
  subtitle = "Live Online Concerts · World Releases",
  limit = 24,
  showBrowseAll = true,
}: {
  zone?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  showBrowseAll?: boolean;
}) {
  const [cards, setCards] = useState<ShowsReleasePublicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterRail>("ALL");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/events/shows-releases", { cache: "no-store" });
        const data = (await res.json()) as { events?: ShowsReleasePublicCard[] };
        if (!cancelled) setCards(Array.isArray(data.events) ? data.events.slice(0, limit) : []);
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return cards;
    if (filter === "LIVE_NOW") return cards.filter((c) => c.phase === "LIVE");
    if (filter === "TODAY") return cards.filter((c) => c.cardStatuses.includes("TODAY") || c.phase === "LIVE" || c.phase === "PRESHOW");
    return cards.filter((c) => c.phase === "CLOSED" || c.phase === "PRESHOW");
  }, [cards, filter]);

  const onTicket = useCallback(async (card: ShowsReleasePublicCard) => {
    setCheckoutError(null);
    try {
      await startTicketCheckout(card);
    } catch {
      setCheckoutError("Ticket checkout unavailable right now. Payments must be configured.");
    }
  }, []);

  const rails: { id: FilterRail; label: string }[] = [
    { id: "ALL", label: "ALL" },
    { id: "LIVE_NOW", label: "LIVE NOW" },
    { id: "TODAY", label: "TODAY" },
    { id: "COMING_SOON", label: "COMING SOON" },
  ];

  return (
    <section
      data-zone={zone}
      style={{
        width: "100%",
        background: "linear-gradient(180deg, rgba(10,6,24,0.95), rgba(5,5,16,0.98))",
        borderTop: "1px solid rgba(255,215,0,0.18)",
        borderBottom: "1px solid rgba(0,255,255,0.12)",
        padding: "18px 0 22px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700", marginBottom: 4 }}>
              {title}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
              {subtitle}
            </div>
          </div>
          {showBrowseAll ? (
            <Link
              href="/concerts"
              style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", textDecoration: "none" }}
            >
              BROWSE ALL →
            </Link>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {rails.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setFilter(r.id)}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                padding: "6px 12px",
                borderRadius: 999,
                border: filter === r.id ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.12)",
                background: filter === r.id ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.03)",
                color: filter === r.id ? "#FFD700" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {checkoutError ? (
          <div style={{ fontSize: 11, color: "#FF3B5C", marginBottom: 10 }}>{checkoutError}</div>
        ) : null}

        {loading ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: "28px 0" }}>
            Loading shows…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "28px 18px",
              borderRadius: 12,
              border: "1px dashed rgba(255,215,0,0.25)",
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
            }}
          >
            No Live Online Concerts or World Releases in this rail yet. Performers publish from their
            studio — then shows appear here.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 6,
              scrollSnapType: "x mandatory",
            }}
          >
            {filtered.map((card) => (
              <div key={card.eventId} style={{ scrollSnapAlign: "start" }}>
                <ShowCard card={card} onTicket={onTicket} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
