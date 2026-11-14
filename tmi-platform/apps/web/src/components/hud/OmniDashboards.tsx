'use client';

import React, { useEffect, useState } from 'react';
import MonitorSatelliteSystem from '@/components/canisters/MonitorSatelliteSystem';

type LiteLiveSession = {
  roomId?: string;
  displayName?: string;
  title?: string;
  viewerCount?: number;
  avatarUrl?: string | null;
  thumbnailUrl?: string | null;
  accentColor?: string;
  privacy?: string;
};

type LiteGoResponse = {
  sessions?: LiteLiveSession[];
  count?: number;
  lite?: boolean;
};

/**
 * Overseer / admin observatory shell.
 * Monitor satellites render registry-backed LIVE only — never fabricated
 * isLive / audience counts (Rule 20).
 */
export default function OmniDashboards() {
  const [activeTab, setActiveTab] = useState<'fan' | 'artist' | 'overseer' | 'admin'>('admin');
  const [liveSessions, setLiveSessions] = useState<LiteLiveSession[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [liveLoadState, setLiveLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (activeTab !== 'overseer') return;
    let cancelled = false;
    const load = async () => {
      setLiveLoadState('loading');
      try {
        const res = await fetch('/api/live/go?lite=1', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) throw new Error(`live go ${res.status}`);
        const data = (await res.json()) as LiteGoResponse;
        if (cancelled) return;
        setLiveSessions(Array.isArray(data.sessions) ? data.sessions : []);
        setLiveCount(typeof data.count === 'number' ? data.count : null);
        setLiveLoadState('ready');
      } catch {
        if (cancelled) return;
        setLiveSessions([]);
        setLiveCount(null);
        setLiveLoadState('error');
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 12000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [activeTab]);

  return (
    <div style={{ background: '#050815', minHeight: '100vh', color: '#FF8C00', fontFamily: 'var(--font-orbitron), sans-serif' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', background: '#030610', borderBottom: '1px solid rgba(220,70,0,0.5)', padding: '10px 20px', gap: '12px' }}>
        {[
          { id: 'fan', label: '🎭 FAN THEATER' },
          { id: 'artist', label: '🎤 ARTIST STUDIO' },
          { id: 'overseer', label: '👁 OVERSEER DECK' },
          { id: 'admin', label: '⚙️ ADMIN HUB' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'fan' | 'artist' | 'overseer' | 'admin')}
            style={{
              background: activeTab === tab.id ? 'rgba(230,48,0,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#FFD700' : 'rgba(255,140,0,0.5)',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #E63000' : 'none',
              padding: '8px 16px', fontWeight: 800, cursor: 'pointer', borderRadius: '4px'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>
        {activeTab === 'overseer' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(0,255,255,0.5)', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px' }}>
              <h2 style={{ color: '#00FFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>OVERSEER DECK — BROADCAST COMMAND CENTER</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: liveLoadState === 'ready' ? '#00FF7F' : liveLoadState === 'error' ? '#FF4444' : '#FFD700', fontSize: '12px', fontWeight: 800 }}>
                  {liveLoadState === 'loading'
                    ? '● LOADING REGISTRY'
                    : liveLoadState === 'error'
                      ? '● REGISTRY UNAVAILABLE'
                      : liveCount != null && liveCount > 0
                        ? `● ${liveCount} PUBLIC LIVE`
                        : '● NO PUBLIC LIVE'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {liveLoadState === 'loading' && (
                <div style={{ gridColumn: '1 / -1', padding: 24, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  Loading live registry…
                </div>
              )}
              {liveLoadState === 'error' && (
                <div style={{ gridColumn: '1 / -1', padding: 24, color: '#ff8a8a', fontSize: 13 }}>
                  Unable to load live sessions. Retry shortly.
                </div>
              )}
              {liveLoadState === 'ready' && liveSessions.length === 0 && (
                <div
                  data-overseer-monitors-empty="1"
                  style={{ gridColumn: '1 / -1', padding: 24, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}
                >
                  No active public live sessions. Monitors stay idle until GlobalLiveSessionRegistry reports real rooms.
                </div>
              )}
              {liveSessions.slice(0, 8).map((session, idx) => {
                const roomId = session.roomId?.trim();
                const label = session.title || session.displayName || `LIVE ${idx + 1}`;
                const accent = session.accentColor || ['#E63000', '#00FFFF', '#FFD700', '#FF2DAA'][idx % 4];
                return (
                  <MonitorSatelliteSystem
                    key={roomId || `session-${idx}`}
                    mainLabel={label}
                    isLive={Boolean(roomId)}
                    liveRoomRoute={roomId ? `/live/rooms/${roomId}` : undefined}
                    staticImageUrl={
                      session.thumbnailUrl ||
                      session.avatarUrl ||
                      '/images/tmi-placeholder.jpg'
                    }
                    accentColor={accent}
                    adZone={`admin-overseer-${idx + 1}`}
                    audienceCount={typeof session.viewerCount === 'number' ? session.viewerCount : 0}
                    showAudienceMonitor
                  />
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(0,255,255,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔴</div>
                <div style={{ fontSize: '10px', color: 'rgba(0,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Public Live Count</div>
                <div style={{ fontSize: '20px', color: '#fff', fontWeight: 900 }}>
                  {liveCount == null ? '—' : liveCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#00FF7F', marginTop: '4px', fontWeight: 800 }}>
                  Registry truth (INVITE_ONLY excluded)
                </div>
              </div>
              <div style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(0,255,255,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
                <div style={{ fontSize: '10px', color: 'rgba(0,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Monitor Feeds</div>
                <div style={{ fontSize: '20px', color: '#fff', fontWeight: 900 }}>{liveSessions.length}</div>
                <div style={{ fontSize: '10px', color: '#00FFFF', marginTop: '4px', fontWeight: 800 }}>Active session rows</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px' }}>
              <h2 style={{ color: '#E63000', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>SYSTEM ADMINISTRATION</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 800 }}>● METRICS: OPEN KPI SURFACES</span>
              </div>
            </div>

            <div
              data-admin-hub-honest-empty="1"
              style={{
                background: 'rgba(8,14,38,0.95)',
                border: '1px solid rgba(220,70,0,0.5)',
                padding: '20px',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.65)',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Fabricated user/revenue/live tiles were removed (Rule 20). Use certified admin KPI / revenue routes for real numbers — this shell no longer paints demo stats.
            </div>
          </div>
        )}

        {activeTab !== 'admin' && activeTab !== 'overseer' && (
          <div style={{ color: '#FFD700', textAlign: 'center', padding: '40px', fontSize: '18px', fontWeight: 900 }}>
            [ {activeTab.toUpperCase()} MODULE LOADED ]
          </div>
        )}
      </div>
    </div>
  );
}
