/**
 * AnalyticsMiniPanel.tsx
 * Purpose: Artist and fan analytics dashboard mini-panels — views, follows, tips, earnings, etc.
 * Placement: apps/web/src/components/analytics/AnalyticsMiniPanel.tsx
 * Depends on: tmi-theme.css
 */

'use client';

import React, { useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArtistAnalytics {
  totalViews: number;
  viewsChange: number;           // % change from prior period
  totalFollows: number;
  followsChange: number;
  totalTips: number;             // points
  tipsChange: number;
  sponsorEarningsCents: number;
  sponsorEarningsChange: number;
  prizeValueWon: number;         // points
  eventPlacements: { place: number; eventName: string; date: string }[];
  battlesWon: number;
  battlesLost: number;
  currentStreak: number;
  magazineFeatureCount: number;
  topGenre: string;
  profileViews7d: number[];       // last 7 days
}

export interface FanAnalytics {
  pointsEarned: number;
  pointsSpent: number;
  currentBalance: number;
  badgesEarned: string[];
  watchStreakDays: number;
  eventsAttended: number;
  votescast: number;
  favArtistId?: string;
  favArtistName?: string;
  reactionsSent: number;
}

type PanelVariant = 'ARTIST_OVERVIEW' | 'ARTIST_EARNINGS' | 'ARTIST_BATTLE_STATS' | 'FAN_STATS' | 'MINI_STAT';

interface StatCardData {
  label: string;
  value: string | number;
  change?: number;    // percentage
  icon: string;
  color: string;
}

interface AnalyticsMiniPanelProps {
  variant: PanelVariant;
  artistData?: ArtistAnalytics;
  fanData?: FanAnalytics;
  customStats?: StatCardData[];
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const ChangeIndicator: React.FC<{ change: number }> = ({ change }) => {
  const color = change > 0 ? '#00FFA8' : change < 0 ? '#FF2DAA' : 'rgba(255,255,255,0.4)';
  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '—';
  return (
    <span style={{ color, fontSize: 10, fontFamily: 'Courier New, monospace', marginLeft: 4 }}>
      {arrow} {Math.abs(change).toFixed(1)}%
    </span>
  );
};

const MiniSparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const height = 32;
  const width = 80;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        points={points}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
      <polyline
        fill={`${color}22`}
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
};

const StatCard: React.FC<StatCardData & { sparkline?: number[] }> = ({ label, value, change, icon, color, sparkline }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${color}22`,
    borderRadius: 8,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    minWidth: 120,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 20, fontWeight: 700, color }}>
        {value}
      </span>
      {change !== undefined && <ChangeIndicator change={change} />}
    </div>
    {sparkline && (
      <div style={{ marginTop: 2 }}>
        <MiniSparkline values={sparkline} color={color} />
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const AnalyticsMiniPanel: React.FC<AnalyticsMiniPanelProps> = ({
  variant,
  artistData,
  fanData,
  customStats,
  className = '',
}) => {
  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(15,12,35,0.96) 0%, rgba(11,11,30,0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px',
    fontFamily: 'system-ui, sans-serif',
    color: '#FFFFFF',
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: 'Courier New, monospace',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  };

  const gridStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  };

  if (variant === 'ARTIST_OVERVIEW' && artistData) {
    return (
      <div className={className} style={panelStyle}>
        <div style={headerStyle}>📊 Artist Overview</div>
        <div style={gridStyle}>
          <StatCard label="Views" value={formatNumber(artistData.totalViews)} change={artistData.viewsChange} icon="👁" color="#22E7FF" sparkline={artistData.profileViews7d} />
          <StatCard label="Follows" value={formatNumber(artistData.totalFollows)} change={artistData.followsChange} icon="❤️" color="#FF2DAA" />
          <StatCard label="Tips" value={formatNumber(artistData.totalTips)} change={artistData.tipsChange} icon="💰" color="#FFD700" />
          <StatCard label="Mag Features" value={artistData.magazineFeatureCount} icon="📰" color="#6B39FF" />
        </div>
      </div>
    );
  }

  if (variant === 'ARTIST_EARNINGS' && artistData) {
    return (
      <div className={className} style={panelStyle}>
        <div style={headerStyle}>💵 Earnings</div>
        <div style={gridStyle}>
          <StatCard label="Sponsor $" value={formatCents(artistData.sponsorEarningsCents)} change={artistData.sponsorEarningsChange} icon="🤝" color="#FFD700" />
          <StatCard label="Prize Points" value={formatNumber(artistData.prizeValueWon)} icon="🏆" color="#FF2DAA" />
        </div>
      </div>
    );
  }

  if (variant === 'ARTIST_BATTLE_STATS' && artistData) {
    const winRate = artistData.battlesWon + artistData.battlesLost > 0
      ? Math.round((artistData.battlesWon / (artistData.battlesWon + artistData.battlesLost)) * 100)
      : 0;

    return (
      <div className={className} style={panelStyle}>
        <div style={headerStyle}>⚔️ Battle Record</div>
        <div style={gridStyle}>
          <StatCard label="Wins" value={artistData.battlesWon} icon="🥇" color="#00FFA8" />
          <StatCard label="Losses" value={artistData.battlesLost} icon="💀" color="#FF2DAA" />
          <StatCard label="Win Rate" value={`${winRate}%`} icon="📈" color="#22E7FF" />
          <StatCard label="Streak" value={artistData.currentStreak} icon="🔥" color="#FFD700" />
        </div>
        {artistData.eventPlacements.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>
              Recent Placements
            </div>
            {artistData.eventPlacements.slice(0, 3).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11 }}>
                <span style={{ fontSize: 14 }}>{p.place === 1 ? '🥇' : p.place === 2 ? '🥈' : '🥉'}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{p.eventName}</span>
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontFamily: 'Courier New', fontSize: 10 }}>{p.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'FAN_STATS' && fanData) {
    return (
      <div className={className} style={panelStyle}>
        <div style={headerStyle}>⭐ Your Stats</div>
        <div style={gridStyle}>
          <StatCard label="Balance" value={formatNumber(fanData.currentBalance)} icon="💎" color="#22E7FF" />
          <StatCard label="Streak" value={`${fanData.watchStreakDays}d`} icon="🔥" color="#FF2DAA" />
          <StatCard label="Events" value={fanData.eventsAttended} icon="🎪" color="#FFD700" />
          <StatCard label="Reactions" value={formatNumber(fanData.reactionsSent)} icon="💬" color="#6B39FF" />
        </div>
        {fanData.badgesEarned.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {fanData.badgesEarned.slice(0, 6).map((badge, i) => (
              <span key={i} style={{ fontSize: 18 }} title={badge}>{badge}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'MINI_STAT' && customStats) {
    return (
      <div className={className} style={{ ...panelStyle, padding: 10 }}>
        <div style={gridStyle}>
          {customStats.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>
      </div>
    );
  }

  return null;
};

export default AnalyticsMiniPanel;
