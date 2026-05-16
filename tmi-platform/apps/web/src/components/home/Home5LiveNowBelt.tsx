"use client";

/**
 * Home5LiveNowBelt.tsx
 * Section A — LIVE NOW BELT
 * Auto-rotates battle / cypher / contest cards every 8 seconds.
 * Crossfade + slide transition. Not tabs.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { eventRotationEngine, LiveEvent, EventRotationEngine } from "@/lib/competition/EventRotationEngine";

const ACCENT: Record<string, string> = {
  battle: "#FF2DAA",
  cypher: "#AA2DFF",
  contest: "#FFD700",
};

const TYPE_LABEL: Record<string, string> = {
  battle: "LIVE BATTLE",
  cypher: "LIVE CYPHER",
  contest: "LIVE CONTEST",
};

const ROUTE: Record<string, string> = {
  battle: "/battles/live",
  cypher: "/cypher/live",
  contest: "/contests/live",
};

function LiveEventCard({ event, visible }: { event: LiveEvent; visible: boolean }) {
  const accent = ACCENT[event.type] ?? "#FF2DAA";
  const [seconds, setSeconds] = useState(event.countdownSeconds);

  useEffect(() => {
    setSeconds(event.countdownSeconds);
    if (event.status !== "live") {
      const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [event.id, event.status, event.countdownSeconds]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(32px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        pointerEvents: visible ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${accent}66`,
      }}
    >
      {/* Left — Room image panel */}
      <div
        style={{
          background: event.roomImage
            ? `linear-gradient(to right, rgba(5,5,16,0.1), rgba(5,5,16,0.7)), url(${event.roomImage}) center/cover`
            : `linear-gradient(135deg, ${accent}22, #050510)`,
          position: "relative",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 14,
          gap: 8,
        }}
      >
        {/* LIVE badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,0,0,0.85)",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
              animation: "none",
            }}
          />
          {TYPE_LABEL[event.type] ?? "LIVE"}
        </div>

        {/* Viewer count */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 11,
            color: "#fff",
            opacity: 0.9,
          }}
        >
          👁 {event.viewerCount.toLocaleString()}
        </div>

        {/* Genre tag */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {event.genre.icon} {event.genre.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
            letterSpacing: "0.06em",
            lineHeight: 1.1,
            textShadow: `0 0 20px ${accent}80`,
          }}
        >
          {event.title}
        </div>

        {/* Participants */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {event.participants.slice(0, 4).map((p) => (
            <div
              key={p.id}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: p.avatar
                  ? `url(${p.avatar}) center/cover`
                  : `${accent}44`,
                border: `1px solid ${accent}88`,
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {!p.avatar && p.name[0]}
            </div>
          ))}
          {event.participants.length > 4 && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: `1px solid rgba(255,255,255,0.2)`,
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +{event.participants.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Right — Event details */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accent}14 0%, rgba(5,5,16,0.97) 100%)`,
          padding: 18,
          display: "grid",
          alignContent: "space-between",
          gap: 12,
        }}
      >
        {/* Status + host */}
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Host
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {event.hostName ?? "TMI Host"}
          </div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700 }}>
            {event.format.replace(/-/g, " ").toUpperCase()}
          </div>
        </div>

        {/* Countdown or slots */}
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            borderRadius: 8,
            padding: 12,
            display: "grid",
            gap: 4,
          }}
        >
          {event.status === "live" ? (
            <>
              <div style={{ fontSize: 10, opacity: 0.6 }}>SLOTS REMAINING</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Orbitron, monospace", color: accent }}>
                {event.slotsLeft}/{event.maxParticipants}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, opacity: 0.6 }}>STARTS IN</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Orbitron, monospace", color: accent }}>
                {EventRotationEngine.formatCountdown(seconds)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>
                {EventRotationEngine.formatAbsoluteTime(event.absoluteStartTime)}
              </div>
            </>
          )}
        </div>

        {/* Reward strip */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <div style={{ background: `${accent}20`, border: `1px solid ${accent}44`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700 }}>
            {event.reward.points.toLocaleString()} PTS
          </div>
          <div style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, color: "#00FF88" }}>
            {event.reward.xp} XP
          </div>
          {event.reward.badge && (
            <div style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, color: "#FFD700" }}>
              BADGE
            </div>
          )}
        </div>

        {/* Prize */}
        {event.reward.sponsorPrize && (
          <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 600 }}>
            🏆 {event.reward.sponsorPrize}
          </div>
        )}

        {/* Join button */}
        <Link
          href={ROUTE[event.type] ?? "/games"}
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
            color: "#000",
            borderRadius: 8,
            padding: "12px 16px",
            fontWeight: 900,
            fontSize: 14,
            textAlign: "center",
            textDecoration: "none",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
          }}
        >
          {event.status === "live" ? "JOIN NOW" : "ENTER ROOM"}
        </Link>
      </div>
    </div>
  );
}

export default function Home5LiveNowBelt() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const refresh = useCallback(() => {
    const live = eventRotationEngine.getLiveNowEvents();
    setEvents(live);
  }, []);

  useEffect(() => {
    refresh();
    const unsub = eventRotationEngine.subscribe(refresh);
    return unsub;
  }, [refresh]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (events.length <= 1) return;
    const t = setInterval(() => {
      setActiveIndex((i) => (i + 1) % events.length);
    }, 8000);
    return () => clearInterval(t);
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,45,170,0.3)",
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
          opacity: 0.7,
          fontSize: 14,
        }}
      >
        No live events at the moment. Starting soon...
      </div>
    );
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF0040",
            boxShadow: "0 0 8px #FF004080",
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FF2DAA",
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
        >
          LIVE NOW
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{events.length} events</span>

        {/* Rotation dots */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: i === activeIndex ? "#FF2DAA" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "width 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Card container */}
      <div style={{ position: "relative", height: 220 }}>
        {events.map((event, i) => (
          <LiveEventCard key={event.id} event={event} visible={i === activeIndex} />
        ))}
      </div>
    </section>
  );
}
