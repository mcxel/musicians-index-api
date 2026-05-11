/**
 * src/components/visual-enforcement/MagazineSlotWrapper.tsx
 *
 * Authority-enforced wrapper for magazine visual slots.
 * NO BYPASS RENDERING - all magazine content must pass authority gate.
 *
 * Used by:
 * - MagazineLayout.tsx::PageRenderer
 * - MagazineCover.tsx
 *
 * Pattern:
 * 1. Claim authority for slot
 * 2. Load visual from hydration queue
 * 3. Show degraded render if blocked
 * 4. Automatic recovery on retry
 * 5. Observable metrics in admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMagazineSlot } from '@/lib/hooks/useVisualAuthority';

export interface MagazineSlotWrapperProps {
  /** Unique slot identifier: cover_001, article_hero_023, sponsor_insert_05 */
  slotId: string;
  /** Chat room ID for authority context */
  roomId: string;
  /** URL of image to display if successful */
  imageUrl?: string;
  /** Fallback placeholder if resolution fails */
  fallbackImageUrl?: string;
  /** Alt text for accessibility */
  altText?: string;
  /** CSS classes for styling */
  className?: string;
  /** Component context for recovery metadata */
  context?: {
    pageNumber?: number;
    articleId?: string;
    sponsorId?: string;
    [key: string]: any;
  };
  /** Callback on authority state change */
  onStateChange?: (state: any) => void;
}

/**
 * Degraded render - shows when visual is blocked
 * Indicates to user that system is working on it (not permanent)
 */
const DegradedRender: React.FC<{ slotId: string; reason?: string }> = ({
  slotId,
  reason,
}) => (
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

/**
 * Error render - shows if recovery exhausted all retries
 * Escalated to recovery center for manual intervention
 */
const ErrorRender: React.FC<{ slotId: string; error: string }> = ({
  slotId,
  error,
}) => (
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

/**
 * MagazineSlotWrapper - Authority-enforced magazine visual
 *
 * ENFORCEMENT RULES:
 * - Must claim authority in image-generation-control domain
 * - No permanent static fallbacks allowed
 * - Degraded render only while resolving
 * - Blocked visuals auto-tracked for recovery
 * - Admin can manually retry from recovery center
 */
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

  // Request authority and hydrate visual
  const { assetId, blocked, fallback, isLoading, error, recoveryAction } =
    useMagazineSlot(slotId, roomId, context);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ assetId, blocked, fallback, isLoading, error });
    }
  }, [assetId, blocked, fallback, isLoading, error, onStateChange]);

  // Resolve display URL
  useEffect(() => {
    if (assetId) {
      // Authority granted - use generated asset
      setDisplayUrl(assetId);
      setDisplayError(null);
    } else if (fallback) {
      // Fallback available (cached <1h old)
      setDisplayUrl(fallback);
      setDisplayError(null);
    } else if (error) {
      // Recovery exhausted
      setDisplayUrl(null);
      setDisplayError(error);
    } else if (imageUrl && !blocked) {
      // Original URL as last resort (before loading)
      setDisplayUrl(imageUrl);
      setDisplayError(null);
    }
  }, [assetId, fallback, error, imageUrl, blocked]);

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <DegradedRender slotId={slotId} reason="Claiming authority..." />
      </div>
    );
  }

  // Blocked state - show degraded render
  if (blocked && !assetId && !fallback) {
    return (
      <div className={className}>
        <DegradedRender slotId={slotId} reason={recoveryAction || 'In recovery queue'} />
      </div>
    );
  }

  // Error state - show error render
  if (displayError) {
    return (
      <div className={className}>
        <ErrorRender slotId={slotId} error={displayError} />
      </div>
    );
  }

  // Success state - render image
  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={altText}
        className={className}
        // Prevent context menu on generated visuals
        onContextMenu={(e) => {
          if (assetId) e.preventDefault();
        }}
        // Lazy load for performance
        loading="lazy"
      />
    );
  }

  // Fallback if nothing resolved (should not happen)
  return (
    <div className={`${className} bg-gray-900 flex items-center justify-center`}>
      <p className="text-xs text-gray-500">Visual slot {slotId}</p>
    </div>
  );
};

/**
 * useIsMagazineSlotBlocked - Hook to check if slot is blocked
 * Useful for parent components to adjust layout
 */
export function useIsMagazineSlotBlocked(slotId: string, roomId: string): boolean {
  const { blocked, assetId, isLoading } = useMagazineSlot(slotId, roomId);
  return blocked && !assetId && !isLoading;
}

/**
 * getMagazineSlotAuthorityStats - Get stats for admin dashboard
 */
export async function getMagazineSlotAuthorityStats(roomId: string) {
  // Called by observability dashboard to report stats
  try {
    const { VisualAuthorityGateway } = await import(
      '@/lib/ai-visuals/VisualAuthorityGateway'
    );
    const gateway = new VisualAuthorityGateway();
    return gateway.getVisualAuthorityStats();
  } catch (e) {
    console.error('Failed to get magazine slot stats:', e);
    return { blockedCount: 0, domainBlockCounts: {} };
  }
}

export default MagazineSlotWrapper;
