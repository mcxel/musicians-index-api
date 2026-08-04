"use client";

/**
 * CipherFloorUnderlay.tsx
 *
 * Holographic floor ring system for the TMI Cipher arena.
 * CSS + SVG + Framer Motion — no Three.js dependency.
 *
 * Phase-driven visual modes (from CipherPresentationTypes.CipherFloorMode):
 *   IDLE       — slow cyan pulse, quiet rings
 *   PERFORMANCE — beat-reactive rings with radial grid
 *   VERSUS     — split orange/cyan energy field
 *   VOTING     — countdown sweep ring filling clockwise
 *   VICTORY    — gold platform glow, winner crown projection
 *
 * Layer order: this component sits above the arena background and below
 * all performer panels (z-index 3-5 range in the arena stack).
 */

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CipherFloorMode } from "@/lib/cipher/CipherPresentationTypes";

export interface CipherFloorUnderlayProps {
  mode: CipherFloorMode;
  /** Normalized beat intensity 0–1 from the BeatPlayer. Drives ring scale/opacity. */
  beatIntensity?: number;
  /** 0–1 fraction of the vote countdown elapsed. Used in VOTING mode. */
  voteProgress?: number;
  /** Primary accent color for active performer side */
  leftColor?: string;
  /** Secondary accent for right performer side (VERSUS mode) */
  rightColor?: string;
}

// Ring configuration by mode
const RING_PRESETS: Record<CipherFloorMode, { color: string; pulseSpeed: number; opacity: number }[]> = {
  IDLE: [
    { color: "#00FFFF", pulseSpeed: 4, opacity: 0.12 },
    { color: "#00FFFF", pulseSpeed: 5, opacity: 0.08 },
    { color: "#AA2DFF", pulseSpeed: 6, opacity: 0.05 },
  ],
  PERFORMANCE: [
    { color: "#00FFFF", pulseSpeed: 0.5, opacity: 0.22 },
    { color: "#FF2DAA", pulseSpeed: 0.7, opacity: 0.18 },
    { color: "#AA2DFF", pulseSpeed: 0.9, opacity: 0.12 },
  ],
  VERSUS: [
    { color: "#00FFFF", pulseSpeed: 1.2, opacity: 0.25 },
    { color: "#FFD700", pulseSpeed: 1.4, opacity: 0.25 },
    { color: "#FF6600", pulseSpeed: 1.8, opacity: 0.14 },
  ],
  VOTING: [
    { color: "#FFD700", pulseSpeed: 0.8, opacity: 0.30 },
    { color: "#FF2DAA", pulseSpeed: 1.0, opacity: 0.20 },
    { color: "#FF2DAA", pulseSpeed: 1.5, opacity: 0.10 },
  ],
  VICTORY: [
    { color: "#FFD700", pulseSpeed: 1.5, opacity: 0.40 },
    { color: "#FFD700", pulseSpeed: 2.0, opacity: 0.28 },
    { color: "#FFFFFF", pulseSpeed: 2.5, opacity: 0.12 },
  ],
};

const MODE_ROTATE_SPEEDS: Record<CipherFloorMode, number> = {
  IDLE: 30,
  PERFORMANCE: 8,
  VERSUS: 6,
  VOTING: 4,
  VICTORY: 12,
};

