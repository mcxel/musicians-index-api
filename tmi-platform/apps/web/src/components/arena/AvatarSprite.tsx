/**
 * PROMPT #3B: Avatar Sprite Component (2.5D Bobblehead)
 * Renders bobblehead with front/back sprites + accessories + emotes
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { AvatarState, EquippedItems } from '@/types/shared';
import { isBackFacingCamera } from './SeatMap';

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

  // Determine if we show back sprite
  const shouldShowBack =
    showBack !== undefined
      ? showBack
      : isBackFacingCamera(seatYaw, cameraYaw);

  // Avatar asset (default to bobblehead-default if not set)
  const frontAsset = avatar.avatarAssetId || '/assets/bobbleheads/default-front.png';
  const backAsset = avatar.avatarAssetId
    ? avatar.avatarAssetId.replace('.png', '-back.png')
    : '/assets/bobbleheads/default-back.png';

  const spriteUrl = shouldShowBack ? backAsset : frontAsset;

  // Handle emote display
  useEffect(() => {
    if (avatar.emoteState && showEmote) {
      const emoteType = avatar.emoteState.emoteId?.toUpperCase() || '';
      setCurrentEmote(emoteType);

      // Auto-clear after duration
      const duration = avatar.emoteState.duration || 2000;
      const timeout = setTimeout(() => {
        setCurrentEmote(null);
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      setCurrentEmote(null);
    }
  }, [avatar.emoteState, showEmote]);

  // Animation classes
  const isWalking = avatar.animationState === 'WALKING' || avatar.animationState === 'walking';
  const isSitting = avatar.animationState === 'SITTING' || avatar.animationState === 'sitting' || avatar.seatId;

  return (
    <div
      className={`avatar-sprite-container ${className}`}
      style={{
        position: 'absolute',
        left: avatar.position?.x || 0,
        top: avatar.position?.y || 0,
        transform: `
          translate(-50%, -50%)
          scale(${scale * (avatar.scale || 1)})
          rotate(${tilt}deg)
        `,
        opacity: avatar.isVisible ? opacity : 0,
        pointerEvents: 'none',
        zIndex: Math.floor((avatar.position?.z || 0) * 10 + 100),
        transition: isWalking ? 'none' : 'left 0.3s ease, top 0.3s ease',
      }}
    >
      {/* Main sprite */}
      <div className="avatar-sprite-body" style={{ position: 'relative', width: 64, height: 64 }}>
        <img
          src={spriteUrl}
          alt={avatar.username}
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
        {showAccessories && avatar.equippedItems && !shouldShowBack && (
          <div className="avatar-accessories" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* Hat */}
            {avatar.equippedItems.hat && ACCESSORY_ASSETS[avatar.equippedItems.hat] && (
              <img
                src={ACCESSORY_ASSETS[avatar.equippedItems.hat].url}
                alt="Hat"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.hat].offsetX}px)`,
                  top: `calc(0% + ${ACCESSORY_ASSETS[avatar.equippedItems.hat].offsetY}px)`,
                  transform: 'translateX(-50%)',
                  width: `${64 * ACCESSORY_ASSETS[avatar.equippedItems.hat].scale}px`,
                  height: 'auto',
                  zIndex: 10,
                }}
              />
            )}

            {/* Shirt */}
            {avatar.equippedItems.shirt && ACCESSORY_ASSETS[avatar.equippedItems.shirt] && (
              <img
                src={ACCESSORY_ASSETS[avatar.equippedItems.shirt].url}
                alt="Shirt"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.shirt].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.shirt].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[avatar.equippedItems.shirt].scale}px`,
                  height: 'auto',
                  zIndex: 5,
                }}
              />
            )}

            {/* Accessory */}
            {avatar.equippedItems.accessory && ACCESSORY_ASSETS[avatar.equippedItems.accessory] && (
              <img
                src={ACCESSORY_ASSETS[avatar.equippedItems.accessory].url}
                alt="Accessory"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.accessory].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.accessory].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[avatar.equippedItems.accessory].scale}px`,
                  height: 'auto',
                  zIndex: 8,
                }}
              />
            )}

            {/* Effect (aura/glow) */}
            {avatar.equippedItems.effect && ACCESSORY_ASSETS[avatar.equippedItems.effect] && (
              <img
                src={ACCESSORY_ASSETS[avatar.equippedItems.effect].url}
                alt="Effect"
                className="animate-pulse"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.effect].offsetX}px)`,
                  top: `calc(50% + ${ACCESSORY_ASSETS[avatar.equippedItems.effect].offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${64 * ACCESSORY_ASSETS[avatar.equippedItems.effect].scale}px`,
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
          {avatar.username}
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
        {avatar.seatId && (
          <div className="avatar-sponsor-badge" style={{ position: 'absolute', top: -10, right: -10, zIndex: 15 }}>
            {/* Badge will be injected by parent if seat has sponsorBadge */}
          </div>
        )}
      </div>

      <style jsx>{`
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
