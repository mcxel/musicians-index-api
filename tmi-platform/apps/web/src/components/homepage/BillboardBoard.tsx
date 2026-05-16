"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface BillboardSlot {
  id: string;
  label: string;
  sublabel?: string;
  stat?: string;
  badge?: string;
  href: string;
  color: string;
  rank?: number;
}

interface BillboardBoardProps {
  slots: BillboardSlot[];
  title?: string;
  scrollMs?: number;
  variant?: "horizontal" | "vertical";
  accentColor?: string;
}

export const LIVE_ARTIST_SLOTS: BillboardSlot[] = [
  { id: "bb1", label: "Wavetek", sublabel: "Trap · Houston TX", stat: "12.4K watching", badge: "LIVE", href: "/live/wavetek", color: "#FF2DAA", rank: 1 },
  { id: "bb2", label: "FlowMaster", sublabel: "Hip-Hop · ATL", stat: "8.1K watching", badge: "LIVE", href: "/live/flowmaster", color: "#00FFFF", rank: 2 },
  { id: "bb3", label: "Krypt", sublabel: "Drill · Chicago", stat: "5.8K watching", badge: "ACTIVE", href: "/live/krypt", color: "#FFD700", rank: 3 },
  { id: "bb4", label: "Neon Vibe", sublabel: "R&B · LA", stat: "4.2K watching", badge: "LIVE", href: "/live/neon-vibe", color: "#AA2DFF", rank: 4 },
  { id: "bb5", label: "Zuri", sublabel: "Afrobeats · NYC", stat: "3.9K watching", badge: "UPCOMING", href: "/live/zuri", color: "#00FF88", rank: 5 },
  { id: "bb6", label: "DD4 Crew", sublabel: "Comedy · Detroit", stat: "3.1K watching", badge: "LIVE", href: "/live/dd4", color: "#FF2DAA", rank: 6 },
];

export default function BillboardBoard({ slots, title, scrollMs = 4000, variant = "horizontal", accentColor = "#00FFFF" }: BillboardBoardProps) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % slots.length);
    }, scrollMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slots.length, scrollMs]);

  if (variant === "vertical") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {title && (
          <div style={{ fontSize: 9, color: accentColor, fontWeight: 800, letterSpacing: "0.18em", marginBottom: 4 }}>{title}</div>
        )}
        {slots.map((slot, i) => (
          <Link key={slot.id} href={slot.href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px",
              background: active === i ? `${slot.color}12` : "rgba(255,255,255,0.02)",
              border: `1px solid ${active === i ? `${slot.color}40` : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8,
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
              onMouseEnter={() => setActive(i)}
            >
              {slot.rank && (
                <span style={{ fontSize: 10, fontWeight: 900, color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.3)", minWidth: 18 }}>#{slot.rank}</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{slot.label}</div>
                {slot.sublabel && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{slot.sublabel}</div>}
              </div>
              {slot.stat && <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, whiteSpace: "nowrap" }}>{slot.stat}</div>}
              {slot.badge && (
                <span style={{
                  fontSize: 7, fontWeight: 900, color: slot.color,
                  border: `1px solid ${slot.color}50`, borderRadius: 3, padding: "2px 5px",
                  animation: slot.badge === "LIVE" ? "pulse 2s ease-in-out infinite" : "none",
                }}>{slot.badge}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {title && (
        <div style={{ fontSize: 9, color: accentColor, fontWeight: 800, letterSpacing: "0.18em", marginBottom: 10 }}>{title}</div>
      )}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {slots.map((slot, i) => (
          <Link key={slot.id} href={slot.href} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 160,
              padding: "12px 14px",
              background: active === i ? `${slot.color}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${active === i ? `${slot.color}50` : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10,
              transition: "all 0.3s ease",
              cursor: "pointer",
              boxShadow: active === i ? `0 0 20px ${slot.color}20` : "none",
            }}
              onMouseEnter={() => setActive(i)}
            >
              {slot.rank && (
                <div style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? "#FFD700" : slot.color, marginBottom: 4 }}>#{slot.rank}</div>
              )}
              {slot.badge && (
                <span style={{ fontSize: 7, fontWeight: 900, color: slot.color, border: `1px solid ${slot.color}50`, borderRadius: 3, padding: "2px 5px", display: "inline-block", marginBottom: 6 }}>{slot.badge}</span>
              )}
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{slot.label}</div>
              {slot.sublabel && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{slot.sublabel}</div>}
              {slot.stat && <div style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>{slot.stat}</div>}
            </div>
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
        {slots.map((_, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? 16 : 6, height: 4, borderRadius: 2, background: i === active ? accentColor : "rgba(255,255,255,0.15)", transition: "all 0.3s", cursor: "pointer" }} />
        ))}
      </div>
    </div>
  );
}
