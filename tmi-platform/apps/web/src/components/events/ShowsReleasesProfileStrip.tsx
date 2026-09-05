"use client";

/**
 * ShowsReleasesProfileStrip — Upcoming / Live Now / Past / World Releases from same catalog.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { WorldMiniBadge } from "@/components/live/WorldMiniBadge";
import type { ShowsReleasePublicCard } from "@/lib/events/ScheduledEventRegistry";

export default function ShowsReleasesProfileStrip({
  performerSlug,
  accentColor = "#FFD700",
}: {
  performerSlug: string;
  accentColor?: string;
}) {
  const [events, setEvents] = useState<ShowsReleasePublicCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/events/shows-releases?performerSlug=${encodeURIComponent(performerSlug)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as { events?: ShowsReleasePublicCard[] };
        if (!cancelled) setEvents(Array.isArray(data.events) ? data.events : []);
      } catch {
        if (!cancelled) setEvents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [performerSlug]);

  const live = events.filter((e) => e.phase === "LIVE");
  const upcoming = events.filter((e) => e.phase === "CLOSED" || e.phase === "PRESHOW");
  const past = events.filter((e) => e.phase === "POSTSHOW");
  const releases = events.filter(
    (e) => e.kind === "WORLD_RELEASE" || e.kind === "MINI_RELEASE",
  );

  const sections: { label: string; items: ShowsReleasePublicCard[] }[] = [
    { label: "LIVE NOW", items: live },
    { label: "UPCOMING", items: upcoming },
    { label: "WORLD RELEASES", items: releases },
    { label: "PAST SHOWS", items: past },
  ];

  return (
    <section
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${accentColor}33`,
        background: "rgba(8,8,24,0.85)",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: accentColor, marginBottom: 10 }}>
        SHOWS & RELEASES · LIVE ONLINE CONCERTS
      </div>
      {events.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          No upcoming Live Online Concerts or World Releases yet.
        </div>
      ) : (
        sections.map((sec) =>
          sec.items.length === 0 ? null : (
            <div key={sec.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
                {sec.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sec.items.slice(0, 4).map((e) => (
                  <Link
                    key={`${sec.label}-${e.eventId}`}
                    href={e.joinHref}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: e.artworkUrl
                          ? `center/cover url(${e.artworkUrl})`
                          : `linear-gradient(135deg, ${accentColor}44, #15102a)`,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                        <WorldMiniBadge authority={e.authority} size="xs" />
                        <span style={{ fontSize: 8, color: accentColor, fontWeight: 800 }}>
                          {e.publicTypeLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{e.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{e.dayTimeLabel}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: accentColor }}>{e.priceLabel}</span>
                  </Link>
                ))}
              </div>
            </div>
          ),
        )
      )}
      <Link href="/concerts" style={{ fontSize: 10, color: "#00FFFF", fontWeight: 700 }}>
        Browse all Live Online Concerts →
      </Link>
    </section>
  );
}
