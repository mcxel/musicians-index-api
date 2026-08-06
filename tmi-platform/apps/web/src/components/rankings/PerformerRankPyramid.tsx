'use client';
/**
 * PerformerRankPyramid
 * =====================
 * Displays a performer's live rankings across all four geographic tiers
 * (City → State → Country → Global) plus their top category championship
 * and confidence score.
 *
 * Usage:
 *   <PerformerRankPyramid userId="..." />
 *
 * Data source: GET /api/rankings/profile/[userId]
 */
import React, { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface GeoTier {
  rank:     number;
  total:    number;
  location: string;
}

interface RankProfile {
  userId:      string;
  displayName: string;
  avatarUrl:   string | null;
  city:        string | null;
  state:       string | null;
  country:     string | null;
  geo: {
    city:    GeoTier;
    state:   GeoTier;
    country: GeoTier;
    global:  GeoTier;
  };
  topCategory: { category: string; rank: number; total: number } | null;
  score: {
    rawScore:          number;
    confidence:        string;
    confidenceFactors: string[];
    pillarScores: {
      competition: number;
      commerce:    number;
      engagement:  number;
      activity:    number;
    };
  } | null;
  risingRank: { rank: number; total: number; risingScore: number };
}

interface Props {
  userId: string;
  /** Set to true when embedded in a dark card (default: standalone dark bg) */
  compact?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, string> = {
  competition: '#FF2DAA',
  commerce:    '#FFD700',
  engagement:  '#00FFFF',
  activity:    '#AA2DFF',
};

const PILLAR_LABELS: Record<string, string> = {
  competition: 'Competition',
  commerce:    'Commerce',
  engagement:  'Engagement',
  activity:    'Activity',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  High:       '#00FF88',
  Solid:      '#00FFFF',
  Moderate:   '#FFD700',
  Low:        '#FF9900',
  Unverified: 'rgba(255,255,255,0.3)',
};

const TIER_CONFIG = [
  { key: 'city',    label: 'City',    icon: '🏙️', color: '#00FFFF' },
  { key: 'state',   label: 'State',   icon: '📍', color: '#AA2DFF' },
  { key: 'country', label: 'Country', icon: '🏳️', color: '#FF2DAA' },
  { key: 'global',  label: 'Global',  icon: '🌍', color: '#FFD700' },
];

function ordinal(n: number): string {
  if (n <= 0) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function pillarBar(value: number, color: string) {
  const pct = Math.round(value / 10); // 0–1000 → 0–100%
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%',
        width:  `${pct}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
        boxShadow:   `0 0 6px ${color}66`,
      }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PerformerRankPyramid({ userId, compact = false }: Props) {
  const [data,    setData]    = useState<RankProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/rankings/profile/${userId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        Loading rankings…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' }}>
        Rankings unavailable
      </div>
    );
  }

  const confColor = CONFIDENCE_COLOR[data.score?.confidence ?? 'Unverified'] ?? CONFIDENCE_COLOR.Unverified;

  return (
    <div style={{
      background:   compact ? 'transparent' : 'rgba(0,0,0,0.6)',
      border:       compact ? 'none' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20,
      padding:      compact ? 0 : 28,
      fontFamily:   'system-ui, sans-serif',
    }}>

      {/* Header */}
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt={data.displayName}
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #AA2DFF' }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(170,45,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎤</div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{data.displayName}</div>
            {data.city && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {[data.city, data.state, data.country].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: confColor, fontWeight: 900 }}>RANKING CONFIDENCE</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: confColor }}>{data.score?.confidence ?? 'Unverified'}</div>
          </div>
        </div>
      )}

      {/* Pyramid — four geo tiers */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontWeight: 900, marginBottom: 14 }}>RANKING PYRAMID</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TIER_CONFIG.map(tier => {
            const tierData = data.geo[tier.key as keyof typeof data.geo];
            const hasRank  = tierData.total > 0 && tierData.rank > 0;
            return (
              <div key={tier.key} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        12,
                padding:    '10px 14px',
                borderRadius: 12,
                background:   hasRank ? `${tier.color}0D` : 'rgba(255,255,255,0.02)',
                border:       `1px solid ${hasRank ? `${tier.color}33` : 'rgba(255,255,255,0.06)'}`,
                transition:   'all 0.2s ease',
              }}>
                <div style={{ fontSize: 18, lineHeight: 1 }}>{tier.icon}</div>
                <div style={{ minWidth: 52 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{tier.label.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{tierData.location || '—'}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  {hasRank ? (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 900, color: tier.color, lineHeight: 1, textShadow: `0 0 16px ${tier.color}66` }}>
                        #{tierData.rank}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>of {tierData.total.toLocaleString()}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Not ranked</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top category badge */}
      {data.topCategory && (
        <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#FFD700', fontWeight: 900, marginBottom: 6 }}>TOP CHAMPIONSHIP</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {data.topCategory.category.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFD700' }}>
              #{data.topCategory.rank}
              <span style={{ fontSize: 10, color: 'rgba(255,215,0,0.5)', marginLeft: 4 }}>/ {data.topCategory.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pillar breakdown */}
      {data.score && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontWeight: 900, marginBottom: 12 }}>SCORE BREAKDOWN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(data.score.pillarScores).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 10, color: PILLAR_COLORS[key], fontWeight: 700, minWidth: 80 }}>{PILLAR_LABELS[key] ?? key}</div>
                {pillarBar(value, PILLAR_COLORS[key] ?? '#fff')}
                <div style={{ fontSize: 10, color: PILLAR_COLORS[key] ?? '#fff', fontWeight: 900, minWidth: 30, textAlign: 'right' }}>{Math.round(value / 10)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence factors */}
      {data.score?.confidenceFactors && data.score.confidenceFactors.length > 0 && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: `${confColor}0A`, border: `1px solid ${confColor}22` }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: confColor, fontWeight: 900, marginBottom: 8 }}>
            VERIFIED ACTIVITY — {data.score.confidence}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.score.confidenceFactors.map(f => (
              <div key={f} style={{ fontSize: 10, color: confColor, background: `${confColor}15`, border: `1px solid ${confColor}30`, borderRadius: 6, padding: '3px 8px', fontWeight: 700 }}>
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rising indicator */}
      {data.risingRank.risingScore > 50 && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14 }}>⚡</div>
          <div style={{ fontSize: 10, color: '#00FFFF', fontWeight: 800 }}>
            Fastest Rising #{data.risingRank.rank} — {Math.round(data.risingRank.risingScore)}% velocity
          </div>
        </div>
      )}
    </div>
  );
}
