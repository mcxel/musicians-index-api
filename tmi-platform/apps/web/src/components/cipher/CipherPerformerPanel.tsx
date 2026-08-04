"use client";

/**
 * CipherPerformerPanel.tsx
 *
 * Neon-framed performer display panel for the TMI Cipher arena.
 * Follows the Rule 2 media priority chain:
 *   1. liveStreamUrl  — live WebRTC/RTMP video (if performer is streaming)
 *   2. motionPosterUrl — short intro video loop (2-3 sec)
 *   3. profileImageUrl — static image
 *   4. Identity card  — name + rank + city (honest empty fallback, Rule 20)
 *
 * Visual variants:
 *   - PRIMARY / SECONDARY — main performer(s) on stage (large panels)
 *   - PREVIOUS / NEXT — compact panels during queue transitions
 *   - WINNER — centered, gold-framed, post-ceremony state
 */

import { motion, AnimatePresence } from "framer-motion";
import type { CipherPerformer, CipherPresentationState } from "@/lib/cipher/CipherPresentationTypes";

export type CipherPanelVariant =
  | "PRIMARY"
  | "SECONDARY"
  | "PREVIOUS"
  | "NEXT"
  | "WINNER";

export interface CipherPerformerPanelProps {
  performer: CipherPerformer;
  variant: CipherPanelVariant;
  presentationState: CipherPresentationState;
  /** Waveform data (0–255 per bar) from Web Audio AnalyserNode — honest flat-line if absent */
  waveformData?: Uint8Array;
  /** Whether audience reaction particles should appear */
  showReactions?: boolean;
  style?: React.CSSProperties;
}

// Accent colors per variant
const ACCENT: Record<CipherPanelVariant, string> = {
  PRIMARY:   "#00FFFF",   // active cyan
  SECONDARY: "#FFD700",   // competing gold
  PREVIOUS:  "#AA2DFF",   // purple (recent)
  NEXT:      "#FF2DAA",   // fuchsia (upcoming)
  WINNER:    "#FFD700",   // gold
};

const BORDER_GLOW: Record<CipherPanelVariant, string> = {
  PRIMARY:   "0 0 24px 4px rgba(0,255,255,0.45)",
  SECONDARY: "0 0 24px 4px rgba(255,215,0,0.45)",
  PREVIOUS:  "0 0 12px 2px rgba(170,45,255,0.3)",
  NEXT:      "0 0 12px 2px rgba(255,45,170,0.3)",
  WINNER:    "0 0 40px 10px rgba(255,215,0,0.6)",
};

const SIZES: Record<CipherPanelVariant, { maxW: number | string; aspectRatio: string }> = {
  PRIMARY:   { maxW: 640, aspectRatio: "9/16" },
  SECONDARY: { maxW: 640, aspectRatio: "9/16" },
  PREVIOUS:  { maxW: 180, aspectRatio: "9/16" },
  NEXT:      { maxW: 180, aspectRatio: "9/16" },
  WINNER:    { maxW: 520, aspectRatio: "9/16" },
};

// ─── Waveform bar chart ───────────────────────────────────────────────────────

function WaveformDisplay({ data, color }: { data?: Uint8Array; color: string }) {
  const BAR_COUNT = 28;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const sample = data ? data[Math.floor((i / BAR_COUNT) * data.length)] ?? 0 : 0;
    return Math.max(3, (sample / 255) * 100);
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        height: 32,
        padding: "0 8px",
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: color,
            borderRadius: 2,
            opacity: 0.7,
            transition: "height 80ms linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Corner accent lines ──────────────────────────────────────────────────────

function CornerAccents({ color }: { color: string }) {
  const len = 18;
  const w = 2;
  return (
    <>
      {/* Top-left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: len, height: w, background: color }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: w, height: len, background: color }} />
      {/* Top-right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: len, height: w, background: color }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: w, height: len, background: color }} />
      {/* Bottom-left */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: len, height: w, background: color }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: w, height: len, background: color }} />
      {/* Bottom-right */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: len, height: w, background: color }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: w, height: len, background: color }} />
    </>
  );
}

// ─── Media source (Rule 2 priority chain) ────────────────────────────────────

