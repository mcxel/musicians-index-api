"use client";

import { usePerformanceQueue } from "./PerformanceQueue";

export function LiveStatusBadge({ roomSlug }: { roomSlug: string }) {
  const { status, memberCount } = usePerformanceQueue(roomSlug);
  if (status !== "ACTIVE") return null;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
      color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)",
      borderRadius: 4, padding: "3px 10px",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
      LIVE{memberCount > 0 ? ` · ${memberCount} watching` : ""}
    </span>
  );
}
