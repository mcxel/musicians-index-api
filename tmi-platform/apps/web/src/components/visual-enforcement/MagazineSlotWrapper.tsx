/**
 * src/components/visual-enforcement/MagazineSlotWrapper.tsx
 *
 * Authority-enforced wrapper for magazine visual slots.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useMagazineSlot } from '@/lib/hooks/useVisualAuthority';
import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';

export interface MagazineSlotWrapperProps {
  slotId: string;
  roomId: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  altText?: string;
  className?: string;
  context?: {
    pageNumber?: number;
    articleId?: string;
    sponsorId?: string;
    [key: string]: unknown;
  };
  onStateChange?: (state: Record<string, unknown>) => void;
}

const DegradedRender: React.FC<{ slotId: string; reason?: string }> = ({ slotId, reason }) => (
  <div
    className="flex items-center justify-center w-full h-full min-h-[200px] bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded"
    role="status"
    aria-label={`Loading: ${slotId}`}
  >
    <div className="text-center p-4">
      <div className="animate-pulse mb-2 text-2xl">◇</div>
      <p className="text-xs text-purple-300">Resolving visual...</p>
      {reason && <p className="text-xs text-gray-400 mt-1">{reason}</p>}
    </div>
  </div>
);

const ErrorRender: React.FC<{ slotId: string; error: string }> = ({ slotId, error }) => (
  <div
    className="flex items-center justify-center w-full h-full min-h-[200px] bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded"
    role="status"
    aria-label={`Error: ${slotId}`}
  >
    <div className="text-center p-4">
      <div className="mb-2 text-2xl">⚠</div>
      <p className="text-xs text-red-300">Visual resolution failed</p>
      <p className="text-xs text-gray-400 mt-1">{error}</p>
      <p className="text-xs text-gray-500 mt-2">Check admin recovery center</p>
    </div>
  </div>
);

export const MagazineSlotWrapper: React.FC<MagazineSlotWrapperProps> = ({
  slotId,
  roomId,
  imageUrl,
  fallbackImageUrl,
  altText = slotId,
  className = '',
  context,
  onStateChange,
}) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);

  const { assetId, blocked, fallback, isLoading, error, recoveryAction } =
    useMagazineSlot(slotId, roomId, context);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ assetId, blocked, fallback, isLoading, error });
    }
  }, [assetId, blocked, fallback, isLoading, error, onStateChange]);

  useEffect(() => {
    if (assetId) {
      setDisplayUrl(assetId);
      setDisplayError(null);
    } else if (fallback) {
      setDisplayUrl(fallback);
      setDisplayError(null);
    } else if (fallbackImageUrl) {
      setDisplayUrl(fallbackImageUrl);
      setDisplayError(null);
    } else if (error) {
      setDisplayUrl(null);
      setDisplayError(error);
    } else if (imageUrl && !blocked) {
      setDisplayUrl(imageUrl);
      setDisplayError(null);
    }
  }, [assetId, fallback, fallbackImageUrl, error, imageUrl, blocked]);

  if (isLoading) {
    return (
      <div className={className}>
        <DegradedRender slotId={slotId} reason="Claiming authority..." />
      </div>
    );
  }

  if (blocked && !assetId && !fallback) {
    return (
      <div className={className}>
        <DegradedRender slotId={slotId} reason={recoveryAction || 'In recovery queue'} />
      </div>
    );
  }

  if (displayError) {
    return (
      <div className={className}>
        <ErrorRender slotId={slotId} error={displayError} />
      </div>
    );
  }

  if (displayUrl) {
    return (
      <div className={className}>
        <ImageSlotWrapper
          imageId={`magazine-slot-${slotId}`}
          roomId={roomId}
          priority="normal"
          fallbackUrl={displayUrl}
          className="w-full h-full object-cover"
          altText={altText}
          containerStyle={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} bg-gray-900 flex items-center justify-center`}>
      <p className="text-xs text-gray-500">Visual slot {slotId}</p>
    </div>
  );
};

export function useIsMagazineSlotBlocked(slotId: string, roomId: string): boolean {
  const { blocked, assetId, isLoading } = useMagazineSlot(slotId, roomId);
  return blocked && !assetId && !isLoading;
}

export async function getMagazineSlotAuthorityStats(roomId: string) {
  try {
    const { getVisualAuthorityStats } = await import('@/lib/ai-visuals/VisualAuthorityGateway');
    return getVisualAuthorityStats();
  } catch (e) {
    console.error('Failed to get magazine slot stats:', e);
    return { blockedCount: 0, domainBlockCounts: {} };
  }
}

export default MagazineSlotWrapper;
