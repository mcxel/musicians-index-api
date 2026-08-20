'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DailyCall } from '@daily-co/daily-js';
import UniversalVenueRenderer from '@/components/live/UniversalVenueRenderer';
import LiveDestinationDrawer from '@/components/live/LiveDestinationDrawer';
import {
  startCountdown,
  openCurtain,
  subscribeStage,
  getStageSnapshot,
} from '@/lib/live/StageLifecycleEngine';
import PerformerCurtainControlPanel from '@/components/performer/PerformerCurtainControlPanel';
import MobileMonitorYield from '@/components/hud/MobileMonitorYield';
import { useMobileQuickPanelRuntime } from '@/lib/hud/mobileQuickPanelRuntime';
import TMIInteractiveVenueHud from '@/components/venue-hud/TMIInteractiveVenueHud';

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
  const searchParams = useSearchParams();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLVideoElement>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Mobile detection — registers dual-monitor status with the quick-panel runtime
  useEffect(() => {
    const { setIsMobile, setDualMonitorActive } = useMobileQuickPanelRuntime.getState();
    setDualMonitorActive(true);
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      setIsMobile(mobile);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('resize', check);
      useMobileQuickPanelRuntime.getState().setDualMonitorActive(false);
    };
  }, []);
  const streamRef = useRef<MediaStream | null>(null);
  const dailyCallRef = useRef<DailyCall | null>(null);

  const [broadcastState, setBroadcastState] = useState<BroadcastState>('preview');
  const [cameraError,    setCameraError]    = useState('');
  // Explicit opt-in only — camera is NEVER active on page load (privacy/Rule 20).
  const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
  const monitorBRef = useRef<HTMLDivElement>(null);
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
  const [autoTrigger,    setAutoTrigger]    = useState(false);

  useEffect(() => subscribeStage((s) => setCurtainState(s.state)), []);

  // Prefill session — camera is NOT requested here (opt-in only, see startCameraPreview)
  useEffect(() => {
    async function prefillSession() {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        const data = await res.json() as { user?: SessionUser };
        if (data.user?.id) {
          setUserId(data.user.id);
          setSessionUser(data.user);
          const activeName = data.user.name ?? data.user.email ?? data.user.id;
          setDisplayName(activeName);

          const shouldAuto = searchParams?.get('auto') === 'true';
          const paramGenre = searchParams?.get('genre');
          const paramMode = searchParams?.get('mode') as EventMode | null;

          if (paramGenre) setGenre(paramGenre);
          if (paramMode) setEventMode(paramMode);

          if (shouldAuto) {
            setTimeout(() => {
              setAutoTrigger(true);
            }, 800);
          }
        }
      } catch { /* no-op */ }
    }

    prefillSession();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Explicit camera activation — only called by the CAM ON button
  async function startCameraPreview() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraPreviewActive(true);
    } catch (err) {
      setCameraError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser and reload this page.'
          : 'Camera not available. Check your device settings or try a different browser.',
      );
    }
  }

  // Auto-launch trigger
  useEffect(() => {
    if (autoTrigger && displayName && broadcastState === 'preview' && !cameraError) {
      setAutoTrigger(false);
      void handleGoLive();
    }
  }, [autoTrigger, displayName, broadcastState, cameraError]);

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
    let activeName = displayName.trim();
    if (!activeName) {
      activeName = sessionUser?.name || sessionUser?.email || `Artist-${Math.floor(Math.random() * 8999 + 1000)}`;
      setDisplayName(activeName);
    }
    setErrorMsg('');
    setActionError('');
    setBroadcastState('syncing');

    if (!cameraPreviewActive) {
      void startCameraPreview();
    }

    window.dispatchEvent(new CustomEvent('tmi:live-syncing', {
      detail: {
        userId: userId || undefined,
        displayName: activeName,
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
        body: JSON.stringify({ userName: activeName }),
        credentials: 'include',
      });
      if (roomRes.ok) {
        const roomData = await roomRes.json() as { roomId?: string; roomUrl?: string; token?: string };

        if (roomData.roomId && roomData.roomUrl && roomData.token) {
          resolvedRoomId = roomData.roomId;
          setDailyRoomId(roomData.roomId);

          const { default: DailyIframe } = await import('@daily-co/daily-js');
          const call = DailyIframe.createCallObject({ videoSource: true, audioSource: true });
          dailyCallRef.current = call;

          call.on('error', (e) => console.error('[Daily] call error', e));
          call.on('left-meeting', () => { dailyCallRef.current = null; });

          await call.join({ url: roomData.roomUrl, token: roomData.token });
          console.log('[GoLive] Daily.co room joined as host:', roomData.roomId);
        }
      }
    } catch (dailyErr) {
      console.warn('[GoLive] Daily.co unavailable — fallback to local live mode:', dailyErr);
    }

    // ── Step 2: Register in GlobalLiveSessionRegistry ───────────────────────
    try {
      await fetch('/api/live/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: activeName,
          genre,
          eventType: eventMode,
          category: modeToCategory(eventMode),
          role: (sessionUser?.role ?? 'performer').toLowerCase(),
          ...(resolvedRoomId ? { roomId: resolvedRoomId } : {}),
        }),
        credentials: 'include',
      });
    } catch {
      console.warn('[GoLive] Live session registry offline — activating local broadcast');
    }

    setBroadcastState('live');
    setLiveSeconds(0);
    localStorage.setItem('tmi_is_live', 'true');
    window.dispatchEvent(new CustomEvent('tmi:golive', {
      detail: {
        userId: userId || undefined,
        displayName: activeName,
        role: sessionUser?.role ?? 'performer',
        genre,
        eventType: eventMode,
        roomId: resolvedRoomId || undefined,
      },
    }));
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
  // Audience renderer only mounts after explicit camera opt-in OR after actual publication.
  // Never mounts on page load alone — that was the prototype audience / privacy bug.
  const showAudience = (cameraPreviewActive || isLive) && !isEnding;

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      maxWidth: isLive ? '100%' : 680,
      width: '100%',
      margin: '0 auto',
      display: isLive ? 'grid' : 'block',
      gridTemplateColumns: isLive ? 'minmax(0, 1fr) 340px' : 'none',
      gap: isLive ? 20 : 0
    }}>
      <style>{`
        @keyframes tmiLivePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tmiLiveBorder { 0%,100%{box-shadow:0 0 0 0 rgba(255,45,170,0.4)} 50%{box-shadow:0 0 0 8px rgba(255,45,170,0)} }
        @keyframes tmiSponsorGlow { 0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.12)} 50%{box-shadow:0 0 36px rgba(255,215,0,0.28)} }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {/* ── Community Sponsor Mission ─────────────────────────────────────── */}
        {!isLive && (
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
        )}
        {/* ──────────────────────────────────────────────────────────────────── */}

        {/* ── Dual Monitor Layout ────────────────────────────────────────────── */}
        {/* Monitor A = performer camera  |  Monitor B = real 360° venue/audience */}
        {/* On mobile: single column so monitors stack; quick panel yield collapses B. */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobileViewport ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 20 }}>

          {/* ── Monitor A — Performer Camera ─────────────────────────────── */}          <MobileMonitorYield monitorId="a">          <div style={{
            position: 'relative', background: '#000', aspectRatio: '16/9',
            borderRadius: 14, overflow: 'hidden',
          border: `2px solid ${isLive ? FUCHSIA : (cameraPreviewActive ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.1)')}`,
            boxShadow: isLive ? `0 0 32px rgba(255,45,170,0.3)` : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}>
            {cameraError ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
                <div style={{ fontSize: 36 }}>📷</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.6 }}>{cameraError}</div>
              </div>
            ) : cameraPreviewActive ? (
              <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            ) : (
              /* Idle state — camera off, waiting for explicit opt-in */
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'radial-gradient(ellipse at center, rgba(255,45,170,0.06) 0%, #000 70%)' }}>
                <div style={{ fontSize: 40, opacity: 0.4 }}>🎥</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: 180, lineHeight: 1.6 }}>
                  Camera off — only you can see your preview
                </div>
                <button
                  type="button"
                  onClick={() => void startCameraPreview()}
                  style={{ padding: '10px 22px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.5)', color: '#00FF88', cursor: 'pointer', letterSpacing: '0.08em' }}
                >
                  📹 TURN ON CAMERA
                </button>
              </div>
            )}

            {/* LIVE badge — only from canonical publication state */}
            {isLive && (
              <div style={{ position: 'absolute', top: 10, left: 10, background: FUCHSIA, borderRadius: 6, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>LIVE · {fmtDuration(liveSeconds)}</span>
              </div>
            )}
            {/* PREVIEW badge — camera on locally, NOT published */}
            {cameraPreviewActive && !isLive && (
              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.75)', borderRadius: 6, padding: '3px 9px', border: '1px solid rgba(0,255,136,0.4)' }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em' }}>PREVIEW · NOT LIVE</span>
              </div>
            )}
            {isLive && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '3px 9px' }}>
                <span style={{ fontSize: 9, color: GOLD, fontWeight: 900 }}>👁 {viewerCount}</span>
              </div>
            )}
            {/* Mic / cam toggles — only visible when camera is on */}
            {cameraPreviewActive && (
              <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 7 }}>
                <button type="button" onClick={toggleMic} title={micOn ? 'Mute mic' : 'Unmute mic'} style={{ width: 32, height: 32, borderRadius: '50%', background: micOn ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.35)', border: `1px solid ${micOn ? '#00FF88' : '#FF4444'}`, color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {micOn ? '🎤' : '🔇'}
                </button>
                <button type="button" onClick={toggleCam} title="Turn off camera" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,68,68,0.2)', border: '1px solid rgba(255,68,68,0.5)', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📷
                </button>
              </div>
            )}
            {/* TMI Interactive Venue HUD Overlay */}
            {(cameraPreviewActive || isLive) && (
              <TMIInteractiveVenueHud
                roomId={dailyRoomId || 'live-stage'}
                roomTitle={displayName || 'Live Broadcast'}
                experienceType={eventMode === 'LIVE_BATTLE' ? 'BATTLE' : eventMode === 'LIVE_CONCERT' ? 'WORLD_CONCERT' : 'LIVE'}
                role={(sessionUser?.role ?? 'performer').toLowerCase() as any}
                onBroadcastStateChange={(st) => {
                  if (st === 'LIVE') setBroadcastState('live');
                  if (st === 'IDLE') setBroadcastState('preview');
                }}
              />
            )}
            <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', padding: '3px 7px', borderRadius: 4, background: 'rgba(5,5,16,0.8)', border: `1px solid ${FUCHSIA}55`, color: FUCHSIA, zIndex: 110 }}>
              MONITOR A · FOH · STAGE CAMERA
            </div>
          </div>
          </MobileMonitorYield>

          {/* ── Monitor B — Real 360° Venue / Audience ───────────────────── */}          <MobileMonitorYield monitorId="b">          <div
            ref={monitorBRef}
            style={{
              position: 'relative', aspectRatio: '16/9',
              borderRadius: 14, overflow: 'hidden', background: '#050510',
              border: `2px solid ${isLive ? 'rgba(170,45,255,0.7)' : 'rgba(170,45,255,0.25)'}`,
              boxShadow: isLive ? '0 0 32px rgba(170,45,255,0.2)' : 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            {showAudience ? (
              /* BOH viewport — house/audience perspective into the same world (canonical law) */
              <UniversalVenueRenderer
                roomId={dailyRoomId || 'main-stage'}
                mode="audience"
                venueIndex={0}
                hubVenueOnly
                hubViewportRole="boh"
                forceStadiumFill={isLive}
                instantEmptyStage={cameraPreviewActive && !isLive}
              />
            ) : (
              /* Idle — no camera active, no live session */
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'radial-gradient(ellipse at center, rgba(170,45,255,0.07) 0%, #050510 70%)' }}>
                <div style={{ fontSize: 36, opacity: 0.3 }}>🏟️</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: 200, lineHeight: 1.6 }}>
                  Venue loads when you turn on your camera or go live
                </div>
              </div>
            )}
            {isLive && (
              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(170,45,255,0.85)', borderRadius: 6, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>LIVE · {viewerCount} WATCHING</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => monitorBRef.current?.requestFullscreen?.().catch(() => {})}
              title="Fullscreen house view"
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, lineHeight: 1, padding: '4px 7px', borderRadius: 5, background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(170,45,255,0.5)', color: '#AA2DFF', cursor: 'pointer' }}
            >⤢</button>
            <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', padding: '3px 7px', borderRadius: 4, background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(170,45,255,0.45)', color: '#AA2DFF' }}>
              MONITOR B · BOH · HOUSE VIEW
            </div>
          </div>
          </MobileMonitorYield>

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

        {/* ── Curtain control (presentation directors + StageLifecycle sync) ─ */}
        {isLive && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.04)' }}>
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
                StageLifecycle: <span style={{ color: CYAN, fontWeight: 700, marginLeft: 4 }}>{curtainState}</span>
              </span>
            </div>
            <PerformerCurtainControlPanel
              performerId={userId || sessionUser?.id || 'performer'}
              sessionId={dailyRoomId ? `live-curtain-${dailyRoomId}` : `live-curtain-${userId || 'preview'}`}
              accentColor={FUCHSIA}
            />
          </div>
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
              type="button"
              onClick={handleGoLive}
              disabled={isStarting || Boolean(cameraError)}
              style={{
                flex: 1, background: isStarting ? 'rgba(255,45,170,0.4)' : FUCHSIA,
                color: '#050510', border: 'none', borderRadius: 10,
                padding: '16px 24px', fontSize: 14, fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: isStarting || Boolean(cameraError) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: cameraError ? 0.45 : 1,
              }}
            >
              {isStarting ? '⟳  SYNCING TO LOBBY…' : '🔴  GO LIVE NOW'}
            </button>
          ) : (
            <>
              <button
                type="button"
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

      {isLive && <LiveDestinationDrawer />}
    </div>
  );
}
