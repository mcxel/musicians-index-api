'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import StageCurtain from '@/components/live/StageCurtain';
import AudienceScene from '@/components/live/AudienceScene';
import {
  startCountdown,
  openCurtain,
  closeCurtainAndEnd,
  subscribeStage,
  getStageSnapshot,
} from '@/lib/live/StageLifecycleEngine';
import { SystemSecurityBot } from '@/lib/bots/SystemSecurityBot';

// ── Types ─────────────────────────────────────────────────────────────────────

type AudienceMember = {
  userId: string;
  displayName: string;
  role: 'fan' | 'artist' | 'host' | 'bot';
  seatId: string | null;
  captureEnabled: boolean;
  viewpoint: { yaw: number; pitch: number; updatedAt: number };
};

type AudienceMessage = {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: number;
};

type VenueSnapshot = {
  venueSlug: string;
  present: number;
  capacity: number;
  occupancyPct: number;
  activeMembers: AudienceMember[];
  messages?: AudienceMessage[];
  moderation?: { slowModeMs: number; mutedUserIds: string[] };
};

type LiveSession = {
  roomId: string;
  displayName: string;
  title: string;
  viewerCount: number;
  tipTotal: number;
  stageState: string;
  accentColor: string;
  userId: string;
};

type FloatingReaction = { id: string; emoji: string; x: number };

interface Props {
  roomId: string;
  mode: 'fan' | 'performer';
}


function publicName(name: string): string {
  if (!name.includes('@')) return name;
  const [local] = name.split('@');
  if (!local) return 'Audience';
  return local.length <= 2 ? `${local[0]}*` : `${local.slice(0, 2)}***`;
}

const securityBot = new SystemSecurityBot();

// ── Component ─────────────────────────────────────────────────────────────────

