"use client";

/**
 * MotionMediaCard — Phase 7.4 Living Card
 *
 * Sharp still by default; hover / press / hold plays motionUrl in-frame.
 * Silent preview when visible (IntersectionObserver). Rims are CSS overlays only.
 * prefers-reduced-motion → static still, no autoplay / float animations.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CollectibleMemoryRecord } from "@/lib/memory/collectiblesContracts";
import {
  resolveCollectibleMotionUrl,
  resolveCollectibleStillUrl,
} from "@/lib/memory/collectiblesContracts";

const KIND_ICON: Record<CollectibleMemoryRecord["kind"], string> = {
  PHOTO: "📸",
  VIDEO: "🎬",
  YOPHO: "🖼️",
  TICKET: "🎟️",
  POSTER: "🎭",
  KEEPSAKE: "✨",
};

const KIND_ACCENT: Record<CollectibleMemoryRecord["kind"], string> = {
  PHOTO: "#00FFFF",
  VIDEO: "#FF2DAA",
  YOPHO: "#AA2DFF",
  TICKET: "#FFD700",
  POSTER: "#00FF88",
  KEEPSAKE: "#FF6B35",
};

/** Presentation-only rim gradients — never burned into master media. */
export const RIM_STYLES: Record<string, string> = {
  neon_cyan: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
  neon_fuchsia: "linear-gradient(135deg, #FF2DAA, #00FFFF)",
  gold_frame: "linear-gradient(135deg, #FFD700, #FF2DAA)",
  vice_glow: "linear-gradient(135deg, #AA2DFF, #FF2DAA, #00FFFF)",
  ticket_stub: "linear-gradient(90deg, #FFD700, #FF6B35)",
};

export interface MotionMediaCardProps {
  item: CollectibleMemoryRecord;
  index?: number;
  layoutId?: string;
  onOpen?: (item: CollectibleMemoryRecord) => void;
  compact?: boolean;
}

export default function MotionMediaCard({
  item,
  index = 0,
  layoutId,
  onOpen,
  compact = false,
}: MotionMediaCardProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stillUrl = resolveCollectibleStillUrl(item);
  const motionUrl = resolveCollectibleMotionUrl(item);
  const accent = KIND_ACCENT[item.kind] ?? "#00FFFF";
  const icon = KIND_ICON[item.kind] ?? "🎤";
  const rim = item.rimStyleId ? RIM_STYLES[item.rimStyleId] : undefined;
  const isTicket = item.kind === "TICKET";
  const isYoPho = item.kind === "YOPHO";
  const preset = item.animationPreset ?? "SCALE_ON_HOVER";

  useEffect(() => {
    const el = cardRef.current;
    if (!el || reduceMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  const startMotion = useCallback(() => {
    if (reduceMotion || !motionUrl) return;
    setPlaying(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = (item.motionPair?.posterFrameMs ?? 0) / 1000;
      void v.play().catch(() => {});
    }
  }, [reduceMotion, motionUrl, item.motionPair?.posterFrameMs]);

  const stopMotion = useCallback(() => {
    setPlaying(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = (item.motionPair?.posterFrameMs ?? 0) / 1000;
    }
  }, [item.motionPair?.posterFrameMs]);

  // Silent auto-preview when visible (motion memories only)
  useEffect(() => {
    if (reduceMotion || !motionUrl) return;
    if (visible && item.motionPair) startMotion();
    else if (!visible) stopMotion();
  }, [visible, motionUrl, reduceMotion, item.motionPair, startMotion, stopMotion]);

  const floatAnim =
    !reduceMotion && preset === "FLOAT"
      ? { y: [0, -4, 0] as number[], transition: { repeat: Infinity, duration: 3.2 + (index % 5) * 0.2 } }
      : undefined;

  const glowShadow =
    !reduceMotion && (preset === "GLOW" || playing)
      ? `0 8px 28px rgba(0,0,0,0.55), 0 0 18px ${accent}44`
      : "0 6px 20px rgba(0,0,0,0.45)";

  return (
    <motion.div
      ref={cardRef}
      layoutId={layoutId}
      animate={floatAnim}
      whileHover={
        reduceMotion || preset !== "SCALE_ON_HOVER"
          ? undefined
          : { scale: 1.04, rotate: 0 }
      }
      style={{
        position: "relative",
        cursor: onOpen ? "pointer" : "default",
        transformOrigin: "center",
        perspective: isTicket || isYoPho ? 800 : undefined,
      }}
      onClick={() => onOpen?.(item)}
      onMouseEnter={() => {
        if (!reduceMotion && motionUrl && !item.motionPair) startMotion();
        else if (!reduceMotion && motionUrl) startMotion();
      }}
      onMouseLeave={() => {
        if (!visible || reduceMotion) stopMotion();
      }}
      onPointerDown={() => {
        if (reduceMotion || !motionUrl) return;
        holdTimer.current = setTimeout(() => startMotion(), 180);
      }}
      onPointerUp={() => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
      }}
      onPointerCancel={() => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(item);
        }
      }}
      aria-label={`${item.title}${motionUrl ? " (motion memory)" : ""}`}
    >
      {/* Rim overlay (presentation only) */}
      <div
        style={{
          borderRadius: isTicket ? 6 : 12,
          padding: rim ? 2 : 0,
          background: rim ?? "transparent",
          boxShadow: glowShadow,
          transform:
            isTicket || isYoPho
              ? `rotateY(${playing && !reduceMotion ? 6 : index % 2 === 0 ? -3 : 3}deg)`
              : undefined,
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <div
          style={{
            background: isTicket ? "rgba(255,215,0,0.08)" : "rgba(5,5,16,0.95)",
            borderRadius: isTicket ? 4 : 10,
            border: `1px solid ${accent}28`,
            overflow: "hidden",
            padding: compact ? 6 : 8,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: isTicket ? "3/2" : "1/1",
              borderRadius: 6,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${accent}18, rgba(5,5,16,0.9))`,
            }}
          >
            {stillUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stillUrl}
                alt={item.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: playing && motionUrl && !reduceMotion ? 0 : 1,
                  transition: "opacity 0.2s ease",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {icon}
              </div>
            )}

            {motionUrl && !reduceMotion && (
              <video
                ref={videoRef}
                src={motionUrl}
                muted
                playsInline
                loop
                preload="metadata"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: playing ? 1 : 0,
                  pointerEvents: "none",
                  transition: "opacity 0.2s ease",
                }}
              />
            )}

            {motionUrl && (
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: "#fff",
                  background: "rgba(0,0,0,0.55)",
                  border: `1px solid ${accent}55`,
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              >
                {item.motionPair?.sourceFormat?.replace(/_/g, " ") ?? "MOTION"}
              </div>
            )}
          </div>

          <div style={{ marginTop: compact ? 6 : 8 }}>
            <p
              style={{
                margin: 0,
                fontSize: compact ? 10 : 11,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.title}
            </p>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: accent,
              }}
            >
              {icon} {item.kind}
              {item.isFavorite ? " · ★" : ""}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
