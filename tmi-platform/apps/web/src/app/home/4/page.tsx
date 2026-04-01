'use client';
// Home4 (Sponsors & Advertisers World) - 5-belt layout, ready for placement data wiring
import React, { useEffect, useState } from 'react';
import AdPlacementCard from '@/components/placement/AdPlacementCard';
import type { AdPlacement } from '@/components/placement/types';

const BELTS = ["A", "B", "C", "D", "E"];

async function fetchPlacements(belt: string): Promise<AdPlacement[]> {
  try {
    const res = await fetch(`/api/placements?belt=${belt}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return [];
  }
}

function BeltSection({ belt }: { belt: string }) {
  const [placements, setPlacements] = useState<AdPlacement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPlacements(null);
    setError(null);
    fetchPlacements(belt)
      .then((data) => {
        if (!cancelled) setPlacements(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load placements');
      });
    return () => {
      cancelled = true;
    };
  }, [belt]);

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Belt {belt}</h2>
      {error && (
        <div className="text-red-500 min-h-[120px] flex items-center justify-center">{error}</div>
      )}
      {!error && placements === null && (
        <div className="min-h-[120px] flex items-center justify-center text-gray-400">Loading placements...</div>
      )}
      {!error && placements && placements.length === 0 && (
        <div className="min-h-[120px] flex items-center justify-center text-gray-400">No placements available.</div>
      )}
      {!error && placements && placements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {placements.map((placement) => (
            <AdPlacementCard key={placement.id} placement={placement} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home4SponsorsWorld() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">Sponsors & Advertisers World</h1>
      <div className="space-y-8">
        {BELTS.map((belt) => (
          <BeltSection key={belt} belt={belt} />
        ))}
      </div>
    </main>
  );
}
