"use client";

import type { FanHubMode, FanTransitionState } from "./FanTierSkinEngine";

type FanLiveMonitorProps = {
  mode: FanHubMode;
  transitionState: FanTransitionState;
  title: string;
};

const MODE_COPY: Record<FanHubMode, { title: string; subtitle: string; icon: string }> = {
  neutral: {
    title: "Neutral Command Feed",
    subtitle: "Preview of the next auditorium stream and fan operations.",
    icon: "📡",
  },
  "live-auditorium": {
    title: "Live Auditorium View",
    subtitle: "Stage camera, crowd lights, and performer stream routing.",
    icon: "🎭",
  },
  lobby: {
    title: "Lobby Pop-up View",
    subtitle: "Seat preview and invited friend lane before venue join.",
    icon: "🚪",
  },
  "earn-points": {
    title: "Watch & Earn Feed",
    subtitle: "Sponsor tasks, trivia queue, and points movement prompts.",
    icon: "💰",
  },
  shop: {
    title: "Cosmetics Showcase",
    subtitle: "Skin packs and props rotating in monitor preview.",
    icon: "🛍️",
  },
  trivia: {
    title: "Trivia + Voting Room",
    subtitle: "Vote windows and quiz cards appear on the feed rail.",
    icon: "🎯",
  },
  livestream: {
    title: "Livestream Control",
    subtitle: "Camera mode selector, latency meter, and stream quality.",
    icon: "📹",
  },
};

export default function FanLiveMonitor({ mode, transitionState, title }: FanLiveMonitorProps) {
  const modeCopy = MODE_COPY[mode];
  const isLive = transitionState === "FULLSCREEN_MODE" || transitionState === "SHOW_START" || transitionState === "SEATED";

  return (
    <section
      style={{
        borderRadius: 20,
        padding: "14px 14px 0",
        background: "linear-gradient(160deg, rgba(6,18,42,0.97), rgba(3,8,18,0.97))",
        border: "2px solid rgba(90,215,255,0.32)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,120,45,0.22), 0 20px 48px rgba(0,0,0,0.38), 0 0 40px rgba(90,215,255,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Monitor top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7ac4ef",
          marginBottom: 10,
        }}
      >
        <span style={{ fontWeight: 800 }}>{title}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isLive && (
            <span
              style={{
                display: "inline-flex",
                gap: 5,
                alignItems: "center",
                borderRadius: 999,
                border: "1px solid rgba(255,60,60,0.5)",
                background: "rgba(255,60,60,0.14)",
                color: "#ff6b6b",
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 900,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#ff4444",
                  boxShadow: "0 0 6px #ff4444",
                }}
              />
              LIVE
            </span>
          )}
          <span>{transitionState.split("_").join(" ")}</span>
        </div>
      </div>

      {/* CRT screen area */}
      <div
        style={{
          minHeight: 300,
          borderRadius: "14px 14px 0 0",
          border: "1px solid rgba(255,120,45,0.35)",
          borderBottom: "none",
          background:
            "radial-gradient(ellipse at 28% 18%, rgba(255,120,45,0.28), transparent 38%), radial-gradient(ellipse at 78% 22%, rgba(90,215,255,0.28), transparent 36%), linear-gradient(180deg, #020810 0%, #060e20 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* CRT scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
        {/* Vertical grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(90,215,255,0.04) 0, rgba(90,215,255,0.04) 1px, transparent 1px, transparent 18px)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        {/* CRT corner glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 68%, rgba(0,0,0,0.56) 100%)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Screen content */}
        <div style={{ position: "relative", zIndex: 5, padding: "14px 16px" }}>
          {/* Stage spotlight bars */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: "0 0 999px 999px",
                  background: `linear-gradient(180deg, rgba(255,${120 + i * 10},${30 + i * 8},0.22), transparent)`,
                  border: `1px solid rgba(255,${120 + i * 10},${30 + i * 8},0.18)`,
                  borderTop: "none",
                }}
              />
            ))}
          </div>

          {/* Stage floor line */}
          <div
            style={{
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(255,120,45,0.62), rgba(90,215,255,0.62), transparent)",
              marginBottom: 16,
              borderRadius: 1,
            }}
          />

          {/* Mode label */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{modeCopy.icon}</span>
            <div>
              <h3
                style={{
                  margin: "0 0 4px",
                  color: "#ffb56a",
                  fontSize: 18,
                  letterSpacing: "0.03em",
                  textShadow: "0 0 12px rgba(255,140,60,0.6)",
                }}
              >
                {modeCopy.title}
              </h3>
              <p style={{ margin: 0, color: "#bde7ff", fontSize: 12, lineHeight: 1.45 }}>
                {modeCopy.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Corner phosphor burn */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            background: "linear-gradient(180deg, rgba(90,215,255,0.06), transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      </div>

      {/* Monitor chin — bottom bezel */}
      <div
        style={{
          height: 22,
          background: "linear-gradient(180deg, rgba(8,22,48,0.9), rgba(4,10,22,0.95))",
          borderTop: "1px solid rgba(255,120,45,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === 2 ? "#ff7b2f" : "rgba(90,215,255,0.4)",
              boxShadow: i === 2 ? "0 0 5px #ff7b2f" : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}
