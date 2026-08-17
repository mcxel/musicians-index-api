"use client";

/**
 * TMI Interactive Lounge HUD — Sibling Social World HUD.
 *
 * User-facing Name: TMI Interactive Lounge HUD
 * Technical Engine: TMI Lounge HUD Runtime
 *
 * Laws:
 *   1. Sibling to Venue HUD; dedicated strictly to social world interaction.
 *   2. Reuses shared primitives (HudCommandBus, HudRecallControl).
 *   3. Proximity engine injects context-sensitive pills (Sit, Talk, Dance, Play, Order).
 *   4. Clean Stage state preserves permanent HUD Recall Control ([ ◰ SHOW HUD ]) in top-right.
 */

import { useEffect, useState, type CSSProperties } from "react";
import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";
import {
  resolveLoungeProximityActions,
  type LoungeMode,
  type ProximityTarget,
} from "@/lib/venue-hud/TMILoungeHudRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface TMIInteractiveLoungeHudProps {
  loungeId: string;
  loungeTitle: string;
  loungeMode?: LoungeMode;
  userRole?: "fan" | "performer" | "admin";
}

export default function TMIInteractiveLoungeHud({
  loungeId,
  loungeTitle,
  loungeMode = "CHILL_LOUNGE",
  userRole = "fan",
}: TMIInteractiveLoungeHudProps) {
  const [hudVisible, setHudVisible] = useState(true);
  const [isSeated, setIsSeated] = useState(false);
  const [isPrivateTalking, setIsPrivateTalking] = useState(false);
  const [activeDance, setActiveDance] = useState<string | null>(null);
  const [showChevron, setShowChevron] = useState(false);
  const [proximityTarget, setProximityTarget] = useState<ProximityTarget | null>({
    id: "seat-vip-1",
    type: "SEAT",
    label: "VIP Couch 01",
    distanceMeters: 1.2,
    availableActions: ["LOUNGE_SIT"],
  });
  const [statusLine, setStatusLine] = useState<string | null>(null);

  // Register command handlers
  useEffect(() => {
    const unsubs = [
      HudCommandBus.register("LOUNGE_SIT", () => {
        setIsSeated((s) => {
          const next = !s;
          setStatusLine(next ? "Seated on VIP Couch 01" : "Stood up");
          return next;
        });
        return true;
      }),

      HudCommandBus.register("LOUNGE_DANCE", () => {
        setActiveDance((d) => {
          const next = d ? null : "Spin Dance";
          setStatusLine(next ? "Dancing: Spin Dance" : "Stopped dancing");
          return next;
        });
        return true;
      }),

      HudCommandBus.register("LOUNGE_PRIVATE_TALK", () => {
        setIsPrivateTalking((p) => {
          const next = !p;
          setStatusLine(next ? "Private talk session active" : "Ended private talk");
          return next;
        });
        return true;
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const proximityActions = proximityTarget ? resolveLoungeProximityActions(proximityTarget) : [];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        overflow: "hidden",
        isolation: "isolate",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* PERMANENT HUD RECALL CONTROL IN TOP-RIGHT EDGE */}
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120 }}>
        <button
          type="button"
          onClick={() => setHudVisible((v) => !v)}
          title={hudVisible ? "Hide Lounge HUD" : "Show Lounge HUD"}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${hudVisible ? CYAN : GOLD}`,
            background: "rgba(6,6,20,0.85)",
            color: hudVisible ? CYAN : GOLD,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            boxShadow: `0 0 12px ${hudVisible ? CYAN : GOLD}44`,
          }}
        >
          {hudVisible ? "◱ HIDE HUD" : "◰ SHOW HUD"}
        </button>
      </div>

      {hudVisible && (
        <>
          {/* TOP STATUS RAIL */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 120,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${GOLD}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: GOLD, letterSpacing: "0.12em" }}>
                LOUNGE: {loungeMode}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{loungeTitle}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isSeated ? <span style={{ fontSize: 9, color: GREEN, fontWeight: 800 }}>🪑 SEATED</span> : null}
              {activeDance ? <span style={{ fontSize: 9, color: FUCHSIA, fontWeight: 800 }}>🕺 {activeDance}</span> : null}
              {isPrivateTalking ? <span style={{ fontSize: 9, color: CYAN, fontWeight: 800 }}>💬 PRIVATE TALK</span> : null}
            </div>
          </div>

          {/* LEFT SOCIAL ACTION RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 12,
              width: 50,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 8,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <button
              type="button"
              title={isSeated ? "Stand up" : "Sit down"}
              onClick={() => HudCommandBus.execute("LOUNGE_SIT")}
              style={sideIconBtn(isSeated ? GREEN : CYAN)}
            >
              🪑
            </button>

            <button
              type="button"
              title={activeDance ? "Stop dancing" : "Start dancing"}
              onClick={() => HudCommandBus.execute("LOUNGE_DANCE")}
              style={sideIconBtn(activeDance ? FUCHSIA : CYAN)}
            >
              🕺
            </button>

            <button
              type="button"
              title="Private conversation"
              onClick={() => HudCommandBus.execute("LOUNGE_PRIVATE_TALK")}
              style={sideIconBtn(isPrivateTalking ? GOLD : CYAN)}
            >
              💬
            </button>
          </div>

          {/* CONTEXTUAL PROXIMITY PILL BAR */}
          {proximityTarget && (
            <div
              style={{
                position: "absolute",
                bottom: 74,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 20,
                border: `1px solid ${CYAN}66`,
                background: "rgba(8,8,24,0.92)",
                backdropFilter: "blur(12px)",
                pointerEvents: "auto",
                boxShadow: `0 0 16px ${CYAN}33`,
              }}
            >
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", alignSelf: "center" }}>
                NEAR {proximityTarget.label} ({proximityTarget.distanceMeters}m):
              </span>
              {proximityActions.map((act) => (
                <button
                  key={act.actionId}
                  type="button"
                  onClick={() => HudCommandBus.execute(act.actionId)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    border: `1px solid ${CYAN}`,
                    background: `${CYAN}22`,
                    color: CYAN,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* BOTTOM CHEVRON EMOTE & SOCIAL TRAY */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${GOLD}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {["👋", "💃", "🙌", "😂"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                  style={emojiCircleBtn}
                >
                  {emoji}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowChevron((c) => !c)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 10,
                  border: `1px solid ${GOLD}66`,
                  background: `${GOLD}22`,
                  color: GOLD,
                  fontSize: 9,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {showChevron ? "▲ CLOSE" : "⋯ MORE"}
              </button>
            </div>

            {showChevron && (
              <div style={{ display: "flex", gap: 6 }}>
                {["👑", "💎", "🍸", "🎵"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                    style={emojiCircleBtn}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {statusLine ? (
        <div
          style={{
            position: "absolute",
            bottom: 130,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.85)",
            border: `1px solid ${CYAN}66`,
            color: CYAN,
            fontSize: 10,
            fontWeight: 800,
            pointerEvents: "none",
          }}
        >
          {statusLine}
        </div>
      ) : null}
    </div>
  );
}

function sideIconBtn(color: string): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

const emojiCircleBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
