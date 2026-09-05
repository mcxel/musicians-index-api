"use client";

/**
 * Booking demand heat map — real signals only; honest empty scaffold otherwise.
 */

import { useMemo, type CSSProperties } from "react";
import { listDemandHeatSignals } from "@/lib/discovery/performerDiscoveryQuery";

interface Props {
  accent?: string;
}

export default function BookingDemandHeatMap({ accent = "#FF6B35" }: Props) {
  const signals = useMemo(() => listDemandHeatSignals(), []);

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Booking Heat Map</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Demand by city / region</h2>
      </header>

      {signals.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>
          Demand signals appear as venues/promoters search and request bookings. No fabricated HIGH
          demand cities.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {signals.map((s) => (
            <div key={`${s.city}-${s.region}`} style={row(s.level, accent)}>
              <strong>
                {s.city}, {s.region}
              </strong>
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                {s.level.toUpperCase()} · {s.searchCount} searches · {s.requestCount} requests
              </span>
            </div>
          ))}
        </div>
      )}
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
function row(level: string, accent: string): CSSProperties {
  const color =
    level === "high" ? "#FF2DAA" : level === "medium" ? "#FFD700" : level === "low" ? accent : "#666";
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${color}44`,
    background: `${color}14`,
  };
}
