"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface MarqueeItem {
  channelLabel: string;
  competitionLabel: string;
  emoji: string;
  accentColor: string;
  startsInMs: number;
  roomShardId: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "NOW";
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export default function LiveMarqueeTicker() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [tick, setTick] = useState(0);
  const fetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch marquee data every 60 s
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/live/marquee", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json() as { events: MarqueeItem[] };
          setItems(data.events ?? []);
        }
      } catch {
        // silently ignore network errors — ticker is non-critical
      }
    }
    load();
    fetchRef.current = setInterval(load, 60_000);
    return () => { if (fetchRef.current) clearInterval(fetchRef.current); };
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) return null;

  const now = Date.now();

  return (
    <div
      style={{
        width: "100%",
        background: "rgba(5,5,16,0.9)",
        borderTop: "1px solid rgba(255,215,0,0.15)",
        borderBottom: "1px solid rgba(255,215,0,0.15)",
        overflow: "hidden",
        position: "relative",
        height: 32,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* LIVE badge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(5,5,16,0.97)",
          padding: "0 10px 0 8px",
          height: "100%",
          borderRight: "1px solid rgba(255,45,170,0.3)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 6px #FF2DAA",
            animation: "pulse 1.5s infinite",
          }}
        />
        <span style={{ fontSize: 8, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.18em" }}>
          LIVE
        </span>
      </div>

      {/* Scrolling ticker */}
      <div
        style={{
          display: "flex",
          gap: 0,
          animation: "marqueeScroll 60s linear infinite",
          paddingLeft: 90, // offset for LIVE badge
          whiteSpace: "nowrap",
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...items, ...items].map((item, i) => {
          const remaining = Math.max(0, item.startsInMs - (Date.now() - now));
          const isNow = remaining <= 0;
          return (
            <Link
              key={`${item.roomShardId}-${i}`}
              href={`/live/rooms/${item.roomShardId}`}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 20px",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 12 }}>{item.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
                {item.channelLabel}:
              </span>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>
                {item.competitionLabel}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: isNow ? "#FF2DAA" : item.accentColor,
                  background: isNow ? "rgba(255,45,170,0.12)" : `${item.accentColor}12`,
                  border: `1px solid ${isNow ? "rgba(255,45,170,0.4)" : `${item.accentColor}40`}`,
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                {isNow ? "● NOW" : `▶ ${formatCountdown(remaining)}`}
              </span>
            </Link>
          );
        })}
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        [data-tmi-marquee]:hover div[style*="marqueeScroll"] {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
