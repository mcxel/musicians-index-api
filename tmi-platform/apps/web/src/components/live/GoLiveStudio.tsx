'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DailyCall } from '@daily-co/daily-js';
import MaskedVideoTile from '@/components/media/MaskedVideoTile';
import UniversalVenueRenderer from '@/components/live/UniversalVenueRenderer';
import PerformerVideoOrbit from '@/components/live/PerformerVideoOrbit';
import {
  startCountdown,
  openCurtain,
  subscribeStage,
  getStageSnapshot,
} from '@/lib/live/StageLifecycleEngine';

type BroadcastState = 'preview' | 'syncing' | 'live' | 'ending';
type EventMode = 'LIVE_GENERAL' | 'LIVE_BATTLE' | 'LIVE_CHALLENGE' | 'LIVE_CONCERT' | 'LIVE_CYPHER';

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
  const router    = useRouter();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dailyCallRef = useRef<DailyCall | null>(null);

  const [broadcastState, setBroadcastState] = useState<BroadcastState>('preview');
  const [cameraError,    setCameraError]    = useState('');
  const [displayName,    setDisplayName]    = useState('');
  const [genre,          setGenre]          = useState('Hip-Hop');
  const [eventMode,      setEventMode]      = useState<EventMode>('LIVE_GENERAL');
  const [errorMsg,       setErrorMsg]       = useState('');
  const [actionError,    setActionError]    = useState('');
  const [viewerCount,    setViewerCount]    = useState(0);
  const [liveSeconds,    setLiveSeconds]    = useState(0);
  const [userId,         setUserId]         = useState('');
  const [sessionUser,    setSessionUser]    = useState<SessionUser | null>(null);
  const [micOn,          setMicOn]          = useState(true);
  const [camOn,          setCamOn]          = useState(true);
  const [dailyRoomId,    setDailyRoomId]    = useState('');
  const [curtainState,     setCurtainState]     = useState(() => getStageSnapshot().state);
  const [isPublicSession,  setIsPublicSession]  = useState(true);

  useEffect(() => subscribeStage((s) => setCurtainState(s.state)), []);

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
    const poll = async () => {
      try {
        const res  = await fetch('/api/live/go');
        const data = await res.json() as { live: { userId: string; viewerCount: number }[] };
        const me   = data.live.find(u => u.userId === userId);
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

  function modeToCategory(mode: EventMode): 'live' | 'battle' | 'challenge' | 'concert' | 'cypher' {
    if (mode === 'LIVE_BATTLE') return 'battle';
    if (mode === 'LIVE_CHALLENGE') return 'challenge';
    if (mode === 'LIVE_CONCERT') return 'concert';
    if (mode === 'LIVE_CYPHER') return 'cypher';
    return 'live';
  }

  async function handleGoLive() {
    if (!displayName.trim()) { setErrorMsg('Enter your display name.'); return; }
    setErrorMsg('');
    setActionError('');
    setBroadcastState('syncing');

    window.dispatchEvent(new CustomEvent('tmi:live-syncing', {
      detail: {
        userId: userId || undefined,
        displayName: displayName.trim(),
        role: (sessionUser?.role ?? 'performer').toLowerCase(),
        genre,
        eventType: eventMode,
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
          eventType: eventMode,
          category: modeToCategory(eventMode),
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
          userId: userId || undefined,
          displayName: displayName.trim(),
          role: sessionUser?.role ?? 'performer',
          genre,
          eventType: eventMode,
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
        userId: userId || undefined,
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
  // Audience / lobby view is visible from camera-on, not just when fully live
  const showAudience = (camOn || isLive) && broadcastState !== 'ending';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 680, margin: '0 auto' }}>
      <style>{`
        @keyframes tmiLivePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tmiLiveBorder { 0%,100%{box-shadow:0 0 0 0 rgba(255,45,170,0.4)} 50%{box-shadow:0 0 0 8px rgba(255,45,170,0)} }
        @keyframes tmiSponsorGlow { 0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.12)} 50%{box-shadow:0 0 36px rgba(255,215,0,0.28)} }
      `}</style>

      {/* ── Community Sponsor Mission ─────────────────────────────────────── */}
      <div style={{
        marginBottom: 20,
        borderRadius: 14,
        border: '1px solid rgba(255,215,0,0.35)',
        borderLeft: '4px solid #FFD700',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(170,45,255,0.06) 100%)',
        padding: '18px 20px',
        animation: 'tmiSponsorGlow 3s ease-in-out infinite',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', color: '#FFD700', textTransform: 'uppercase' }}>
              We Grow Together — Community Sponsor Program
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Your stage. Your neighborhood. Your income.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { icon: '🚶', title: 'Walk Your Neighborhood', body: 'Find local businesses — restaurants, barbershops, salons, stores — and introduce them to TMI. You already know these people. That\'s your advantage.' },
            { icon: '🤝', title: 'Get Them to Sponsor You', body: 'Tell them: "I\'ll put your business on my TMI page and give you global promotion every time I perform. You\'ll reach fans across the platform — and beyond." It\'s a win-win.' },
            { icon: '💸', title: 'Sponsor Money Goes Straight to Your Pocket', body: 'When a business signs up as your sponsor through your link, that revenue is yours. No middleman. You brought them in, you earn from them — monthly.' },
            { icon: '🏅', title: 'Enter the Yearly Competition', body: 'Performers with active local sponsors get entry into the TMI Yearly Competition — with prizes, platform features, and industry exposure.' },
            { icon: '🌍', title: 'You Promote Them. They Promote You.', body: 'Your neighborhood backs you on stage. You put them on the world map. Every show you do is free advertising for every business that sponsors you. That\'s a team.' },
          ].map((item) => (
            <div key={item.icon} style={{
              display: 'flex', gap: 12,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#FFD700', marginBottom: 4 }}>
            How it works in 3 steps:
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            1. Find a local business → share your TMI sponsor link with them<br />
            2. They sign up &amp; activate their sponsorship → money hits your account<br />
            3. Feature them on your page every show → they grow, you grow, community wins
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <Link
            href="/sponsors/invite"
            style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 11, fontWeight: 900,
              background: 'linear-gradient(135deg, #FFD700, #ff9500)',
              color: '#050510', textDecoration: 'none', letterSpacing: '0.08em',
            }}
          >
            🏆 GET MY SPONSOR LINK
          </Link>
          <Link
            href="/hub/performer#sponsors"
            style={{
              padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 800,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none', letterSpacing: '0.06em',
            }}
          >
            VIEW SPONSOR DASHBOARD →
          </Link>
        </div>
      </div>
      {/* ──────────────────────────────────────────────────────────────────── */}

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
              Fans can find you right now. Broadcasting as <strong style={{ color: '#fff' }}>{displayName}</strong> · {genre} · {eventMode.replace('LIVE_', '').replace('_', ' ')}
            </div>
          </div>
          <Link
            href="/live/rooms"
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.04)' }}>
          <div style={{ width: '100%', fontSize: 8, color: 'rgba(255,215,0,0.6)', fontWeight: 800, letterSpacing: '0.14em', marginBottom: 4 }}>STAGE CURTAIN</div>
          <button
            type="button"
            onClick={() => startCountdown()}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', color: GOLD, cursor: 'pointer', letterSpacing: '0.07em' }}
          >
            ▶ PREPARE STAGE
          </button>
          <button
            type="button"
            onClick={() => openCurtain()}
            disabled={curtainState !== 'COUNTDOWN'}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: curtainState === 'COUNTDOWN' ? 'rgba(0,255,136,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${curtainState === 'COUNTDOWN' ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.1)'}`, color: curtainState === 'COUNTDOWN' ? '#00FF88' : 'rgba(255,255,255,0.25)', cursor: curtainState === 'COUNTDOWN' ? 'pointer' : 'not-allowed', letterSpacing: '0.07em' }}
          >
            🎭 OPEN CURTAIN
          </button>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center' }}>
            State: <span style={{ color: CYAN, fontWeight: 700, marginLeft: 4 }}>{curtainState}</span>
          </span>
        </div>
      )}

      {showAudience && !isPublicSession && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: CYAN, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 12 }}>
            🔒 PRIVATE SESSION — ARTIST BOX
          </div>
          <PerformerVideoOrbit
            accent={CYAN}
            maxVisible={6}
            onInvite={(id) => {
              if (id === 'invite') {
                router.push('/performers/search');
              } else {
                router.push(`/messages/new?to=${encodeURIComponent(id)}&type=invite`);
              }
            }}
          />
        </div>
      )}

      {showAudience && isPublicSession && (
        <>
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
          </section>

          {/* UniversalVenueRenderer — AudienceScene + WebRTC + chat + reactions + moderation, all in one (Phase 3B) */}
          <section style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2020', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
              <div style={{ fontSize: 9, color: FUCHSIA, fontWeight: 900, letterSpacing: '0.18em' }}>YOUR LIVE AUDIENCE</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
                · {viewerCount} watching
              </div>
            </div>
            <UniversalVenueRenderer roomId="main-stage" mode="performer" venueIndex={0} />
          </section>
        </>
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

          <div style={{ marginBottom: 10 }}>
            <select
              value={eventMode}
              onChange={e => setEventMode(e.target.value as EventMode)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff',
                padding: '10px 14px',
                fontSize: 13,
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="LIVE_GENERAL">General Live (Mixed Genre Wall)</option>
              <option value="LIVE_BATTLE">Battle Mode (Battle Wall)</option>
              <option value="LIVE_CHALLENGE">Challenge Mode (Challenge Wall)</option>
              <option value="LIVE_CONCERT">Concert Mode (Concert Wall)</option>
              <option value="LIVE_CYPHER">Cypher Mode (Cypher Wall)</option>
            </select>
          </div>

          {errorMsg && (
            <div style={{ fontSize: 11, color: '#FF4444', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 6, padding: '8px 12px', marginTop: 6 }}>
              {errorMsg}
            </div>
          )}

          {/* Public / Private toggle */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setIsPublicSession(true)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                background: isPublicSession ? 'rgba(255,45,170,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isPublicSession ? 'rgba(255,45,170,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: isPublicSession ? FUCHSIA : 'rgba(255,255,255,0.3)',
              }}
            >
              🌐 PUBLIC — AUDIENCE + LOBBY WALL
            </button>
            <button
              type="button"
              onClick={() => setIsPublicSession(false)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                background: !isPublicSession ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${!isPublicSession ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: !isPublicSession ? CYAN : 'rgba(255,255,255,0.3)',
              }}
            >
              🔒 PRIVATE — ARTIST BOX ONLY
            </button>
          </div>
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
              href="/live/rooms"
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
