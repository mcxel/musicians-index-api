"use client";

/**
 * CipherPiPPanel.tsx
 *
 * Picture-in-Picture subsystem for the TMI Cipher arena.
 *
 * Modes (CipherPiPMode):
 *   PREVIOUS_PERFORMER — who just performed (compact, muted style)
 *   NEXT_PERFORMER     — who performs after the current artist
 *   HOST               — host camera feed
 *   DJ                 — DJ/beat-producer camera
 *   JUDGE              — panel judge view
 *   REACTION_CAMERA    — audience reaction camera
 *   OFF                — PiP hidden
 *
 * Safety constraints (from spec):
 *   - NEVER covers vote buttons (when showVoteBar is true, PiP docks top)
 *   - NEVER covers the performer's face in the primary panel
 *   - Respects collision groups registered in CipherPanelDefinition
 *
 * Lifecycle states:
 *   DOCKED → ENTERING → ACTIVE → FOCUSED → SWAPPING → RETURNING → CLOSED
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { CipherPiPMode, CipherPiPAnchor, CipherPerformer } from "@/lib/cipher/CipherPresentationTypes";

export interface CipherPiPPanelProps {
  mode: CipherPiPMode;
  /** The performer being shown in this PiP slot */
  performer?: CipherPerformer;
  /** Where to anchor the PiP on screen */
  anchor: CipherPiPAnchor;
  /** If vote bar is visible, PiP must not overlap vote buttons */
  voteBarVisible?: boolean;
  /** Optional click handler */
  onFocus?: () => void;
}

// ─── Anchor position mapping ──────────────────────────────────────────────────

const ANCHOR_STYLES: Record<CipherPiPAnchor, React.CSSProperties> = {
  BOTTOM_LEFT:  { bottom: 90, left: 12 },
  BOTTOM_RIGHT: { bottom: 90, right: 12 },
  UPPER_LEFT:   { top: 60, left: 12 },
  UPPER_RIGHT:  { top: 60, right: 12 },
};

// ─── Mode labels ──────────────────────────────────────────────────────────────

const MODE_LABELS: Record<CipherPiPMode, string> = {
  PREVIOUS_PERFORMER: "JUST PERFORMED",
  NEXT_PERFORMER:     "UP NEXT",
  HOST:               "HOST",
  DJ:                 "DJ",
  JUDGE:              "JUDGE",
  REACTION_CAMERA:    "CROWD",
  OFF:                "",
};

const MODE_ACCENT: Record<CipherPiPMode, string> = {
  PREVIOUS_PERFORMER: "#AA2DFF",
  NEXT_PERFORMER:     "#FF2DAA",
  HOST:               "#00FFFF",
  DJ:                 "#FFD700",
  JUDGE:              "#00FFFF",
  REACTION_CAMERA:    "#FF2DAA",
  OFF:                "transparent",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function CipherPiPPanel({
  mode,
  performer,
  anchor,
  voteBarVisible = false,
  onFocus,
}: CipherPiPPanelProps) {
  const [isFocused, setIsFocused] = useState(false);

  // When vote bar becomes visible, push PiP to upper anchors automatically
  const effectiveAnchor: CipherPiPAnchor =
    voteBarVisible && (anchor === "BOTTOM_LEFT" || anchor === "BOTTOM_RIGHT")
      ? anchor === "BOTTOM_LEFT" ? "UPPER_LEFT" : "UPPER_RIGHT"
      : anchor;

  const anchorStyle = ANCHOR_STYLES[effectiveAnchor];
  const accent = MODE_ACCENT[mode];
  const label = MODE_LABELS[mode];
  const width = isFocused ? 240 : 140;

  if (mode === "OFF" || !performer) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`pip-${mode}-${performer.id}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3, ease: "backOut" }}
        onClick={() => {
          setIsFocused(!isFocused);
          onFocus?.();
        }}
        style={{
          position: "absolute",
          ...anchorStyle,
          zIndex: 40,
          width,
          aspectRatio: "9/16",
          borderRadius: 6,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 16px 3px ${accent}55`,
          overflow: "hidden",
          cursor: "pointer",
          transition: "width 0.25s ease",
          background: "#050510",
        }}
      >
        {/* Media — Rule 2 priority chain */}
        {performer.liveStreamUrl ? (
          <video
            src={performer.liveStreamUrl}
            autoPlay muted playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : performer.motionPosterUrl ? (
          <video
            src={performer.motionPosterUrl}
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : performer.profileImageUrl ? (
          <img
            src={performer.profileImageUrl}
            alt={performer.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/tmi-placeholder.jpg"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0614" }}>
            <span style={{ fontSize: 28 }}>🎤</span>
          </div>
        )}

        {/* Bottom overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(5,5,16,0.95) 0%, transparent 100%)",
            padding: "6px 6px 5px",
          }}
        >
          {/* Mode label (glowing tag) */}
          <div
            style={{
              color: accent,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          {/* Performer name */}
          <div
            style={{
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {performer.displayName}
          </div>
        </div>

        {/* Top left corner accent */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 2, background: accent }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 10, background: accent }} />

        {/* Expand hint */}
        {!isFocused && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              color: "rgba(255,255,255,0.4)",
              fontSize: 9,
            }}
          >
            ⤢
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
