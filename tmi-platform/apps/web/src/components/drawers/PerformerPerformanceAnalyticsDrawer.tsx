"use client";

/**
 * PerformerPerformanceAnalyticsDrawer — 4-quadrant analytics command deck.
 * Every quadrant is honest-empty (Rule 20): no revenue backend, stream
 * telemetry, fan-demographics engine, engagement scoring, or platform-wide
 * traffic analytics exist anywhere in the codebase yet. This previously
 * hardcoded a fabricated "$1.84M" revenue figure and matching fake stream/
 * engagement/gifting numbers copied from an AI concept mockup — removed.
 * Keep the visual shell; wire real numbers in as each backend ships.
 */

import type { CSSProperties } from "react";
import UniversalDrawerBase from "./UniversalDrawerBase";

interface PerformerPerformanceAnalyticsDrawerProps {
  open: boolean;
  onClose: () => void;
  performerId?: string;
  displayName?: string;
}

export default function PerformerPerformanceAnalyticsDrawer({
  open,
  onClose,
  displayName,
}: PerformerPerformanceAnalyticsDrawerProps) {
  return (
    <UniversalDrawerBase
      open={open}
      animationId="command_lift"
      title="PERFORMER PERFORMANCE & REVENUE COMMAND DECK"
      subtitle={displayName ? `${displayName} · no live telemetry wired yet` : "No live telemetry wired yet"}
      onClose={onClose}
      accentColor="#00FFFF"
      mode="overlay"
      overlayHeight="min(92vh, 880px)"
    >
      <div
        style={{
          flex: 1,
          padding: 16,
          background: "rgba(3,2,12,0.95)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 14,
          overflowY: "auto",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* QUADRANT 1: PERFORMER PERFORMANCE & REVENUE */}
        <div style={quadCard("#00FFFF")}>
          <div style={quadHeader("#00FFFF")}>PERFORMER PERFORMANCE & REVENUE</div>
          <EmptyBody color="#00FFFF" text="No revenue or stream data recorded yet. This connects once the revenue and stream-telemetry engines are wired." />
        </div>

        {/* QUADRANT 2: PERFORMER ENGAGEMENT & AUDIENCE */}
        <div style={quadCard("#FF2DAA")}>
          <div style={quadHeader("#FF2DAA")}>PERFORMER ENGAGEMENT & AUDIENCE</div>
          <EmptyBody color="#FF2DAA" text="No audience growth or engagement data recorded yet." />
        </div>

        {/* QUADRANT 3: FAN ANALYTICS */}
        <div style={quadCard("#AA2DFF")}>
          <div style={quadHeader("#AA2DFF")}>FAN ANALYTICS</div>
          <EmptyBody color="#AA2DFF" text="No listening history or gifting data recorded yet." />
        </div>

        {/* QUADRANT 4: PLATFORM-WIDE STATS */}
        <div style={quadCard("#FFD700")}>
          <div style={quadHeader("#FFD700")}>PLATFORM-WIDE STATS</div>
          <EmptyBody color="#FFD700" text="Platform-wide traffic and growth analytics are not wired yet." />
        </div>
      </div>
    </UniversalDrawerBase>
  );
}

function EmptyBody({ color, text }: { color: string; text: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: 20,
      }}
    >
      <span style={{ fontSize: 22, opacity: 0.35 }}>📊</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 260 }}>{text}</span>
      <span style={{ fontSize: 20, fontWeight: 900, color: `${color}55` }}>—</span>
    </div>
  );
}

function quadCard(color: string): CSSProperties {
  return {
    background: "rgba(8,5,22,0.85)",
    border: `1px solid ${color}44`,
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    boxShadow: `0 0 20px ${color}15`,
  };
}

function quadHeader(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.14em",
    color,
    paddingBottom: 6,
    borderBottom: `1px solid ${color}22`,
  };
}
