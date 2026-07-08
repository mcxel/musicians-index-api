'use client';

import { useEffect, useMemo, useState } from 'react';

type Snapshot = {
  articleSlug: string;
  shares: number;
  opens: number;
  clicks: number;
  copies: number;
  engagedReads: number;
  modeCounts?: Partial<Record<'still' | 'motion' | 'live' | 'premiere', number>>;
  platformCounts?: Record<string, number>;
};

interface Props {
  articleSlug: string;
}

export default function PerformerArticleInsightsCard({ articleSlug }: Props) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/referral/article-share?articleSlug=${encodeURIComponent(articleSlug)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!canceled && data?.ok && data?.snapshot) {
          setSnapshot(data.snapshot as Snapshot);
        }
      } catch {
        // Keep UI resilient if analytics endpoint is unavailable.
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    void load();
    return () => {
      canceled = true;
    };
  }, [articleSlug]);

  const rates = useMemo(() => {
    const s = snapshot;
    if (!s) return { clickThrough: 0, engagedRate: 0 };
    const clickThrough = s.opens > 0 ? Math.round((s.clicks / s.opens) * 100) : 0;
    const engagedRate = s.opens > 0 ? Math.round((s.engagedReads / s.opens) * 100) : 0;
    return { clickThrough, engagedRate };
  }, [snapshot]);

  const topPlatforms = useMemo(() => {
    if (!snapshot?.platformCounts) return [] as Array<{ name: string; count: number }>;
    return Object.entries(snapshot.platformCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [snapshot]);

  const modeRows = useMemo(() => {
    const counts = snapshot?.modeCounts ?? {};
    return [
      { key: 'still', label: 'Still', value: counts.still ?? 0 },
      { key: 'motion', label: 'Motion', value: counts.motion ?? 0 },
      { key: 'live', label: 'Live', value: counts.live ?? 0 },
      { key: 'premiere', label: 'Premiere', value: counts.premiere ?? 0 },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <div style={{ marginTop: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', padding: '14px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.12em' }}>ARTICLE ANALYTICS</div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Loading attribution snapshot...</div>
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div style={{ marginTop: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.12em' }}>ARTICLE ANALYTICS</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)' }}>Impressions are separate from engaged reads</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
        {[
          { label: 'OPENS', value: snapshot.opens },
          { label: 'CLICKS', value: snapshot.clicks },
          { label: 'ENGAGED', value: snapshot.engagedReads },
          { label: 'SHARES', value: snapshot.shares },
        ].map((row) => (
          <div key={row.label} style={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', padding: '8px 10px' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{row.value.toLocaleString()}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>{row.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>CTR: <span style={{ color: '#00FFFF', fontWeight: 800 }}>{rates.clickThrough}%</span></div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>Engaged Read Rate: <span style={{ color: '#00FF88', fontWeight: 800 }}>{rates.engagedRate}%</span></div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 7 }}>
        <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 800, letterSpacing: '0.08em' }}>MODE BREAKDOWN</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {modeRows.map((row) => (
            <div key={row.key} style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.14)', padding: '5px 10px', fontSize: 8, color: 'rgba(255,255,255,0.8)' }}>
              {row.label}: {row.value}
            </div>
          ))}
        </div>
      </div>

      {topPlatforms.length > 0 && (
        <div style={{ marginTop: 12, display: 'grid', gap: 7 }}>
          <div style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.08em' }}>TOP PLATFORMS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topPlatforms.map((row) => (
              <div key={row.name} style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.14)', padding: '5px 10px', fontSize: 8, color: 'rgba(255,255,255,0.8)' }}>
                {row.name}: {row.count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
