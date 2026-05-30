'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BubbleSponsor {
  id: string;
  name: string;
  logoUrl: string;
  type: 'local' | 'major';
  tierColor?: string;
}

interface SponsorBubbleOverlayProps {
  sponsors: BubbleSponsor[];
  orbitRadius?: number;
  /** Called when a bubble is clicked — show profile/info card */
  onSponsorClick?: (sponsor: BubbleSponsor) => void;
}

// Deterministic position calculation — no Math.random() at render time
// to avoid SSR/hydration mismatch.
function getOrbitPosition(
  index: number,
  total: number,
  baseRadius: number,
): { x: number; y: number; floatDuration: number } {
  // Spread sponsors around a full orbit with slight radius variation per index
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radiusVariance = (index % 3) * 15; // deterministic variance: 0, 15, 30
  const radius = baseRadius + radiusVariance;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    floatDuration: 3.5 + (index % 4) * 0.6, // 3.5 → 5.3s cycle, deterministic
  };
}

const BUBBLE_PALETTE = [
  '#FFD700', // gold
  '#AA2DFF', // purple
  '#FF2DAA', // fuchsia
  '#00FFFF', // cyan
  '#00FF88', // green
  '#FF6B35', // orange
  '#FF4444', // red
  '#4DFFB4', // mint
  '#7B61FF', // indigo
  '#FFAB00', // amber
  '#00C2FF', // sky blue
  '#FF1744', // crimson
];

function BubbleItem({
  sponsor,
  index,
  total,
  orbitRadius,
  onSponsorClick,
}: {
  sponsor: BubbleSponsor;
  index: number;
  total: number;
  orbitRadius: number;
  onSponsorClick?: (sponsor: BubbleSponsor) => void;
}) {
  const [burst, setBurst] = useState(false);
  const { x, y, floatDuration } = useMemo(
    () => getOrbitPosition(index, total, orbitRadius),
    [index, total, orbitRadius],
  );

  const accentColor = BUBBLE_PALETTE[index % BUBBLE_PALETTE.length] ?? '#00FFFF';

  function handleClick() {
    setBurst(true);
    setTimeout(() => {
      setBurst(false);
      onSponsorClick?.(sponsor);
    }, 220);
  }

  return (
    <motion.div
      key={sponsor.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={burst ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1, x, y }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        damping: 10,
        stiffness: 80,
        delay: index * 0.08,
      }}
      onClick={onSponsorClick ? handleClick : undefined}
      style={{
        position: 'absolute',
        width: sponsor.type === 'major' ? 72 : 56,
        height: sponsor.type === 'major' ? 72 : 56,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(0,0,0,0.45))`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 0 18px ${accentColor}18, inset 0 0 10px rgba(255,255,255,0.04)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onSponsorClick ? 'pointer' : 'default',
        pointerEvents: onSponsorClick ? 'auto' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Perpetual float animation on the inner logo */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: floatDuration, ease: 'easeInOut' }}
        style={{ width: '60%', height: '60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          // Fallback: initials badge when no logo yet
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: `${accentColor}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, color: accentColor, letterSpacing: '0.05em',
          }}>
            {sponsor.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </motion.div>

      {/* Major sponsor accent ring */}
      {sponsor.type === 'major' && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -2,
            borderRadius: '50%',
            border: `1px solid ${accentColor}50`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
}

export default function SponsorBubbleOverlay({
  sponsors,
  orbitRadius = 180,
  onSponsorClick,
}: SponsorBubbleOverlayProps) {
  if (!sponsors.length) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <AnimatePresence>
        {sponsors.map((sponsor, i) => (
          <BubbleItem
            key={sponsor.id}
            sponsor={sponsor}
            index={i}
            total={sponsors.length}
            orbitRadius={orbitRadius}
            onSponsorClick={onSponsorClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Legendary pulse — call this when crowd energy spikes ─────────────────────
// Wrap the overlay in a container and apply this class/style to trigger the bloom.
// Usage: add class "sponsor-bubble-legendary" to the parent container.

export const LEGENDARY_PULSE_KEYFRAMES = `
@keyframes sponsorLegendaryBloom {
  0%   { filter: brightness(1) blur(0px); }
  10%  { filter: brightness(2.5) blur(1px); }
  25%  { filter: brightness(1.6) blur(0px); }
  100% { filter: brightness(1) blur(0px); }
}
.sponsor-bubble-legendary {
  animation: sponsorLegendaryBloom 0.8s ease-out forwards;
}
`;
