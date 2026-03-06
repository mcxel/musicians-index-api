/**
 * PROMPT #3B: Avatar Sprite Component (2.5D Bobblehead)
 * Renders bobblehead with front/back sprites + accessories + emotes
 */

'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import type { AvatarState } from '@/types/shared';
import { isBackFacingCamera } from './SeatMap';

type Vec2 = { x: number; y: number; z?: number };

export interface AvatarSpriteProps {
  avatar: AvatarState;
  cameraYaw?: number; // Camera angle (default 270 = looking down from top)
  seatYaw?: number; // Seat facing angle
  showBack?: boolean; //  Override: force back sprite
  scale?: number;
  tilt?: number; // Rotation in degrees (for wobble)
  opacity?: number;
  showAccessories?: boolean;
  showEmote?: boolean;
  className?: string;
}

interface AccessoryAsset {
  url: string;
  offsetX: number;
  offsetY: number;
  scale: number;
}

// Accessory asset registry (future: load from API)
const ACCESSORY_ASSETS: Record<string, AccessoryAsset> = {
  'hat-party': { url: '/assets/accessories/hat-party.png', offsetX: 0, offsetY: -30, scale: 0.8 },
  'hat-crown': { url: '/assets/accessories/hat-crown.png', offsetX: 0, offsetY: -35, scale: 0.9 },
  'shirt-sponsor-pepsi': { url: '/assets/accessories/shirt-pepsi.png', offsetX: 0, offsetY: 10, scale: 1.0 },
  'shirt-sponsor-nike': { url: '/assets/accessories/shirt-nike.png', offsetX: 0, offsetY: 10, scale: 1.0 },
  'accessory-sunglasses': { url: '/assets/accessories/sunglasses.png', offsetX: 0, offsetY: -5, scale: 0.7 },
  'accessory-headphones': { url: '/assets/accessories/headphones.png', offsetX: 0, offsetY: -8, scale: 0.9 },
  'effect-glow': { url: '/assets/effects/glow.png', offsetX: 0, offsetY: 0, scale: 1.2 },
  'effect-sparkle': { url: '/assets/effects/sparkle.png', offsetX: 0, offsetY: -20, scale: 1.0 },
};

// Emote emoji map (future: animated sprites)
const EMOTE_EMOJI: Record<string, string> = {
  WAVE: '👋',
  CLAP: '👏',
  DANCE: '💃',
  CHEER: '🎉',
  THUMBS_UP: '👍',
  HEART: '❤️',
  FIRE: '🔥',
  STAR: '⭐',
  SPONSOR_BOUNCE: '🎁',
};

