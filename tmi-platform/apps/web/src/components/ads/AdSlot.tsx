// Global AdSlot component for serving ads by placement
import React, { useEffect, useState } from 'react';
import AdPlacementCard from '@/components/placement/AdPlacementCard';
import type { AdPlacement } from '@/components/placement/types';

interface AdSlotProps {
  placement: string;
}

export default function AdSlot({ placement }: AdSlotProps) {
  const [ad, setAd] = useState<AdPlacement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAd(null);
    fetch(`/api/ads/serve?placement=${placement}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to serve ad');
        const data = await res.json();
        if (!cancelled) setAd(data);
      })
      .catch(() => {
        if (!cancelled) setError('No ad available');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (loading) {
    return <div className="min-h-[120px] flex items-center justify-center text-gray-400">Loading ad...</div>;
  }
  if (error || !ad) {
    return <div className="min-h-[120px] flex items-center justify-center text-gray-400">No ad available.</div>;
  }
  return <AdPlacementCard placement={ad} />;
}
