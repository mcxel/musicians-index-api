'use client';

import React from 'react';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';

export interface PresenceEngineProps {
  isLive: boolean;
  hasStream: boolean;
  hasMotionPoster: boolean;
  motionPosterUrl?: string;
  profileImageUrl: string;
  videoComponent?: React.ReactNode;
  avatarComponent?: React.ReactNode;
  fallbackAlt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PresenceEngine({
  isLive,
  hasStream,
  hasMotionPoster,
  motionPosterUrl,
  profileImageUrl,
  videoComponent,
  avatarComponent,
  fallbackAlt = "Presence Visual",
  className,
  style
}: PresenceEngineProps) {
  // Hierarchy: LIVE CAMERA -> AVATAR -> MOTION POSTER -> PROFILE VISUAL
  // Enforces the "Ambient State Engine" rule (Never a Black Box or Null Tile)
  const RenderState = {
    LIVE: isLive && hasStream,
    AVATAR: isLive && !hasStream,
    POSTER: !isLive && hasMotionPoster,
    PROFILE: !isLive && !hasMotionPoster
  };

  let content: React.ReactNode = null;

  if (RenderState.LIVE && videoComponent) {
    content = videoComponent;
  } else if (RenderState.AVATAR && avatarComponent) {
    content = avatarComponent;
  } else if (RenderState.POSTER && motionPosterUrl) {
    content = (
      <MotionPosterPlayer 
        isLive={false} 
        motionPosterUrl={motionPosterUrl} 
        staticImageUrl={profileImageUrl} 
        alt={fallbackAlt} 
        showLiveOverlay={false}
      />
    );
  } else {
    content = (
      <img 
        src={profileImageUrl || '/images/tmi-placeholder.jpg'} 
        alt={fallbackAlt} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    );
  }

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#050510', overflow: 'hidden', ...style }}>{content}</div>
  );
}