export const AvatarSprite: React.FC<AvatarSpriteProps> = ({
  avatar,
  cameraYaw = 270,
  seatYaw = 90,
  showBack,
  scale = 1,
  tilt = 0,
  opacity = 1,
  showAccessories = true,
  showEmote = true,
  className = '',
}) => {
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);

  // Narrow `avatar` (was indexed with unknown) into a local typed view for safe access
  const av = avatar as unknown as {
    avatarAssetId?: string;
    emoteState?: { emoteId?: string; duration?: number } | null;
    animationState?: string | null;
    equippedItems?: Record<string, string> | null;
    position?: Vec2;
    scale?: number | undefined;
    isVisible?: boolean | undefined;
    username?: string | undefined;
    seatId?: string | undefined;
  };

  const equipped = (av.equippedItems as unknown as Record<string, string>) ?? {};

  // Determine if we show back sprite
  const shouldShowBack =
    showBack !== undefined
      ? showBack
      : isBackFacingCamera(seatYaw, cameraYaw);

  // Avatar asset (default to bobblehead-default if not set)
  const frontAsset = av.avatarAssetId || '/assets/bobbleheads/default-front.png';
  const backAsset = av.avatarAssetId
    ? av.avatarAssetId.replace('.png', '-back.png')
    : '/assets/bobbleheads/default-back.png';

  const spriteUrl = shouldShowBack ? backAsset : frontAsset;

  // Handle emote display
  useEffect(() => {
    if (av.emoteState && showEmote) {
      const emoteType = av.emoteState.emoteId?.toUpperCase() || '';
      setCurrentEmote(emoteType);

      // Auto-clear after duration
      const duration = typeof av.emoteState.duration === 'number' ? av.emoteState.duration : 2000;
      const timeout = setTimeout(() => {
        setCurrentEmote(null);
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      setCurrentEmote(null);
    }
  }, [av.emoteState, showEmote]);

  // Animation classes
  const isWalking = av.animationState === 'WALKING' || av.animationState === 'walking';

  return (
    <div
      className={`avatar-sprite-container ${className}`}
      style={{
        position: 'absolute',
        left: av.position?.x || 0,
        top: av.position?.y || 0,
        transform: `
              translate(-50%, -50%)
              scale(${scale * (av.scale || 1)})
              rotate(${tilt}deg)
            `,
            opacity: av.isVisible ? opacity : 0,
            pointerEvents: 'none',
            zIndex: Math.floor(((av.position?.z as number) || 0) * 10 + 100),
        transition: isWalking ? 'none' : 'left 0.3s ease, top 0.3s ease',
      }}
    >
      {/* Main sprite */}
      <div className="avatar-sprite-body" style={{ position: 'relative', width: 64, height: 64 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spriteUrl}
          alt={av.username}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
          onError={(e) => {
            // Fallback to default if asset fails to load
            e.currentTarget.src = shouldShowBack
              ? '/assets/bobbleheads/default-back.png'
              : '/assets/bobbleheads/default-front.png';
          }}
            />

        {/* Accessories (only show if not back view or if accessory is visible from back) */}
        {showAccessories && Object.keys(equipped).length > 0 && !shouldShowBack && (
          <div className="avatar-accessories" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* Hat */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {equipped.hat && ACCESSORY_ASSETS[equipped.hat] && (
              <img
                src={ACCESSORY_ASSETS[equipped.hat].url}
                alt="Hat"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[equipped.hat].offsetX}px)`,
                  top: `calc(0% + ${ACCESSORY_ASSETS[equipped.hat].offsetY}px)`,
                  transform: 'translateX(-50%)',
                  width: `${64 * ACCESSORY_ASSETS[equipped.hat].scale}px`,
                  height: 'auto',
                  zIndex: 10,
                }}
              />
            )}

            {/* Shirt */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {equipped.shirt && ACCESSORY_ASSETS[equipped.shirt] && (
              <img
                src={ACCESSORY_ASSETS[equipped.shirt].url}
                alt="Shirt"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[equipped.shirt].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[equipped.shirt].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[equipped.shirt].scale}px`,
                  height: 'auto',
                  zIndex: 5,
                }}
              />
            )}

            {/* Accessory */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {equipped.accessory && ACCESSORY_ASSETS[equipped.accessory] && (
              <img
                src={ACCESSORY_ASSETS[equipped.accessory].url}
                alt="Accessory"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[equipped.accessory].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[equipped.accessory].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[equipped.accessory].scale}px`,
                  height: 'auto',
                  zIndex: 8,
                }}
              />
            )}

            {/* Effect (aura/glow) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {equipped.effect && ACCESSORY_ASSETS[equipped.effect] && (
              <img
                src={ACCESSORY_ASSETS[equipped.effect].url}
                alt="Effect"
                className="animate-pulse"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[equipped.effect].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[equipped.effect].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[equipped.effect].scale}px`,
                  height: 'auto',
                  zIndex: 1,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        )}

        {/* Username label */}
        <div
          className="avatar-username"
          style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            padding: '2px 6px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 4,
          }}
        >
          {av.username}
        </div>

        {/* Emote overlay */}
        {currentEmote && showEmote && EMOTE_EMOJI[currentEmote] && (
          <div
            className="avatar-emote animate-bounce"
            style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 32,
              zIndex: 20,
              animation: 'float 0.6s ease-in-out infinite alternate',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {EMOTE_EMOJI[currentEmote]}
          </div>
        )}

        {/* Sponsor badge (if VIP seat with sponsor) */}
        {av.seatId && (
          <div className="avatar-sponsor-badge" style={{ position: 'absolute', top: -10, right: -10, zIndex: 15 }}>
            {/* Badge will be injected by parent if seat has sponsorBadge */}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          from {
            transform: translateX(-50%) translateY(0);
          }
          to {
            transform: translateX(-50%) translateY(-8px);
          }
        }

        .avatar-sprite-container {
          will-change: transform, opacity;
        }

        .avatar-emote {
          animation: float 0.6s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default AvatarSprite;
