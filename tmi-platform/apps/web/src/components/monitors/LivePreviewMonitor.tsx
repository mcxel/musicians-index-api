'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TmiBadgeOverlay from '@/components/overlays/TmiBadgeOverlay';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

interface LivePreviewMonitorProps {
  images: [string, string, string];
  roomId?: string;
  hostName?: string;
  genre?: string;
  occupancy?: number;
  label?: string;
  joinRoute?: string;
  hostRoute?: string;
  isLive?: boolean;
  intervalMs?: number;
}

export default function LivePreviewMonitor({
  images,
  roomId = 'lobby',
  hostName = 'Host',
  genre = 'Hip-Hop',
  occupancy = 0,
  label = 'Room Preview',
  joinRoute,
  hostRoute,
  isLive = true,
  intervalMs = 4000,
}: LivePreviewMonitorProps) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const resolvedJoinRoute = joinRoute ?? `/rooms/${roomId}`;
  const resolvedHostRoute = hostRoute ?? `/profile/${hostName.toLowerCase().replace(/\s/g, '-')}`;

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % 3), intervalMs);
    return () => clearInterval(t);
  }, [hovered, intervalMs]);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16/9',
        background: '#050510',
        border: '2px solid #00FFFF35',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Live badge */}
      {isLive && <TmiBadgeOverlay badge="LIVE" position="top-left" />}

      {/* Image */}
      <motion.div
        key={idx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <ImageSlotWrapper
          imageId={`live-preview-${roomId}-${idx}`}
          roomId={roomId}
          priority="high"
          fallbackUrl={images[idx]}
          altText={`${label} preview`}
          className="w-full h-full object-cover"
          containerStyle={{ position: 'absolute', inset: 0 }}
        />
      </motion.div>

      {/* Scan lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(0,255,255,0.025) 0px,rgba(0,255,255,0.025) 1px,transparent 1px,transparent 2px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Bottom info overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 12px',
          background: 'linear-gradient(to top, rgba(5,5,16,0.95), transparent)',
          zIndex: 3,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{label}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              href={resolvedHostRoute}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 8, color: '#FF2DAA', textDecoration: 'none', fontWeight: 700 }}
            >
              {hostName}
            </Link>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{genre}</span>
            {occupancy > 0 && (
              <span style={{ fontSize: 8, color: '#00FF88' }}>👥 {occupancy}</span>
            )}
          </div>
        </div>
        {hovered && (
          <Link
            href={resolvedJoinRoute}
            style={{
              fontSize: 8,
              fontWeight: 800,
              color: '#050510',
              background: '#00FFFF',
              padding: '4px 10px',
              borderRadius: 4,
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            JOIN →
          </Link>
        )}
      </div>

      {/* Indicator dots */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 3,
          zIndex: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: i === idx ? '#00FFFF' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
