'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

interface MonitorSlotProps {
  images: string[];
  label?: string;
  aspectRatio?: number;
}

export default function MonitorSlot({ images, label, aspectRatio = 16 / 9 }: MonitorSlotProps) {
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
        border: '2px solid #00FFFF40',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Monitor bezel effect */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 6, border: '1px solid #00FFFF20', pointerEvents: 'none', zIndex: 2 }} />

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
        }}
      >
        <ImageSlotWrapper
          imageId={`monitor-slot-${currentIndex}`}
          roomId="monitor-slot"
          priority="high"
          fallbackUrl={images[currentIndex]}
          altText={label ?? 'Monitor image'}
          className="w-full h-full object-cover"
          containerStyle={{ position: 'absolute', inset: 0 }}
        />
      </motion.div>

      {/* Scan lines effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.03) 0px, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 2px)',
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
              background: i === currentIndex ? '#00FFFF' : 'rgba(0,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
