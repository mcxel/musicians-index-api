"use client";

/**
 * Rule 20: every stat here must be real or honestly unavailable — never a
 * hand-typed number with a fake "flicker" animation pretending to be live
 * telemetry (the previous version did exactly that, including a fabricated
 * "TMI REVENUE" figure). Live room count / watching-now come from the real
 * homepage live-rooms API (getHomeLive). The remaining stats have no
 * client-fetchable real-time authority yet, so they render "—" rather than
 * an invented number. Revenue is not shown here at all — no public revenue
 * authority exists, and platform revenue is not homepage-public data.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHomeLive } from "@/components/home/data/getHomeLive";

interface StatPulse {
  label: string;
  value: string;
  color: string;
  href?: string;
  live?: boolean;
}

interface TmiMonitorHUDProps {
  compact?: boolean;
  position?: "top" | "side" | "inline";
}

const UNAVAILABLE = "—";

const BASE_STATS: StatPulse[] = [
  { label: "LIVE ROOMS", value: UNAVAILABLE, color: "#FF2DAA", href: "/live", live: true },
  { label: "WATCHING NOW", value: UNAVAILABLE, color: "#00FFFF", href: "/live", live: true },
  { label: "BATTLES ACTIVE", value: UNAVAILABLE, color: "#FFD700", href: "/battles" },
  { label: "CYPHERS OPEN", value: UNAVAILABLE, color: "#AA2DFF", href: "/cypher" },
];

export default function TmiMonitorHUD({ compact = false, position = "inline" }: TmiMonitorHUDProps) {
  const [stats, setStats] = useState(BASE_STATS);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const envelope = await getHomeLive(50, 0);
        if (!isMounted) return;
        const rooms = envelope.data.rooms;
        const roomCount = envelope.source === "live" ? String(rooms.length) : UNAVAILABLE;
        const watching = envelope.source === "live"
          ? rooms.reduce((sum, r) => sum + (Number.isFinite(r.viewers) ? r.viewers : 0), 0).toLocaleString()
          : UNAVAILABLE;
        setStats((prev) =>
          prev.map((s) => {
            if (s.label === "LIVE ROOMS") return { ...s, value: roomCount };
            if (s.label === "WATCHING NOW") return { ...s, value: watching };
            return s;
          }),
        );
      } catch {
        // Leave stats at their honest "unavailable" default.
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {stats.slice(0, 4).map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {s.live && s.value !== UNAVAILABLE && <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, animation: "pulse 1.5s ease-in-out infinite" }} />}
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em" }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(0,0,0,0.6)",
      border: "1px solid rgba(0,255,255,0.15)",
      borderRadius: 10,
      padding: "12px 16px",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontSize: 8, color: "#00FFFF", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 10 }}>
        TMI LIVE MONITOR
      </div>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href ?? "#"} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "8px 10px",
              background: `${s.color}08`,
              border: `1px solid ${s.color}20`,
              borderRadius: 8,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                {s.live && s.value !== UNAVAILABLE && (
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}`, animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.12em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.value === UNAVAILABLE ? "rgba(255,255,255,0.25)" : s.color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
