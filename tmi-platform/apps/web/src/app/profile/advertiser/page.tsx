'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#00FFFF', fuchsia: '#FF2DAA', gold: '#FFD700', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };

interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }
interface AdPlacement { id: string; name: string; location: string; status: 'live' | 'paused' | 'ended'; impressions: number; clicks: number; ctr: number; }

export default function AdvertiserProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with fetch from canonical /api/hq/advertiser endpoint
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then((d: Session) => { setSession(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;

  const name = session?.user?.displayName ?? 'Advertiser';
  const tier = session?.tier ?? 'GOLD';

  const TIER_COLORS: Record<string, string> = { DIAMOND: '#00FFFF', GOLD: '#FFD700', PLATINUM: '#E5E4E2', SILVER: '#C0C0C0', RUBY: '#CD7F32', PRO: '#AA2DFF', FREE: '#666' };
  const tierColor = TIER_COLORS[tier] ?? '#666';

  const totalImpressions = placements.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = placements.reduce((sum, p) => sum + p.clicks, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #050815, #0d0d3a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(0,255,136,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.green}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.green}44`, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.green, fontWeight: 800, marginBottom: 4 }}>ADVERTISER DASHBOARD</div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>{name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: tierColor, fontWeight: 700, letterSpacing: 2 }}>{tier} ADVERTISER</span>
              </div>
            </div>
          </div>
          <Link href="/ads/create" style={{ background: C.green, color: '#000', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            New Ad Placement
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Analytics Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>TOTAL IMPRESSIONS</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.accent }}>{totalImpressions.toLocaleString()}</div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>TOTAL CLICKS</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.fuchsia }}>{totalClicks.toLocaleString()}</div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>AVERAGE CTR</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>{avgCtr.toFixed(2)}%</div>
            </div>
        </div>

        {/* Ad Placement Management Widget */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>AD PLACEMENT MANAGEMENT</div>
          {placements.length === 0 ? (
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>No ad placements found.</div>
              <Link href="/ads/create" style={{ background: C.green, color: '#000', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
                Create your first placement
              </Link>
            </div>
          ) : (
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>AD PLACEMENT</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>LOCATION</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>STATUS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>IMPRESSIONS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>CLICKS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>CTR</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map((ad, index) => (
                    <tr key={ad.id} style={{ borderBottom: index < placements.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{ad.name}</td>
                      <td style={{ padding: '14px 16px', color: C.dim }}>{ad.location}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: ad.status === 'live' ? C.green + '22' : ad.status === 'paused' ? C.gold + '22' : C.dim + '22',
                          color: ad.status === 'live' ? C.green : ad.status === 'paused' ? C.gold : C.dim,
                          padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                        }}>{ad.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{ad.impressions.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{ad.clicks.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', color: C.gold }}>{ad.ctr.toFixed(2)}%</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Link href={`/ads/${ad.id}/analytics`} style={{ color: C.accent, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}