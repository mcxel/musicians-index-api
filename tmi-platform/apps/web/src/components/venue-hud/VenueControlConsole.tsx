"use client";

/**
 * VenueControlConsole
 * The PRE-LIVE state centered glass panel (video reference: 0.00–1.50 sec).
 *
 * Video-reference geometry (1280×720):
 *   x: ~313–965   (width ~652)
 *   y: ~160–555   (height ~360–395)
 *
 * Normalized: 24.4% → 75.4% width, centered vertically
 *
 * Three-column composition:
 *   Left nav:       ~29%   (room info, settings, experience modes)
 *   Center:         ~34%   (GO LIVE dominant CTA)
 *   Right settings: ~37%   (mic / camera / quality controls)
 *
 * Transition:
 *   On Go Live → animate: opacity 0, scale 1.04, blur →
 *   Parent mounts perimeter HUD rails
 *   Duration: 240–300 ms, ease: cubic-bezier(.2,.8,.2,1)
 *
 * Certification: L1 IMPLEMENTED
 */

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

const CYAN    = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD    = "#FFD700";
const GREEN   = "#00FF88";
const RED_ACTION = "#F53E5C"; // video-reference accent

export type GoLiveQuality = "360p" | "480p" | "720p" | "1080p";
export type ExperienceMode = "LIVE" | "BATTLE" | "CYPHER" | "CHALLENGE" | "CONCERT" | "GAME_SHOW";

interface VenueControlConsoleProps {
  roomTitle: string;
  experienceMode: ExperienceMode;
  onExperienceModeChange?: (mode: ExperienceMode) => void;
  micMuted: boolean;
  cameraOff: boolean;
  quality: GoLiveQuality;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onQualityChange?: (q: GoLiveQuality) => void;
  isConnecting: boolean;
  onGoLive: () => void;
  onClose?: () => void;
}

const EXPERIENCE_MODES: Array<{ id: ExperienceMode; label: string; icon: string }> = [
  { id: "LIVE",       label: "Go Live",     icon: "🔴" },
  { id: "BATTLE",     label: "Battle",      icon: "⚔️" },
  { id: "CYPHER",     label: "Cypher",      icon: "🔄" },
  { id: "CHALLENGE",  label: "Challenge",   icon: "🏆" },
  { id: "CONCERT",    label: "Concert",     icon: "🎤" },
  { id: "GAME_SHOW",  label: "Game Show",   icon: "🎮" },
];

const QUALITIES: GoLiveQuality[] = ["360p", "480p", "720p", "1080p"];

export default function VenueControlConsole({
  roomTitle,
  experienceMode,
  onExperienceModeChange,
  micMuted,
  cameraOff,
  quality,
  onToggleMic,
  onToggleCamera,
  onQualityChange,
  isConnecting,
  onGoLive,
  onClose,
}: VenueControlConsoleProps) {
  return (
    <motion.div
      key="venue-control-console"
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: "blur(8px)",
        transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
      }}
      transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        position: "absolute",
        // Video-reference: centered at ~(313–965, 160–555)
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "clamp(320px, 51%, 660px)",
        maxWidth: "90vw",
        borderRadius: 20,
        background: "rgba(14,16,26,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
        pointerEvents: "auto",
        overflow: "hidden",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* macOS-style traffic lights (visual only) */}
          {[RED_ACTION, GOLD, GREEN].map((c) => (
            <div
              key={c}
              style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }}
            />
          ))}
          <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", marginLeft: 6 }}>
            {roomTitle}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Three-column body */}
      <div style={{ display: "flex", minHeight: 280 }}>
        {/* LEFT — Room navigation / experience modes */}
        <div
          style={{
            width: "29%",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            padding: "14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            MODE
          </div>
          {EXPERIENCE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onExperienceModeChange?.(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 9px",
                borderRadius: 9,
                border: `1px solid ${experienceMode === m.id ? RED_ACTION + "80" : "transparent"}`,
                background: experienceMode === m.id ? `${RED_ACTION}18` : "transparent",
                color: experienceMode === m.id ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 11,
                fontWeight: experienceMode === m.id ? 800 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* CENTER — GO LIVE CTA */}
        <div
          style={{
            width: "34%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 12px",
            gap: 14,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)" }}>
              BROADCAST
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginTop: 3 }}>
              READY
            </div>
          </div>

          {/* Primary GO LIVE button — video-reference accent ~#F53E5C */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoLive}
            disabled={isConnecting}
            style={{
              width: 110,
              height: 44,
              borderRadius: 22,
              border: `2px solid ${RED_ACTION}`,
              background: `linear-gradient(135deg, ${RED_ACTION}44 0%, ${RED_ACTION}22 100%)`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.12em",
              cursor: isConnecting ? "wait" : "pointer",
              boxShadow: `0 0 22px ${RED_ACTION}66, 0 0 8px ${RED_ACTION}44 inset`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isConnecting ? "CONNECTING..." : "▶ GO LIVE"}
          </motion.button>

          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>
            {experienceMode} · {quality}
          </div>
        </div>

        {/* RIGHT — Mic, camera, quality settings */}
        <div
          style={{
            width: "37%",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
            SETTINGS
          </div>

          {/* Mic toggle */}
          <div style={settingRow()}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>🎤 Microphone</span>
            <ToggleChip active={!micMuted} onToggle={onToggleMic} label={micMuted ? "MUTED" : "ACTIVE"} color={micMuted ? "#FF4466" : CYAN} />
          </div>

          {/* Camera toggle */}
          <div style={settingRow()}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>🎥 Camera</span>
            <ToggleChip active={!cameraOff} onToggle={onToggleCamera} label={cameraOff ? "OFF" : "ON"} color={cameraOff ? "#FF4466" : GREEN} />
          </div>

          {/* Quality selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>QUALITY</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onQualityChange?.(q)}
                  style={{
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: `1px solid ${quality === q ? GOLD + "80" : "rgba(255,255,255,0.12)"}`,
                    background: quality === q ? `${GOLD}18` : "transparent",
                    color: quality === q ? GOLD : "rgba(255,255,255,0.4)",
                    fontSize: 9,
                    fontWeight: quality === q ? 800 : 500,
                    cursor: "pointer",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ToggleChip({ active, onToggle, label, color }: { active: boolean; onToggle: () => void; label: string; color: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        border: `1px solid ${color}66`,
        background: `${color}18`,
        color,
        fontSize: 9,
        fontWeight: 900,
        cursor: "pointer",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </button>
  );
}

function settingRow(): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };
}