export default function VenueImmersiveRoom({ roomId, mode }: Props) {
  const [snapshot, setSnapshot] = useState<VenueSnapshot | null>(null);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState(mode === 'performer' ? 'Performer' : 'Fan');
  const [mySeatId, setMySeatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [curtainState, setCurtainState] = useState(() => getStageSnapshot().state);

  useEffect(() => subscribeStage((s) => setCurtainState(s.state)), []);

  // Auth session
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string; name?: string; email?: string } }) => {
        if (!data.authenticated || !data.user?.id) return;
        setUserId(data.user.id.substring(0, 16));
        setDisplayName(publicName((data.user.name ?? data.user.email ?? data.user.id).slice(0, 40)));
      })
      .catch(() => {});
  }, []);

  // Poll audience snapshot
  const refresh = useCallback(async () => {
    const res = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}&messages=1`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return;
    setSnapshot(await res.json() as VenueSnapshot);
  }, [roomId]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 2500);
    return () => window.clearInterval(id);
  }, [refresh]);

  // Poll live session
  useEffect(() => {
    type SessionEntry = { roomId: string; userId: string; displayName: string; title: string; viewerCount: number; tipTotal: number; stageState: string; accentColor: string };
    const poll = async () => {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { sessions: SessionEntry[] };
        const match = data.sessions.find((s) => s.roomId === roomId);
        setLiveSession(match ?? null);
      } catch { /* non-fatal */ }
    };
    void poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [roomId]);

  // Fan join / leave — waits for real userId from auth
  useEffect(() => {
    if (mode !== 'fan' || !userId) return;

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const groupId = searchParams?.get('groupId') ?? null;

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
          groupId,
          captureEnabled: false,
          viewpoint: { yaw: 0, pitch: 0, updatedAt: Date.now() },
        },
      }),
    })
      .then(async (r) => {
        const d = await r.json() as { assignedSeatId?: string };
        if (d.assignedSeatId) setMySeatId(d.assignedSeatId);
        await refresh();
      })
      .catch(() => {});

    return () => {
      void fetch('/api/live/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', venueSlug: roomId, userId }),
      }).catch(() => {});
    };
  }, [mode, roomId, userId, displayName, refresh]);

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    if (!securityBot.scanComms(text)) {
      setErrorMsg('Message blocked by TMI security.');
      return;
    }
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', venueSlug: roomId, userId: userId || 'guest', displayName, text }),
    })
      .then(async (r) => {
        if (!r.ok) { const d = await r.json() as { error?: string }; setErrorMsg(d.error ?? 'Send failed'); return; }
        setErrorMsg('');
        await refresh();
      })
      .catch(() => setErrorMsg('Send failed'));
  }

  function sendReaction(emoji: string) {
    const id = `r-${Date.now()}-${Math.random()}`;
    const x = 15 + Math.random() * 70;
    setReactions((prev) => [...prev.slice(-8), { id, emoji, x }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2600);
  }

  const members = useMemo(() => snapshot?.activeMembers ?? [], [snapshot?.activeMembers]);
  const messages = useMemo(() => snapshot?.messages ?? [], [snapshot?.messages]);

  const isOpen = curtainState === 'CAMERA_LIVE' || curtainState === 'INTERMISSION';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: "'Inter', sans-serif",
        background: 'radial-gradient(ellipse at 50% 0%, rgba(26,0,5,0.98) 0%, rgba(5,5,16,1) 55%)',
        borderRadius: 16,
        border: '1px solid rgba(255,215,0,0.18)',
        overflow: 'hidden',
        marginTop: 16,
      }}
    >
      <style>{`
        @keyframes venueReactionFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-90px) scale(1.4); }
        }
        @keyframes venueSeatGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(0,255,255,0.35); }
          50%       { box-shadow: 0 0 24px rgba(0,255,255,0.85); }
        }
        @keyframes venueStageBreath {
          0%, 100% { box-shadow: 0 0 40px rgba(255,45,170,0.2), 0 0 80px rgba(255,45,170,0.08); }
          50%       { box-shadow: 0 0 60px rgba(255,45,170,0.35), 0 0 120px rgba(255,45,170,0.15); }
        }
      `}</style>

      {/* ── 3D Scene (stage + seats behind curtain) ─────────────────────── */}
      <div style={{ position: 'relative' }}>
        <div style={{ perspective: '700px', perspectiveOrigin: '50% 15%', padding: '20px 20px 0' }}>

          {/* Stage panel */}
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              margin: '0 auto',
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid rgba(255,215,0,0.35)',
              background: '#000',
              aspectRatio: '16 / 9',
              position: 'relative',
              marginBottom: 6,
              animation: 'venueStageBreath 4s ease-in-out infinite',
            }}
          >
            {liveSession ? (
              <>
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(255,45,170,0.25), rgba(5,5,16,0.92) 70%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  <div style={{ fontSize: 'clamp(28px,6vw,52px)' }}>🎤</div>
                  <div style={{ fontSize: 'clamp(13px,2.5vw,18px)', fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
                    {liveSession.displayName}
                  </div>
                  {liveSession.title && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
                      {liveSession.title}
                    </div>
                  )}
                </div>
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#FF0000', borderRadius: 5, padding: '3px 8px', fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>
                  ● LIVE
                </div>
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.75)', borderRadius: 5, padding: '3px 8px', fontSize: 9, color: '#00FFFF', fontWeight: 900 }}>
                  👁 {liveSession.viewerCount}
                </div>
              </>
            ) : (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: 'rgba(5,5,16,0.92)',
                }}
              >
                <div style={{ fontSize: 36 }}>🎭</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', fontWeight: 700 }}>
                  SHOW STARTING SOON
                </div>
              </div>
            )}
          </div>

          {/* 3D audience — canonical AudienceScene renderer (replaces old CSS seat grid) */}
          <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', paddingBottom: 24 }}>
            <div
              style={{
                fontSize: 8,
                color: 'rgba(255,215,0,0.55)',
                letterSpacing: '0.18em',
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              {mode === 'fan' && mySeatId
                ? `Your seat: ${mySeatId.toUpperCase()} · ${members.filter((m) => m.seatId).length} seated`
                : `Live venue · ${snapshot?.present ?? 0} in seats`}
            </div>

            <div style={{ position: 'relative' }}>
              <AudienceScene
                view={mode}
                venue={1}
                watcherCount={snapshot?.present}
                occupancyRatio={snapshot ? Math.min(1, snapshot.present / Math.max(1, snapshot.capacity)) : 0.08}
                onReaction={sendReaction}
                hideControls
                accentColor={mode === 'performer' ? '#FFD700' : '#00FFFF'}
              />

              {/* Real seated members — named, identity-bound overlay on top of the ambient crowd.
                  AudienceScene has no concept of individual users; this strip is the only place
                  real seatId/displayName/role data (from /api/live/audience) is actually visible. */}
              {members.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0, right: 0, bottom: 6,
                    display: 'flex',
                    gap: 5,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    padding: '0 8px',
                    pointerEvents: 'none',
                  }}
                >
                  {members.slice(0, 16).map((m) => {
                    const isMe = m.seatId === mySeatId;
                    const roleEmoji = m.role === 'bot' ? '🤖' : m.role === 'host' ? '🌟' : m.role === 'artist' ? '🎤' : '🎧';
                    const shortName = m.displayName.split('|')[0]?.slice(0, 8) ?? 'Fan';
                    return (
                      <div
                        key={m.userId}
                        title={`${m.displayName} — ${m.role}${m.seatId ? ` · ${m.seatId.toUpperCase()}` : ''}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          padding: '2px 7px',
                          borderRadius: 999,
                          fontSize: 8,
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          background: isMe ? 'rgba(0,255,255,0.22)' : 'rgba(0,0,0,0.55)',
                          border: isMe ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.12)',
                          color: isMe ? '#00FFFF' : 'rgba(255,255,255,0.75)',
                          backdropFilter: 'blur(3px)',
                        }}
                      >
                        <span>{roleEmoji}</span>
                        <span>{isMe ? 'YOU' : shortName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curtain — overlays the 3D scene, parts to reveal stage */}
        <StageCurtain />
      </div>

      {/* Floating reactions — above curtain */}
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            bottom: '35%',
            left: `${r.x}%`,
            fontSize: 28,
            pointerEvents: 'none',
            animation: 'venueReactionFloat 2.6s ease-out forwards',
            zIndex: 60,
          }}
        >
          {r.emoji}
        </div>
      ))}

      {/* ── Bottom HUD ────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 20px', position: 'relative', zIndex: 10 }}>

        {/* Reaction bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['🔥', '❤️', '⚡', '👑', '🎤', '💜', '🎶'] as const).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendReaction(emoji)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                fontSize: 19,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Performer curtain controls */}
        {mode === 'performer' && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,215,0,0.2)',
              background: 'rgba(255,215,0,0.04)',
            }}
          >
            <div style={{ width: '100%', fontSize: 8, color: 'rgba(255,215,0,0.6)', fontWeight: 800, letterSpacing: '0.14em', textAlign: 'center', marginBottom: 6 }}>
              STAGE CONTROLS
            </div>
            <button
              type="button"
              onClick={() => startCountdown()}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 900,
                background: 'rgba(255,215,0,0.12)',
                border: '1px solid rgba(255,215,0,0.4)',
                color: '#FFD700',
                cursor: 'pointer',
                letterSpacing: '0.08em',
              }}
            >
              ▶ PREPARE STAGE
            </button>
            <button
              type="button"
              onClick={() => openCurtain()}
              disabled={curtainState !== 'COUNTDOWN'}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 900,
                background: curtainState === 'COUNTDOWN' ? 'rgba(0,255,136,0.14)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${curtainState === 'COUNTDOWN' ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: curtainState === 'COUNTDOWN' ? '#00FF88' : 'rgba(255,255,255,0.25)',
                cursor: curtainState === 'COUNTDOWN' ? 'pointer' : 'not-allowed',
                letterSpacing: '0.08em',
              }}
            >
              🎭 OPEN CURTAIN
            </button>
            <button
              type="button"
              onClick={() => closeCurtainAndEnd()}
              disabled={!isOpen}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 900,
                background: isOpen ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isOpen ? 'rgba(255,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: isOpen ? '#FF7070' : 'rgba(255,255,255,0.25)',
                cursor: isOpen ? 'pointer' : 'not-allowed',
                letterSpacing: '0.08em',
              }}
            >
              ■ CLOSE CURTAIN
            </button>
          </div>
        )}

        {/* Chat */}
        <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
          <div
            style={{
              padding: '7px 10px',
              fontSize: 9,
              color: '#AA2DFF',
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>VENUE CHAT</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {snapshot?.present ?? 0} IN ROOM
            </span>
          </div>
          <div
            style={{
              maxHeight: 130,
              overflowY: 'auto',
              padding: '8px 10px',
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            {messages.slice(-30).map((m) => (
              <div key={m.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>
                <span style={{ color: '#AA2DFF', fontWeight: 700 }}>{m.displayName}: </span>
                {m.text}
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                No messages yet — be the first to speak.
              </div>
            )}
          </div>
          {errorMsg && (
            <div style={{ padding: '4px 10px', fontSize: 10, color: '#FF7070', background: 'rgba(255,68,68,0.08)' }}>
              {errorMsg}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 8px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Say something to the room…"
              style={{
                flex: 1,
                borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                padding: '8px 10px',
                fontSize: 12,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              style={{
                borderRadius: 7,
                border: '1px solid rgba(170,45,255,0.45)',
                background: 'rgba(170,45,255,0.18)',
                color: '#DDB7FF',
                fontWeight: 700,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
