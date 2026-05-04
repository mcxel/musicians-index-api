"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveMonitorSlots,
  type LobbyMonitorSlot,
} from "@/lib/lobby/LobbyFeedBus";

const SOURCE_ACCENT: Record<LobbyMonitorSlot["source"], string> = {
  room:      "#00FFFF",
  stage:     "#9B2DFF",
  battle:    "#FF6600",
  cypher:    "#FF2DAA",
  performer: "#00CC44",
  sponsor:   "#FFD700",
};

type LobbyStageViewportProps = {
  roomName: string;
  countdownSeconds: number;
  activeUsers: number;
  vipUsers: number;
  queueDepth: number;
  occupancyPercent: number;
};

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function LobbyStageViewport({
  roomName,
  countdownSeconds,
  activeUsers,
  vipUsers,
  queueDepth,
  occupancyPercent,
}: LobbyStageViewportProps) {
  // B2: Subscribe to LobbyFeedBus — stage monitors mirror live bus state
  const [feed, setFeed] = useState(() => getLobbyFeedSnapshot());
  useEffect(() => subscribeLobbyFeed(setFeed), []);

  // Derive monitor panels from live feed — real routes, no static labels
  const feedPanels = useMemo(() => deriveMonitorSlots(feed), [feed]);

  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid #6f4aa5",
        background: "linear-gradient(160deg, #1a1030 0%, #0e081a 100%)",
        padding: 16,
      }}
    >
      <style>{`
        @keyframes stageGlow {
          0%, 100% { box-shadow: 0 0 14px rgba(145, 98, 206, 0.25); }
          50% { box-shadow: 0 0 24px rgba(145, 98, 206, 0.45); }
        }
      `}</style>
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" }}>
        Lobby Stage
      </div>
      <h2 style={{ margin: "6px 0 12px", color: "#f3e9ff", fontSize: 24 }}>{roomName}</h2>

      <div
        style={{
          borderRadius: 14,
          border: "1px solid #8b62c7",
          minHeight: 210,
          background:
            "radial-gradient(circle at 50% 30%, rgba(140, 95, 191, 0.45), rgba(20, 12, 35, 0.9) 58%), linear-gradient(180deg, #170d2b, #0a0712)",
          display: "grid",
          placeItems: "center",
          animation: "stageGlow 3.2s ease-in-out infinite",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ color: "#f8eeff", fontSize: 28, fontWeight: 800, letterSpacing: 1.2 }}>MAIN SCREEN</div>
          <div style={{ color: "#d5c3ee", fontSize: 12, marginTop: 6 }}>Live camera + host feed viewport</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            width: 158,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(5,7,12,0.78)",
            padding: 10,
            boxShadow: "0 18px 36px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ color: "#b8e4ff", fontSize: 9, fontWeight: 900, letterSpacing: 1.1, textTransform: "uppercase" }}>Pinned Video Feed</div>
          <div style={{ marginTop: 8, borderRadius: 12, border: "1px solid rgba(125,211,252,0.25)", background: "linear-gradient(180deg, rgba(125,211,252,0.22), rgba(6,12,18,0.92))", minHeight: 96, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 10 }}>
            <div>
              <div style={{ color: "#f8eeff", fontSize: 12, fontWeight: 800 }}>HOST PANEL</div>
              <div style={{ color: "#cfe7ff", fontSize: 10, marginTop: 3 }}>Pinned while speaking</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 10px rgba(52,211,153,0.9)" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
        {feedPanels.map((panel) => {
          const isLive = panel.status === "LIVE";
          const accent = SOURCE_ACCENT[panel.source];
          return (
            <Link key={panel.id} href={panel.route} style={{ textDecoration: "none" }}>
              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${isLive ? accent + "55" : accent + "22"}`,
                  background: "linear-gradient(180deg, rgba(20,15,34,0.96), rgba(9,8,16,0.98))",
                  minHeight: 112, padding: 10, position: "relative", overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute", inset: 0,
                    background: isLive ? `radial-gradient(circle at top right, ${accent}18, transparent 42%)` : "none",
                  }}
                />
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#f3e9ff" }}>{panel.label}</div>
                  <div
                    style={{
                      fontSize: 8, fontWeight: 900, letterSpacing: "0.1em",
                      color: isLive ? accent : "#c4b5fd",
                      textTransform: "uppercase",
                    }}
                  >
                    {panel.status}
                  </div>
                </div>
                <div style={{ position: "relative", marginTop: 8 }}>
                  <div
                    style={{
                      fontSize: 10, fontWeight: 700, marginBottom: 3,
                      color: isLive ? accent : "rgba(255,255,255,0.55)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {panel.title}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.32)", lineHeight: 1.3 }}>
                    {panel.subtitle}
                  </div>
                </div>
                {panel.heat > 0 && (
                  <div style={{ position: "relative", marginTop: 10 }}>
                    <div style={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.08)" }}>
                      <div
                        style={{
                          height: "100%", width: `${Math.min(100, panel.heat)}%`,
                          background: accent, borderRadius: 1, transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(110px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ borderRadius: 10, border: "1px solid #61458e", background: "#130b20", padding: 10 }}>
          <div style={{ color: "#9984bc", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Countdown</div>
          <div style={{ color: "#ffdf9f", fontWeight: 800, marginTop: 3 }}>{formatCountdown(countdownSeconds)}</div>
        </div>
        <div style={{ borderRadius: 10, border: "1px solid #61458e", background: "#130b20", padding: 10 }}>
          <div style={{ color: "#9984bc", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Audience</div>
          <div style={{ color: "#c7f7ff", fontWeight: 800, marginTop: 3 }}>{activeUsers}</div>
        </div>
        <div style={{ borderRadius: 10, border: "1px solid #61458e", background: "#130b20", padding: 10 }}>
          <div style={{ color: "#9984bc", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>VIP Seats</div>
          <div style={{ color: "#ffd79c", fontWeight: 800, marginTop: 3 }}>{vipUsers}</div>
        </div>
        <div style={{ borderRadius: 10, border: "1px solid #61458e", background: "#130b20", padding: 10 }}>
          <div style={{ color: "#9984bc", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Room Stats</div>
          <div style={{ color: "#d0f2cc", fontWeight: 800, marginTop: 3 }}>
            Q {queueDepth} | O {occupancyPercent}%
          </div>
        </div>
      </div>
    </section>
  );
}
