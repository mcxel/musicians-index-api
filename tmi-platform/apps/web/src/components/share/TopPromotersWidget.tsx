'use client';

/**
 * TopPromotersWidget — shows the top viral promoters from the playlist share leaderboard.
 * Drop into any profile, homepage, or admin page.
 *
 * Props:
 *   limit   — number of rows to show (default 5)
 *   compact — single-line strip mode
 */

import React, { useEffect, useState } from 'react';

interface LeaderboardRow {
  playlistId: string;
  shares: number;
  opens: number;
  clicks: number;
  copies: number;
  lastAt: number;
  shareToClickRate: number;
  openToShareRate: number;
}

interface TopPromotersWidgetProps {
  limit?: number;
  compact?: boolean;
  className?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function formatRate(r: number): string {
  return `${(r * 100).toFixed(0)}%`;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function TopPromotersWidget({
  limit = 5,
  compact = false,
  className,
}: TopPromotersWidgetProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/referral/playlist-share/leaderboard?limit=${limit}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = (await res.json()) as { leaderboard?: LeaderboardRow[] };
        setRows(data.leaderboard ?? []);
      } catch {
        setError('Could not load leaderboard.');
      } finally {
        setLoading(false);
      }
    }
    void load();
    const interval = setInterval(load, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [limit]);

  const containerStyle: React.CSSProperties = {
    background: 'rgba(0,255,255,0.04)',
    border: '1px solid rgba(0,255,255,0.14)',
    borderRadius: 14,
    padding: compact ? '10px 14px' : '18px 20px',
    ...(className ? {} : {}),
  };

  if (compact) {
    if (loading) {
      return (
        <div style={containerStyle}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Loading promoters…
          </span>
        </div>
      );
    }
    if (error || rows.length === 0) return null;

    return (
      <div style={containerStyle} className={className}>
        <span
          style={{
            fontSize: 11,
            color: '#00FFFF',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginRight: 8,
          }}
        >
          🔥 Top Promoters:
        </span>
        {rows.slice(0, 3).map((r, i) => (
          <span
            key={r.playlistId}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginRight: 10 }}
          >
            {MEDALS[i] ?? `#${i + 1}`} {r.shares} shares · {formatRate(r.shareToClickRate)} CTR
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <h3
        style={{
          fontFamily: '"Bebas Neue","Impact",sans-serif',
          fontSize: 16,
          letterSpacing: '0.08em',
          color: '#00FFFF',
          margin: '0 0 14px 0',
        }}
      >
        🔥 TOP PROMOTERS TODAY
      </h3>

      {loading && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Loading…
        </p>
      )}
      {!loading && error && (
        <p style={{ fontSize: 12, color: 'rgba(255,60,60,0.7)', margin: 0 }}>
          {error}
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          No promoters yet. Be the first!
        </p>
      )}
      {!loading &&
        !error &&
        rows.map((row, i) => (
          <div
            key={row.playlistId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom:
                i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>
              {MEDALS[i] ?? `#${i + 1}`}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.playlistId}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {timeAgo(row.lastAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#FF2DAA',
                }}
              >
                {row.shares} shares
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {formatRate(row.shareToClickRate)} CTR · {row.clicks} clicks
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
