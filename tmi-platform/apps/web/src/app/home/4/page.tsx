'use client';
// Home4 (Sponsors & Advertisers World) - 5-belt layout, ready for placement data wiring
import React, { useEffect, useState } from 'react';
import AdPlacementCard from '@/components/placement/AdPlacementCard';
import type { AdPlacement } from '@/components/placement/types';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import HomeNavigator from '@/components/home/HomeNavigator';

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
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <main style={{ minHeight: '100vh', background: '#050510', padding: '0 0 48px' }}>
          <div style={{ padding: '32px 24px 0', borderBottom: '1px solid #FFD70033', marginBottom: 32 }}>
            <h1 style={{ color: '#FFD700', fontSize: 28, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
              Sponsors &amp; Advertisers World
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>Premium placement belts · Real-time inventory</p>
          </div>
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {BELTS.map((belt) => (
              <BeltSection key={belt} belt={belt} />
            ))}
          </div>
        </main>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
