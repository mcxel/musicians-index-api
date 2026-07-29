"use client";

/**
 * MemoryCinematicViewer — Phase 7.4 focus overlay
 *
 * Shared layoutId expand → fullscreen. Swipe next/prev, CSS double-tap zoom,
 * press-hold motion play, mute toggle. Scoped — not a full editor suite.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CollectibleMemoryRecord } from "@/lib/memory/collectiblesContracts";
import {
  resolveCollectibleMotionUrl,
  resolveCollectibleStillUrl,
} from "@/lib/memory/collectiblesContracts";

export interface MemoryCinematicViewerProps {
  items: CollectibleMemoryRecord[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function MemoryCinematicViewer({
  items,
  index,
  onClose,
  onIndexChange,
}: MemoryCinematicViewerProps) {
  const reduceMotion = useReducedMotion();
  const item = items[index];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastTap = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stillUrl = item ? resolveCollectibleStillUrl(item) : undefined;
  const motionUrl = item ? resolveCollectibleMotionUrl(item) : undefined;
  const hasAudio = Boolean(item?.motionPair?.hasAudio);

  const go = useCallback(
    (delta: number) => {
      if (items.length === 0) return;
      const next = (index + delta + items.length) % items.length;
      onIndexChange(next);
      setZoom(1);
      setPlaying(false);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === " ") {
        e.preventDefault();
        if (motionUrl && !reduceMotion) setPlaying((p) => !p);
      }
      if (e.key === "m" || e.key === "M") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, motionUrl, reduceMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !motionUrl || reduceMotion) return;
    if (playing) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing, motionUrl, reduceMotion, index]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 12000,
          background: "rgba(2,2,10,0.94)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
      >
        <motion.div
          layoutId={`memory-card-${item.id}`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
            if (!reduceMotion && motionUrl) {
              holdTimer.current = setTimeout(() => setPlaying(true), 200);
            }
          }}
          onTouchEnd={(e) => {
            if (holdTimer.current) clearTimeout(holdTimer.current);
            const start = touchStartX.current;
            const end = e.changedTouches[0]?.clientX;
            touchStartX.current = null;
            if (start != null && end != null) {
              const dx = end - start;
              if (dx > 60) go(-1);
              else if (dx < -60) go(1);
            }
            const now = Date.now();
            if (now - lastTap.current < 280) {
              setZoom((z) => (z > 1 ? 1 : 1.8));
            }
            lastTap.current = now;
          }}
          onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 1.8))}
          style={{
            position: "relative",
            maxWidth: "min(92vw, 960px)",
            maxHeight: "78vh",
            width: "100%",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(0,255,255,0.25)",
            boxShadow: "0 0 40px rgba(170,45,255,0.25)",
            background: "#050510",
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: reduceMotion ? "none" : "transform 0.2s ease",
              width: "100%",
              height: "min(78vh, 720px)",
              position: "relative",
            }}
          >
            {stillUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stillUrl}
                alt={item.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: playing && motionUrl && !reduceMotion ? 0 : 1,
                }}
              />
            )}
            {motionUrl && !reduceMotion && (
              <video
                ref={videoRef}
                src={motionUrl}
                muted={muted || !hasAudio}
                playsInline
                loop
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: playing ? 1 : 0,
                }}
              />
            )}
            {!stillUrl && !motionUrl && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                }}
              >
                No media available
              </div>
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 14px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{item.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                {item.kind}
                {item.locationLabel ? ` · ${item.locationLabel}` : ""}
                {item.subtitle ? ` · ${item.subtitle}` : ""}
              </div>
            </div>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous memory"
                  style={ctrlBtn}
                >
                  ‹
                </button>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                  {index + 1}/{items.length}
                </span>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next memory"
                  style={ctrlBtn}
                >
                  ›
                </button>
              </>
            )}

            {motionUrl && !reduceMotion && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause motion" : "Play motion"}
                style={ctrlBtn}
              >
                {playing ? "❚❚" : "▶"}
              </button>
            )}

            {motionUrl && hasAudio && !reduceMotion && (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                style={ctrlBtn}
              >
                {muted ? "🔇" : "🔊"}
              </button>
            )}

            <button type="button" onClick={onClose} aria-label="Close viewer" style={ctrlBtn}>
              ✕
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const ctrlBtn: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(0,255,255,0.3)",
  color: "#fff",
  borderRadius: 8,
  width: 36,
  height: 36,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
