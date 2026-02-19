/**
 * PROMPT #3B: Emote Overlay Renderer
 * Displays emote animations above avatars with sponsor-branded options
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { EmoteType } from '@/types/shared';

export interface EmoteInstance {
  id: string;
  userId: string;
  emoteType: EmoteType;
  position: { x: number; y: number };
  startTime: number;
  duration: number;
}

export interface EmoteOverlayProps {
  emotes: EmoteInstance[];
  className?: string;
}

// Emote visual assets (emoji + optional particle effects)
const EMOTE_VISUALS: Record<
  EmoteType,
  {
    emoji: string;
    color: string;
    particleCount?: number;
    particleColor?: string;
    scale?: number;
  }
> = {
  WAVE: { emoji: '👋', color: '#FFD700', particleCount: 3, particleColor: '#FFF' },
  CLAP: { emoji: '👏', color: '#FF6B6B', particleCount: 5, particleColor: '#FFD700' },
  DANCE: { emoji: '💃', color: '#E91E63', particleCount: 8, particleColor: '#FF1493', scale: 1.2 },
  CHEER: { emoji: '🎉', color: '#4CAF50', particleCount: 12, particleColor: '#FFD700' },
  THUMBS_UP: { emoji: '👍', color: '#2196F3', particleCount: 2, particleColor: '#4FC3F7' },
  HEART: { emoji: '❤️', color: '#FF1744', particleCount: 6, particleColor: '#FF8A80', scale: 1.1 },
  FIRE: { emoji: '🔥', color: '#FF5722', particleCount: 10, particleColor: '#FF9800', scale: 1.3 },
  STAR: { emoji: '⭐', color: '#FFC107', particleCount: 8, particleColor: '#FFD54F', scale: 1.1 },
  SPONSOR_BOUNCE: { emoji: '🎁', color: '#9C27B0', particleCount: 15, particleColor: '#BA68C8', scale: 1.4 },
};

export const EmoteOverlay: React.FC<EmoteOverlayProps> = ({ emotes, className = '' }) => {
  const [activeEmotes, setActiveEmotes] = useState<EmoteInstance[]>([]);

  useEffect(() => {
    const now = Date.now();
    const active = emotes.filter((e) => now - e.startTime < e.duration);
    setActiveEmotes(active);

    // Cleanup expired emotes
    if (active.length !== emotes.length) {
      const timeout = setTimeout(() => {
        setActiveEmotes(emotes.filter((e) => Date.now() - e.startTime < e.duration));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [emotes]);

  return (
    <div className={`emote-overlay ${className}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      {activeEmotes.map((emote) => {
        const visual = EMOTE_VISUALS[emote.emoteType];
        const elapsed = Date.now() - emote.startTime;
        const progress = Math.min(elapsed / emote.duration, 1);

        // Rise animation
        const yOffset = -60 * progress; // Float upward
        const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2; // Fade at end
        const scale = (visual.scale || 1) * (1 + 0.3 * Math.sin(progress * Math.PI)); // Pulse

        return (
          <div
            key={emote.id}
            className="emote-instance"
            style={{
              position: 'absolute',
              left: emote.position.x,
              top: emote.position.y + yOffset,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              transition: 'none',
              fontSize: 48,
              filter: `drop-shadow(0 0 8px ${visual.color})`,
            }}
          >
            {visual.emoji}

            {/* Particles (simple burst effect) */}
            {visual.particleCount &&
              visual.particleCount > 0 &&
              progress < 0.6 &&
              Array.from({ length: visual.particleCount }).map((_, i) => {
                const angle = (i / visual.particleCount!) * 2 * Math.PI;
                const distance = 40 * progress;
                const px = Math.cos(angle) * distance;
                const py = Math.sin(angle) * distance;
                const pOpacity = 1 - progress / 0.6;

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: visual.particleColor || visual.color,
                      opacity: pOpacity,
                      boxShadow: `0 0 4px ${visual.particleColor || visual.color}`,
                    }}
                  />
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default EmoteOverlay;