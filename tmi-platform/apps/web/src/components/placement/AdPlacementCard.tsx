// AdPlacementCard component for displaying a sponsor/ad placement
import React, { useEffect, useCallback } from 'react';
import type { AdPlacement } from '@/components/placement/types';

export default function AdPlacementCard({ placement }: { placement: AdPlacement }) {
  // Track impression on mount
  useEffect(() => {
    fetch('/api/ads/track-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placementId: placement.id }),
    });
  }, [placement.id]);

  // Track click on click
  const handleClick = useCallback(() => {
    fetch('/api/ads/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placementId: placement.id }),
    });
  }, [placement.id]);

  return (
    <a
      href={placement.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 shadow hover:shadow-lg transition overflow-hidden bg-white"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4 p-4">
        <img
          src={placement.image}
          alt={placement.title}
          className="w-16 h-16 object-contain bg-gray-100 rounded"
        />
        <div>
          <div className="font-semibold text-lg">{placement.title}</div>
          <div className="text-xs text-gray-500 capitalize">{placement.type}</div>
        </div>
      </div>
    </a>
  );
}
