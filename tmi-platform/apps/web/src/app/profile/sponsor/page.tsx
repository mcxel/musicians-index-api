'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#00FFFF', fuchsia: '#FF2DAA', gold: '#FFD700', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };

interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }
interface Campaign { id: string; name: string; status: 'live' | 'upcoming' | 'ended'; impressions: number; clicks: number; budget: number; }

export default function SponsorProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, campaignsRes] = await Promise.all([
          fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/sponsor/campaigns', { cache: 'no-store' })
        ]);
        const sessionData = await sessionRes.json();
        const campaignsData = await campaignsRes.json();
        setSession(sessionData);
        setCampaigns(campaignsData.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch sponsor data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;

  const name = session?.user?.displayName ?? 'Sponsor';
  const tier = session?.tier ?? 'GOLD';

  const TIER_COLORS: Record<string, string> = { DIAMOND: '#00FFFF', GOLD: '#FFD700', PLATINUM: '#E5E4E2', SILVER: '#C0C0C0', RUBY: '#CD7F32', PRO: '#AA2DFF', FREE: '#666' };
  const tierColor = TIER_COLORS[tier] ?? '#666';

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #050815, #0d0d3a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.gold}44`, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.gold, fontWeight: 800, marginBottom: 4 }}>SPONSOR DASHBOARD</div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>{name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: tierColor, fontWeight: 700, letterSpacing: 2 }}>{tier} SPONSOR</span>
              </div>
            </div>
          </div>
          <Link href="/campaigns/create" style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            New Campaign
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
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>TOTAL SPEND</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.green }}>${totalBudget.toLocaleString()}</div>
            </div>
        </div>

        {/* Campaign Management Widget */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>CAMPAIGN MANAGEMENT</div>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>CAMPAIGN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>IMPRESSIONS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>CLICKS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>BUDGET</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr key={campaign.id} style={{ borderBottom: index < campaigns.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{campaign.name}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: campaign.status === 'live' ? C.green + '22' : campaign.status === 'upcoming' ? C.gold + '22' : C.dim + '22',
                        color: campaign.status === 'live' ? C.green : campaign.status === 'upcoming' ? C.gold : C.dim,
                        padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                      }}>{campaign.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{campaign.impressions.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{campaign.clicks.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>${campaign.budget.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Link href={`/campaigns/${campaign.id}/analytics`} style={{ color: C.accent, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}