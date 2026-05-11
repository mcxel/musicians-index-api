/**
 * src/components/visual-enforcement/PerformerPortraitWrapper.tsx
 *
 * Authority-enforced wrapper for performer/artist motion portraits.
 * NO BYPASS RENDERING - all portraits must claim motion-portrait-authority.
 *
 * Used by:
 * - PerformerCard.tsx::PerformerHUD
 * - ArtistProfile.tsx::ArtistHeader
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePerformerPortrait } from '@/lib/hooks/useVisualAuthority';

export interface PerformerPortraitWrapperProps {
  performerId: string;
  roomId: string;
  displayName: string;
  kind?: 'artist' | 'host' | 'dj';
  className?: string;
  containerStyle?: React.CSSProperties;
  onStateChange?: (state: any) => void;
}

const PortraitPlaceholder: React.FC<{ displayName: string }> = ({ displayName }) => (
  <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-lg">
    <div className="text-center">
      <div className="text-4xl mb-2">🎤</div>
      <p className="text-sm font-mono text-cyan-300">{displayName}</p>
      <p className="text-xs text-gray-400 mt-2">Animating...</p>
    </div>
  </div>
);

export const PerformerPortraitWrapper: React.FC<PerformerPortraitWrapperProps> = ({
  performerId,
  roomId,
  displayName,
  kind = 'artist',
  className = '',
  containerStyle,
  onStateChange,
}) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  const { portraitId, blocked, fallback, isLoading, error, animationState } =
    usePerformerPortrait(performerId, roomId, displayName, kind);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ portraitId, blocked, fallback, isLoading, error, animationState });
    }
  }, [portraitId, blocked, fallback, isLoading, error, animationState, onStateChange]);

  useEffect(() => {
    if (portraitId) {
      setDisplayUrl(portraitId);
    } else if (fallback) {
      setDisplayUrl(fallback);
    }
  }, [portraitId, fallback]);

  if (isLoading || blocked) {
    return (
      <div className={className} style={containerStyle}>
        <PortraitPlaceholder displayName={displayName} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={containerStyle}>
        <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-red-900/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-300">⚠ Portrait failed</p>
        </div>
      </div>
    );
  }

  if (displayUrl) {
    return (
      <div className={className} style={containerStyle}>
        <img
          src={displayUrl}
          alt={displayName}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
        {animationState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/40 rounded-lg animate-pulse" />
        )}
      </div>
    );
  }

  return <PortraitPlaceholder displayName={displayName} />;
};

export default PerformerPortraitWrapper;
