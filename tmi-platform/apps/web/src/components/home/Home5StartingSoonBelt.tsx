"use client";

/**
 * Home5StartingSoonBelt.tsx
 * Section B — STARTING SOON BELT
 * Visual countdown cards for rooms opening soon.
 * Shows both relative countdown + absolute event time.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { eventRotationEngine, LiveEvent, EventRotationEngine } from "@/lib/competition/EventRotationEngine";

const ACCENT: Record<string, string> = {
  battle: "#FF6B35",
  cypher: "#AA2DFF",
  contest: "#FFD700",
};

const ROUTE: Record<string, string> = {
  battle: "/battles/register",
  cypher: "/cypher/register",
  contest: "/contests/register",
};

function StartingSoonCard({ event }: { event: LiveEvent }) {
  const accent = ACCENT[event.type] ?? "#FF6B35";
  const [seconds, setSeconds] = useState(event.countdownSeconds);

  useEffect(() => {
    setSeconds(event.countdownSeconds);
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [event.id, event.countdownSeconds]);

  const urgency = seconds < 120; // under 2 min — pulse red

  return (
    <div
      style={{
        border: `1px solid ${urgency ? "#FF0040" : accent}66`,
        borderRadius: 10,
        background: urgency
          ? "linear-gradient(135deg, rgba(255,0,64,0.12), rgba(5,5,16,0.95))"
          : `linear-gradient(135deg, ${accent}10, rgba(5,5,16,0.97))`,
        padding: 14,
        display: "grid",
        gap: 10,
        transition: "border-color 0.5s ease",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {event.genre.icon} {event.genre.name} · {event.type.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              letterSpacing: "0.06em",
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
            {event.format.replace(/-/g, " ")}
          </div>
        </div>

        {/* Countdown clock */}
        <div
          style={{
            textAlign: "right",
            background: urgency ? "rgba(255,0,64,0.15)" : "rgba(0,0,0,0.4)",
            border: `1px solid ${urgency ? "#FF004044" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8,
            padding: "8px 12px",
            minWidth: 90,
            transition: "background 0.5s ease",
          }}
        >
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.08em", marginBottom: 2 }}>
            STARTS IN
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "Orbitron, monospace",
              color: urgency ? "#FF0040" : accent,
              transition: "color 0.5s ease",
            }}
          >
            {EventRotationEngine.formatCountdown(seconds)}
          </div>
          <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2 }}>
            {EventRotationEngine.formatAbsoluteTime(event.absoluteStartTime)}
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          {event.participants.length}/{event.maxParticipants} joined
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#00FF88",
            fontWeight: 600,
          }}
        >
          {event.slotsLeft} slots left
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#FFD700", fontWeight: 600 }}>
          {event.reward.points.toLocaleString()} pts
        </div>
      </div>

      {/* Enter button */}
      <Link
        href={ROUTE[event.type] ?? "/games"}
        style={{
          background: urgency
            ? "linear-gradient(135deg, #FF0040, #FF2DAA)"
            : `linear-gradient(135deg, ${accent}cc, ${accent}99)`,
          color: urgency ? "#fff" : "#000",
          borderRadius: 6,
          padding: "8px 12px",
          fontWeight: 800,
          fontSize: 12,
          textAlign: "center",
          textDecoration: "none",
          letterSpacing: "0.06em",
          fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
          transition: "background 0.5s ease",
        }}
      >
        {urgency ? "ENTERING NOW" : "REGISTER"}
      </Link>
    </div>
  );
}

export default function Home5StartingSoonBelt() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  const refresh = useCallback(() => {
    const soon = eventRotationEngine.getStartingSoonEvents().slice(0, 5);
    setEvents(soon);
  }, []);

  useEffect(() => {
    refresh();
    const unsub = eventRotationEngine.subscribe(refresh);
    // Refresh countdowns every second
    const t = setInterval(refresh, 1000);
    return () => {
      unsub();
      clearInterval(t);
    };
  }, [refresh]);

  if (events.length === 0) return null;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FF6B35",
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
        >
          STARTING SOON
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{events.length} rooms opening</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {events.map((event) => (
          <StartingSoonCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
