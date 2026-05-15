/**
 * src/components/visual-enforcement/VenueReconstructionWrapper.tsx
 *
 * Authority-enforced wrapper for venue 3D reconstruction.
 * NO BYPASS RENDERING - all venue visuals must claim visual-hydration-control.
 *
 * Used by:
 * - DigitalVenueTwinShell.tsx
 * - VenueCard.tsx
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useVenueReconstruction } from '@/lib/hooks/useVisualAuthority';
import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';

export interface VenueReconstructionWrapperProps {
  venueId: string;
  roomId: string;
  venueName: string;
  venueType?: 'club' | 'arena' | 'battle-hall' | 'lounge';
  className?: string;
  onStateChange?: (state: Record<string, unknown>) => void;
}

const VenuePlaceholder: React.FC<{ venueName: string }> = ({ venueName }) => (
  <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-lg">
    <div className="text-center">
      <div className="text-6xl mb-4">◆</div>
      <p className="text-lg font-mono text-purple-300">{venueName}</p>
      <p className="text-xs text-gray-400 mt-4">Reconstructing environment...</p>
    </div>
  </div>
);

export const VenueReconstructionWrapper: React.FC<VenueReconstructionWrapperProps> =
  ({
    venueId,
    roomId,
    venueName,
    venueType = 'club',
    className = '',
    onStateChange,
  }) => {
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);

    const {
      reconstructedAssetId,
      blocked,
      fallback,
      isLoading,
      error,
      environmentState,
    } = useVenueReconstruction(venueId, roomId, venueName, venueType);

    useEffect(() => {
      if (onStateChange) {
        onStateChange({
          reconstructedAssetId,
          blocked,
          fallback,
          isLoading,
          error,
          environmentState,
        });
      }
    }, [reconstructedAssetId, blocked, fallback, isLoading, error, environmentState, onStateChange]);

    useEffect(() => {
      if (reconstructedAssetId) {
        setDisplayUrl(reconstructedAssetId);
      } else if (fallback) {
        setDisplayUrl(fallback);
      }
    }, [reconstructedAssetId, fallback]);

    if (isLoading || blocked || environmentState === 'initializing') {
      return (
        <div className={className}>
          <VenuePlaceholder venueName={venueName} />
        </div>
      );
    }

    if (error) {
      return (
        <div className={className}>
          <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-red-900/10 border border-red-500/30 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-red-300">⚠ Venue reconstruction failed</p>
              <p className="text-xs text-gray-400 mt-2">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (displayUrl) {
      return (
        <div className={className}>
          <ImageSlotWrapper
            imageId={`venue-reconstruction-${venueId}`}
            roomId={roomId}
            priority="high"
            fallbackUrl={displayUrl}
            className="w-full h-full object-cover"
            altText={`${venueName} reconstruction`}
            containerStyle={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 pointer-events-none border border-purple-500/30 rounded-lg" />
        </div>
      );
    }

    return <VenuePlaceholder venueName={venueName} />;
  };

export default VenueReconstructionWrapper;
