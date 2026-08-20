"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGovernedIdleFallbackPolicy } from "@/lib/adaptiveWorldRuntime/IdleFallbackGovernor";
import {
  getOpenMatchLiveSessions,
  openMatchRoomHref,
  pickPrimaryOpenMatchSession,
} from "@/lib/live/openMatchDiscovery";
import { onSessionsChanged } from "@/lib/broadcast/GlobalLiveSessionRegistry";

export interface IdleMonitorFallbackProps {
  monitorId: string | number;
  seedIndex?: number;
  /** 0-based cell index within an 8-split monitor; cells 2–7 show match recruitment UI. */
  cellIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FALLBACK_SCENES = [
  {
    id: "3d-brand",
    title: "TMI 3D BRAND ENVIRONMENT",
    subtitle: "Living OS Core Broadcast Stream",
    accent: "#FF2DAA",
    gradient: "linear-gradient(135deg, rgba(255,45,170,0.18), rgba(0,255,255,0.05))",
    icon: "🌐",
    tag: "LIVE ENVIRONMENT",
  },
  {
    id: "sponsor-promo",
    title: "TMI HOUSE & SPONSOR SPOTLIGHT",
    subtitle: "Official Brand & Merchandise Showcase",
    accent: "#FFD700",
    gradient: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,45,170,0.05))",
    icon: "🏆",
    tag: "SPONSOR DROP",
  },
  {
    id: "ambient-loop",
    title: "CINEMATIC AMBIENT MOTION",
    subtitle: "Universal Stage Audio & Visual Sync",
    accent: "#AA2DFF",
    gradient: "linear-gradient(135deg, rgba(170,45,255,0.18), rgba(0,255,255,0.05))",
    icon: "✨",
    tag: "STAGE AMBIENT",
  },
];

function isMatchRecruitmentCell(cellIndex?: number): boolean {
  return typeof cellIndex === "number" && cellIndex >= 2 && cellIndex <= 7;
}

function OpenMatchCell({
  monitorId,
  cellIndex,
  className,
  style,
}: IdleMonitorFallbackProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(() => getOpenMatchLiveSessions());

  useEffect(() => {
    const sync = () => setSessions(getOpenMatchLiveSessions());
    sync();
    return onSessionsChanged(sync);
  }, []);

  const primary = pickPrimaryOpenMatchSession(sessions);

  if (!primary) {
    return (
      <div
        data-idle-monitor-fallback={monitorId}
        data-open-match-cell={cellIndex}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 120,
          borderRadius: 8,
          background: "linear-gradient(135deg, rgba(0,255,255,0.08), rgba(5,5,16,0.95))",
          border: "1px solid rgba(0,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          padding: 12,
          boxSizing: "border-box",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          ...style,
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)" }}>
          CELL {typeof cellIndex === "number" ? cellIndex + 1 : "—"}
        </span>
        <span style={{ fontSize: 20, opacity: 0.35 }}>🎤</span>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
          No open battles or cyphers right now
        </div>
        <Link
          href="/live/lobby"
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#00FFFF",
            textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 6,
            padding: "6px 10px",
          }}
        >
          BROWSE LIVE LOBBY
        </Link>
      </div>
    );
  }

  const href = openMatchRoomHref(primary);

  return (
    <div
      data-idle-monitor-fallback={monitorId}
      data-open-match-cell={cellIndex}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 120,
        borderRadius: 8,
        background: "linear-gradient(135deg, rgba(0,255,255,0.18), rgba(170,45,255,0.05))",
        border: "1px solid rgba(0,255,255,0.4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 12,
        boxSizing: "border-box",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "#00FFFF",
            background: "rgba(0,255,255,0.12)",
            border: "1px solid rgba(0,255,255,0.35)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          OPEN MATCH
        </span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{primary.category.toUpperCase()}</span>
      </div>
      <div style={{ textAlign: "center", margin: "8px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em" }}>{primary.displayName}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{primary.title}</div>
        {primary.viewerCount > 0 ? (
          <div style={{ fontSize: 8, color: "#00FF88", marginTop: 6, fontWeight: 800 }}>
            {primary.viewerCount} watching
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => router.push(href)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #00FFFF",
          background: "rgba(0,255,255,0.15)",
          color: "#00FFFF",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.14em",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        OPEN MATCH →
      </button>
    </div>
  );
}

export default function IdleMonitorFallbackRuntime({
  monitorId,
  seedIndex = 0,
  cellIndex,
  className = "",
  style = {},
}: IdleMonitorFallbackProps) {
  if (isMatchRecruitmentCell(cellIndex)) {
    return (
      <OpenMatchCell
        monitorId={monitorId}
        cellIndex={cellIndex}
        className={className}
        style={style}
      />
    );
  }

  const initialIdx = typeof seedIndex === "number" ? Math.abs(seedIndex) % FALLBACK_SCENES.length : 0;
  const [sceneIdx, setSceneIdx] = useState(initialIdx);

  useEffect(() => {
    const tick = () => {
      setSceneIdx((prev) => (prev + 1) % FALLBACK_SCENES.length);
    };
    const schedule = () => {
      const ms = getGovernedIdleFallbackPolicy().rotationIntervalMs;
      return window.setInterval(tick, ms);
    };
    let timer = schedule();
    const resync = window.setInterval(() => {
      window.clearInterval(timer);
      timer = schedule();
    }, 12000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(resync);
    };
  }, []);

  const scene = FALLBACK_SCENES[sceneIdx] ?? FALLBACK_SCENES[0]!;

  return (
    <div
      data-idle-monitor-fallback={monitorId}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 180,
        borderRadius: 8,
        background: scene.gradient,
        border: `1px solid ${scene.accent}44`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
        boxSizing: "border-box",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: scene.accent,
            background: `${scene.accent}20`,
            border: `1px solid ${scene.accent}40`,
            padding: "2px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
          }}
        >
          {scene.tag}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
          MONITOR {monitorId}
        </span>
      </div>

      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{scene.icon}</div>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#fff",
            margin: "0 0 4px",
            textTransform: "uppercase",
          }}
        >
          {scene.title}
        </h3>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: 0 }}>{scene.subtitle}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: scene.accent,
              boxShadow: `0 0 8px ${scene.accent}`,
            }}
          />
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
            STANDBY
          </span>
        </div>
        <span style={{ fontSize: 8, color: scene.accent, fontWeight: 800 }}>NO LIVE SLOT</span>
      </div>
    </div>
  );
}
