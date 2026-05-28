'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStageWebRTC } from '@/hooks/useStageWebRTC';
import { useLiveSessionHeartbeat } from '@/hooks/useLiveSessionHeartbeat';
import { recordFanJoin, recordFanMessage } from '@/lib/fans/SuperFanMomentumEngine';
import PerformerRelationshipPanel from './PerformerRelationshipPanel';
import AudienceRecognitionOverlay from './AudienceRecognitionOverlay';
import { SystemSecurityBot } from '@/lib/bots/SystemSecurityBot';

type ArenaMode = 'audience' | 'performer';

type AudienceMember = {
  userId: string;
  displayName: string;
  role: 'fan' | 'artist' | 'host' | 'bot';
  seatId: string | null;
  captureEnabled: boolean;
  viewpoint: {
    yaw: number;
    pitch: number;
    updatedAt: number;
  };
};

type AudienceMessage = {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: number;
};

type Snapshot = {
  venueSlug: string;
  present: number;
  capacity: number;
  occupancyPct: number;
  activeMembers: AudienceMember[];
  messages?: AudienceMessage[];
  moderation?: {
    slowModeMs: number;
    mutedUserIds: string[];
  };
};

interface Props {
  roomId: string;
  mode: ArenaMode;
}

function publicName(name: string): string {
  if (!name.includes('@')) return name;
  const [local] = name.split('@');
  if (!local) return 'Audience Member';
  if (local.length <= 2) return `${local[0] ?? 'u'}*`;
  return `${local.slice(0, 2)}***`;
}

const FALLBACK_AUDIENCE = [
  { id: 'fb-1', name: 'Nova Fan', avatar: '🎧' },
  { id: 'fb-2', name: 'Crown Vibe', avatar: '🔥' },
  { id: 'fb-3', name: 'Wave Room', avatar: '🎶' },
  { id: 'fb-4', name: 'Pulse Mode', avatar: '✨' },
  { id: 'fb-5', name: 'Neon Seat', avatar: '🎤' },
  { id: 'fb-6', name: 'Arena Fam', avatar: '💫' },
  { id: 'fb-7', name: 'Beat Watch', avatar: '🪩' },
  { id: 'fb-8', name: 'Stage Eye', avatar: '👀' },
];

const AVATAR_SET = ['🎧', '🔥', '🎶', '✨', '🎤', '💫', '🪩', '👑'];

function hashAvatar(seed: string): string {
  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_SET[hash % AVATAR_SET.length] ?? '🎧';
}

function rotateWindow<T>(items: T[], start: number, count: number): T[] {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, i) => items[(start + i) % items.length] as T);
}

const securityBot = new SystemSecurityBot();

