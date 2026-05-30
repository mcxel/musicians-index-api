'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LiverySponsor {
  id: string;
  name: string;
  logoUrl: string;
  type: 'local' | 'major';
  tierColor?: string;
}

interface SponsorLiveryOverlayProps {
  sponsors: LiverySponsor[];
  onSponsorClick?: (sponsor: LiverySponsor) => void;
}

// Deterministic livery positions anchored around a performer silhouette.
// Coordinates are percentage offsets from center (0,0).
// Layout mimics a racing suit: shoulders, chest, arms, hips — no grid.
const LIVERY_SLOTS = [
  // Major sponsor slots — prime real estate
  { x: -110, y: -90,  rotation: -8,  scale: 1.15, priority: 'major' },  // left shoulder
  { x:  110, y: -90,  rotation:  8,  scale: 1.15, priority: 'major' },  // right shoulder
  { x:    0, y: -130, rotation:  0,  scale: 1.1,  priority: 'major' },  // chest center
  { x: -125, y:  20,  rotation: -12, scale: 1.0,  priority: 'major' },  // left arm
  { x:  125, y:  20,  rotation:  12, scale: 1.0,  priority: 'major' },  // right arm
  // Local sponsor slots — distributed around the body
  { x: -80,  y:  80,  rotation: -6,  scale: 0.85, priority: 'local' },  // left hip
  { x:  80,  y:  80,  rotation:  6,  scale: 0.85, priority: 'local' },  // right hip
  { x: -55,  y: -45,  rotation: -10, scale: 0.8,  priority: 'local' },  // left chest
  { x:  55,  y: -45,  rotation:  10, scale: 0.8,  priority: 'local' },  // right chest
  { x:    0, y:  110, rotation:  0,  scale: 0.8,  priority: 'local' },  // lower center
  { x: -140, y: -20,  rotation: -15, scale: 0.75, priority: 'local' },  // far left arm
  { x:  140, y: -20,  rotation:  15, scale: 0.75, priority: 'local' },  // far right arm
  { x: -95,  y:  140, rotation: -8,  scale: 0.7,  priority: 'local' },  // left leg
  { x:  95,  y:  140, rotation:  8,  scale: 0.7,  priority: 'local' },  // right leg
  { x:    0, y: -160, rotation:  3,  scale: 0.7,  priority: 'local' },  // collar
];

function DecalItem({
  sponsor,
  slot,
  index,
  onSponsorClick,
}: {
  sponsor: LiverySponsor;
  slot: typeof LIVERY_SLOTS[number];
  index: number;
  onSponsorClick?: (s: LiverySponsor) => void;
}) {
  const accentColor = sponsor.tierColor ?? (sponsor.type === 'major' ? '#FFD700' : '#AA2DFF');
  const isMajor = sponsor.type === 'major';
  const w = isMajor ? 88 : 68;
  const h = isMajor ? 44 : 34;

  return (
    <motion.div
      key={sponsor.id}
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      animate={{
        scale: slot.scale,
        rotate: slot.rotation,
        opacity: 1,
        x: slot.x,
        y: slot.y,
      }}
      exit={{ scale: 0, opacity: 0, rotate: slot.rotation + 10 }}
      transition={{
        type: 'spring',
        damping: 14,
        stiffness: 160,
        delay: index * 0.07,
      }}
      whileHover={{ scale: (slot.scale ?? 1) * 1.12, zIndex: 30 }}
      onClick={onSponsorClick ? () => onSponsorClick(sponsor) : undefined}
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: 4,
        background: `linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35))`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${accentColor}35`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 8px ${accentColor}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onSponsorClick ? 'pointer' : 'default',
        pointerEvents: onSponsorClick ? 'auto' : 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Gloss sheen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Accent edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
        pointerEvents: 'none',
      }} />

      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          style={{ width: '80%', height: '80%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
        />
      ) : (
        <span style={{
          fontSize: isMajor ? 11 : 9, fontWeight: 900, color: accentColor,
          letterSpacing: '0.06em', textTransform: 'uppercase', position: 'relative', zIndex: 1,
        }}>
          {sponsor.name.slice(0, 10)}
        </span>
      )}
    </motion.div>
  );
}

export default function SponsorLiveryOverlay({
  sponsors,
  onSponsorClick,
}: SponsorLiveryOverlayProps) {
  // Sort: major sponsors get the prime slots first
  const sorted = useMemo(
    () => [...sponsors].sort((a, b) => (a.type === 'major' ? -1 : b.type === 'major' ? 1 : 0)),
    [sponsors],
  );

  if (!sorted.length) return null;

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
        {sorted.map((sponsor, i) => {
          const slot = LIVERY_SLOTS[i % LIVERY_SLOTS.length];
          return (
            <DecalItem
              key={sponsor.id}
              sponsor={sponsor}
              slot={slot}
              index={i}
              onSponsorClick={onSponsorClick}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
