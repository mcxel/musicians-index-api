'use client';

/**
 * HostAvatarPortrait — animated host entity card.
 *
 * Honest intermediate step toward the full bobblehead HostCharacterRuntime:
 * - Portrait image with framer-motion idle animations (sway, blink, breathe)
 * - State-driven visual changes (talking = glow, celebrating = bounce, idle = calm)
 * - Motion tag from HostIdentityRegistry drives the animation variant
 * - Current dialogue line displayed as a speech bubble
 * - Role badge (MAIN_HOST / CO_HOST / BATTLE_REF / etc.)
 *
 * Per Rule 18 Asset Realization Directive: does NOT pretend to be 3D or
 * face-scan driven. What it IS: a real, animated entity card that reacts to
 * HostEntityRuntime state changes. When the full HostCharacterRuntime exists,
 * this component gets replaced — not extended.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  onHostEntitiesChange,
  type HostEntity,
  type HostEntityState,
} from '@/lib/live/HostEntityRuntime';

// ─── State → animation variant ────────────────────────────────────────────────

const STATE_VARIANTS: Record<HostEntityState, object> = {
  idle: {
    animate: { y: [0, -3, 0], scale: [1, 1.01, 1] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  talking: {
    animate: { scale: [1, 1.03, 1, 1.03, 1] },
    transition: { duration: 0.6, repeat: Infinity },
  },
  reacting: {
    animate: { rotate: [-2, 2, -2, 2, 0], scale: [1, 1.05, 1] },
    transition: { duration: 0.4, repeat: 3 },
  },
  gesturing: {
    animate: { x: [0, 6, -6, 0], y: [0, -4, 0] },
    transition: { duration: 0.5 },
  },
  entering: {
    animate: { x: [60, 0], opacity: [0, 1], scale: [0.85, 1] },
    transition: { duration: 0.6, type: 'spring', stiffness: 300, damping: 22 },
  },
  exiting: {
    animate: { x: [0, -60], opacity: [1, 0], scale: [1, 0.85] },
    transition: { duration: 0.5 },
  },
  celebrating: {
    animate: { y: [0, -12, 0, -8, 0], scale: [1, 1.08, 1, 1.05, 1], rotate: [-3, 3, -3, 3, 0] },
    transition: { duration: 0.8, repeat: 3 },
  },
  hushing: {
    animate: { scale: [1, 0.97, 1], y: [0, 1, 0] },
    transition: { duration: 1.2, repeat: 2 },
  },
  pointing: {
    animate: { x: [0, 8, 8, 0], rotate: [0, 6, 6, 0] },
    transition: { duration: 0.8 },
  },
  laughing: {
    animate: { y: [0, -5, 0, -5, 0], scale: [1, 1.04, 1, 1.04, 1] },
    transition: { duration: 0.4, repeat: 4 },
  },
};

// ─── Role badge labels ─────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  MAIN_HOST:        'HOST',
  CO_HOST:          'CO-HOST',
  CYPHER_JUDGE:     'JUDGE',
  PRIZE_HOST:       'PRIZE HOST',
  CROWD_HYPE:       'HYPE',
  BATTLE_REF:       'REF',
  PA_ANNOUNCER:     'ANNOUNCER',
  PLATFORM_AUTHORITY: 'AUTHORITY',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface HostAvatarPortraitProps {
  hostId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showBadge?: boolean;
  showDialogue?: boolean;
  onStageOnly?: boolean;
}

const SIZE_MAP = { sm: 64, md: 88, lg: 120 };

// ─── Component ────────────────────────────────────────────────────────────────

export default function HostAvatarPortrait({
  hostId,
  size = 'md',
  showName = true,
  showBadge = true,
  showDialogue = true,
  onStageOnly = false,
}: HostAvatarPortraitProps) {
  const [entity, setEntity] = useState<HostEntity | null>(null);
  const px = SIZE_MAP[size];

  useEffect(() => {
    return onHostEntitiesChange(entities => {
      const found = entities.find(e => e.identity.id === hostId);
      setEntity(found ?? null);
    });
  }, [hostId]);

  if (!entity) return null;
  if (onStageOnly && !entity.onStage) return null;

  const { identity, state, currentLine } = entity;
  const variant = STATE_VARIANTS[state] ?? STATE_VARIANTS.idle;
  const roleLabel = ROLE_LABELS[identity.role] ?? identity.role;
  const accentColor = identity.colorHex;
  const isTalking = state === 'talking' || state === 'gesturing' || state === 'reacting';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>

      {/* Speech bubble — appears when host has a current line */}
      <AnimatePresence>
        {showDialogue && currentLine && (
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{
              maxWidth: px * 2.2,
              padding: '6px 10px',
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}44`,
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '.04em',
              textAlign: 'center',
              position: 'relative',
              lineHeight: 1.4,
            }}
          >
            {currentLine}
            {/* Bubble tail */}
            <span style={{
              position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `6px solid ${accentColor}44`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portrait */}
      <motion.div
        {...(variant as object)}
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2.5px solid ${isTalking ? accentColor : `${accentColor}66`}`,
          boxShadow: isTalking
            ? `0 0 20px ${accentColor}88, 0 0 8px ${accentColor}44`
            : `0 0 12px ${accentColor}33`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          background: `linear-gradient(135deg, ${accentColor}22, rgba(0,0,0,0.8))`,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Portrait image — falls back to styled initials if image missing */}
        <img
          src={`/hosts/${identity.id}.png`}
          alt={identity.name}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
          }}
        />
        {/* Initials fallback (always in DOM, hidden behind image) */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: px * 0.3, fontWeight: 900, color: accentColor,
          letterSpacing: '-.02em',
          zIndex: -1,
        }}>
          {identity.shortName.slice(0, 2).toUpperCase()}
        </div>

        {/* On-stage LIVE indicator */}
        {entity.onStage && (
          <div style={{
            position: 'absolute', bottom: 3, right: 3,
            width: 10, height: 10, borderRadius: '50%',
            background: '#FF2020',
            boxShadow: '0 0 6px #FF2020',
            animation: 'hostBlink 1s step-end infinite',
          }} />
        )}
      </motion.div>

      {/* Name */}
      {showName && (
        <div style={{
          fontSize: size === 'sm' ? 8 : 10,
          fontWeight: 900,
          color: accentColor,
          letterSpacing: '.06em',
          textAlign: 'center',
          maxWidth: px * 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {identity.shortName}
        </div>
      )}

      {/* Role badge */}
      {showBadge && (
        <div style={{
          fontSize: 7,
          fontWeight: 900,
          color: '#050310',
          background: accentColor,
          borderRadius: 4,
          padding: '2px 6px',
          letterSpacing: '.1em',
        }}>
          {roleLabel}
        </div>
      )}

      <style>{`
        @keyframes hostBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
