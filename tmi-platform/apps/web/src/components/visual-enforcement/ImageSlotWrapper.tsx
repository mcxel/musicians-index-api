/**
 * src/components/visual-enforcement/ImageSlotWrapper.tsx
 *
 * Authority-enforced wrapper for generic image hydration.
 * NO BYPASS RENDERING - all images must claim authority first.
 *
 * Used by:
 * - ArticlesHub.jsx
 * - NewsStrip.tsx
 * - HomepageCanvas.tsx (carousel images)
 * - NewReleases.tsx
 * - FeaturedArtist.tsx
 * - TicketDisplay.tsx
 * - NFTTicketPreview.tsx
 * - DealOrFeud.jsx
 * - FanDashboard.tsx
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useImageSlot } from '@/lib/hooks/useVisualAuthority';

export interface ImageSlotWrapperProps {
  /** Unique image ID */
  imageId: string;
  /** Room ID for authority context */
  roomId: string;
  /** Display priority: critical, high, normal, deferred */
  priority?: 'critical' | 'high' | 'normal' | 'deferred';
  /** CSS classes */
  className?: string;
  /** Container style */
  containerStyle?: React.CSSProperties;
  /** Alt text for accessibility */
  altText?: string;
  /** Placeholder color while loading */
  placeholderColor?: string;
  /** Explicit degraded-state fallback URL */
  fallbackUrl?: string;
  /** Callback on state change */
  onStateChange?: (state: Record<string, unknown>) => void;
}

const ImagePlaceholder: React.FC<{ placeholderColor?: string }> = ({
  placeholderColor = 'from-gray-700 to-gray-800',
}) => (
  <div
    className={`w-full h-full animate-pulse bg-gradient-to-br ${placeholderColor}`}
    role="status"
    aria-label="Loading image"
  />
);

export const ImageSlotWrapper: React.FC<ImageSlotWrapperProps> = ({
  imageId,
  roomId,
  priority = 'normal',
  className = 'w-full h-full object-cover',
  containerStyle,
  altText = imageId,
  placeholderColor,
  fallbackUrl,
  onStateChange,
}) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);

  const { assetId, blocked, fallback, isLoading, error } = useImageSlot(
    imageId,
    roomId,
    priority
  );

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
    } else if (fallbackUrl) {
      setDisplayUrl(fallbackUrl);
      setDisplayError(null);
    } else if (error) {
      setDisplayUrl(null);
      setDisplayError(error);
    }
  }, [assetId, fallback, fallbackUrl, error]);

  // Loading or blocked state
  if (isLoading || (blocked && !assetId && !fallback)) {
    return (
      <div style={containerStyle}>
        <ImagePlaceholder placeholderColor={placeholderColor} />
      </div>
    );
  }

  // Error state
  if (displayError && !fallback) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-gray-800/50"
        style={containerStyle}
      >
        <p className="text-xs text-gray-400">⚠ Image unavailable</p>
      </div>
    );
  }

  // Success state
  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={altText}
        className={className}
        style={containerStyle}
        loading="lazy"
      />
    );
  }

  // Fallback
  return (
    <div style={containerStyle}>
      <ImagePlaceholder placeholderColor={placeholderColor} />
    </div>
  );
};

/**
 * Batch image loader - for carousel/grid layouts
 * Efficiently loads multiple images with authority
 */
export const ImageBatchWrapper: React.FC<{
  imageIds: string[];
  roomId: string;
  priority?: 'critical' | 'high' | 'normal' | 'deferred';
  renderImage: (id: string, url: string | null, isLoading: boolean) => React.ReactNode;
}> = ({ imageIds, roomId, priority = 'normal', renderImage }) => {
  return (
    <>
      {imageIds.map((id) => (
        <ImageSlotWrapperBatch
          key={id}
          imageId={id}
          roomId={roomId}
          priority={priority}
          renderImage={renderImage}
        />
      ))}
    </>
  );
};

const ImageSlotWrapperBatch: React.FC<{
  imageId: string;
  roomId: string;
  priority?: 'critical' | 'high' | 'normal' | 'deferred';
  renderImage: (id: string, url: string | null, isLoading: boolean) => React.ReactNode;
}> = ({ imageId, roomId, priority = 'normal', renderImage }) => {
  const { assetId, fallback, isLoading } = useImageSlot(imageId, roomId, priority);
  const url = assetId || fallback || null;
  return <>{renderImage(imageId, url, isLoading)}</>;
};

export default ImageSlotWrapper;
