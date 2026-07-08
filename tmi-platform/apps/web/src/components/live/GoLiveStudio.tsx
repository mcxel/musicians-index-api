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
import StartLiveSessionModal from '@/components/live/StartLiveSessionModal';
import { announceContenderCall, getBotDJForRotation, type ContenderCallInput } from '@/engines/performance/BotDJEngine';

import {
  startBroadcast,
  endBroadcast,
  subscribeBroadcastState,
  updateViewerCount as runtimeUpdateViewerCount,
  teardownBroadcastRuntime,
  type BroadcastMode as BroadcastModeType,
} from '@/lib/broadcast/BroadcastControlRuntime';

type BroadcastState = 'preview' | 'syncing' | 'live' | 'ending';
type EventMode = 'LIVE_GENERAL' | 'LIVE_BATTLE' | 'LIVE_CHALLENGE' | 'LIVE_CONCERT' | 'LIVE_CYPHER';
type CompetitiveLifecycleState = 'preparing' | 'waiting_for_contender' | 'opponent_joined' | 'vs_animation' | 'countdown' | 'live' | 'winner_results' | 'replay' | 'archive';

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
  const videoRef   = useRef<HTMLVideoElement>(null);
  const stageRef   = useRef<HTMLVideoElement>(null);
  const waitCamRef = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
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
  const [competitiveLifecycleState, setCompetitiveLifecycleState] = useState<CompetitiveLifecycleState | null>(null);
  const [botAnnouncement, setBotAnnouncement] = useState('');
  const [curtainState,     setCurtainState]     = useState(() => getStageSnapshot().state);
  const [isPublicSession,  setIsPublicSession]  = useState(true);
  const [showPicker,       setShowPicker]       = useState(true);

  useEffect(() => subscribeStage((s) => setCurtainState(s.state)), []);

  // Prefill session display name immediately; start camera only after destination is chosen
  useEffect(() => {
    async function init() {
      // Always load session so displayName is ready before the picker confirms
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        const data = await res.json() as { user?: SessionUser };
        if (data.user?.id) {
          setUserId(data.user.id);
          setSessionUser(data.user);
          setDisplayName(data.user.name ?? data.user.email ?? data.user.id);
        }
      } catch { /* no-op */ }

      if (showPicker) return; // camera waits until destination is chosen

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
    }

    init();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [showPicker]);

  useEffect(() => {
    if (!stageRef.current || !streamRef.current || broadcastState !== 'live') return;
    stageRef.current.srcObject = streamRef.current;
    void stageRef.current.play();
  }, [broadcastState]);

  // Wire waiting room camera mirror when in competitive live mode
  useEffect(() => {
    if (!waitCamRef.current || !streamRef.current || broadcastState !== 'live') return;
    waitCamRef.current.srcObject = streamRef.current;
    void waitCamRef.current.play().catch(() => {});
  }, [broadcastState, eventMode]);

  // Sync liveSeconds + viewerCount from BroadcastControlRuntime
  useEffect(() => {
    return subscribeBroadcastState((s) => {
      setLiveSeconds(s.liveSeconds);
      setViewerCount(s.viewerCount);
    });
  }, []);

  // Cleanup runtime on unmount
  useEffect(() => () => teardownBroadcastRuntime(), []);

  // Poll viewer count when live; forward to runtime so subscribers stay in sync
  useEffect(() => {
    if (broadcastState !== 'live' || !userId) return;
    const poll = async () => {
      try {
        const res  = await fetch('/api/live/go');
        const data = await res.json() as { live: { userId: string; viewerCount: number }[] };
        const me   = data.live.find(u => u.userId === userId);
        if (me) {
          setViewerCount(me.viewerCount);
          runtimeUpdateViewerCount(me.viewerCount);
        }
      } catch { /* no-op */ }
    };
    poll();
    const t = setInterval(poll, 10_000);
    return () => clearInterval(t);
  }, [broadcastState, userId]);

  // Derived early so the lifecycle useEffect dependency is declared before first use.
  const isCompetitiveMode = eventMode === 'LIVE_BATTLE' || eventMode === 'LIVE_CYPHER' || eventMode === 'LIVE_CHALLENGE';

  useEffect(() => {
    if (broadcastState !== 'live' || !isCompetitiveMode || !dailyRoomId) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/live/competitive-session?roomId=${encodeURIComponent(dailyRoomId)}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { session?: { state?: CompetitiveLifecycleState } };
        if (!cancelled) {
          setCompetitiveLifecycleState(data.session?.state ?? null);
        }
      } catch {
        // Keep host panel resilient on transient API failures.
      }
    };

    void poll();
    const timer = setInterval(poll, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [broadcastState, isCompetitiveMode, dailyRoomId]);

  // Bot DJ contender call — posts a real templated "come join" line to the
  // waiting-for-contender panel below whenever a competitive session goes
  // live. Uses real session data (genre, mode) only; no fabricated slot
  // counts or join-window timers (this session type has neither).
  useEffect(() => {
    if (broadcastState !== 'live' || !isCompetitiveMode) {
      setBotAnnouncement('');
      return;
    }
    const sessionType = eventMode === 'LIVE_BATTLE' ? 'battle' : eventMode === 'LIVE_CYPHER' ? 'cypher' : 'challenge';
    const input: ContenderCallInput = {
      label: `${genre} ${sessionType.charAt(0).toUpperCase()}${sessionType.slice(1)}`,
      sessionType,
      genre,
    };
    const bot = getBotDJForRotation(Math.floor(Date.now() / 1000));
    const action = announceContenderCall(bot.id, input, Math.floor(Date.now() / 5000));
    setBotAnnouncement(action.text);
  }, [broadcastState, isCompetitiveMode, eventMode, genre]);

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

  function wallRouteForMode(mode: EventMode): string {
    if (mode === 'LIVE_BATTLE') return '/battles/lobby-wall';
    if (mode === 'LIVE_CYPHER') return '/cypher/lobby-wall';
    if (mode === 'LIVE_CHALLENGE') return '/challenges/lobby-wall';
    return '/live/rooms';
  }

  function wallLabelForMode(mode: EventMode): string {
    if (mode === 'LIVE_BATTLE') return 'BATTLE WALL';
    if (mode === 'LIVE_CYPHER') return 'CYPHER WALL';
    if (mode === 'LIVE_CHALLENGE') return 'CHALLENGE WALL';
    return 'LOBBY WALL';
  }

  const competitiveStatusLabel =
    competitiveLifecycleState === 'preparing' ? 'SETTING UP STAGE' :
    competitiveLifecycleState === 'waiting_for_contender' || !competitiveLifecycleState ? 'WAITING FOR CONTENDER' :
    competitiveLifecycleState === 'opponent_joined' ? 'OPPONENT JOINED' :
    competitiveLifecycleState === 'vs_animation' ? 'VS TRANSITION' :
    competitiveLifecycleState === 'countdown' ? 'COUNTDOWN' :
    competitiveLifecycleState === 'live' ? 'BATTLE STARTING' :
    competitiveLifecycleState === 'winner_results' ? 'RESULTS' :
    competitiveLifecycleState === 'replay' ? 'REPLAY' :
    'SESSION COMPLETE';

  const competitiveDetailLabel =
    competitiveLifecycleState === 'preparing'
      ? 'Initializing split-screen and pre-show systems. Join is disabled until setup completes.'
      : competitiveLifecycleState === 'waiting_for_contender' || !competitiveLifecycleState
      ? `Your session is live on the ${wallLabelForMode(eventMode)}. Anyone can join and ${eventMode === 'LIVE_BATTLE' ? 'battle you' : eventMode === 'LIVE_CYPHER' ? 'join the cypher' : 'take the challenge'}.`
      : competitiveLifecycleState === 'opponent_joined'
      ? 'Contender locked. Routing to VS transition now.'
      : competitiveLifecycleState === 'vs_animation'
      ? 'Broadcast director is running the VS animation sequence.'
      : competitiveLifecycleState === 'countdown'
      ? 'Countdown is active. Match goes live automatically.'
      : competitiveLifecycleState === 'live'
      ? 'Match is live. Crowd, cameras, and scoring are synchronized.'
      : competitiveLifecycleState === 'winner_results'
      ? 'Winner detected. Results package is being prepared.'
      : competitiveLifecycleState === 'replay'
      ? 'Replay mode active. Archiving after final replay.'
      : 'Session is archived.';

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

    // ── Step 2: Register via BroadcastControlRuntime ─────────────────────────
    // Routes: POST /api/live/go + StageLifecycleEngine.startCountdown()
    //         + RuntimeEventBus VENUE_OPEN + WORLD_SESSION_ADDED
    try {
      const { roomId: confirmedRoomId } = await startBroadcast({
        userId,
        displayName: displayName.trim(),
        roomId: resolvedRoomId || `room-${Date.now()}`,
        title: displayName.trim(),
        mode: eventMode as BroadcastModeType,
        genre,
        isPublic: isPublicSession,
      });
      if (!resolvedRoomId) setDailyRoomId(confirmedRoomId);

      setBroadcastState('live');
      setLiveSeconds(0);
      localStorage.setItem('tmi_is_live', 'true');
      // Keep window event for any legacy consumers not yet on RuntimeEventBus
      window.dispatchEvent(new CustomEvent('tmi:golive', {
        detail: {
          userId: userId || undefined,
          displayName: displayName.trim(),
          role: sessionUser?.role ?? 'performer',
          genre,
          eventType: eventMode,
          roomId: confirmedRoomId,
        },
      }));
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setErrorMsg(
        code === 'unauthorized' || code === 'not_authenticated'
          ? 'You must be logged in to go live. Please sign in and try again.'
          : code === 'capacity_limit_exceeded'
          ? 'Platform is at capacity. Please try again in a few minutes.'
          : 'Network error. Check your connection and try again.',
      );
      await dailyCallRef.current?.leave();
      await dailyCallRef.current?.destroy();
      dailyCallRef.current = null;
      setDailyRoomId('');
      setCompetitiveLifecycleState(null);
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
      // Routes: DELETE /api/live/go + closeCurtainAndEnd() + RuntimeEventBus VENUE_CLOSING
      await endBroadcast(userId);
    } catch {
      setBroadcastState('live');
      setActionError('Could not end broadcast right now. Check your connection and try again.');
      return;
    }
    setBroadcastState('preview');
    setLiveSeconds(0);
    setViewerCount(0);
    setDailyRoomId('');
    setCompetitiveLifecycleState(null);
    localStorage.removeItem('tmi_is_live');
    // Keep window event for legacy consumers not yet on RuntimeEventBus
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
        @keyframes tmiWaitPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.92)} }
        @keyframes tmiWaitDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      `}</style>

      {showPicker && (
        <StartLiveSessionModal
          onConfirm={(mode, pickedGenre) => {
            setEventMode(mode);
            setGenre(pickedGenre);
            setShowPicker(false);
          }}
          onCancel={() => router.back()}
        />
      )}

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
              🔴 YOU ARE LIVE · {wallLabelForMode(eventMode)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Fans can find you right now. Broadcasting as <strong style={{ color: '#fff' }}>{displayName}</strong> · {genre} · {eventMode.replace('LIVE_', '').replace('_', ' ')}
            </div>
          </div>
          <Link
            href={wallRouteForMode(eventMode)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 9, fontWeight: 900,
              background: 'rgba(255,45,170,0.15)', border: `1px solid rgba(255,45,170,0.4)`,
              color: FUCHSIA, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap',
            }}
          >
            VIEW {wallLabelForMode(eventMode)} →
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

      {/* ── Battle / Cypher / Challenge waiting room split-screen ─────────── */}
      {isLive && isCompetitiveMode && (
        <div style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          border: '2px solid rgba(255,215,0,0.45)',
          marginBottom: 20,
          background: '#000',
          aspectRatio: '16/9',
        }}>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.85), transparent)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4444', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.15em' }}>
                {eventMode === 'LIVE_BATTLE' ? 'BATTLE' : eventMode === 'LIVE_CYPHER' ? 'CYPHER' : 'CHALLENGE'} SESSION — LIVE ON {wallLabelForMode(eventMode)}
              </span>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{fmtDuration(liveSeconds)}</span>
          </div>

          {/* Left half: performer camera */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 'calc(50% - 2px)', height: '100%', background: '#050510' }}>
            <video
              ref={waitCamRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              background: 'rgba(0,0,0,0.75)', borderRadius: 6, padding: '4px 10px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{displayName}</div>
              <div style={{ fontSize: 8, color: '#00FF88', fontWeight: 700, letterSpacing: '0.1em' }}>READY</div>
            </div>
          </div>

          {/* VS separator */}
          <div style={{
            position: 'absolute', left: 'calc(50% - 2px)', top: 0, width: 4, height: '100%',
            background: 'linear-gradient(180deg, transparent 0%, #FFD700 50%, transparent 100%)',
            zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#FFD700', color: '#050510',
              fontSize: 8, fontWeight: 900, padding: '5px 3px',
              borderRadius: 3, letterSpacing: '0.08em',
              writingMode: 'vertical-rl', textOrientation: 'mixed',
            }}>
              VS
            </div>
          </div>

          {/* Right half: lifecycle-aware contender slot */}
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: 'calc(50% - 2px)', height: '100%',
            background: competitiveLifecycleState === 'live'
              ? 'rgba(0,255,136,0.06)'
              : competitiveLifecycleState === 'vs_animation' || competitiveLifecycleState === 'countdown'
              ? 'rgba(255,215,0,0.05)'
              : 'rgba(5,5,16,0.97)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.4s',
          }}>
            {/* VS ANIMATION state — large flash icon */}
            {(competitiveLifecycleState === 'vs_animation' || competitiveLifecycleState === 'opponent_joined') && (
              <>
                <div style={{ fontSize: 44, animation: 'tmiWaitPulse 0.6s ease-in-out infinite' }}>⚡</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#FFD700', letterSpacing: '0.12em', textAlign: 'center' }}>
                  OPPONENT LOCKED
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,215,0,0.6)', textAlign: 'center', padding: '0 12px' }}>
                  VS animation playing — match starts automatically
                </div>
              </>
            )}

            {/* COUNTDOWN state — big countdown display */}
            {competitiveLifecycleState === 'countdown' && (
              <>
                <div style={{
                  fontSize: 56, fontWeight: 900, color: '#FFD700',
                  animation: 'tmiWaitPulse 0.9s ease-in-out infinite',
                  lineHeight: 1, textShadow: '0 0 30px rgba(255,215,0,0.6)',
                }}>
                  3
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.18em' }}>
                  MATCH STARTS NOW
                </div>
              </>
            )}

            {/* LIVE state — opponent is live */}
            {competitiveLifecycleState === 'live' && (
              <>
                <div style={{ fontSize: 28 }}>🔴</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em' }}>
                  OPPONENT IS LIVE
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0 12px' }}>
                  Match in progress. Check your broadcast tools below.
                </div>
              </>
            )}

            {/* WINNER / REPLAY / ARCHIVE */}
            {(competitiveLifecycleState === 'winner_results' || competitiveLifecycleState === 'replay' || competitiveLifecycleState === 'archive') && (
              <>
                <div style={{ fontSize: 36 }}>🏆</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#FFD700', letterSpacing: '0.08em' }}>
                  {competitiveStatusLabel}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', textAlign: 'center', padding: '0 12px', lineHeight: 1.6 }}>
                  {competitiveDetailLabel}
                </div>
              </>
            )}

            {/* WAITING state — default with dots */}
            {(!competitiveLifecycleState || competitiveLifecycleState === 'waiting_for_contender' || competitiveLifecycleState === 'preparing') && (
              <>
                <div style={{ fontSize: 30, animation: 'tmiWaitPulse 2s ease-in-out infinite' }}>
                  {eventMode === 'LIVE_BATTLE' ? '⚔️' : eventMode === 'LIVE_CYPHER' ? '🎤' : '🎯'}
                </div>
                <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '0 14px', letterSpacing: '0.06em' }}>
                  {competitiveStatusLabel}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', textAlign: 'center', padding: '0 10px', lineHeight: 1.6 }}>
                  {competitiveDetailLabel}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#FFD700',
                      animation: `tmiWaitDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                {botAnnouncement && (
                  <div style={{
                    marginTop: 8, maxWidth: 200, padding: '6px 12px',
                    borderRadius: 20, background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    fontSize: 9, color: '#FFD700', textAlign: 'center', lineHeight: 1.5,
                  }}>
                    {botAnnouncement}
                  </div>
                )}
                <Link
                  href={wallRouteForMode(eventMode)}
                  style={{
                    marginTop: 6, fontSize: 8, fontWeight: 900,
                    color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)',
                    borderRadius: 5, padding: '5px 11px', textDecoration: 'none', letterSpacing: '0.1em',
                  }}
                >
                  VIEW {wallLabelForMode(eventMode)} →
                </Link>
              </>
            )}
          </div>
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
