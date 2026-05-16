'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

interface GovernedMonitorSlotProps {
  /** Image IDs to cycle through (authority-bound) */
  governedImageIds: string[];
  /** Room ID for authority context */
  roomId: string;
  /** Fallback images if governed images unavailable */
  fallbackImages?: string[];
  /** Display label */
  label?: string;
  /** Aspect ratio */
  aspectRatio?: number;
  /** Priority: critical, high, normal, deferred */
  priority?: 'critical' | 'high' | 'normal' | 'deferred';
}

export default function GovernedMonitorSlot({
  governedImageIds,
  roomId,
  fallbackImages = [],
  label,
  aspectRatio = 16 / 9,
  priority = 'normal',
}: GovernedMonitorSlotProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useGovernedMode, setUseGovernedMode] = useState(true);

  const totalImages = useGovernedMode ? governedImageIds.length : fallbackImages.length;

  useEffect(() => {
    if (totalImages === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, 3000);
    return () => clearInterval(interval);
  }, [totalImages]);

  // If no governed images, use fallback
  if (governedImageIds.length === 0 && fallbackImages.length > 0) {
    return (
      <FallbackMonitorSlot
        images={fallbackImages}
        label={label}
        aspectRatio={aspectRatio}
        isGovernedFallback={true}
      />
    );
  }

  // Governed mode: render through authority wrapper
  if (useGovernedMode && governedImageIds.length > 0) {
    return (
      <div
        style={{
          position: 'relative',
          aspectRatio: `${aspectRatio}`,
          background: '#050510',
          border: '2px solid #00FFFF40',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Monitor bezel effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
            border: '1px solid #00FFFF20',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Governed image slot */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <ImageSlotWrapper
            imageId={governedImageIds[currentIndex]}
            roomId={roomId}
            priority={priority}
            altText={`Monitor slot ${currentIndex + 1} of ${governedImageIds.length}`}
            containerStyle={{ width: '100%', height: '100%' }}
            className="w-full h-full object-cover"
            placeholderColor="from-cyan-900 to-cyan-950"
          />
        </div>

        {/* Scan lines effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,255,255,0.03) 0px, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Label */}
        {label && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#00FFFF',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: 4,
              zIndex: 3,
            }}
          >
            {label}
            {' • GOVERNED'}
          </div>
        )}

        {/* Indicator dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 4,
            zIndex: 3,
          }}
        >
          {governedImageIds.map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background:
                  i === currentIndex
                    ? '#00FFFF'
                    : 'rgba(0,255,255,0.35)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Authority indicator (bottom right corner badge) */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: '#00FFFF',
            background: 'rgba(0,255,255,0.25)',
            border: '1px solid rgba(0,255,255,0.5)',
            padding: '3px 6px',
            borderRadius: 3,
            zIndex: 3,
          }}
        >
          ✓ AUTHORITY
        </div>
      </div>
    );
  }

  // Fallback render
  return (
    <FallbackMonitorSlot
      images={fallbackImages}
      label={label}
      aspectRatio={aspectRatio}
      isGovernedFallback={true}
    />
  );
}

/**
 * FallbackMonitorSlot - Governed degraded-state fallback
 * Still emits telemetry but uses pre-cached images when authority is unavailable
 */
function FallbackMonitorSlot({
  images,
  label,
  aspectRatio,
  isGovernedFallback,
}: {
  images: string[];
  label?: string;
  aspectRatio: number;
  isGovernedFallback?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: `${aspectRatio}`,
        background: '#050510',
        border: `2px solid ${isGovernedFallback ? '#FFD70040' : '#AA2DFF40'}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Monitor bezel effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 6,
          border: `1px solid ${isGovernedFallback ? '#FFD70020' : '#AA2DFF20'}`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Image carousel */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${images[currentIndex]}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8,
        }}
      />

      {/* Scan lines effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,255,255,0.03) 0px, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Fallback indicator label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: isGovernedFallback ? '#FFD700' : '#AA2DFF',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            borderRadius: 4,
            zIndex: 3,
          }}
        >
          {label}
          {isGovernedFallback ? ' • CACHED' : ' • STATIC'}
        </div>
      )}

      {/* Indicator dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 3,
        }}
      >
        {images.map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background:
                i === currentIndex
                  ? isGovernedFallback
                    ? '#FFD700'
                    : '#AA2DFF'
                  : isGovernedFallback
                    ? 'rgba(255,215,0,0.35)'
                    : 'rgba(170,45,255,0.35)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Fallback status badge */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: 7,
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: isGovernedFallback ? '#FFD700' : '#AA2DFF',
          background: isGovernedFallback
            ? 'rgba(255,215,0,0.25)'
            : 'rgba(170,45,255,0.25)',
          border: isGovernedFallback
            ? '1px solid rgba(255,215,0,0.5)'
            : '1px solid rgba(170,45,255,0.5)',
          padding: '3px 6px',
          borderRadius: 3,
          zIndex: 3,
        }}
      >
        {isGovernedFallback ? 'CACHED' : 'FALLBACK'}
      </div>
    </div>
  );
}
