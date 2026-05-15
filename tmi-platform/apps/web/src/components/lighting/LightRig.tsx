"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LightMode, LightCue } from "@/lib/lighting/lightingEngine";
import { ROOM_PRESETS as ROOM_LIGHT_PRESETS } from "@/lib/lighting/lightingEngine";

const SAFE_STROBE_MAX = 3;

interface LightRigProps {
  room: string;
  mode?: LightMode;
  children?: React.ReactNode;
  safeMode?: boolean;
}

export default function LightRig({ room, mode, children, safeMode = false }: LightRigProps) {
  const preset = ROOM_LIGHT_PRESETS[room];
  const cue: LightCue | null = preset && mode ? (preset.cues[mode] ?? null) : null;

  const safeCue: LightCue | null = cue
    ? { ...cue, strobeHz: safeMode ? 0 : Math.min(cue.strobeHz, SAFE_STROBE_MAX) }
    : null;

  return (
    <div style={{ position: "relative", isolation: "isolate" }}>
      {/* Ambient wash layer */}
      {safeCue && (
        <motion.div
          animate={{
            opacity: [safeCue.intensity * 0.3, safeCue.intensity * 0.6, safeCue.intensity * 0.3],
            backgroundColor: safeCue.primaryColor,
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${safeCue.primaryColor}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Crowd wash */}
      {safeCue?.crowdWash && (
        <motion.div
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", zIndex: 0,
            background: `linear-gradient(0deg, ${safeCue.accentColor}18 0%, transparent 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Spotlight */}
      {safeCue?.spotlight && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 60 / (safeCue.strobeHz || 1) }}
          style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 200, height: "60%", zIndex: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 0%, ${safeCue.primaryColor}30 0%, transparent 70%)`,
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
