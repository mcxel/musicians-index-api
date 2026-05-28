'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simulate fetching active campaigns from the DB
const MOCK_CAMPAIGNS = [
  { id: 'camp-1', brand: 'BeatMarket', slot: 'lobby-wall-featured', status: 'active', impressions: 14205, revenue: 199 },
  { id: 'camp-2', brand: 'SoundWave Audio', slot: 'arena-stage-sponsor', status: 'active', impressions: 38400, revenue: 499 },
];

export default function AdminAdvertisersPage() {
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: '#FFD700', textTransform: 'uppercase', marginBottom: 6 }}>
          TMI Admin — Monetization
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#fff' }}>
          Advertiser Network
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: '16px 24px', minWidth: 200 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Weekly Ad Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FFD700' }}>${totalRevenue}</div>
        </div>
        <div style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 10, padding: '16px 24px', minWidth: 200 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Impressions</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#00FFFF' }}>{totalImpressions.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 16, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <div>Brand</div>
          <div>Placement Slot</div>
          <div>Status</div>
          <div>Impressions</div>
          <div>Revenue</div>
        </div>
        
        {campaigns.map(camp => (
          <div key={camp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 16, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{camp.brand}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{camp.slot}</div>
            <div>
              <span style={{ background: 'rgba(0,255,136,0.15)', color: '#00FF88', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 900 }}>{camp.status.toUpperCase()}</span>
            </div>
            <div style={{ fontFamily: 'monospace' }}>{camp.impressions.toLocaleString()}</div>
            <div style={{ fontWeight: 700, color: '#FFD700' }}>${camp.revenue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}