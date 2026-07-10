"use client";

/**
 * VideoPanel — futuristic broadcast-style video tile.
 * Used by the video lounge / live rooms.
 *
 * Design language: 40% Entertainment Magazine + 30% Vice City
 * + 20% Live Broadcast + 10% Spatial World (per TMI Rule 18).
 *
 * Visual spec:
 *  • Glass morphism panel with neon edge glow
 *  • Four-corner viewfinder brackets (broadcast look)
 *  • Animated speaking ring (cyan glow pulse)
 *  • Lower-third name tag (ESPN/UFC style)
 *  • LIVE badge with red dot when streaming
 *  • Quality badge (HD / 4K)
 */

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export interface Participant {
  id: string;
  userName: string;
  avatarUrl?: string;
  isLive?: boolean;
  isSpeaking?: boolean;
  role?: 'HOST' | 'PERFORMER' | 'FAN' | 'JUDGE';
  quality?: 'HD' | '4K' | 'SD';
}

interface VideoPanelProps {
  participant: Participant;
  layout?: React.CSSProperties;
  featured?: boolean; // larger/primary slot
}

// Role → accent colour
const ROLE_COLOR: Record<string, string> = {
  HOST: '#ffd700',
  PERFORMER: '#00ffff',
  JUDGE: '#ff00ff',
  FAN: '#aa2dff',
};

export function VideoPanel({ participant, layout, featured = false }: VideoPanelProps) {
  const accent = ROLE_COLOR[participant.role ?? 'PERFORMER'] ?? '#00ffff';
  const isSpeaking = participant.isSpeaking ?? false;

  // Pulse animation ref — ring expands when speaking
  const [pulseScale, setPulseScale] = useState(1);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pulseRef.current) clearInterval(pulseRef.current);
    if (!isSpeaking) { setPulseScale(1); return; }
    let up = true;
    pulseRef.current = setInterval(() => {
      setPulseScale((s) => {
        if (up && s >= 1.05) { up = false; }
        if (!up && s <= 1.0) { up = true; }
        return up ? s + 0.005 : s - 0.005;
      });
    }, 16);
    return () => { if (pulseRef.current) clearInterval(pulseRef.current); };
  }, [isSpeaking]);

  const borderColor = isSpeaking ? accent : 'rgba(255,255,255,0.1)';
  const glowShadow = isSpeaking
    ? `0 0 0 2px ${accent}88, 0 0 20px 4px ${accent}44, 0 0 40px 8px ${accent}22`
    : `0 4px 24px rgba(0,0,0,0.5)`;

  return (
    <motion.div
      layout
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        position: 'relative',
        borderRadius: featured ? '10px' : '8px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(10,6,20,0.95) 0%, rgba(5,2,12,0.98) 100%)',
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        willChange: 'transform',
        ...layout,
      }}
    >
      {/* ── Speaking ring ─────────────────────────────────────────────── */}
      {isSpeaking && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 'inherit',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 12px 2px ${accent}66`,
            transform: `scale(${pulseScale})`,
            transition: 'transform 0.016s linear',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* ── Video / avatar area ────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          paddingTop: '56.25%', // 16:9
          position: 'relative',
          background: participant.avatarUrl
            ? `url(${participant.avatarUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, #0a0614 0%, #0d0820 50%, #050310 100%)`,
        }}
      >
        {/* Placeholder icon when no video */}
        {!participant.avatarUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: featured ? 72 : 48,
              height: featured ? 72 : 48,
              borderRadius: '50%',
              background: `radial-gradient(circle at 38% 38%, ${accent}44, ${accent}11 60%, transparent 90%)`,
              border: `1px solid ${accent}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: featured ? 32 : 22,
              boxShadow: `0 0 20px ${accent}22`,
            }}>
              👤
            </div>
          </div>
        )}

        {/* ── Glass scan overlay (broadcast feel) ───────────────────── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── Viewfinder corner brackets ─────────────────────────────── */}
        <CornerBrackets color={accent} size={featured ? 16 : 10} />

        {/* ── LIVE badge ──────────────────────────────────────────────── */}
        {participant.isLive && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(220, 20, 20, 0.88)',
            border: '1px solid rgba(255,80,80,0.6)',
            borderRadius: 4,
            padding: '2px 6px',
            boxShadow: '0 0 10px rgba(220,20,20,0.5)',
            backdropFilter: 'blur(4px)',
          }}>
            <LiveDot />
            <span style={{
              fontSize: 9,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '0.12em',
              lineHeight: 1,
            }}>
              LIVE
            </span>
          </div>
        )}

        {/* ── Quality badge ─────────────────────────────────────────── */}
        {participant.quality && participant.quality !== 'SD' && (
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${accent}44`,
            borderRadius: 3,
            padding: '2px 5px',
            fontSize: 8,
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.08em',
            backdropFilter: 'blur(4px)',
          }}>
            {participant.quality}
          </div>
        )}
      </div>

      {/* ── Lower-third name tag ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: featured ? '8px 12px' : '5px 8px',
        background: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 60%, transparent 100%)`,
        borderTop: `1px solid ${accent}22`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {/* Role accent bar */}
        <div style={{
          width: 2,
          height: featured ? 24 : 16,
          borderRadius: 1,
          background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
          boxShadow: `0 0 6px ${accent}88`,
          flexShrink: 0,
        }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: featured ? 13 : 10,
            fontWeight: 700,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.02em',
            textShadow: `0 0 8px ${accent}66`,
          }}>
            {participant.userName}
          </div>
          {participant.role && (
            <div style={{
              fontSize: featured ? 9 : 8,
              color: accent,
              fontWeight: 600,
              letterSpacing: '0.15em',
              marginTop: 1,
              opacity: 0.85,
            }}>
              {participant.role}
            </div>
          )}
        </div>
        {/* Speaking indicator */}
        {isSpeaking && (
          <div style={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            {[0, 1, 2].map((i) => (
              <SpeakingBar key={i} delay={i * 120} color={accent} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Corner bracket SVG-in-div decoration ──────────────────────────────────────
function CornerBrackets({ color, size }: { color: string; size: number }) {
  const s = size;
  const corners = [
    { top: 6, left: 6, rotate: 0 },
    { top: 6, right: 6, rotate: 90 },
    { bottom: 6, right: 6, rotate: 180 },
    { bottom: 6, left: 6, rotate: 270 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: s,
            height: s,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <svg
            width={s}
            height={s}
            viewBox="0 0 10 10"
            fill="none"
            style={{ transform: `rotate(${pos.rotate}deg)`, display: 'block' }}
          >
            <path
              d="M0 8 L0 0 L8 0"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>
      ))}
    </>
  );
}

// ── Animated LIVE red dot ──────────────────────────────────────────────────────
function LiveDot() {
  return (
    <>
      <style>{`
        @keyframes tmi-live-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#ff4444',
        boxShadow: '0 0 5px #ff4444',
        animation: 'tmi-live-blink 1.2s ease-in-out infinite',
        flexShrink: 0,
      }} />
    </>
  );
}

// ── Speaking equalizer bars ────────────────────────────────────────────────────
function SpeakingBar({ delay, color }: { delay: number; color: string }) {
  return (
    <>
      <style>{`
        @keyframes tmi-speak-bar {
          0%, 100% { height: 3px; }
          50%       { height: 10px; }
        }
      `}</style>
      <div style={{
        width: 2,
        borderRadius: 1,
        background: color,
        boxShadow: `0 0 4px ${color}`,
        animation: `tmi-speak-bar 0.7s ease-in-out ${delay}ms infinite`,
      }} />
    </>
  );
}
