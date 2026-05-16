"use client";

// Canon source: Venue Skins Plus Seating/ + img00040.jpg (Fan Dashboard cinema view)
// Crowd layout: avatar pods arranged by layout type
// Layouts: theater (row grid) | standing (scattered) | arena (tiered arcs) | intimate (loose cluster) | broadcast (bleacher rows)

import React from "react";
import type { VenueSkin } from "@/components/venue/VenueShell";

type CrowdLayout = "standing" | "theater" | "arena" | "intimate" | "broadcast";

interface CrowdPod {
  id: string;
  avatar?: string;
  isActive?: boolean;
  isTipping?: boolean;
  username?: string;
}

interface VenueCrowdPodsProps {
  skin?: VenueSkin;
  layout?: CrowdLayout;
  pods?: CrowdPod[];
  /** Max pods to render — default 32 */
  maxPods?: number;
  style?: React.CSSProperties;
}

const SKIN_POD_COLOR: Record<VenueSkin, string> = {
  "neon-club":    "#AA2DFF",
  "space-lounge": "#00FFFF",
  "auditorium":   "#FFD700",
  "outdoor":      "#00FF88",
  "game-show":    "#FF2DAA",
  "dark-space":   "#00FFFF",
};

const AVATARS = ["🎵","🎤","🎧","⭐","🔥","💜","🎶","🥁","🎸","🎹","🎺","🎻"];

function generatePods(count: number): CrowdPod[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `pod-${i}`,
    avatar: AVATARS[i % AVATARS.length],
    isActive: Math.random() > 0.3,
    isTipping: Math.random() > 0.85,
  }));
}

const DEFAULT_PODS = generatePods(40);

// ─── Layout renderers ─────────────────────────────────────────────────────────

function TheaterRows({ pods, accent }: { pods: CrowdPod[]; accent: string }) {
  const rows = [pods.slice(0, 8), pods.slice(8, 16), pods.slice(16, 24), pods.slice(24, 32)];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 4 }}>
          {row.map((pod) => <Pod key={pod.id} pod={pod} accent={accent} size={28 - ri * 2} />)}
        </div>
      ))}
    </div>
  );
}

function StandingCluster({ pods, accent }: { pods: CrowdPod[]; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "center",
        padding: "0 10%",
      }}
    >
      {pods.slice(0, 32).map((pod) => (
        <Pod key={pod.id} pod={pod} accent={accent} size={26} />
      ))}
    </div>
  );
}

function ArenaArcs({ pods, accent }: { pods: CrowdPod[]; accent: string }) {
  const arcs = [pods.slice(0, 6), pods.slice(6, 14), pods.slice(14, 22), pods.slice(22, 32)];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      {arcs.map((arc, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 4,
            transform: `scaleX(${1 - i * 0.08})`,
          }}
        >
          {arc.map((pod) => <Pod key={pod.id} pod={pod} accent={accent} size={30 - i * 3} />)}
        </div>
      ))}
    </div>
  );
}

function BroadcastBleachers({ pods, accent }: { pods: CrowdPod[]; accent: string }) {
  const rows = [pods.slice(0, 10), pods.slice(10, 20), pods.slice(20, 30)];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 3 }}>
          {row.map((pod) => <Pod key={pod.id} pod={pod} accent={accent} size={24} />)}
        </div>
      ))}
    </div>
  );
}

// ─── Pod ──────────────────────────────────────────────────────────────────────

function Pod({ pod, accent, size }: { pod: CrowdPod; accent: string; size: number }) {
  return (
    <div
      title={pod.username}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: pod.isActive ? `${accent}18` : "rgba(255,255,255,0.04)",
        border: `1px solid ${pod.isActive ? `${accent}50` : "rgba(255,255,255,0.08)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        boxShadow: pod.isTipping ? `0 0 6px ${accent}80` : "none",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {pod.avatar}
      {pod.isTipping && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -4,
            fontSize: 8,
            filter: "drop-shadow(0 0 3px #FFD700)",
          }}
        >
          💰
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VenueCrowdPods({
  skin = "dark-space",
  layout = "standing",
  pods = DEFAULT_PODS,
  maxPods = 32,
  style,
}: VenueCrowdPodsProps) {
  const accent = SKIN_POD_COLOR[skin];
  const visiblePods = pods.slice(0, maxPods);

  return (
    <div
      data-venue-crowd
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
    >
      {layout === "theater"   && <TheaterRows pods={visiblePods} accent={accent} />}
      {layout === "standing"  && <StandingCluster pods={visiblePods} accent={accent} />}
      {layout === "arena"     && <ArenaArcs pods={visiblePods} accent={accent} />}
      {layout === "intimate"  && <StandingCluster pods={visiblePods} accent={accent} />}
      {layout === "broadcast" && <BroadcastBleachers pods={visiblePods} accent={accent} />}
    </div>
  );
}
