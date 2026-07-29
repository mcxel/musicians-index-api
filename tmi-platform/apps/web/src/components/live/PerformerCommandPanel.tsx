"use client";

/**
 * PerformerCommandPanel — floating upper-right control panel on Instant Go Live stage.
 * FREE tier basics only this pass: welcome, wave, real audience count, camera angle stubs
 * wired to BroadcastDirectorEngine when present. Gold/Diamond = registry metadata only.
 */

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getNextBroadcastShot,
  type CameraShotType,
} from "@/lib/live/BroadcastDirectorEngine";
import type { VenuePresenceMetrics } from "@/lib/venues/venuePresenceMetrics";

export type CommandTab = "audience" | "host" | "stage" | "camera" | "chat" | "events";

interface PerformerCommandPanelProps {
  roomId: string;
  /** Real human presence count — never bots-as-watching */
  audienceCount: number;
  /** Full honesty metrics when Instant Go Live + Venue Support Presence is active */
  metrics?: VenuePresenceMetrics;
  environmentVerified?: boolean;
  soundCheckComplete?: boolean;
  hostMode?: boolean;
  onHostModeChange?: (on: boolean) => void;
  onWelcome?: () => void;
  onWave?: () => void;
  accentColor?: string;
}

const TABS: { id: CommandTab; label: string }[] = [
  { id: "audience", label: "Audience" },
  { id: "host", label: "Host" },
  { id: "stage", label: "Stage" },
  { id: "camera", label: "Camera" },
  { id: "chat", label: "Chat" },
  { id: "events", label: "Events" },
];

const CAMERA_ANGLES: { id: CameraShotType; label: string }[] = [
  { id: "StageView", label: "Stage" },
  { id: "AudienceView", label: "Audience" },
  { id: "CrowdView", label: "Crowd" },
  { id: "OverheadView", label: "Overhead" },
  { id: "VIPView", label: "VIP" },
];

export default function PerformerCommandPanel({
  roomId,
  audienceCount,
  metrics,
  environmentVerified = false,
  soundCheckComplete = false,
  hostMode: hostModeProp,
  onHostModeChange,
  onWelcome,
  onWave,
  accentColor = "#FF2DAA",
}: PerformerCommandPanelProps) {
  const [minimized, setMinimized] = useState(false);
  const [tab, setTab] = useState<CommandTab>("audience");
  const [hostModeLocal, setHostModeLocal] = useState(true);
  const [activeShot, setActiveShot] = useState<CameraShotType>("StageView");
  const [lastCaption, setLastCaption] = useState("MAIN STAGE");

  const hostMode = hostModeProp ?? hostModeLocal;

  const setHostMode = useCallback(
    (on: boolean) => {
      setHostModeLocal(on);
      onHostModeChange?.(on);
    },
    [onHostModeChange],
  );

  const applyCameraAngle = useCallback(
    (shotType: CameraShotType) => {
      setActiveShot(shotType);
      // Wire to existing BroadcastDirector — pick featured from real room when available
      const shot = getNextBroadcastShot(roomId, {
        roomType: "PERFORMER_LIVE",
        audienceCount,
      });
      // Prefer requested angle caption from engine map via re-roll if mismatch
      setLastCaption(shot.shotType === shotType ? shot.caption : shotType.replace(/View$/, "").toUpperCase());
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:broadcast-camera", {
            detail: { roomId, shotType, caption: lastCaption },
          }),
        );
      }
    },
    [roomId, audienceCount, lastCaption],
  );

  useEffect(() => {
    // Keep caption in sync when angle changes without depending on stale lastCaption in event
  }, []);

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        title="Expand Command Panel"
        style={{
          position: "fixed",
          top: 72,
          right: 16,
          zIndex: 9200,
          padding: "8px 12px",
          borderRadius: 12,
          border: `1px solid ${accentColor}88`,
          background: "rgba(8,6,20,0.92)",
          color: accentColor,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.1em",
          cursor: "pointer",
          boxShadow: `0 0 16px ${accentColor}33`,
        }}
      >
        ⌃ COMMAND
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "fixed",
        top: 72,
        right: 16,
        width: 280,
        zIndex: 9200,
        pointerEvents: "auto",
        background: "rgba(8,6,20,0.94)",
        backdropFilter: "blur(18px)",
        border: `1px solid ${accentColor}55`,
        borderRadius: 14,
        boxShadow: `0 12px 36px rgba(0,0,0,0.65), 0 0 20px ${accentColor}22`,
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: accentColor }}>
          COMMAND
        </span>
        <span style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800 }}>
          {audienceCount} watching
        </span>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          style={{
            marginLeft: "auto",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: 6,
            width: 24,
            height: 24,
            cursor: "pointer",
            fontSize: 10,
          }}
        >
          —
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "8px 8px 0",
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flexShrink: 0,
              padding: "5px 8px",
              borderRadius: 7,
              border: tab === t.id ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
              background: tab === t.id ? `${accentColor}22` : "transparent",
              color: tab === t.id ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 12, minHeight: 120 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {tab === "audience" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    color: "#00FF88",
                  }}
                >
                  VENUE READY
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                  <div>
                    🎭 Environment {environmentVerified || metrics ? "Verified" : "Checking…"}
                  </div>
                  <div>
                    🤖 Sound Check {soundCheckComplete || metrics ? "Complete" : "Pending…"}
                  </div>
                  <div>
                    🛠 {metrics?.supportAgents ?? 0} Support Crew Active
                  </div>
                  <div style={{ color: "#00FFFF", fontWeight: 800 }}>
                    👤 {metrics?.humanViewers ?? audienceCount} Human Attendee(s)
                  </div>
                  <div>
                    💺 {metrics?.occupiedPositions ?? audienceCount} Occupied Positions
                  </div>
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                  Support bots are platform ops — never counted as watching / votes / rankings.
                </div>
                {(metrics?.humanViewers ?? audienceCount) === 0 && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    Venue Open · Waiting for audience…
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => onWelcome?.()} style={actionBtn(accentColor)}>
                    👋 Welcome
                  </button>
                  <button type="button" onClick={() => onWave?.()} style={actionBtn(accentColor)}>
                    🌊 Wave
                  </button>
                </div>
              </div>
            )}

            {tab === "host" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hostMode}
                    onChange={(e) => setHostMode(e.target.checked)}
                  />
                  Host Mode — arrival toasts
                </label>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                  Corner music-video-style toasts when real fans enter. No fabricated arrivals.
                </div>
              </div>
            )}

            {tab === "stage" && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
                Ambient stage lights stay on with empty seats. Progressive seat fill follows real
                joins only — full walk-path 3D is Phase 5B IDLE.
              </div>
            )}

            {tab === "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  Angle stubs → BroadcastDirector · {lastCaption}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {CAMERA_ANGLES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyCameraAngle(a.id)}
                      style={{
                        ...actionBtn(accentColor),
                        border:
                          activeShot === a.id
                            ? `1px solid ${accentColor}`
                            : "1px solid rgba(255,255,255,0.12)",
                        background:
                          activeShot === a.id ? `${accentColor}28` : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,215,0,0.55)" }}>
                  Gold/Diamond AI director — FUTURE (metadata only)
                </div>
              </div>
            )}

            {tab === "chat" && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Use room chat / Messaging canister. FREE panel keeps welcome + wave shortcuts on
                Audience tab.
              </div>
            )}

            {tab === "events" && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
                Mini Event Creator (Gold) stays on performer dashboard. This pass: FREE basics only —
                full entitlement filter FUTURE.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function actionBtn(accent: string): CSSProperties {
  return {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${accent}55`,
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
  };
}
