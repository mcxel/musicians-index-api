'use client';

import React, { useState, useRef } from 'react';

export interface MotionPhotoPreviewProps {
  imageSrc: string;
  motionSrc?: string | null;
  altText?: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  borderColor?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  autoPlay?: boolean;
  style?: React.CSSProperties;
}

/**
 * Universal Motion Photo & Still Image Renderer.
 * Renders 1-7s looping Motion Videos (NFL Draft style) for Performer Articles,
 * YoPho Canvases, Magazine Covers, and Orbital Wheel Cards with static fallback.
 */
export default function MotionPhotoPreview({
  imageSrc,
  motionSrc,
  altText = 'TMI Motion Photo',
  width = '100%',
  height = '100%',
  borderRadius = 12,
  borderColor = 'rgba(255,45,170,0.5)',
  showBadge = true,
  badgeLabel = 'LIVE MOTION',
  autoPlay = true,
  style = {},
}: MotionPhotoPreviewProps) {
  const [isPlayingMotion, setIsPlayingMotion] = useState<boolean>(Boolean(motionSrc && autoPlay));
  const [hasError, setHasError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canPlayMotion = Boolean(motionSrc && !hasError);

  const togglePlayback = () => {
    if (!canPlayMotion) return;
    if (isPlayingMotion) {
      videoRef.current?.pause();
      setIsPlayingMotion(false);
    } else {
      videoRef.current?.play().catch(() => setHasError(true));
      setIsPlayingMotion(true);
    }
  };

  return (
    <div
      onClick={togglePlayback}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        border: `2px solid ${borderColor}`,
        background: '#050510',
        cursor: canPlayMotion ? 'pointer' : 'default',
        boxShadow: `0 0 20px ${borderColor}33`,
        ...style,
      }}
    >
      {canPlayMotion && isPlayingMotion ? (
        <video
          ref={videoRef}
          src={motionSrc!}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={altText}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Motion Photo Badge Overlay */}
      {showBadge && canPlayMotion && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: isPlayingMotion ? 'rgba(255,45,170,0.85)' : 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            padding: '3px 8px',
            fontSize: 9,
            fontWeight: 900,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            letterSpacing: '0.05em',
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isPlayingMotion ? '#00FFFF' : '#FFD700',
              boxShadow: isPlayingMotion ? '0 0 6px #00FFFF' : 'none',
            }}
          />
          {badgeLabel}
        </div>
      )}
    </div>
  );
}
