'use client';

/**
 * AlbumOutNowOverlay
 *
 * Performer-triggered cinematic album reveal for the Broadcast Control Deck
 * and live audience surfaces.
 *
 * Behavior:
 *   1. Performer presses "Drop Release" in the Broadcast Control Deck.
 *   2. Overlay fades in over the main monitor.
 *   3. Album cover spins in (3D card-flip + scale), gold "OUT NOW" stamp drops,
 *      artist + title appear beneath.
 *   4. Holds for `holdMs` (default 5 s), then sweeps out.
 *   5. `onDismiss` fires — caller removes the overlay from DOM.
 *
 * Audience surface: embed with `position: absolute, inset: 0` inside any
 * VideoMonitorGrid cell or live room panel. Performer surface: same component,
 * rendered in the Broadcast Control Deck preview monitor.
 *
 * Per Rule 7 / Rule 18 visual formula:
 *   dark space background + neon bloom + bold 1980s magazine cover typography.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AlbumOutNowOverlayProps {
  /** Shown when true — controlled by the Broadcast Control Deck */
  visible: boolean;
  /** Album art URL. Required — no placeholder presented as real content (Rule 20). */
  albumArtUrl: string;
  albumTitle: string;
  artistName: string;
  /** How long the overlay stays fully visible before sweeping out (ms). Default 5000. */
  holdMs?: number;
  /** Fires after the exit animation completes — caller unmounts / hides. */
  onDismiss?: () => void;
  /** Accent color for glow and "OUT NOW" badge. Defaults to TMI gold. */
  accentColor?: string;
}

// ── Animation variants ─────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit:   { opacity: 0, transition: { duration: 0.6, delay: 0.1 } },
};

const artVariants = {
  hidden: {
    opacity: 0,
    scale: 0.6,
    rotateY: 90,
    rotateZ: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    rotateZ: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 180,
      damping: 16,
      mass: 0.9,
      delay: 0.15,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.08,
    y: -30,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const badgeVariants = {
  hidden:  { opacity: 0, scale: 0.4, rotate: -12 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -4,
    transition: { type: 'spring' as const, stiffness: 400, damping: 14, delay: 0.55 },
  },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.3 } },
};

const titleVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.75, ease: 'easeOut' } },
  exit:    { opacity: 0, y: 14, transition: { duration: 0.3 } },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function AlbumOutNowOverlay({
  visible,
  albumArtUrl,
  albumTitle,
  artistName,
  holdMs = 5000,
  onDismiss,
  accentColor = '#ffd700',
}: AlbumOutNowOverlayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    // Auto-dismiss after hold duration
    timerRef.current = setTimeout(() => {
      onDismiss?.();
    }, holdMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, holdMs, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="album-out-now"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #0d0020 0%, #050510 60%, #000008 100%)',
            overflow: 'hidden',
          }}
        >
          {/* ── Background glow bloom ───────────────────────────────────────── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 480,
              height: 480,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}06 40%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* ── Outer ring pulse ────────────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.4, 1.2], opacity: [0, 0.35, 0] }}
            transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 340,
              height: 340,
              borderRadius: '50%',
              border: `2px solid ${accentColor}55`,
              pointerEvents: 'none',
            }}
          />

          {/* ── Album art ───────────────────────────────────────────────────── */}
          <motion.div
            variants={artVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ position: 'relative', perspective: 800 }}
          >
            {/* Glow shadow behind art */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: -12,
                borderRadius: 20,
                background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
                filter: 'blur(18px)',
                zIndex: -1,
              }}
            />

            <img
              src={albumArtUrl}
              alt={`${albumTitle} by ${artistName}`}
              width={240}
              height={240}
              style={{
                display: 'block',
                width: 240,
                height: 240,
                borderRadius: 14,
                objectFit: 'cover',
                boxShadow: [
                  `0 0 0 2px ${accentColor}44`,
                  `0 0 40px 8px ${accentColor}33`,
                  `0 30px 60px rgba(0,0,0,0.8)`,
                ].join(', '),
              }}
            />

            {/* ── "OUT NOW" badge ────────────────────────────────────────────── */}
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                top: -18,
                right: -18,
                background: accentColor,
                color: '#050510',
                fontFamily: '"Arial Black", "Impact", sans-serif',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.12em',
                padding: '6px 10px',
                borderRadius: 6,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                boxShadow: `0 0 16px ${accentColor}99, 0 0 4px rgba(0,0,0,0.6)`,
                userSelect: 'none',
              }}
            >
              OUT NOW
            </motion.div>
          </motion.div>

          {/* ── Artist + album name ─────────────────────────────────────────── */}
          <motion.div
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              marginTop: 28,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: '"Arial Black", sans-serif',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                lineHeight: 1.15,
                textShadow: `0 0 20px ${accentColor}66`,
              }}
            >
              {albumTitle}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: accentColor,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginTop: 6,
                opacity: 0.9,
              }}
            >
              {artistName}
            </div>
          </motion.div>

          {/* ── Neon bottom line ────────────────────────────────────────────── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accentColor}aa 40%, #ff00ff66 60%, transparent)`,
              boxShadow: `0 0 12px 2px ${accentColor}44`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
