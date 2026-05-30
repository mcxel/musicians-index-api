'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { DailyCall } from '@daily-co/daily-js';
import MaskedVideoTile from '@/components/media/MaskedVideoTile';
import ArenaImmersivePanel from '@/components/live/ArenaImmersivePanel';

type BroadcastState = 'preview' | 'syncing' | 'live' | 'ending';

interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

const GENRES = ['Hip-Hop', 'R&B', 'Trap', 'EDM', 'Pop', 'Gospel', 'Afrobeats', 'Jazz', 'Dance', 'Comedy', 'Podcast', 'Other'];
const FUCHSIA = '#FF2DAA';
const CYAN = '#00FFFF';
const GOLD = '#FFD700';

export default function GoLiveStudio() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dailyCallRef = useRef<DailyCall | null>(null);

  const [broadcastState, setBroadcastState] = useState<BroadcastState>('preview');
  const [cameraError,    setCameraError]    = useState('');
  const [displayName,    setDisplayName]    = useState('');
  const [genre,          setGenre]          = useState('Hip-Hop');
  const [errorMsg,       setErrorMsg]       = useState('');
  const [actionError,    setActionError]    = useState('');
  const [viewerCount,    setViewerCount]    = useState(0);
  const [liveSeconds,    setLiveSeconds]    = useState(0);
  const [userId,         setUserId]         = useState('');
  const [sessionUser,    setSessionUser]    = useState<SessionUser | null>(null);
  const [micOn,          setMicOn]          = useState(true);
  const [camOn,          setCamOn]          = useState(true);
  const [dailyRoomId,    setDailyRoomId]    = useState('');

  // Start camera + prefill session display name
  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setCameraError(
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in your browser and reload this page.'
            : 'Camera not available. Check your device settings or try a different browser.',
        );
      }

      try {
        const res = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        const data = await res.json() as { user?: SessionUser };
        if (data.user?.id) {
          setUserId(data.user.id);
          setSessionUser(data.user);
          setDisplayName(data.user.name ?? data.user.email ?? data.user.id);
        }
      } catch { /* no-op */ }
    }

    init();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current || !streamRef.current || broadcastState !== 'live') return;
    stageRef.current.srcObject = streamRef.current;
    void stageRef.current.play();
  }, [broadcastState]);

  // Live timer
  useEffect(() => {
    if (broadcastState !== 'live') return;
    const t = setInterval(() => setLiveSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [broadcastState]);

  // Poll viewer count when live
  useEffect(() => {
    if (broadcastState !== 'live' || !userId) return;
    const shortId = userId.substring(0, 8);
    const poll = async () => {
      try {
        const res  = await fetch('/api/live/go');
        const data = await res.json() as { live: { userId: string; viewerCount: number }[] };
        const me   = data.live.find(u => u.userId === shortId);
        if (me) setViewerCount(me.viewerCount);
      } catch { /* no-op */ }
    };
    poll();
    const t = setInterval(poll, 10_000);
    return () => clearInterval(t);
  }, [broadcastState, userId]);

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !micOn; setMicOn(v => !v); }
  }

  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !camOn; setCamOn(v => !v); }
  }

  async function handleGoLive() {
    if (!displayName.trim()) { setErrorMsg('Enter your display name.'); return; }
    setErrorMsg('');
    setActionError('');
    setBroadcastState('syncing');

    window.dispatchEvent(new CustomEvent('tmi:live-syncing', {
      detail: {
        userId: userId ? userId.substring(0, 8) : undefined,
        displayName: displayName.trim(),
        role: (sessionUser?.role ?? 'performer').toLowerCase(),
        genre,
      },
    }));

    // ── Step 1: Create Daily.co room and join as owner ──────────────────────
    let resolvedRoomId = '';
    try {
      const roomRes = await fetch('/api/video/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: displayName.trim() }),
        credentials: 'include',
      });
      if (roomRes.ok) {
        const roomData = await roomRes.json() as { roomId: string; roomUrl: string; token: string };
        resolvedRoomId = roomData.roomId;
        setDailyRoomId(roomData.roomId);

        // Join as host — headless call object (no embedded iframe)
        const { default: DailyIframe } = await import('@daily-co/daily-js');
        const call = DailyIframe.createCallObject({ videoSource: true, audioSource: true });
        dailyCallRef.current = call;

        call.on('error', (e) => console.error('[Daily] call error', e));
        call.on('left-meeting', () => { dailyCallRef.current = null; });

        await call.join({ url: roomData.roomUrl, token: roomData.token });
        console.log('[GoLive] Daily.co room joined as host:', roomData.roomId);
      } else {
        console.warn('[GoLive] Daily.co room creation failed — broadcasting registry-only');
      }
    } catch (dailyErr) {
      console.warn('[GoLive] Daily.co unavailable — registry-only mode:', dailyErr);
    }

    // ── Step 2: Register in GlobalLiveSessionRegistry ───────────────────────
    try {
      const res = await fetch('/api/live/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          genre,
          role: (sessionUser?.role ?? 'performer').toLowerCase(),
          ...(resolvedRoomId ? { roomId: resolvedRoomId } : {}),
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setErrorMsg(
          res.status === 401
            ? 'You must be logged in to go live. Please sign in and try again.'
            : (err.error ?? 'Failed to start broadcast.'),
        );
        // Clean up Daily call if registry failed
        await dailyCallRef.current?.leave();
        await dailyCallRef.current?.destroy();
        dailyCallRef.current = null;
        setDailyRoomId('');
        setBroadcastState('preview');
        return;
      }

      setBroadcastState('live');
      setLiveSeconds(0);
      localStorage.setItem('tmi_is_live', 'true');
      window.dispatchEvent(new CustomEvent('tmi:golive', {
        detail: {
          userId: userId ? userId.substring(0, 8) : undefined,
          displayName: displayName.trim(),
          role: sessionUser?.role ?? 'performer',
          genre,
          roomId: resolvedRoomId || undefined,
        },
      }));
    } catch {
      setErrorMsg('Network error. Check your connection and try again.');
      await dailyCallRef.current?.leave();
      await dailyCallRef.current?.destroy();
      dailyCallRef.current = null;
      setDailyRoomId('');
      setBroadcastState('preview');
    }
  }

  async function handleEndBroadcast() {
    setBroadcastState('ending');
    setActionError('');

    // Leave Daily.co call first
    try {
      if (dailyCallRef.current) {
        await dailyCallRef.current.leave();
        await dailyCallRef.current.destroy();
        dailyCallRef.current = null;
      }
    } catch (dailyErr) {
      console.warn('[EndBroadcast] Daily.co leave error:', dailyErr);
    }

    try {
      const res = await fetch('/api/live/go', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('end-failed');
    } catch {
      setBroadcastState('live');
      setActionError('Could not end broadcast right now. Check your connection and try again.');
      return;
    }
    setBroadcastState('preview');
    setLiveSeconds(0);
    setViewerCount(0);
    setDailyRoomId('');
    localStorage.removeItem('tmi_is_live');
    window.dispatchEvent(new CustomEvent('tmi:endbroadcast', {
      detail: {
        userId: userId ? userId.substring(0, 8) : undefined,
        displayName: displayName.trim(),
        role: sessionUser?.role ?? 'performer',
      },
    }));
  }

  function fmtDuration(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  const isLive     = broadcastState === 'live';
  const isStarting = broadcastState === 'syncing';
  const isEnding   = broadcastState === 'ending';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 680, margin: '0 auto' }}>
      <style>{`
        @keyframes tmiLivePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tmiLiveBorder { 0%,100%{box-shadow:0 0 0 0 rgba(255,45,170,0.4)} 50%{box-shadow:0 0 0 8px rgba(255,45,170,0)} }
      `}</style>

      {/* ── Camera self-view ──────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', background: '#000',
        border: `2px solid ${isLive ? FUCHSIA : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 20,
        boxShadow: isLive ? `0 0 40px rgba(255,45,170,0.25)` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        animation: isLive ? 'tmiLiveBorder 2s ease-in-out infinite' : 'none',
      }}>
        {cameraError ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 }}>
            <div style={{ fontSize: 44 }}>📷</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
              {cameraError}
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
          />
        )}

        {/* LIVE badge */}
        {isLive && (
          <div style={{
            position: 'absolute', top: 12, left: 12, background: FUCHSIA, borderRadius: 6,
            padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>
              LIVE · {fmtDuration(liveSeconds)}
            </span>
          </div>
        )}

        {/* PREVIEW badge */}
        {!isLive && !cameraError && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>PREVIEW</span>
          </div>
        )}

        {/* Viewer count */}
        {isLive && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 900 }}>👁 {viewerCount}</span>
          </div>
        )}

        {/* Mic / cam toggles */}
        {!cameraError && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={toggleMic}
              title={micOn ? 'Mute mic' : 'Unmute mic'}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: micOn ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.35)',
                border: `1px solid ${micOn ? '#00FF88' : '#FF4444'}`,
                color: '#fff', cursor: 'pointer', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {micOn ? '🎤' : '🔇'}
            </button>
            <button
              onClick={toggleCam}
              title={camOn ? 'Hide camera' : 'Show camera'}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: camOn ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.35)',
                border: `1px solid ${camOn ? '#00FF88' : '#FF4444'}`,
                color: '#fff', cursor: 'pointer', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {camOn ? '📹' : '📷'}
            </button>
          </div>
        )}
      </div>

      {/* ── "You are live" confirmation ───────────────────────────────────── */}
      {isLive && (
        <div style={{
          background: 'rgba(255,45,170,0.08)', border: `1.5px solid rgba(255,45,170,0.45)`,
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: FUCHSIA, marginBottom: 4 }}>
              🔴 YOU ARE LIVE ON THE LOBBY WALL
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Fans can find you right now. Broadcasting as <strong style={{ color: '#fff' }}>{displayName}</strong> · {genre}
            </div>
          </div>
          <Link
            href="/live/lobby"
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 9, fontWeight: 900,
              background: 'rgba(255,45,170,0.15)', border: `1px solid rgba(255,45,170,0.4)`,
              color: FUCHSIA, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap',
            }}
          >
            VIEW LOBBY WALL →
          </Link>

          {dailyRoomId && (
            <Link
              href={`/live/rooms/${dailyRoomId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 9, fontWeight: 900,
                background: 'rgba(0,255,136,0.12)', border: `1px solid rgba(0,255,136,0.4)`,
                color: '#00FF88', textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap',
              }}
            >
              OPEN LIVE ROOM →
            </Link>
          )}

          <Link
            href="/live/arena/main-stage?mode=performer"
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 9, fontWeight: 900,
              background: 'rgba(0,255,255,0.12)', border: `1px solid rgba(0,255,255,0.35)`,
              color: CYAN, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap',
            }}
          >
            OPEN ARENA VIEW →
          </Link>
        </div>
      )}

      {/* ── MRT panel-focus arena ─────────────────────────────────────────── */}
      {isLive && (
        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 800 }}>
            PANEL FOCUS ARENA
          </div>

          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 10, background: '#000', aspectRatio: '16/9' }}>
            <video
              ref={stageRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 8 }}>
            <MaskedVideoTile shape="octagon" performerName="Panelist 1" genre="Cypher" avatarEmoji="🎤" size={120} accentColor="#00FFFF" role="performer" allowAudioPreview />
            <MaskedVideoTile shape="octagon" performerName="Panelist 2" genre="Battle" avatarEmoji="🎵" size={120} accentColor="#FF2DAA" role="performer" allowAudioPreview />
            <MaskedVideoTile shape="octagon" performerName="Panelist 3" genre="Live"   avatarEmoji="🎙️" size={120} accentColor="#FFD700" role="performer" allowAudioPreview />
          </div>

          <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', padding: 10 }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 800 }}>AUDIENCE AVATARS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {['/tmi-curated/mag-42.jpg', '/tmi-curated/mag-50.jpg', '/tmi-curated/mag-58.jpg', '/tmi-curated/mag-66.jpg', '/tmi-curated/mag-74.jpg', '/tmi-curated/mag-82.jpg'].map((avatar, index) => (
                <div key={avatar} style={{ borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', aspectRatio: '1 / 1' }}>
                  <img src={avatar} alt={`Audience avatar ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isLive && (
        <ArenaImmersivePanel roomId="main-stage" mode="performer" />
      )}

      {/* ── Broadcast setup (only when idle) ─────────────────────────────── */}
      {!isLive && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', marginBottom: 14, textTransform: 'uppercase' }}>
            BROADCAST SETUP
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={40}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff', padding: '10px 14px', fontSize: 13, borderRadius: 8,
                fontFamily: "'Inter', sans-serif", outline: 'none',
              }}
            />
            <select
              value={genre}
              onChange={e => setGenre(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff', padding: '10px 14px', fontSize: 13, borderRadius: 8,
                fontFamily: "'Inter', sans-serif", cursor: 'pointer',
              }}
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {errorMsg && (
            <div style={{ fontSize: 11, color: '#FF4444', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 6, padding: '8px 12px', marginTop: 6 }}>
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* ── Action button ─────────────────────────────────────────────────── */}
      {actionError && (
        <div style={{ fontSize: 11, color: '#FF4444', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
          {actionError}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {!isLive ? (
          <button
            onClick={handleGoLive}
            disabled={isStarting || !!cameraError}
            style={{
              flex: 1, background: isStarting ? 'rgba(255,45,170,0.4)' : FUCHSIA,
              color: '#050510', border: 'none', borderRadius: 10,
              padding: '16px 24px', fontSize: 14, fontWeight: 900,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: isStarting || !!cameraError ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', opacity: !!cameraError ? 0.45 : 1,
            }}
          >
            {isStarting ? '⟳  SYNCING TO LOBBY…' : '🔴  GO LIVE NOW'}
          </button>
        ) : (
          <>
            <button
              onClick={handleEndBroadcast}
              disabled={isEnding}
              style={{
                flex: 1, background: 'rgba(255,68,68,0.12)', color: '#FF4444',
                border: '1.5px solid rgba(255,68,68,0.4)', borderRadius: 10,
                padding: '14px 24px', fontSize: 13, fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: isEnding ? 'not-allowed' : 'pointer',
                opacity: isEnding ? 0.6 : 1,
              }}
            >
              {isEnding ? '⟳  ENDING…' : '■  END BROADCAST'}
            </button>
            <Link
              href="/live/lobby"
              style={{
                padding: '14px 20px', borderRadius: 10, fontSize: 11, fontWeight: 900,
                background: `rgba(0,255,255,0.1)`, border: `1px solid rgba(0,255,255,0.3)`,
                color: CYAN, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center',
              }}
            >
              VIEW WALL
            </Link>
          </>
        )}
      </div>

      {/* Tip when camera blocked */}
      {cameraError && (
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 14, lineHeight: 1.6 }}>
          Tip: Click the camera icon in your browser address bar to grant permission, then reload.
        </p>
      )}
    </div>
  );
}
