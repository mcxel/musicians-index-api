export const dynamic = 'force-dynamic';

'use client';

import { useMemo, useState } from 'react';

interface Snapshot {
  playlistId: string;
  shares: number;
  opens: number;
  clicks: number;
  copies: number;
  lastAt: number;
}

interface LeaderboardRow extends Snapshot {
  shareToClickRate: number;
  openToShareRate: number;
}

const DEMO_PLAYLISTS = ['nova-cipher-001', 'kreach-001', 'spotlight-issue-1'];

function ratio(top: number, bottom: number): string {
  if (bottom <= 0) return '0%';
  return `${Math.round((top / bottom) * 100)}%`;
}

export default function AdminPublicLaunchViralPage() {
  const [playlistId, setPlaylistId] = useState(DEMO_PLAYLISTS[0]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSnapshot(target: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/referral/playlist-share?playlistId=${encodeURIComponent(target)}`);
      const json = (await res.json()) as { ok?: boolean; snapshot?: Snapshot; error?: string };
      if (!res.ok || !json.ok || !json.snapshot) {
        throw new Error(json.error || 'Failed to load viral share stats');
      }
      setSnapshot(json.snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaderboard() {
    try {
      const res = await fetch('/api/referral/playlist-share/leaderboard?limit=12');
      const json = (await res.json()) as { ok?: boolean; leaderboard?: LeaderboardRow[]; error?: string };
      if (!res.ok || !json.ok || !json.leaderboard) {
        throw new Error(json.error || 'Failed to load leaderboard');
      }
      setLeaderboard(json.leaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const health = useMemo(() => {
    if (!snapshot) return { label: 'NO DATA', color: '#999' };
    const shareToClick = snapshot.shares > 0 ? snapshot.clicks / snapshot.shares : 0;
    if (shareToClick >= 0.6) return { label: 'HOT', color: '#00FF88' };
    if (shareToClick >= 0.3) return { label: 'WARM', color: '#FFD700' };
    return { label: 'COLD', color: '#FF6B6B' };
  }, [snapshot]);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30 }}>Viral Playlist Lock Monitor</h1>
        <p style={{ margin: 0, color: '#9fd3df' }}>
          Tracks share, open, copy, and referral click throughput for Phase 1 playlist virality.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            placeholder="playlist id"
            style={{
              minWidth: 280,
              background: '#0c1020',
              border: '1px solid #00ffff44',
              borderRadius: 10,
              color: '#fff',
              padding: '10px 12px',
            }}
          />
          <button
            type="button"
            onClick={() => {
              void loadSnapshot(playlistId);
              void loadLeaderboard();
            }}
            style={{
              border: '1px solid #00ffff77',
              background: 'linear-gradient(120deg, #00ffff1f, #ff2daa26)',
              color: '#f8ffff',
              borderRadius: 999,
              padding: '10px 14px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Loading...' : 'Load Snapshot'}
          </button>
          {DEMO_PLAYLISTS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPlaylistId(id);
                void loadSnapshot(id);
                void loadLeaderboard();
              }}
              style={{
                border: '1px solid #ffffff25',
                background: '#ffffff08',
                color: '#fff',
                borderRadius: 999,
                padding: '8px 12px',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              {id}
            </button>
          ))}
        </div>

        {error ? (
          <div style={{ border: '1px solid #ff6b6b55', background: '#ff6b6b12', borderRadius: 12, padding: 12, color: '#ff9f9f' }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Shares', value: snapshot?.shares ?? 0, color: '#00FFFF' },
            { label: 'Opens', value: snapshot?.opens ?? 0, color: '#AA2DFF' },
            { label: 'Copies', value: snapshot?.copies ?? 0, color: '#FFD700' },
            { label: 'Referral Clicks', value: snapshot?.clicks ?? 0, color: '#00FF88' },
          ].map((tile) => (
            <div key={tile.label} style={{ border: `1px solid ${tile.color}33`, background: '#0d1022', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 10, color: '#98a5bb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tile.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: tile.color }}>{tile.value}</div>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ffffff1f', background: '#0d1022', borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#9fb3c8' }}>Share → Click</span>
            <span style={{ color: '#fff' }}>{ratio(snapshot?.clicks ?? 0, snapshot?.shares ?? 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#9fb3c8' }}>Open → Share</span>
            <span style={{ color: '#fff' }}>{ratio(snapshot?.shares ?? 0, snapshot?.opens ?? 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#9fb3c8' }}>Current Heat</span>
            <span style={{ color: health.color, fontWeight: 800 }}>{health.label}</span>
          </div>
          {snapshot ? (
            <div style={{ color: '#8ba0b7', fontSize: 11 }}>
              Last event: {new Date(snapshot.lastAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div style={{ border: '1px solid #ffffff1f', background: '#0d1022', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#9fb3c8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Top Viral Playlists
            </div>
            <button
              type="button"
              onClick={() => {
                void loadLeaderboard();
              }}
              style={{
                border: '1px solid #ffffff25',
                background: '#ffffff08',
                color: '#fff',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {leaderboard.length === 0 ? (
              <div style={{ color: '#7f91a6', fontSize: 12 }}>No viral playlists tracked yet.</div>
            ) : (
              leaderboard.map((row, index) => (
                <div
                  key={row.playlistId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px minmax(0,1fr) repeat(3, 90px)',
                    gap: 8,
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ color: '#FFD700', fontWeight: 800 }}>#{index + 1}</div>
                  <div style={{ color: '#d8e4f5', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.playlistId}</div>
                  <div style={{ color: '#00FFFF', fontSize: 11 }}>S {row.shares}</div>
                  <div style={{ color: '#00FF88', fontSize: 11 }}>C {row.clicks}</div>
                  <div style={{ color: '#FFD700', fontSize: 11 }}>{Math.round(row.shareToClickRate * 100)}%</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
