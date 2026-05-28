'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import HighFidelityAvatar from '@/components/avatar/HighFidelityAvatar';
import { VibeControlPanel } from '@/components/live/VibeControlPanel';
import FoundingSupporterCTA from '@/components/launch/FoundingSupporterCTA';
import type { VibeState } from '@/types/vibe';

type LobbyRole = 'fan' | 'performer' | 'artist';
type LobbyStatus = 'idle' | 'live' | 'private';

interface TmiProfileLobbyProps {
  slug: string;
  displayName: string;
  role: LobbyRole;
  avatarUrl?: string;
  accentColor?: string;
}

const ACCENT: Record<LobbyRole, string> = {
  fan:       '#00FFFF',
  performer: '#FF2DAA',
  artist:    '#AA2DFF',
};

const ROLE_LABEL: Record<LobbyRole, string> = {
  fan:       'FAN LOBBY',
  performer: 'PERFORMER LOBBY',
  artist:    'ARTIST ROOM',
};

const DEFAULT_VIBE: VibeState = {
  underlay: 'neon-pulse',
  overlay: 'none',
  strobeIntensity: 0.35,
  transitionMode: 'fade',
  spotlightMode: false,
  shaderQuality: 'medium',
};

function storageKey(slug: string) {
  return `tmi-lobby-public-${slug}`;
}