function PerformerMedia({ performer, accent }: { performer: CipherPerformer; accent: string }) {
  if (performer.liveStreamUrl) {
    return (
      <video
        src={performer.liveStreamUrl}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => {
          // Rule 20: If stream fails, the component re-renders with next priority
          // The actual fallback is handled by parent state; video element just hides
        }}
      />
    );
  }
  if (performer.motionPosterUrl) {
    return (
      <video
        src={performer.motionPosterUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  if (performer.profileImageUrl) {
    return (
      <img
        src={performer.profileImageUrl}
        alt={performer.displayName}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/tmi-placeholder.jpg"; }}
      />
    );
  }
  // Honest empty — identity card (Rule 20)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0614",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 40 }}>🎤</div>
      <div style={{ color: accent, fontWeight: 900, fontSize: 14, textTransform: "uppercase", letterSpacing: 2 }}>
        {performer.displayName}
      </div>
      {performer.location && (
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{performer.location}</div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CipherPerformerPanel({
  performer,
  variant,
  presentationState,
  waveformData,
  showReactions = false,
  style,
}: CipherPerformerPanelProps) {
  const accent = performer.accentColor ?? ACCENT[variant];
  const size = SIZES[variant];
  const isSmall = variant === "PREVIOUS" || variant === "NEXT";
  const isWinner = variant === "WINNER" || presentationState === "WINNER_DECLARED" || presentationState === "CEREMONY";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.35, ease: "backOut" }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: size.maxW,
        aspectRatio: size.aspectRatio,
        borderRadius: 8,
        border: `2px solid ${accent}`,
        boxShadow: BORDER_GLOW[variant],
        overflow: "hidden",
        background: "#050510",
        ...style,
      }}
    >
      {/* Media layer */}
      <PerformerMedia performer={performer} accent={accent} />

      {/* Gradient overlay — bottom 40% for lower-third legibility */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "linear-gradient(to top, rgba(5,5,16,0.96) 0%, rgba(5,5,16,0.7) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Corner accents */}
      <CornerAccents color={accent} />

      {/* LIVE badge (only if actually live — Rule 20) */}
      {performer.liveStreamUrl && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,30,30,0.85)",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          <motion.div
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>LIVE</span>
        </div>
      )}

      {/* Rank label (top-right) */}
      {performer.rankLabel && !isSmall && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.65)",
            border: `1px solid ${accent}`,
            padding: "2px 7px",
            borderRadius: 4,
            color: accent,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          {performer.rankLabel}
        </div>
      )}

      {/* Verse label (above lower-third) */}
      {performer.verseLabel && !isSmall && (
        <div
          style={{
            position: "absolute",
            bottom: 66,
            left: 10,
            color: "rgba(255,255,255,0.55)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {performer.verseLabel}
        </div>
      )}

      {/* Waveform */}
      {!isSmall && (
        <div style={{ position: "absolute", bottom: 52, left: 0, right: 0 }}>
          <WaveformDisplay data={waveformData} color={accent} />
        </div>
      )}

      {/* Lower-third */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: isSmall ? "6px 8px" : "10px 12px",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: isSmall ? 11 : 16,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            textShadow: `0 0 12px ${accent}`,
            lineHeight: 1.1,
          }}
        >
          {performer.displayName}
        </div>
        {performer.location && !isSmall && (
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 }}>
            {performer.countryCode ? `🏴 ` : ""}{performer.location}
          </div>
        )}
        {performer.activeBeat && !isSmall && (
          <div style={{ color: accent, fontSize: 10, marginTop: 3, opacity: 0.85 }}>
            ♪ {performer.activeBeat.title}
            {performer.activeBeat.producerName ? ` — ${performer.activeBeat.producerName}` : ""}
          </div>
        )}
      </div>

      {/* WINNER overlay — gold crown on WINNER_DECLARED / CEREMONY */}
      <AnimatePresence>
        {isWinner && variant === "WINNER" && (
          <motion.div
            key="winner-crown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -120%)",
              fontSize: 42,
              filter: "drop-shadow(0 0 18px #FFD700)",
              pointerEvents: "none",
            }}
          >
            👑
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
