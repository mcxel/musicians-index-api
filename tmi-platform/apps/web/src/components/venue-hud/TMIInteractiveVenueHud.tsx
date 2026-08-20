"use client";

/**
 * TMI Interactive Venue HUD — Master Viewport Control Layer.
 *
 * User-facing Name: TMI Interactive Venue HUD
 * Core Package: Base Live HUD
 * Technical Engine: TMI Experience HUD Runtime
 *
 * Laws:
 *   1. Mounted over the active Media Player / Monitor / Venue Viewport.
 *   2. Pre-live console contracts into perimeter HUD rails on [ GO LIVE ].
 *   3. CLEAN_STAGE mode hides rails but keeps persistent HUD Recall Control ([ ◰ HUD ]) in top-right.
 *   4. Zero document layout mutation (Δx=0, Δy=0, Δwidth=0, Δheight=0 for venue viewport).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  HudCommandBus,
  resolveHudCapabilities,
  type BroadcastState,
  type ExperienceType,
  type HudPresentationState,
  type UserRoleCapability,
} from "@/lib/venue-hud/TMIExperienceHudRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface TMIInteractiveVenueHudProps {
  roomId: string;
  roomTitle: string;
  experienceType?: ExperienceType;
  role?: UserRoleCapability;
  tier?: "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  onBroadcastStateChange?: (state: BroadcastState) => void;
}

export default function TMIInteractiveVenueHud({
  roomId,
  roomTitle,
  experienceType = "LIVE",
  role = "performer",
  tier = "FREE",
  onBroadcastStateChange,
}: TMIInteractiveVenueHudProps) {
  const [hudState, setHudState] = useState<HudPresentationState>("PRE_LIVE");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("IDLE");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sessionSec, setSessionSec] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  const capabilities = useMemo(() => resolveHudCapabilities(role), [role]);

  // Register command handlers
  useEffect(() => {
    const unsubs = [
      HudCommandBus.register("GO_LIVE", async () => {
        setBroadcastState("CONNECTING");
        onBroadcastStateChange?.("CONNECTING");
        setStatusLine("Connecting to venue edge...");

        await new Promise((res) => setTimeout(res, 800));

        setBroadcastState("LIVE");
        setHudState("LIVE_VISIBLE");
        onBroadcastStateChange?.("LIVE");
        setStatusLine("You are LIVE!");
        return true;
      }),

      HudCommandBus.register("END_LIVE", async () => {
        setBroadcastState("ENDING");
        onBroadcastStateChange?.("ENDING");

        await new Promise((res) => setTimeout(res, 500));

        setBroadcastState("IDLE");
        setHudState("PRE_LIVE");
        onBroadcastStateChange?.("IDLE");
        setSessionSec(0);
        setStatusLine("Broadcast ended.");
        return true;
      }),

      HudCommandBus.register("TOGGLE_MIC", () => {
        setMicMuted((m) => !m);
        setStatusLine(micMuted ? "Microphone active" : "Microphone muted");
        return true;
      }),

      HudCommandBus.register("TOGGLE_CAMERA", () => {
        setCameraOff((c) => !c);
        setStatusLine(cameraOff ? "Camera active" : "Camera off");
        return true;
      }),

      HudCommandBus.register("EMIT_REACTION", (payload) => {
        const emoji = payload.params?.emoji ?? "🔥";
        setReactionCount((c) => c + 1);
        const id = Math.random().toString(36).substring(2, 9);
        const x = Math.floor(Math.random() * 80) + 10;
        setActiveReactions((prev) => [...prev.slice(-15), { id, emoji, x }]);
        setTimeout(() => {
          setActiveReactions((prev) => prev.filter((r) => r.id !== id));
        }, 1200);
        return true;
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [micMuted, cameraOff, onBroadcastStateChange]);

  // Live session timer
  useEffect(() => {
    if (broadcastState !== "LIVE") return;
    const interval = setInterval(() => setSessionSec((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [broadcastState]);

  const formatClock = (sec: number) => {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleGoLive = () => {
    void HudCommandBus.execute("GO_LIVE");
  };

  const handleEndLive = () => {
    void HudCommandBus.execute("END_LIVE");
  };

  const toggleCleanStage = () => {
    setHudState((current) => (current === "CLEAN_STAGE" ? "LIVE_VISIBLE" : "CLEAN_STAGE"));
  };

  const isCleanStage = hudState === "CLEAN_STAGE";

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
      {/* REACTION FLOATING PARTICLE LAYER */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {activeReactions.map((r) => (
          <div
            key={r.id}
            style={{
              position: "absolute",
              bottom: "15%",
              left: `${r.x}%`,
              fontSize: 24,
              animation: "hudReactionRise 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* PERMANENT HUD RECALL CONTROL ([ ◰ HUD ] / [ ◱ HIDE HUD ]) IN TOP-RIGHT EDGE */}
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120 }}>
        <button
          type="button"
          onClick={toggleCleanStage}
          title={isCleanStage ? "Show Venue HUD" : "Hide Venue HUD (Clean Stage)"}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${isCleanStage ? GOLD : CYAN}`,
            background: "rgba(6,6,20,0.85)",
            color: isCleanStage ? GOLD : CYAN,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 0 12px ${isCleanStage ? GOLD : CYAN}44`,
          }}
        >
          <span>{isCleanStage ? "◰ SHOW HUD" : "◱ HIDE HUD"}</span>
        </button>
      </div>

      {/* PRE-LIVE CENTERED CONTROL DECK */}
      {hudState === "PRE_LIVE" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(280px, 85vw, 560px)",
            padding: "20px 24px",
            borderRadius: 20,
            border: `1.5px solid ${CYAN}66`,
            background: "rgba(8,8,24,0.92)",
            backdropFilter: "blur(16px)",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            boxShadow: `0 0 32px ${CYAN}33`,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: CYAN }}>
              PRE-LIVE CONTROL DECK
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginTop: 2 }}>{roomTitle}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Mode: {experienceType} · Tier: {tier}
            </div>
          </div>

          {/* STATEFUL CENTER GO LIVE BUTTON */}
          <button
            type="button"
            onClick={handleGoLive}
            disabled={broadcastState === "CONNECTING"}
            style={{
              width: "100%",
              maxWidth: 240,
              height: 56,
              borderRadius: 28,
              border: `2px solid ${GREEN}`,
              background: `linear-gradient(135deg, ${GREEN}33 0%, rgba(0,255,136,0.1) 100%)`,
              color: GREEN,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "0.14em",
              cursor: "pointer",
              boxShadow: `0 0 24px ${GREEN}66`,
              transition: "transform 80ms ease, background 180ms ease",
            }}
          >
            {broadcastState === "CONNECTING" ? "CONNECTING..." : "▶ GO LIVE"}
          </button>

          {/* SURROUNDING SETUP QUICK CONTROLS */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => HudCommandBus.execute("TOGGLE_MIC")}
              style={iconChip(micMuted ? RED : CYAN)}
            >
              {micMuted ? "🎙 MUTE" : "🎤 MIC ACTIVE"}
            </button>

            <button
              type="button"
              onClick={() => HudCommandBus.execute("TOGGLE_CAMERA")}
              style={iconChip(cameraOff ? RED : CYAN)}
            >
              {cameraOff ? "🚫 CAM OFF" : "🎥 CAM ACTIVE"}
            </button>

            <button type="button" style={iconChip(GOLD)}>
              👥 GUESTS
            </button>
            <button type="button" style={iconChip(FUCHSIA)}>
              ⚡ EFFECTS
            </button>
          </div>
        </div>
      )}

      {/* LIVE PERIMETER HUD RAILS (VISIBLE WHEN LIVE & NOT CLEAN_STAGE) */}
      {broadcastState === "LIVE" && !isCleanStage && (
        <>
          {/* TOP STATUS RAIL */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 120, // Keep space for HUD recall button in top right
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${CYAN}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: RED,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: RED,
                    boxShadow: `0 0 8px ${RED}`,
                  }}
                />
                LIVE
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: GOLD, fontFamily: "monospace" }}>
                {formatClock(sessionSec)}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{roomTitle}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, color: CYAN, fontWeight: 800 }}>👁 {viewerCount.toLocaleString()}</span>
              <span style={{ fontSize: 10, color: FUCHSIA, fontWeight: 800 }}>
                ♥ {reactionCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* LEFT CONTROL RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 12,
              width: 46,
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
              title="Toggle Mic"
              onClick={() => HudCommandBus.execute("TOGGLE_MIC")}
              style={sideIconBtn(micMuted ? RED : CYAN)}
            >
              {micMuted ? "🎙" : "🎤"}
            </button>
            <button
              type="button"
              title="Toggle Camera"
              onClick={() => HudCommandBus.execute("TOGGLE_CAMERA")}
              style={sideIconBtn(cameraOff ? RED : CYAN)}
            >
              {cameraOff ? "🚫" : "🎥"}
            </button>
            <button type="button" title="Source / Media" style={sideIconBtn(GOLD)}>
              ▣
            </button>
            <button type="button" title="Guests" style={sideIconBtn(GREEN)}>
              👥
            </button>
          </div>

          {/* RIGHT EXPERIENCE CONTEXT MODULE RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              right: 12,
              width: 160,
              padding: 10,
              borderRadius: 14,
              border: `1px solid ${CYAN}33`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: CYAN, letterSpacing: "0.12em" }}>
              {experienceType} MODULE
            </div>

            {experienceType === "BATTLE" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: GOLD, fontWeight: 800 }}>ROUND 2</div>
                <div>A: 62% | B: 38%</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>Time: 01:26</div>
              </div>
            )}

            {experienceType === "WORLD_CONCERT" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: GREEN, fontWeight: 800 }}>SETLIST: SONG 04</div>
                <div>Crowd Energy: HIGH</div>
              </div>
            )}

            {experienceType === "WORLD_RELEASE" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: FUCHSIA, fontWeight: 800 }}>NEW SINGLE REVEAL</div>
                <div style={{ fontSize: 8, color: GOLD }}>STORE ACTIVE</div>
              </div>
            )}

            {experienceType === "LIVE" && (
              <div style={{ fontSize: 10, color: "#fff", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>Audience Active</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>Shard: Main Bowl A1</div>
              </div>
            )}
          </div>

          {/* BOTTOM INTERACTION RAIL */}
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
              border: `1px solid ${CYAN}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            {/* Reaction Trigger Bar */}
            <div style={{ display: "flex", gap: 6 }}>
              {["🔥", "❤️", "👏", "💎"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                  style={{
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
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Performer Action Button */}
            {capabilities.canEndLive && (
              <button
                type="button"
                onClick={handleEndLive}
                style={{
                  padding: "8px 16px",
                  borderRadius: 18,
                  border: `1px solid ${RED}`,
                  background: `${RED}22`,
                  color: RED,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                ⏹ END LIVE
              </button>
            )}
          </div>
        </>
      )}

      {statusLine ? (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.75)",
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

function iconChip(color: string): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "0.04em",
  };
}

function sideIconBtn(color: string): CSSProperties {
  return {
    width: 30,
    height: 30,
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
