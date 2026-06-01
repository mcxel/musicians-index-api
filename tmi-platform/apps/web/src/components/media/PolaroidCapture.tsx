"use client";
/**
 * PolaroidCapture — "Capture This Moment" widget
 *
 * Drop into any arena, venue, battle, or cypher room.
 * When clicked: creates a Memory Moment + shows a polaroid animation.
 *
 * Feeds into the Memory Wall at /memories.
 * Part of the engagement loop: Join → Watch → Capture → Share → Return.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { saveMemoryMoment } from "@/lib/memories/MemoryMomentEngine";

interface Props {
  sourceId:   string;   // roomId, eventId, artistSlug, etc.
  sourceType: "event" | "profile" | "ticket";
  eventName:  string;   // Display name: "Battle Night", "World Concert", etc.
  accentColor?: string;
  compact?:   boolean;
  userId?:    string;
}

export default function PolaroidCapture({ sourceId, sourceType, eventName, accentColor = "#FF2DAA", compact = false, userId = "guest" }: Props) {
  const [captured, setCaptured] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [lastCapture, setLastCapture] = useState<{ id: string; title: string } | null>(null);

  const capture = useCallback(() => {
    if (captured) return;
    setAnimating(true);
    const title = `${eventName} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    const moment = saveMemoryMoment(userId, title, sourceType, sourceId);
    setLastCapture({ id: moment.id, title });
    setTimeout(() => {
      setCaptured(true);
      setAnimating(false);
    }, 800);
  }, [captured, eventName, sourceType, sourceId, userId]);

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={capture}
          disabled={captured}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 8, border: "none",
            background: captured ? "rgba(0,255,136,0.12)" : `${accentColor}18`,
            color: captured ? "#00FF88" : accentColor,
            fontSize: 9, fontWeight: 900, cursor: captured ? "not-allowed" : "pointer",
            letterSpacing: "0.08em", outline: `1px solid ${captured ? "rgba(0,255,136,0.3)" : accentColor + "30"}`,
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 12, animation: animating ? "pcSpin 0.8s ease" : "none" }}>
            {captured ? "✓" : "📸"}
          </span>
          {captured ? "SAVED" : "CAPTURE"}
        </button>
        {captured && (
          <Link href="/memories" style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            View memory →
          </Link>
        )}
        <style>{`@keyframes pcSpin{0%{transform:scale(1)}40%{transform:scale(1.3) rotate(-10deg)}100%{transform:scale(1)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes pcFlash { 0%{opacity:0}20%{opacity:1}100%{opacity:0} }
        @keyframes pcPolaroid { 0%{transform:translateY(20px) rotate(-5deg) scale(0.8);opacity:0} 60%{transform:translateY(-8px) rotate(2deg) scale(1.05)} 100%{transform:translateY(0) rotate(-1deg) scale(1);opacity:1} }
      `}</style>

      {/* Flash overlay */}
      {animating && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 99999, pointerEvents: "none", animation: "pcFlash 0.8s ease forwards" }} />
      )}

      {/* Polaroid result */}
      {captured && lastCapture && (
        <div style={{ animation: "pcPolaroid 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards", background: "#fff", borderRadius: 4, padding: "10px 10px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxWidth: 160, textAlign: "center" }}>
          {/* Polaroid "photo" */}
          <div style={{ background: "#111", borderRadius: 2, height: 80, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            📸
          </div>
          {/* Caption */}
          <div style={{ fontSize: 8, color: "#333", lineHeight: 1.4, fontFamily: "monospace" }}>{lastCapture.title}</div>
          <Link href="/memories" style={{ display: "block", marginTop: 6, fontSize: 8, color: accentColor, textDecoration: "none", fontWeight: 700 }}>VIEW MEMORY WALL →</Link>
        </div>
      )}

      {/* Capture button */}
      {!captured && (
        <button
          onClick={capture}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "12px 20px", borderRadius: 12,
            background: animating ? `${accentColor}22` : `${accentColor}10`,
            border: `1.5px solid ${accentColor}44`,
            color: accentColor, cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 24, animation: animating ? "pcSpin 0.8s ease" : "none" }}>📸</span>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>
            {animating ? "CAPTURING…" : "CAPTURE MOMENT"}
          </span>
          <span style={{ fontSize: 7, color: `${accentColor}88` }}>Save to Memory Wall</span>
        </button>
      )}
    </div>
  );
}
