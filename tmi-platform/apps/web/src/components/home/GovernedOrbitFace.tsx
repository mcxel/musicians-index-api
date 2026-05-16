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
}: GovernedOrbitFaceProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.8, repeat: Infinity, delay: delayIndex * 0.12 }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: 106,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(0,255,255,0.4)',
        boxShadow: '0 0 16px rgba(0,255,255,0.18)',
        background: 'rgba(10,10,20,0.9)',
      }}
    >
      {/* Governed performer portrait (replaces direct backgroundImage) */}
      <div style={{ height: 68, position: 'relative', overflow: 'hidden' }}>
        <PerformerPortraitWrapper
          performerId={artistId}
          roomId={roomId}
          displayName={artistName}
          kind="artist"
          containerStyle={{
            width: '100%',
            height: '100%',
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info section */}
      <div style={{ padding: '5px 6px', display: 'grid', gap: 2 }}>
        <div style={{ fontSize: 9, color: '#00FFFF', fontWeight: 800 }}>
          #{rank} {artistName}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
          SCORE {score}
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
  );
}
