'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PerformerPortraitWrapper } from '@/components/visual-enforcement';

interface GovernedOrbitFaceProps {
  artistId: string;
  artistName: string;
  rank: number;
  score: number;
  route: string;
  profileRoute: string;
  roomId?: string;
  x: number;
  y: number;
  delayIndex?: number;
  /** Direct photo URL from DB — bypasses the authority resolution system */
  avatarUrl?: string;
  genre?: string;
}

export default function GovernedOrbitFace({
  artistId,
  artistName,
  rank,
  score,
  route,
  profileRoute,
  roomId = 'home-1',
  x,
  y,
  delayIndex = 0,
  avatarUrl,
  genre,
}: GovernedOrbitFaceProps) {
  return (
    // Positioning wrapper — static transform so Framer Motion doesn't fight it
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) translateZ(0)`,
        willChange: 'transform',
      }}
    >
    <motion.div
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.8, repeat: Infinity, delay: delayIndex * 0.12 }}
      style={{
        width: 106,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(0,255,255,0.4)',
        boxShadow: '0 0 16px rgba(0,255,255,0.18)',
        background: 'rgba(10,10,20,0.9)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Portrait — direct URL wins over authority system for real users */}
      <div style={{ height: 68, position: 'relative', overflow: 'hidden' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={artistName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/tmi-curated/mag-20.jpg'; }}
          />
        ) : (
          <PerformerPortraitWrapper
            performerId={artistId}
            roomId={roomId}
            displayName={artistName}
            kind="artist"
            containerStyle={{ width: '100%', height: '100%' }}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info section */}
      <div style={{ padding: '5px 6px', display: 'grid', gap: 2 }}>
        <div style={{ fontSize: 9, color: '#00FFFF', fontWeight: 800 }}>
          #{rank} {artistName}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
          {genre ? <span style={{ color: '#FF2DAA', marginRight: 4 }}>{genre}</span> : null}SCORE {score}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Link
            href={profileRoute}
            style={{
              fontSize: 7,
              textDecoration: 'none',
              color: '#00FFFF',
              borderBottom: '1px solid rgba(0,255,255,0.35)',
              paddingBottom: 1,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#00FF88';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#00FFFF';
            }}
          >
            PROFILE
          </Link>
          <Link
            href={route}
            style={{
              fontSize: 7,
              textDecoration: 'none',
              color: '#FF2DAA',
              borderBottom: '1px solid rgba(255,45,170,0.35)',
              paddingBottom: 1,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#FF88DD';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#FF2DAA';
            }}
          >
            VOTE
          </Link>
        </div>
      </div>

      {/* Authority indicator (top-right corner) */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          fontSize: 6,
          fontWeight: 800,
          color: '#00FFFF',
          background: 'rgba(0,255,255,0.2)',
          padding: '2px 3px',
          borderRadius: 2,
          zIndex: 10,
          letterSpacing: '0.1em',
        }}
      >
        ✓
      </div>
    </motion.div>
    </div>
  );
}
