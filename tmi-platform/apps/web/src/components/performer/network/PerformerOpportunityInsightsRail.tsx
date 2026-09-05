"use client";

/**
 * PerformerOpportunityInsightsRail — Rule 20 honest metrics + opportunities.
 * Performer metrics ≠ venue physical-ticket metrics.
 */

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { listActiveBoostsForOwner } from "@/lib/discovery/DiscoveryBoostEngine";

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface Props {
  ownerId: string;
  mode?: "performer" | "venue";
  accent?: string;
}

export default function PerformerOpportunityInsightsRail({
  ownerId,
  mode = "performer",
  accent = "#00FFFF",
}: Props) {
  const [bookingOpen, setBookingOpen] = useState(0);
  const [boostCount, setBoostCount] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    setBoostCount(listActiveBoostsForOwner(ownerId).length);
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/booking/opportunities", {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok) {
          setBookingOpen(0);
          setLoadState("error");
          return;
        }
        const data = (await res.json()) as { opportunities?: unknown[] };
        const count = Array.isArray(data.opportunities) ? data.opportunities.length : 0;
        setBookingOpen(count);
        setLoadState(count === 0 ? "empty" : "ready");
      } catch {
        if (cancelled) return;
        setBookingOpen(0);
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const performerMetrics: MetricCard[] = [
    { label: "Online tickets", value: "0", sub: "No digital sales yet", color: "#00FFFF" },
    { label: "Tips", value: "$0", sub: "No tips this period", color: "#FF2DAA" },
    {
      label: "Booking offers",
      value: loadState === "loading" ? "…" : String(bookingOpen),
      sub:
        loadState === "error"
          ? "Unable to load"
          : loadState === "loading"
            ? "Loading…"
            : "Open opportunities",
      color: "#00FF88",
    },
    { label: "Merch", value: "$0", sub: "No merch sales yet", color: "#FFD700" },
    {
      label: "Active boosts",
      value: String(boostCount),
      sub: boostCount ? "PROMOTED live" : "Organic only",
      color: accent,
    },
  ];

  const venueMetrics: MetricCard[] = [
    { label: "Venue bookings", value: "0", sub: "No venue bookings yet", color: "#22c55e" },
    { label: "Physical events", value: "0", sub: "Create an event to start", color: "#00FFFF" },
    { label: "Venue promos", value: String(boostCount), sub: "Active promotions", color: "#FFD700" },
    {
      label: "Open opportunities",
      value: loadState === "loading" ? "…" : String(bookingOpen),
      sub: loadState === "error" ? "Unable to load" : "Posted gigs",
      color: "#FF2DAA",
    },
  ];

  const metrics = mode === "venue" ? venueMetrics : performerMetrics;

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Opportunity Rail · Insights</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
          {mode === "venue" ? "Venue business metrics" : "Performer revenue signals"}
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Real numbers only. Venue physical tickets stay separate from performer live-broadcast
          digital tickets.
        </p>
      </header>

      <div style={grid}>
        {metrics.map((m) => (
          <div key={m.label} style={card(m.color)}>
            <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4 }}>{m.label}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={label}>Opportunities</div>
        {loadState === "loading" && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Loading opportunities…</div>
        )}
        {loadState === "error" && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Unable to load booking opportunities. Retry later.
          </div>
        )}
        {(loadState === "empty" || (loadState === "ready" && bookingOpen === 0)) && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            No open booking opportunities right now.{" "}
            <Link href="/booking/venues" style={{ color: accent }}>
              Browse venues →
            </Link>
          </div>
        )}
        {loadState === "ready" && bookingOpen > 0 && (
          <Link href="/booking/offers" style={{ color: accent, fontSize: 12, fontWeight: 700 }}>
            View {bookingOpen} open opportunit{bookingOpen === 1 ? "y" : "ies"} →
          </Link>
        )}
      </div>
    </section>
  );
}

function section(accent: string): CSSProperties {
  return {
    background: "rgba(10,8,24,0.92)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: 18,
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.28em",
    color: accent,
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  };
}
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 8,
};
function card(color: string): CSSProperties {
  return {
    padding: "14px 12px",
    borderRadius: 12,
    background: `${color}0d`,
    border: `1px solid ${color}28`,
  };
}
const label: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 8,
  textTransform: "uppercase",
};
