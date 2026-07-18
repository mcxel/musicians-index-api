'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AvatarViewer = dynamic(() => import('@/components/3d/AvatarLobbyCanvas').then((mod) => mod.AvatarViewer), {
  ssr: false,
});

interface HighFidelityAvatarProps {
  imageUrl?: string;
  name: string;
  size?: number;
  tierColor?: string;
  showCreateCTA?: boolean;
  enable3D?: boolean;
  isPlaying?: boolean;
}

export default function HighFidelityAvatar({
  imageUrl,
  name,
  size = 48,
  tierColor = '#00FFFF',
  showCreateCTA = false,
  enable3D = false,
  isPlaying = false,
}: HighFidelityAvatarProps) {
  if (enable3D) {
    return (
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden bg-[#0a0a1a] border-2 shadow-lg"
        style={{ width: size, height: size, borderColor: `${tierColor}80`, boxShadow: `0 0 15px ${tierColor}30` }}
      >
        <AvatarViewer
          active={true}
          color={tierColor}
          visorColor={tierColor}
          crown={tierColor === '#5CE1E6' || tierColor === '#FFD700'}
          isPlaying={isPlaying}
          size={size}
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden bg-[#0a0a1a] border-2 shadow-lg"
        style={{ width: size, height: size, borderColor: `${tierColor}80`, boxShadow: `0 0 15px ${tierColor}30` }}
      >
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(5,5,16,0.6) 100%)' }}
        />
      </div>
    );
  }

  if (showCreateCTA) {
    return (
      <Link
        href="/avatar/scan/wardrobe"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px dashed ${tierColor}66`,
          background: `${tierColor}09`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          textDecoration: 'none',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: size * 0.28, lineHeight: 1 }}>+</span>
        {size >= 56 && (
          <span style={{
            fontSize: Math.max(7, size * 0.11),
            fontWeight: 900,
            color: tierColor,
            letterSpacing: '0.06em',
            textAlign: 'center',
            lineHeight: 1.1,
          }}>
            CREATE
          </span>
        )}
      </Link>
    );
  }

  // Minimal initial ring — never a blob
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${tierColor}33`,
        background: `${tierColor}09`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: size * 0.45, fontWeight: 900, color: `${tierColor}88`, lineHeight: 1 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