export default function ArenaImmersivePanel({ roomId, mode }: Props) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [userId, setUserId] = useState('guest-user');
  const [displayName, setDisplayName] = useState(mode === 'performer' ? 'Performer' : 'Fan');
  const [joined, setJoined] = useState(true);
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [slowModeSeconds, setSlowModeSeconds] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [liveSession, setLiveSession] = useState<{
    displayName: string; title: string; viewerCount: number; tipTotal: number; stageState: string; accentColor: string; userId: string;
  } | null>(null);
  const prevMemberIdsRef = useRef<Set<string>>(new Set());

  const { stream, error, videoRef } = useStageWebRTC({
    video: mode === 'performer' || (mode === 'audience' && captureEnabled),
    audio: mode === 'performer' || (mode === 'audience' && captureEnabled),
    hd: false,
  });

  // Performer heartbeat — keeps live session alive + reports viewer count to registry
  useLiveSessionHeartbeat({
    enabled: mode === 'performer',
    viewerCount: snapshot?.present ?? 0,
  });

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string; name?: string; email?: string } }) => {
        if (!data.authenticated || !data.user?.id) return;
        const resolved = data.user.name ?? data.user.email ?? data.user.id;
        setUserId(data.user.id.substring(0, 16));
        setDisplayName(publicName(resolved.slice(0, 40)));
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}&messages=1`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return;
    const data = (await response.json()) as Snapshot;
    setSnapshot(data);
  }, [roomId]);

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => void refresh(), 2500);
    return () => window.clearInterval(poll);
  }, [refresh]);

  useEffect(() => {
    type SessionEntry = { roomId: string; userId: string; displayName: string; title: string; viewerCount: number; tipTotal: number; stageState: string; accentColor: string };
    async function fetchSession() {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { sessions: SessionEntry[] };
        const match = data.sessions.find((s) => s.roomId === roomId);
        setLiveSession(match ?? null);
      } catch { /* non-fatal */ }
    }
    void fetchSession();
    const interval = setInterval(fetchSession, 5_000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Track new audience members in SuperFanMomentumEngine
  useEffect(() => {
    if (!liveSession?.userId) return;
    const currentIds = (snapshot?.activeMembers ?? []).map((m) => m.userId);
    for (const member of snapshot?.activeMembers ?? []) {
      if (!prevMemberIdsRef.current.has(member.userId)) {
        recordFanJoin(liveSession.userId, roomId, member.userId, member.displayName);
      }
    }
    prevMemberIdsRef.current = new Set(currentIds);
  }, [snapshot?.activeMembers, liveSession?.userId, roomId]);

  useEffect(() => {
    if (mode !== 'audience' || !joined) return;
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        venueSlug: roomId,
        member: {
          userId,
          displayName,
          role: 'fan',
          seatId: null,
          captureEnabled,
          viewpoint: { yaw: 0, pitch: 0, updatedAt: Date.now() },
        },
      }),
    }).then(() => refresh()).catch(() => {});

    return () => {
      void fetch('/api/live/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          venueSlug: roomId,
          userId,
        }),
      }).catch(() => {});
    };
  }, [mode, joined, roomId, userId, displayName, captureEnabled, refresh]);

  useEffect(() => {
    if (mode !== 'audience' || !joined) return;
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture',
        venueSlug: roomId,
        userId,
        captureEnabled,
      }),
    })
      .then(() => {
        window.dispatchEvent(new CustomEvent('tmi:arena-status', {
          detail: {
            roomId,
            message: captureEnabled ? 'Audience camera capture enabled' : 'Audience camera capture disabled',
          },
        }));
      })
      .catch(() => {});
  }, [mode, joined, roomId, userId, captureEnabled]);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
    void videoRef.current.play();
  }, [stream, videoRef]);

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');

    if (!securityBot.scanComms(text)) {
      setErrorMsg('Message blocked by TMI Security Bot: Malicious payload detected.');
      return;
    }

    if (liveSession?.userId) {
      recordFanMessage(liveSession.userId, userId, displayName);
    }
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'message',
        venueSlug: roomId,
        userId,
        displayName,
        text,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setErrorMsg(data?.error ?? 'Message failed to send');
          return;
        }
        setErrorMsg('');
        window.dispatchEvent(new CustomEvent('tmi:arena-message', {
          detail: { roomId, text },
        }));
        await refresh();
      })
      .catch(() => setErrorMsg('Message failed to send'));
  }

  const audience = snapshot?.activeMembers ?? [];
  const captureAudience = useMemo(() => audience.filter((member) => member.captureEnabled), [audience]);
  const mutedUserIds = snapshot?.moderation?.mutedUserIds ?? [];
  const activeSlowModeSeconds = Math.round((snapshot?.moderation?.slowModeMs ?? 0) / 1000);
  const visibleTileCount = mode === 'performer' ? 6 : 4;

  const audienceTiles = useMemo(() => {
    const mapped = audience.map((member) => ({
      id: member.userId,
      name: member.displayName,
      avatar: hashAvatar(member.userId),
      captureEnabled: member.captureEnabled,
    }));

    if (mapped.length >= visibleTileCount) return mapped;

    const needed = visibleTileCount - mapped.length;
    const fallback = FALLBACK_AUDIENCE.slice(0, needed).map((item) => ({
      id: item.id,
      name: item.name,
      avatar: item.avatar,
      captureEnabled: false,
    }));

    return [...mapped, ...fallback];
  }, [audience, visibleTileCount]);

  const rotatingTiles = useMemo(
    () => rotateWindow(audienceTiles, rotationOffset, visibleTileCount),
    [audienceTiles, rotationOffset, visibleTileCount],
  );

  useEffect(() => {
    setSlowModeSeconds(activeSlowModeSeconds);
  }, [activeSlowModeSeconds]);

  useEffect(() => {
    if (audienceTiles.length <= visibleTileCount) return;
    const interval = window.setInterval(() => {
      setRotationOffset((prev) => (prev + 1) % audienceTiles.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [audienceTiles.length, visibleTileCount]);

  function updateSlowMode() {
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'moderation',
        moderationAction: 'slow-mode',
        venueSlug: roomId,
        slowModeSeconds,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setErrorMsg(data?.error ?? 'Failed to update slow mode');
          return;
        }
        setErrorMsg('');
        window.dispatchEvent(new CustomEvent('tmi:arena-status', {
          detail: {
            roomId,
            message: slowModeSeconds > 0 ? `Slow mode set to ${slowModeSeconds}s` : 'Slow mode disabled',
          },
        }));
        await refresh();
      })
      .catch(() => setErrorMsg('Failed to update slow mode'));
  }

  function setMuted(targetUserId: string, shouldMute: boolean) {
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'moderation',
        moderationAction: shouldMute ? 'mute' : 'unmute',
        venueSlug: roomId,
        targetUserId,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setErrorMsg(data?.error ?? 'Moderation update failed');
          return;
        }
        setErrorMsg('');
        window.dispatchEvent(new CustomEvent('tmi:arena-status', {
          detail: {
            roomId,
            message: shouldMute ? 'User muted' : 'User unmuted',
          },
        }));
        await refresh();
      })
      .catch(() => setErrorMsg('Moderation update failed'));
  }

  return (
    <section style={{ border: '1px solid rgba(0,255,255,0.25)', borderRadius: 14, padding: 12, background: 'rgba(5,5,16,0.74)', marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#00FFFF', fontWeight: 800 }}>
            MRT ARENA
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {snapshot?.present ?? 0} inside · {roomId}
          </div>
        </div>

        {mode === 'audience' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setJoined((prev) => {
                  const next = !prev;
                  window.dispatchEvent(new CustomEvent('tmi:arena-status', {
                    detail: {
                      roomId,
                      message: next ? 'Entered immersive arena' : 'Exited immersive arena',
                    },
                  }));
                  return next;
                });
              }}
              style={{
                border: '1px solid rgba(0,255,136,0.35)',
                borderRadius: 8,
                padding: '7px 10px',
                background: joined ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.06)',
                color: joined ? '#00FF88' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {joined ? 'Inside Arena' : 'Enter Arena'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
              <input type="checkbox" checked={captureEnabled} onChange={(e) => setCaptureEnabled(e.target.checked)} />
              Audience camera capture
            </label>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>Performer Control View</div>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          minHeight: 260,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'radial-gradient(circle at center, rgba(255,45,170,0.16), rgba(0,255,255,0.08) 55%, rgba(5,5,16,0.94))',
          overflow: 'hidden',
          marginBottom: 12,
          padding: 10,
        }}
      >
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 800 }}>
          MAIN PERFORMER VIEW
        </div>

        {/* Performer identity + LIVE badge — visible to both modes */}
        {liveSession ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ background: '#FF0000', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em' }}>● LIVE</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{liveSession.displayName}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{liveSession.title}</span>
            <span style={{ fontSize: 11, color: '#00FFFF', marginLeft: 'auto' }}>{liveSession.viewerCount} watching</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: 'rgba(255,0,0,0.2)', color: '#FF7070', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>CONNECTING…</span>
          </div>
        )}

        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#000', marginBottom: 10 }}>
          {mode === 'performer' ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: '0.08em' }}>
              LIVE PERFORMER FEED
            </div>
          )}
        </div>

        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 800 }}>
          ROTATING AUDIENCE FEED
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visibleTileCount, 3)}, minmax(0, 1fr))`, gap: 8 }}>
          {rotatingTiles.map((tile) => (
            <div key={tile.id} style={{ borderRadius: 8, border: `1px solid ${tile.captureEnabled ? 'rgba(0,255,136,0.45)' : 'rgba(255,255,255,0.2)'}`, background: tile.captureEnabled ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.05)', padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{tile.avatar}</span>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{tile.name.slice(0, 12)}</span>
              </div>
              <div style={{ fontSize: 9, color: tile.captureEnabled ? '#00FF88' : 'rgba(255,255,255,0.55)' }}>
                {tile.captureEnabled ? 'LIVE CAM READY' : 'AVATAR FALLBACK'}
              </div>
            </div>
          ))}
        </div>

        {audienceTiles.length > visibleTileCount && (
          <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
            Rotating every 7s to simulate full crowd coverage.
          </div>
        )}
      </div>

      {mode === 'audience' && joined && captureEnabled && (
        <div style={{ marginBottom: 12, border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,255,136,0.04)' }}>
          <div style={{ padding: '8px 10px', fontSize: 10, color: '#00FF88', fontWeight: 800, letterSpacing: '0.1em' }}>
            YOUR CAMERA PREVIEW (OPTIONAL)
          </div>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#000' }} />
          {(error || errorMsg) && <div style={{ padding: '6px 10px', color: '#FF7070', fontSize: 11 }}>{error ?? errorMsg}</div>}
        </div>
      )}

      {mode === 'performer' && (
        <>
          {liveSession?.userId && (
            <>
              <AudienceRecognitionOverlay
                performerId={liveSession.userId}
                currentMemberIds={(snapshot?.activeMembers ?? []).map((m) => m.userId)}
                displayNames={Object.fromEntries((snapshot?.activeMembers ?? []).map((m) => [m.userId, m.displayName]))}
              />
              <PerformerRelationshipPanel
                performerId={liveSession.userId}
                tipTotal={liveSession.tipTotal ?? 0}
              />
            </>
          )}
        <div style={{ marginBottom: 12, border: '1px solid rgba(255,45,170,0.35)', borderRadius: 10, padding: 10, background: 'rgba(255,45,170,0.05)' }}>
          <div style={{ fontSize: 10, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>
            CROWD CONTROL + CAPTURE MONITOR
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>
              💸 Tips: ${(liveSession?.tipTotal ?? 0).toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: '#00FFFF', fontWeight: 700 }}>
              👥 {snapshot?.present ?? 0} live
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Slow mode</div>
            <input
              type="range"
              min={0}
              max={20}
              value={slowModeSeconds}
              onChange={(event) => setSlowModeSeconds(Number(event.target.value))}
              style={{ width: 140 }}
            />
            <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>{slowModeSeconds}s</div>
            <button
              type="button"
              onClick={updateSlowMode}
              style={{
                borderRadius: 8,
                border: '1px solid rgba(255,215,0,0.45)',
                background: 'rgba(255,215,0,0.16)',
                color: '#FFD700',
                fontWeight: 700,
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Apply
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {captureAudience.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>No audience members have enabled camera capture yet.</div>
            )}
            {captureAudience.map((member) => (
              <div key={member.userId} style={{ border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, padding: 8, background: 'rgba(0,0,0,0.28)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00FF88' }}>{member.displayName}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                  POV {member.viewpoint.yaw}° / {member.viewpoint.pitch}°
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Camera ready for WebRTC room capture
                </div>
                <button
                  type="button"
                  onClick={() => setMuted(member.userId, !mutedUserIds.includes(member.userId))}
                  style={{
                    marginTop: 6,
                    borderRadius: 7,
                    border: `1px solid ${mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.45)' : 'rgba(255,68,68,0.45)'}`,
                    background: mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)',
                    color: mutedUserIds.includes(member.userId) ? '#00FF88' : '#FF7070',
                    fontWeight: 700,
                    padding: '5px 8px',
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                >
                  {mutedUserIds.includes(member.userId) ? 'Unmute Chat' : 'Mute Chat'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 6 }}>ALL ACTIVE AUDIENCE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {audience.slice(0, 18).map((member) => (
                <div key={`mod-${member.userId}`} style={{ border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, padding: 7 }}>
                  <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{member.displayName}</div>
                  <button
                    type="button"
                    onClick={() => setMuted(member.userId, !mutedUserIds.includes(member.userId))}
                    style={{
                      marginTop: 5,
                      borderRadius: 7,
                      border: `1px solid ${mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.45)' : 'rgba(255,68,68,0.45)'}`,
                      background: mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)',
                      color: mutedUserIds.includes(member.userId) ? '#00FF88' : '#FF7070',
                      fontWeight: 700,
                      padding: '4px 7px',
                      cursor: 'pointer',
                      fontSize: 10,
                    }}
                  >
                    {mutedUserIds.includes(member.userId) ? 'Unmute Chat' : 'Mute Chat'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', fontSize: 10, color: '#AA2DFF', fontWeight: 800, letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          ARENA CHAT
        </div>
        <div style={{ maxHeight: 150, overflowY: 'auto', padding: 10, display: 'grid', gap: 6, background: 'rgba(0,0,0,0.18)' }}>
          {(snapshot?.messages ?? []).slice(-40).map((message) => (
            <div key={message.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ color: '#AA2DFF', fontWeight: 700 }}>{message.displayName}:</span> {message.text}
            </div>
          ))}
          {(snapshot?.messages?.length ?? 0) === 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>No messages yet.</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder="Message everyone in the arena"
            style={{
              flex: 1,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              padding: '8px 10px',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            style={{
              borderRadius: 8,
              border: '1px solid rgba(170,45,255,0.5)',
              background: 'rgba(170,45,255,0.22)',
              color: '#DDB7FF',
              fontWeight: 700,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
