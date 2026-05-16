"use client";

import type { ArtistShowState } from "./ArtistCurtainShell";

type ArtistStageMonitorProps = {
  showState: ArtistShowState;
  artistName: string;
  currentTrack: string;
  audienceCount: number;
};

const STATE_FEED: Record<
  ArtistShowState,
  { headline: string; sub: string; scanColor: string; icon: string }
> = {
  closed: {
    headline: "Stage Offline",
    sub: "Configure your show, setlist, and sponsor placements before opening.",
    scanColor: "#444",
    icon: "🎪",
  },
  "pre-show": {
    headline: "Pre-Show Preparation",
    sub: "Audience holding. Sponsor loop active. Curtain sequence ready.",
    scanColor: "#FFD700",
    icon: "🎭",
  },
  opening: {
    headline: "Curtain Rising",
    sub: "Stage reveal in progress. Camera routing to performer position.",
    scanColor: "#FF9200",
    icon: "🎬",
  },
  live: {
    headline: "YOU ARE LIVE",
    sub: "Stage feed active. Reactions open. Tipping enabled. Audience seated.",
    scanColor: "#00FF88",
    icon: "🔴",
  },
  intermission: {
    headline: "Intermission",
    sub: "15-minute break. Sponsor loop active. Fan points accruing for watchers.",
    scanColor: "#00FFFF",
    icon: "⏸️",
  },
  closing: {
    headline: "Closing Sequence",
    sub: "Outro underway. Thank-you messages queued. NFT drop window open.",
    scanColor: "#FF2DAA",
    icon: "🎤",
  },
};

export default function ArtistStageMonitor({
  showState,
  artistName,
  currentTrack,
  audienceCount,
}: ArtistStageMonitorProps) {
  const feed = STATE_FEED[showState];
  const isLive = showState === "live";

  return (
    <section
      style={{
        borderRadius: 20,
        border: "2px solid rgba(0,255,255,0.28)",
        background: "linear-gradient(160deg, rgba(5,16,38,0.98), rgba(2,8,18,0.98))",
        boxShadow: "inset 0 0 0 1px rgba(255,45,170,0.16), 0 20px 50px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      {/* Monitor top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(0,255,255,0.16)",
          background: "rgba(0,255,255,0.04)",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5ad7ff", fontWeight: 800 }}>
          Stage Monitor · {artistName}
        </div>
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
                fontSize: 9,
                fontWeight: 900,
                padding: "2px 8px",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 5px #ff4444" }} />
              LIVE
            </span>
          )}
          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a8faa" }}>
            {audienceCount.toLocaleString()} IN HOUSE
          </span>
        </div>
      </div>

      {/* CRT screen */}
      <div
        style={{
          position: "relative",
          minHeight: 280,
          background: `radial-gradient(ellipse at 30% 20%, ${feed.scanColor}1c, transparent 40%), radial-gradient(ellipse at 75% 70%, rgba(255,45,170,0.12), transparent 38%), linear-gradient(180deg, #020a18 0%, #050f22 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 4px)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        {/* Vertical grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(90deg, rgba(0,255,255,0.03) 0, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 20px)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* CRT vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />

        {/* Stage spotlight bars */}
        <div style={{ display: "flex", gap: 3, padding: "0 12px", paddingTop: 12, position: "relative", zIndex: 5 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 70,
                borderRadius: "0 0 999px 999px",
                background: `linear-gradient(180deg, ${feed.scanColor}${isLive ? "28" : "0e"}, transparent)`,
                border: `1px solid ${feed.scanColor}${isLive ? "20" : "0a"}`,
                borderTop: "none",
              }}
            />
          ))}
        </div>

        {/* Stage floor bar */}
        <div
          style={{
            margin: "0 12px 16px",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${feed.scanColor}80, rgba(255,45,170,0.6), transparent)`,
            borderRadius: 1,
            position: "relative",
            zIndex: 5,
          }}
        />

        {/* Content */}
        <div style={{ padding: "0 16px 16px", position: "relative", zIndex: 5 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{feed.icon}</span>
            <div>
              <h3
                style={{
                  margin: "0 0 5px",
                  fontSize: 20,
                  fontWeight: 900,
                  color: feed.scanColor,
                  textShadow: `0 0 14px ${feed.scanColor}70`,
                  letterSpacing: "0.02em",
                }}
              >
                {feed.headline}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#b0d8f0", lineHeight: 1.5 }}>
                {feed.sub}
              </p>
            </div>
          </div>

          {/* Current track strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.2)",
              background: "rgba(0,255,255,0.06)",
              padding: "8px 12px",
            }}
          >
            <span style={{ fontSize: 16 }}>{isLive ? "▶️" : "⏹️"}</span>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4abedc", fontWeight: 800, marginBottom: 2 }}>
                {isLive ? "On Stage" : "Queued"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#d9f4ff" }}>{currentTrack}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitor chin bezel */}
      <div
        style={{
          height: 24,
          background: "rgba(3,10,22,0.95)",
          borderTop: "1px solid rgba(0,255,255,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === 3 ? "#00FFFF" : i === 1 ? "#FF2DAA" : "rgba(255,255,255,0.16)",
              boxShadow: i === 3 ? "0 0 5px #00FFFF" : i === 1 ? "0 0 5px #FF2DAA" : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}
