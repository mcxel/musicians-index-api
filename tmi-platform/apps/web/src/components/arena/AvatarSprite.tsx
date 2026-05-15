/**
 * PROMPT #3B: Avatar Sprite Component (2.5D Bobblehead)
 * Renders bobblehead with front/back sprites + accessories + emotes
 */

'use client';

import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import type { AvatarState } from '@/types/shared';
import { isBackFacingCamera } from './SeatMap';

type Vec2 = { x: number; y: number; z?: number };

export interface AvatarSpriteProps {
  avatar: AvatarState;
  cameraYaw?: number;
  seatYaw?: number;
  showBack?: boolean;
  scale?: number;
  tilt?: number;
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

  const equipped = (av.equippedItems as Record<string, string>) ?? {};

  const shouldShowBack = showBack !== undefined ? showBack : isBackFacingCamera(seatYaw, cameraYaw);

  const frontAsset = av.avatarAssetId || '/assets/bobbleheads/default-front.png';
  const backAsset = av.avatarAssetId
    ? av.avatarAssetId.replace('.png', '-back.png')
    : '/assets/bobbleheads/default-back.png';

  const spriteUrl = shouldShowBack ? backAsset : frontAsset;
  const roomId = `arena-${av.seatId ?? 'default'}`;

  useEffect(() => {
    if (av.emoteState && showEmote) {
      const emoteType = av.emoteState.emoteId?.toUpperCase() || '';
      setCurrentEmote(emoteType);
      const duration = typeof av.emoteState.duration === 'number' ? av.emoteState.duration : 2000;
      const timeout = setTimeout(() => setCurrentEmote(null), duration);
      return () => clearTimeout(timeout);
    }
    setCurrentEmote(null);
  }, [av.emoteState, showEmote]);

  return (
    <div
      className={`avatar-sprite-container ${className}`}
      style={{
        position: 'absolute',
        left: av.position?.x || 0,
        top: av.position?.y || 0,
        transform: `translate(-50%, -50%) scale(${scale * (av.scale || 1)}) rotate(${tilt}deg)`,
        opacity: av.isVisible ? opacity : 0,
        pointerEvents: 'none',
        zIndex: Math.floor(((av.position?.z as number) || 0) * 10 + 100),
        transition: av.animationState === 'WALKING' || av.animationState === 'walking' ? 'none' : 'left 0.3s ease, top 0.3s ease',
      }}
    >
      <div className="avatar-sprite-body" style={{ position: 'relative', width: 64, height: 64 }}>
        <ImageSlotWrapper
          imageId={`avatar-sprite-${av.seatId ?? 'default'}-${shouldShowBack ? 'back' : 'front'}`}
          roomId={roomId}
          priority="high"
          fallbackUrl={spriteUrl}
          altText={`${av.username ?? 'Avatar'} sprite`}
          className="w-full h-full object-contain"
          containerStyle={{ width: '100%', height: '100%' }}
        />

        {showAccessories && Object.keys(equipped).length > 0 && !shouldShowBack && (
          <div className="avatar-accessories" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {equipped.hat && ACCESSORY_ASSETS[equipped.hat] && (
              <ImageSlotWrapper
                imageId={`avatar-hat-${equipped.hat}`}
                roomId={roomId}
                priority="normal"
                fallbackUrl={ACCESSORY_ASSETS[equipped.hat].url}
                altText="Avatar hat"
                className="w-full h-full object-contain"
                containerStyle={{ width: '100%', height: '100%' }}
              />
            )}
            {equipped.shirt && ACCESSORY_ASSETS[equipped.shirt] && (
              <ImageSlotWrapper
                imageId={`avatar-shirt-${equipped.shirt}`}
                roomId={roomId}
                priority="normal"
                fallbackUrl={ACCESSORY_ASSETS[equipped.shirt].url}
                altText="Avatar shirt"
                className="w-full h-full object-contain"
                containerStyle={{ width: '100%', height: '100%' }}
              />
            )}
            {equipped.accessory && ACCESSORY_ASSETS[equipped.accessory] && (
              <ImageSlotWrapper
                imageId={`avatar-accessory-${equipped.accessory}`}
                roomId={roomId}
                priority="normal"
                fallbackUrl={ACCESSORY_ASSETS[equipped.accessory].url}
                altText="Avatar accessory"
                className="w-full h-full object-contain"
                containerStyle={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default AvatarSprite;
