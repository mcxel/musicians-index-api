"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UnifiedEngagementEngine, EngagementCampaign } from '@/lib/engagement/UnifiedEngagementEngine';

export default function WhatsNewPage() {
  const [campaigns, setCampaigns] = useState<EngagementCampaign[]>([]);

  useEffect(() => {
    const active = UnifiedEngagementEngine.listActiveCampaigns();
    setCampaigns(active);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            UNIFIED ENGAGEMENT ENGINE
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 950, margin: '8px 0', letterSpacing: '-0.02em' }}>
            ✨ WHAT'S NEW ON TMI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 540, margin: '0 auto' }}>
            Discover the latest 3D Avatar Creation Center upgrades, live broadcast tools, and community releases.
          </p>
        </div>

        {/* Feature Release Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {campaigns.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)', padding: '3px 8px', borderRadius: 4, fontWeight: 800, textTransform: 'uppercase' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>
                  MULTI-CHANNEL
                </span>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#fff' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
                {item.summary}
              </p>

              {item.actionUrl && (
                <Link
                  href={item.actionUrl}
                  style={{
                    marginTop: 'auto',
                    padding: '10px 18px',
                    background: '#00FF88',
                    color: '#050510',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: 12,
                    textDecoration: 'none',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Explore Feature →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Back Link */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/hub" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            ← Back to Platform Hub
          </Link>
        </div>

      </div>
    </div>
  );
}
