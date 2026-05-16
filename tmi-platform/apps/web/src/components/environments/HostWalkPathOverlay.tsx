"use client";

import type { HostPlacement, WalkPathPoint } from "@/lib/environments/HostPlacementEngine";

type HostWalkPathOverlayProps = {
  hosts: HostPlacement[];
  accentColor: string;
};

function HostDot({ host, accentColor }: { host: HostPlacement; accentColor: string }) {
  const first: WalkPathPoint = host.walkPath[0] ?? { x: host.startX, y: host.startY, durationMs: 0 };

  return (
    <div
      title={`${host.label} (${host.role})`}
      style={{
        position: "absolute",
        left: `${host.startX * 100}%`,
        top: `${host.startY * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}CC 0%, ${accentColor}44 80%)`,
        border: `2px solid ${accentColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        color: "#fff",
        fontWeight: 800,
        zIndex: 8,
        cursor: "default",
        boxShadow: `0 0 10px ${accentColor}66`,
      }}
    >
      {host.hasCaneMechanic ? "🎩" : host.role === "judge" ? "⚖" : "🎤"}
    </div>
  );
}

function WalkPathLine({ path, accentColor }: { path: WalkPathPoint[]; accentColor: string }) {
  if (path.length < 2) return null;
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 7 }}
    >
      {path.slice(0, -1).map((pt, i) => {
        const next = path[i + 1];
        if (!next) return null;
        return (
          <line
            key={i}
            x1={`${pt.x * 100}%`}
            y1={`${pt.y * 100}%`}
            x2={`${next.x * 100}%`}
            y2={`${next.y * 100}%`}
            stroke={accentColor}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            strokeOpacity={0.35}
          />
        );
      })}
    </svg>
  );
}

export function HostWalkPathOverlay({ hosts, accentColor }: HostWalkPathOverlayProps) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 7 }}
    >
      {hosts.map((host) => (
        <div key={host.hostId}>
          <WalkPathLine path={host.walkPath} accentColor={accentColor} />
          <HostDot host={host} accentColor={accentColor} />
        </div>
      ))}
    </div>
  );
}
