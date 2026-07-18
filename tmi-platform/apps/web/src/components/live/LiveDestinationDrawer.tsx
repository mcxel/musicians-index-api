'use client';

import { useState } from 'react';

type DestinationId = 'tmi' | 'youtube' | 'twitch' | 'facebook' | 'tiktok' | 'instagram';
type StreamStatus = 'LIVE' | 'OFF' | 'CONNECTING' | 'RECONNECT';

interface DestinationState {
  id: DestinationId;
  label: string;
  logo: string;
  handle: string;
  status: StreamStatus;
  viewers: number;
  health: 'Excellent' | 'Fair' | 'Poor' | 'Disconnected';
  bitrate: string;
  accent: string;
}

export default function LiveDestinationDrawer() {
  const [destinations, setDestinations] = useState<DestinationState[]>([
    { id: 'tmi', label: 'TMI Live', logo: '🟣', handle: '@MarcelD', status: 'LIVE', viewers: 12847, health: 'Excellent', bitrate: '6.2 Mbps', accent: '#FF2DAA' },
    { id: 'youtube', label: 'YouTube', logo: '🔴', handle: 'Marcel Official', status: 'LIVE', viewers: 4231, health: 'Excellent', bitrate: '5.8 Mbps', accent: '#FF0000' },
    { id: 'twitch', label: 'Twitch', logo: '🟣', handle: 'marcel_beats', status: 'OFF', viewers: 0, health: 'Disconnected', bitrate: '0 Kbps', accent: '#9146FF' },
    { id: 'facebook', label: 'Facebook', logo: '🔵', handle: 'Marcel D Music', status: 'RECONNECT', viewers: 0, health: 'Poor', bitrate: '120 Kbps', accent: '#1877F2' },
    { id: 'tiktok', label: 'TikTok', logo: '⚫', handle: '@marceld_live', status: 'OFF', viewers: 0, health: 'Disconnected', bitrate: '0 Kbps', accent: '#00F2FE' },
    { id: 'instagram', label: 'Instagram', logo: '🟠', handle: 'marcel_beats_live', status: 'OFF', viewers: 0, health: 'Disconnected', bitrate: '0 Kbps', accent: '#E1306C' },
  ]);

  const [expandedId, setExpandedId] = useState<DestinationId | null>(null);

  const toggleStatus = (id: DestinationId) => {
    setDestinations((prev) =>
      prev.map((dest) => {
        if (dest.id === id) {
          const newStatus: StreamStatus = dest.status === 'LIVE' ? 'OFF' : 'LIVE';
          return {
            ...dest,
            status: newStatus,
            viewers: newStatus === 'LIVE' ? Math.floor(Math.random() * 500) + 100 : 0,
            health: newStatus === 'LIVE' ? 'Excellent' : 'Disconnected',
            bitrate: newStatus === 'LIVE' ? '4.5 Mbps' : '0 Kbps',
          };
        }
        return dest;
      })
    );
  };

  const handleReconnect = (id: DestinationId) => {
    setDestinations((prev) =>
      prev.map((dest) => {
        if (dest.id === id) {
          return { ...dest, status: 'CONNECTING', health: 'Fair' };
        }
        return dest;
      })
    );

    setTimeout(() => {
      setDestinations((prev) =>
        prev.map((dest) => {
          if (dest.id === id) {
            return { ...dest, status: 'LIVE', health: 'Excellent', bitrate: '5.2 Mbps', viewers: 180 };
          }
          return dest;
        })
      );
    }, 2000);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(10, 6, 20, 0.45)',
      backdropFilter: 'blur(12px)',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      padding: '16px 14px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      overflowY: 'auto'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', margin: 0, textTransform: 'uppercase', color: '#FF2DAA' }}>
            Broadcasting Destinations
          </h2>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Multistream Routing
          </span>
        </div>
      </div>

      {/* Target list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {destinations.map((dest) => {
          const isExpanded = expandedId === dest.id;
          const isLive = dest.status === 'LIVE';
          const isConnecting = dest.status === 'CONNECTING';
          const isReconnect = dest.status === 'RECONNECT';

          return (
            <div
              key={dest.id}
              style={{
                background: isLive ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)',
                border: isLive ? `1.5px solid ${dest.accent}40` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'all 200ms ease'
              }}
            >
              {/* Header block */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : dest.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{dest.logo}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>{dest.label}</div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)' }}>{dest.handle}</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isLive && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.3)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 8,
                      fontWeight: 900,
                      color: '#00FF88'
                    }}>
                      <span style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#00FF88',
                        boxShadow: '0 0 6px #00FF88'
                      }} />
                      LIVE
                    </span>
                  )}
                  {isConnecting && (
                    <span style={{
                      background: 'rgba(255,215,0,0.1)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 8,
                      fontWeight: 900,
                      color: '#FFD700',
                      animation: 'pulse 1.5s infinite alternate'
                    }}>
                      SYNCING
                    </span>
                  )}
                  {isReconnect && (
                    <span style={{
                      background: 'rgba(255,68,68,0.1)',
                      border: '1px solid rgba(255,68,68,0.3)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 8,
                      fontWeight: 900,
                      color: '#FF4444'
                    }}>
                      ERROR
                    </span>
                  )}
                  {dest.status === 'OFF' && (
                    <span style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 8,
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.45)'
                    }}>
                      OFFLINE
                    </span>
                  )}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expansion Details */}
              {isExpanded && (
                <div style={{
                  padding: '0 12px 12px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  paddingTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  background: 'rgba(0,0,0,0.1)'
                }}>
                  {/* Grid Status Parameters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 6px' }}>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>HEALTH</div>
                      <div style={{ fontSize: 8, fontWeight: 900, color: dest.health === 'Excellent' ? '#00FF88' : dest.health === 'Fair' ? '#FFD700' : '#FF4444' }}>{dest.health}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 6px' }}>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>VIEWERS</div>
                      <div style={{ fontSize: 8, fontWeight: 900, color: '#fff' }}>{dest.viewers.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 6px' }}>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>BITRATE</div>
                      <div style={{ fontSize: 8, fontWeight: 900, color: '#fff' }}>{dest.bitrate}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 6px' }}>
                      <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>RTMP CHANNEL</div>
                      <div style={{ fontSize: 8, fontWeight: 900, color: '#00FFFF' }}>rtmp://tmi.live/push</div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {dest.id !== 'tmi' && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {isReconnect ? (
                        <button
                          onClick={() => handleReconnect(dest.id)}
                          style={{
                            flex: 1,
                            background: 'rgba(255,215,0,0.15)',
                            border: '1px solid #FFD700',
                            borderRadius: 6,
                            color: '#FFD700',
                            fontSize: 8,
                            fontWeight: 900,
                            padding: '5px 0',
                            cursor: 'pointer'
                          }}
                        >
                          RECONNECT
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(dest.id)}
                          disabled={isConnecting}
                          style={{
                            flex: 1,
                            background: isLive ? 'rgba(255,68,68,0.15)' : 'rgba(0,255,136,0.15)',
                            border: `1px solid ${isLive ? '#FF4444' : '#00FF88'}`,
                            borderRadius: 6,
                            color: isLive ? '#FF8A8A' : '#00FF88',
                            fontSize: 8,
                            fontWeight: 900,
                            padding: '5px 0',
                            cursor: isConnecting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isLive ? 'DISCONNECT' : 'CONNECT'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Broadcast presets */}
      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>
          BROADCAST PROFILES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { name: 'Quick Stream', targets: 'TMI only' },
            { name: 'Concert Broadcast', targets: 'TMI, YouTube, Facebook' },
            { name: 'Social Cast', targets: 'Twitch, TikTok, Instagram' }
          ].map((profile) => (
            <button
              key={profile.name}
              style={{
                textAlign: 'left',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, color: '#FF8FBE' }}>{profile.name}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>{profile.targets}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