export default function TmiProfileLobby({
  slug,
  displayName,
  role,
  avatarUrl,
  accentColor,
}: TmiProfileLobbyProps) {
  const color = accentColor ?? ACCENT[role];
  const lobbyRoomId = `lobby-${role}-${slug}`;
  const enterPath = `/live/rooms/${lobbyRoomId}`;

  const [isOwner, setIsOwner]       = useState(false);
  const [isPublic, setIsPublic]     = useState(true);
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>('idle');
  const [expanded, setExpanded]     = useState(false);
  const [vibe, setVibe]             = useState<VibeState>(DEFAULT_VIBE);
  const [vibeOpen, setVibeOpen]     = useState(false);

  // Restore public/private from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(slug));
      if (stored === 'private') setIsPublic(false);
    } catch {}
  }, [slug]);

  // Session check — determine ownership
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean; user?: { id?: string } }) => {
        if (data.authenticated && data.user?.id) {
          const uid = data.user.id.toLowerCase();
          setIsOwner(uid === slug.toLowerCase() || uid === slug);
        }
      })
      .catch(() => {});
  }, [slug]);

  const togglePublic = useCallback(() => {
    setIsPublic((prev) => {
      const next = !prev;
      try { localStorage.setItem(storageKey(slug), next ? 'public' : 'private'); } catch {}
      return next;
    });
  }, [slug]);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const handleVibeChange = useCallback((patch: Partial<VibeState>) => {
    setVibe((prev) => ({ ...prev, ...patch }));
  }, []);

  const statusColor: Record<LobbyStatus, string> = {
    idle:    'rgba(255,255,255,0.3)',
    live:    '#FF2DAA',
    private: '#FFD700',
  };

  const statusLabel: Record<LobbyStatus, string> = {
    idle:    'IDLE',
    live:    'LIVE',
    private: 'PRIVATE',
  };

  return (
    <div style={{
      border: `1px solid ${color}22`,
      background: `linear-gradient(135deg, ${color}06, rgba(5,5,16,0.92))`,
      borderRadius: 12,
      marginTop: 24,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div
        onClick={toggleExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: 'pointer',
          borderBottom: expanded ? `1px solid ${color}18` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status dot */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: statusColor[lobbyStatus],
            boxShadow: lobbyStatus === 'live' ? `0 0 8px ${statusColor.live}` : 'none',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.2em',
            color, textTransform: 'uppercase',
          }}>
            {ROLE_LABEL[role]}
          </span>
          <span style={{
            fontSize: 7, fontWeight: 800, letterSpacing: '0.12em',
            color: statusColor[lobbyStatus],
            background: `${statusColor[lobbyStatus]}18`,
            border: `1px solid ${statusColor[lobbyStatus]}44`,
            borderRadius: 4, padding: '1px 5px',
          }}>
            {statusLabel[lobbyStatus]}
          </span>
          {!isPublic && (
            <span style={{
              fontSize: 7, fontWeight: 800, letterSpacing: '0.1em', color: '#FFD700',
              background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 4, padding: '1px 5px',
            }}>
              FOLLOWERS ONLY
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href={enterPath}
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 9, fontWeight: 900,
              background: color, color: '#050510',
              textDecoration: 'none', letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            ENTER LOBBY
          </Link>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '16px 16px 20px' }}>

          {/* Performer lobby — video-first */}
          {(role === 'performer' || role === 'artist') && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                PERFORMER PRESENCE
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                border: `1px solid ${color}22`,
                borderRadius: 8,
                background: `${color}07`,
              }}>
                <HighFidelityAvatar
                  imageUrl={avatarUrl}
                  name={displayName}
                  size={64}
                  tierColor={color}
                  showCreateCTA={!avatarUrl}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{displayName}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color, marginBottom: 6 }}>
                    {role === 'artist' ? 'ARTIST' : 'PERFORMER'} · {isPublic ? 'PUBLIC ROOM' : 'PRIVATE ROOM'}
                  </div>
                  <Link
                    href={`/live/go?profile=${slug}`}
                    style={{
                      display: 'inline-block', padding: '5px 12px', borderRadius: 6,
                      border: `1px solid ${color}55`, background: `${color}12`,
                      color, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em',
                      textDecoration: 'none',
                    }}
                  >
                    🔴 GO LIVE
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Fan lobby — avatar-first */}
          {role === 'fan' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                FAN IDENTITY
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                border: `1px solid ${color}22`,
                borderRadius: 8,
                background: `${color}07`,
              }}>
                <HighFidelityAvatar
                  imageUrl={avatarUrl}
                  name={displayName}
                  size={64}
                  tierColor={color}
                  showCreateCTA={!avatarUrl}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{displayName}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color, marginBottom: 6 }}>
                    FAN · {isPublic ? 'PUBLIC HANGOUT' : 'PRIVATE SPACE'}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link
                      href="/avatar/scan/wardrobe"
                      style={{
                        padding: '5px 12px', borderRadius: 6,
                        border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)',
                        color: '#FFD700', fontSize: 8, fontWeight: 900, letterSpacing: '0.08em',
                        textDecoration: 'none',
                      }}
                    >
                      WARDROBE
                    </Link>
                    <Link
                      href="/avatar/create"
                      style={{
                        padding: '5px 12px', borderRadius: 6,
                        border: `1px solid ${color}44`, background: `${color}08`,
                        color, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em',
                        textDecoration: 'none',
                      }}
                    >
                      CUSTOMIZE
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Public/Private toggle — owner only */}
          {isOwner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                  Lobby Visibility
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
                  {isPublic
                    ? 'Anyone can discover this lobby on the billboard wall'
                    : 'Only followers and invited guests can enter'}
                </div>
              </div>
              <button
                onClick={togglePublic}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 9, fontWeight: 900,
                  border: isPublic ? `1px solid ${color}55` : '1px solid rgba(255,215,0,0.55)',
                  background: isPublic ? `${color}18` : 'rgba(255,215,0,0.12)',
                  color: isPublic ? color : '#FFD700',
                  cursor: 'pointer', letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {isPublic ? 'PUBLIC' : 'PRIVATE'}
              </button>
            </div>
          )}

          {/* Vibe controls — performers/artists only */}
          {(role === 'performer' || role === 'artist') && (
            <div>
              <button
                onClick={() => setVibeOpen((v) => !v)}
                style={{
                  width: '100%', padding: '8px 12px', marginBottom: vibeOpen ? 8 : 0,
                  border: '1px solid rgba(0,255,255,0.18)',
                  background: 'rgba(0,255,255,0.05)',
                  color: '#00FFFF', fontSize: 9, fontWeight: 900,
                  letterSpacing: '0.12em', cursor: 'pointer', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>STAGE VIBE CONTROLS</span>
                <span style={{ transform: vibeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 10 }}>▾</span>
              </button>
              {vibeOpen && (
                <VibeControlPanel
                  role={isOwner ? 'performer' : 'fan'}
                  vibeState={vibe}
                  onVibeChange={handleVibeChange}
                />
              )}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <FoundingSupporterCTA variant="lobby" />
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              href={enterPath}
              style={{
                flex: 1, minWidth: 110, padding: '9px 12px', borderRadius: 8,
                border: `1px solid ${color}44`, background: `${color}12`,
                color, fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              ENTER LOBBY
            </Link>
            <Link
              href={`/live/lobby/${role}s`}
              style={{
                flex: 1, minWidth: 110, padding: '9px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              LOBBY WALL
            </Link>
            <Link
              href={`/live/lobby/${role}s`}
              style={{
                flex: 1, minWidth: 110, padding: '9px 12px', borderRadius: 8,
                border: '1px solid rgba(255,215,0,0.18)', background: 'rgba(255,215,0,0.06)',
                color: '#FFD700', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              INVITE FRIENDS
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
