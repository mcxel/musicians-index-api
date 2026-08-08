"use client";

/**
 * AwrRenderHealthPanel — Observatory RENDER HEALTH (RuntimeTelemetry only, Rule 20).
 */

import { useEffect, useState } from "react";
import {
  getRenderHealthSnapshot,
  LIVE_LOBBY_WALL_CONTRACT_ID,
  type RenderHealthSnapshot,
} from "@/lib/adaptiveWorldRuntime";

function SectionLabel({ children, accent }: { children: string; accent: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.18em",
        color: accent,
        fontWeight: 900,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function formatFps(fps: number | null): string {
  if (fps == null) return "—";
  return `${fps}`;
}

function formatMs(ms: number | null): string {
  if (ms == null) return "—";
  return `${ms.toFixed(1)} ms`;
}

export default function AwrRenderHealthPanel() {
  const [health, setHealth] = useState<RenderHealthSnapshot>(() =>
    getRenderHealthSnapshot(LIVE_LOBBY_WALL_CONTRACT_ID),
  );

  useEffect(() => {
    const refresh = () => {
      setHealth(getRenderHealthSnapshot(LIVE_LOBBY_WALL_CONTRACT_ID));
    };
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => window.clearInterval(id);
  }, []);

  const collecting = health.telemetryState === "collecting";
  const idle = health.telemetryState === "idle";
  const ready = health.telemetryState === "ready";

  return (
    <section
      data-awr-render-health
      style={{
        borderRadius: 10,
        border: "1px solid rgba(170,45,255,0.35)",
        background: "rgba(170,45,255,0.06)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <SectionLabel accent="#AA2DFF">Render Health · AWR</SectionLabel>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: idle ? "rgba(255,255,255,0.4)" : collecting ? "#FFD700" : "#00FF88",
          }}
        >
          {idle ? "NO CONSUMER" : collecting ? "COLLECTING" : "READY"}
        </span>
      </div>

      {idle && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          No LIVE_LOBBY_WALL consumer mounted. Open a lobby wall surface to start frame sampling.
        </div>
      )}

      {!idle && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
          <div>
            Est. FPS:{" "}
            <strong style={{ color: ready ? "#AA2DFF" : "rgba(255,255,255,0.45)" }}>
              {collecting ? "…" : formatFps(health.estimatedFps)}
            </strong>
          </div>
          <div>
            Frame avg:{" "}
            <strong style={{ color: ready ? "#AA2DFF" : "rgba(255,255,255,0.45)" }}>
              {collecting ? "…" : formatMs(health.averageFrameMs)}
            </strong>
          </div>
          <div>
            Presentation: <strong>{health.presentationTier}</strong>
          </div>
          <div>
            Device: <strong>{health.deviceTier}</strong>
          </div>
        </div>
      )}

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", marginTop: 8, lineHeight: 1.45 }}>
        {health.notes}
        {collecting ? " (≥8 rAF samples required before FPS is shown.)" : null}
      </div>
    </section>
  );
}