export default function CipherFloorUnderlay({
  mode = "IDLE",
  beatIntensity = 0,
  voteProgress = 0,
  leftColor = "#00FFFF",
  rightColor = "#FFD700",
}: CipherFloorUnderlayProps) {
  const rings = RING_PRESETS[mode];
  const rotateSpeed = MODE_ROTATE_SPEEDS[mode];
  const beatScale = 1 + beatIntensity * 0.08;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "10%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Perspective container — creates the 3D floor illusion */}
      <div
        style={{
          position: "relative",
          width: "80%",
          maxWidth: 700,
          aspectRatio: "2 / 1",
          transform: "perspective(600px) rotateX(52deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* Radial grid (SVG) */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: mode === "IDLE" ? 0.04 : 0.08 }}
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          {/* Concentric ellipses */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
            <ellipse
              key={`ring-${i}`}
              cx="100"
              cy="100"
              rx={r * 100}
              ry={r * 45}
              fill="none"
              stroke={rings[i % rings.length]?.color ?? "#00FFFF"}
              strokeWidth="0.4"
            />
          ))}
          {/* Radial lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI;
            const x2 = 100 + 100 * Math.cos(angle);
            const y2 = 100 + 45 * Math.sin(angle);
            const x3 = 100 + 100 * Math.cos(angle + Math.PI);
            const y3 = 100 + 45 * Math.sin(angle + Math.PI);
            return (
              <line
                key={`line-${i}`}
                x1={x2} y1={y2} x2={x3} y2={y3}
                stroke={rings[0]?.color ?? "#00FFFF"}
                strokeWidth="0.2"
              />
            );
          })}
        </svg>

        {/* Animated glow rings (Framer Motion) */}
        {rings.map((ring, i) => (
          <motion.div
            key={`glow-${mode}-${i}`}
            style={{
              position: "absolute",
              left: `${10 + i * 10}%`,
              right: `${10 + i * 10}%`,
              top: `${20 + i * 10}%`,
              bottom: `${-20 + i * 10}%`,
              borderRadius: "50%",
              border: `${2 - i * 0.4}px solid ${ring.color}`,
              opacity: ring.opacity,
              scale: beatScale,
            }}
            animate={{
              opacity: [ring.opacity, ring.opacity * 0.5, ring.opacity],
              scale: [beatScale, beatScale * 1.04, beatScale],
            }}
            transition={{
              duration: ring.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.25,
            }}
          />
        ))}

        {/* Rotating accent ring */}
        <motion.div
          style={{
            position: "absolute",
            left: "5%",
            right: "5%",
            top: "15%",
            bottom: "-15%",
            borderRadius: "50%",
            border: `1px dashed ${rings[0]?.color ?? "#00FFFF"}`,
            opacity: 0.15,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: rotateSpeed, repeat: Infinity, ease: "linear" }}
        />

        {/* VERSUS mode — split energy field */}
        <AnimatePresence>
          {mode === "VERSUS" && (
            <motion.div
              key="versus-split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: "49%",
                right: "49%",
                top: 0,
                bottom: 0,
                background: "linear-gradient(to bottom, transparent, rgba(255,103,0,0.35), transparent)",
              }}
            />
          )}
        </AnimatePresence>

        {/* VOTING mode — clockwise countdown sweep */}
        <AnimatePresence>
          {(mode === "VOTING" || mode === "PERFORMANCE") && (
            <svg
              key="vote-sweep"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="100"
                cy="100"
                rx="90"
                ry="40"
                fill="none"
                stroke={mode === "VOTING" ? "#FFD700" : leftColor}
                strokeWidth="1.5"
                strokeDasharray={`${voteProgress * 565} 565`}
                strokeLinecap="round"
                opacity={0.6}
              />
            </svg>
          )}
        </AnimatePresence>

        {/* VICTORY mode — gold platform */}
        <AnimatePresence>
          {mode === "VICTORY" && (
            <motion.div
              key="victory-platform"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              style={{
                position: "absolute",
                left: "25%",
                right: "25%",
                top: "25%",
                bottom: "10%",
                borderRadius: "50%",
                background: "radial-gradient(ellipse at center, rgba(255,215,0,0.22) 0%, transparent 70%)",
                border: "2px solid rgba(255,215,0,0.5)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Center glow — always present */}
        <div
          style={{
            position: "absolute",
            left: "35%",
            right: "35%",
            top: "40%",
            bottom: "30%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${rings[0]?.color ?? "#00FFFF"}18 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}
