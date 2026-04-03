"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRankGlow, calculateGlowIntensity } from '@/lib/avatar/bubbleEngine';
import type { BubbleCharacter, DanceMove, EmoteType } from '@/lib/avatar/bubbleEngine';
import type { SkinTone } from '@/lib/avatar/avatarEngine';

interface BubbleCharacterProps {
  bubble: BubbleCharacter;
  size?: number;
  showNameTag?: boolean;
  showRankBadge?: boolean;
  showEmote?: boolean;
  isActive?: boolean;          // on stage / currently performing
  onClick?: () => void;
}

const SKIN_COLOR: Record<SkinTone, string> = {
  fair:   '#F8D5A0',
  light:  '#ECC07A',
  medium: '#D4954A',
  olive:  '#C07830',
  tan:    '#A86028',
  brown:  '#8B4010',
  dark:   '#5A2A08',
  deep:   '#2A1004',
};

const EMOTE_LABEL: Record<EmoteType, string> = {
  fire: '🔥', clap: '👏', 'point-up': '☝️', laugh: '😂', sunglasses: '😎',
  crown: '👑', 'mic-drop': '🎤', 'money-rain': '💸', heart: '❤️', skull: '💀',
};

const DANCE_COLORS: Record<DanceMove, string> = {
  'two-step':       '#00FFFF',
  'bounce':         '#FF2DAA',
  'wave':           '#AA2DFF',
  'snap':           '#FFD700',
  'dab':            '#FF9500',
  'bankroll':       '#00FF88',
  'running-man':    '#FF2200',
  'hit-dem-folks':  '#0088FF',
  'wobble':         '#FF2DAA',
  'moonwalk':       '#FFD700',
};

export default function BubbleCharacterComponent({
  bubble,
  size = 80,
  showNameTag = true,
  showRankBadge = true,
  showEmote = true,
  isActive = false,
  onClick,
}: BubbleCharacterProps) {
  const [emoteVisible, setEmoteVisible] = useState(false);
  const glow = getRankGlow(bubble.rankBadge);
  const glowIntensity = calculateGlowIntensity(bubble.points);
  const skinColor = SKIN_COLOR[bubble.avatar.skinTone] ?? '#D4954A';
  const danceColor = DANCE_COLORS[bubble.currentDance] ?? '#00FFFF';

  // Show emote for 2.5s
  useEffect(() => {
    if (bubble.activeEmote) {
      setEmoteVisible(true);
      const t = setTimeout(() => setEmoteVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [bubble.activeEmote]);

  // Idle bounce animation
  const bounceAnim = bubble.avatar.animation === 'idle-bounce'
    ? { y: [0, -size * 0.06, 0] }
    : bubble.avatar.animation === 'sway'
    ? { x: [0, size * 0.04, 0, -size * 0.04, 0] }
    : bubble.avatar.animation === 'nod'
    ? { rotateZ: [0, 2, 0, -2, 0] }
    : {};

  const bubbleSize = size;
  const headSize = bubbleSize * 0.6;
  const hairH = headSize * 0.35;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Glow ring */}
      <motion.div
        animate={{ scale: isActive ? [1, 1.07, 1] : 1, opacity: isActive ? 1 : glowIntensity * 0.6 }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 1.2 }}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: bubbleSize * 1.1,
          height: bubbleSize * 1.1,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow}33 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Avatar bubble */}
      <motion.div
        animate={bounceAnim}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        whileHover={onClick ? { scale: 1.08 } : {}}
        onClick={onClick}
        style={{
          position: 'relative',
          width: bubbleSize,
          height: bubbleSize,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${skinColor}CC, ${skinColor}88)`,
          border: `2px solid ${glow}`,
          boxShadow: `0 0 ${12 * glowIntensity}px ${glow}${Math.round(glowIntensity * 99).toString(16).padStart(2, '0')}`,
          cursor: onClick ? 'pointer' : 'default',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Hair */}
        {bubble.avatar.hairStyle !== 'bald' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: hairH,
            background: bubble.avatar.hairColor,
            borderRadius: `${headSize}px ${headSize}px 0 0`,
          }} />
        )}

        {/* Hat */}
        {bubble.avatar.hatStyle !== 'none' && (
          <div style={{
            position: 'absolute', top: -4, left: '10%', right: '10%',
            height: bubbleSize * 0.18,
            background: bubble.avatar.hatColor,
            borderRadius: 4,
            zIndex: 2,
          }} />
        )}

        {/* Eyes */}
        <div style={{ position: 'absolute', top: '38%', left: '25%', width: bubbleSize * 0.12, height: bubbleSize * 0.12, background: bubble.avatar.eyeColor, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '38%', right: '25%', width: bubbleSize * 0.12, height: bubbleSize * 0.12, background: bubble.avatar.eyeColor, borderRadius: '50%' }} />

        {/* Glasses */}
        {bubble.avatar.glassesStyle !== 'none' && (
          <div style={{
            position: 'absolute', top: '35%', left: '18%', right: '18%',
            height: bubbleSize * 0.18,
            background: 'transparent',
            border: `2px solid ${bubble.avatar.clothesColor}`,
            borderRadius: bubble.avatar.glassesStyle === 'shades' ? 2 : 8,
            opacity: 0.9,
          }} />
        )}

        {/* Crown for legend/host */}
        {bubble.hasCrown && (
          <div style={{
            position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
            fontSize: bubbleSize * 0.18,
            lineHeight: 1,
          }}>👑</div>
        )}

        {/* Dance indicator ring */}
        {isActive && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -4,
              borderRadius: '50%',
              border: `3px dashed ${danceColor}88`,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Emote pop */}
      <AnimatePresence>
        {showEmote && emoteVisible && bubble.activeEmote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -bubbleSize * 0.6 }}
            exit={{ opacity: 0, scale: 0.8, y: -bubbleSize * 0.8 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              top: 0,
              fontSize: bubbleSize * 0.3,
              pointerEvents: 'none',
            }}
          >
            {EMOTE_LABEL[bubble.activeEmote]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name tag */}
      {showNameTag && (
        <div style={{
          maxWidth: bubbleSize * 1.8,
          padding: '2px 8px',
          background: `${glow}22`,
          border: `1px solid ${glow}55`,
          borderRadius: 4,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: bubble.nameTagColor, fontSize: Math.max(9, bubbleSize * 0.13), fontWeight: 700 }}>
            {bubble.displayName}
          </span>
        </div>
      )}

      {/* Rank badge */}
      {showRankBadge && (
        <div style={{
          padding: '1px 6px',
          background: `${glow}33`,
          borderRadius: 3,
        }}>
          <span style={{ color: glow, fontSize: Math.max(8, bubbleSize * 0.10), letterSpacing: 1 }}>
            {bubble.rankBadge.toUpperCase()}
          </span>
        </div>
      )}

      {/* Points glow strip */}
      {bubble.points > 0 && (
        <div style={{ fontSize: Math.max(8, bubbleSize * 0.10), color: '#FFD700', letterSpacing: 1 }}>
          {bubble.points.toLocaleString()} PTS
        </div>
      )}
    </div>
  );
}
