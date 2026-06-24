'use client';

/**
 * UniversalVenueRenderer — Phase 3B (Venue Runtime Convergence, 2026-06-20).
 *
 * Supersedes the ArenaImmersivePanel / VenueImmersiveRoom split. Every
 * consumer of those two components always rendered AudienceScene as a
 * sibling right next to ArenaImmersivePanel's own flat CSS seat grid — two
 * separate "crowd" representations stacked on every single page that used
 * them (ArenaEventShell, GoLiveStudio, live/audience, live/arena/[id], the
 * room page). This component inherits the strongest capability from each
 * side instead of picking a winner and deleting the loser (Rule 21):
 *
 *  From VenueImmersiveRoom (kept as the base ambient layer):
 *    - AudienceScene (canonical 3D-ish crowd visual)
 *    - Floating reaction bubbles
 *    - Real, identity-bound member-overlay strip on top of the canvas
 *
 *  From ArenaImmersivePanel (layered in, real capability the other lacked):
 *    - Real WebRTC performer video (useStageWebRTC) + viewer heartbeat
 *    - LiveRecoveryOverlay reconnection states (CONNECTED/RECONNECTING/...)
 *    - Optional audience camera capture + live preview
 *    - Real moderation: slow-mode + per-user mute, capture-monitor grid
 *    - SponsorBubbleOverlay on showtime reveal
 *    - AudienceRecognitionOverlay + PerformerRelationshipPanel (SuperFan tracking)
 *    - The fuller 4-step curtain control flow (PREPARE/COUNTDOWN/OPEN/CLOSE)
 *
 * ArenaImmersivePanel and VenueImmersiveRoom are left running (LEGACY_CANDIDATE,
 * not deleted) until this component is verified across all 5 real call sites.
 * All 5 (ArenaEventShell, the room page, GoLiveStudio, live/audience,
 * live/arena/[id]) are migrated as of 2026-06-20; live/arena/[id] turned out
 * to be unreachable dead code (next.config.js redirects it to /live/rooms/[id]
 * before it ever renders) — found during the Phase 3C browser certification.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getGuestId } from '@/lib/identity/getGuestId';
import { useStageWebRTC } from '@/hooks/useStageWebRTC';
import { useLiveSessionHeartbeat } from '@/hooks/useLiveSessionHeartbeat';
import { recordFanJoin, recordFanMessage } from '@/lib/fans/SuperFanMomentumEngine';
import PerformerRelationshipPanel from './PerformerRelationshipPanel';
import AudienceRecognitionOverlay from './AudienceRecognitionOverlay';
import { SystemSecurityBot } from '@/lib/bots/SystemSecurityBot';
import LiveRecoveryOverlay, { type RecoveryState } from './LiveRecoveryOverlay';
import SponsorBubbleOverlay, { type BubbleSponsor } from '@/components/sponsor/SponsorBubbleOverlay';
import { useShowtimeReveal } from '@/lib/live/LiveryRevealController';
import StageCurtain from '@/components/live/StageCurtain';
import AudienceScene, { type VenueIndex } from '@/components/live/AudienceScene';
import { useAudienceWorld } from '@/lib/live/useAudienceWorld';
import AvatarActionWheel from '@/components/avatars/AvatarActionWheel';
import PropLoader from '@/components/avatars/PropLoader';
import MemoryCaptureButton from '@/components/memory/MemoryCaptureButton';
import {
  startCountdown,
  openCurtain,
  closeCurtainAndEnd,
  resetStage,
  getStageSnapshot,
  subscribeStage,
} from '@/lib/live/StageLifecycleEngine';

type RendererMode = 'audience' | 'performer';

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

type Snapshot = {
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
  mode: RendererMode;
  /** Passed straight through to AudienceScene — defaults to 1 (Arena) to match prior ArenaEventShell behavior. */
  venueIndex?: VenueIndex;
  /**
   * Real identity from the caller (e.g. a fan slug), if already known —
   * overrides the internal session-fetch/guest-id resolution below. Added
   * after the Phase 3C browser certification found the room page's separate
   * TmiAudiencePerspectiveShell panel was resolving a DIFFERENT anonymous
   * fallback ("fan-guest") than this component's own default ("guest-user"),
   * producing two audience entries for one real visitor.
   */
  fanIdOverride?: string;
}

function publicName(name: string): string {
  if (!name.includes('@')) return name;
  const [local] = name.split('@');
  if (!local) return 'Audience Member';
  return local.length <= 2 ? `${local[0] ?? 'u'}*` : `${local.slice(0, 2)}***`;
}

const securityBot = new SystemSecurityBot();

const SHOWTIME_SPONSORS: BubbleSponsor[] = [
  { id: 'sp-1', name: 'Fender',  logoUrl: '', type: 'major', tierColor: '#FFD700' },
  { id: 'sp-2', name: 'Sony',    logoUrl: '', type: 'major', tierColor: '#AA2DFF' },
  { id: 'sp-3', name: 'Beats',   logoUrl: '', type: 'major', tierColor: '#FF2DAA' },
  { id: 'sp-4', name: 'Nike',    logoUrl: '', type: 'local', tierColor: '#00FFFF' },
  { id: 'sp-5', name: 'Walmart', logoUrl: '', type: 'local', tierColor: '#00FF88' },
];

export default function UniversalVenueRenderer({ roomId, mode, venueIndex = 1, fanIdOverride }: Props) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [userId, setUserId] = useState(() => fanIdOverride ?? getGuestId());
  const [displayName, setDisplayName] = useState(mode === 'performer' ? 'Performer' : 'Fan');
  const [joined, setJoined] = useState(true);
  const [mySeatId, setMySeatId] = useState<string | null>(null);
  const [curtainState, setCurtainState] = useState(() => getStageSnapshot().state);
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryState>('CONNECTED');
  const [slowModeSeconds, setSlowModeSeconds] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const wasLiveRef = useRef(false);
  const prevMemberIdsRef = useRef<Set<string>>(new Set());
  const revealActive = useShowtimeReveal(liveSession?.stageState);

  const { stream, error, videoRef } = useStageWebRTC({
    video: mode === 'performer' || (mode === 'audience' && captureEnabled),
    audio: mode === 'performer' || (mode === 'audience' && captureEnabled),
    hd: false,
  });

  useLiveSessionHeartbeat({ enabled: mode === 'performer', viewerCount: snapshot?.present ?? 0 });

  // Phase C2: canonical entity world for AudienceScene entity-mode rendering
  const { entities: audienceEntities } = useAudienceWorld(roomId);
  useEffect(() => subscribeStage((s) => setCurtainState(s.state)), []);

  useEffect(() => {
    if (fanIdOverride) return; // caller already resolved identity — don't override it
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
    setSnapshot(await response.json() as Snapshot);
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
        setLiveSession(data.sessions.find((s) => s.roomId === roomId) ?? null);
      } catch { /* non-fatal */ }
    }
    void fetchSession();
    const interval = setInterval(fetchSession, 5_000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Trust Loop: surfaces host drops / WebRTC errors as recovery UX
  useEffect(() => {
    if (mode === 'audience') {
      if (error) setRecoveryStatus('RECONNECTING');
      else if (wasLiveRef.current && !liveSession) setRecoveryStatus('HOST_OFFLINE');
      else if (!wasLiveRef.current && liveSession) setRecoveryStatus('CONNECTED');
      else if (wasLiveRef.current && liveSession && (recoveryStatus === 'RECONNECTING' || recoveryStatus === 'HOST_OFFLINE')) {
        setRecoveryStatus('RESTORED');
        const t = setTimeout(() => setRecoveryStatus('CONNECTED'), 3000);
        return () => clearTimeout(t);
      }
    }
    wasLiveRef.current = !!liveSession;
  }, [error, liveSession, mode, recoveryStatus]);

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
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const groupId = searchParams?.get('groupId') ?? null;

    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        venueSlug: roomId,
        member: { userId, displayName, role: 'fan', seatId: null, captureEnabled, groupId, viewpoint: { yaw: 0, pitch: 0, updatedAt: Date.now() } },
      }),
    })
      .then(async (r) => {
        const data = await r.json() as { assignedSeatId?: string };
        if (data.assignedSeatId) setMySeatId(data.assignedSeatId);
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
  }, [mode, joined, roomId, userId, displayName, captureEnabled, refresh]);

  useEffect(() => {
    if (mode !== 'audience' || !joined) return;
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'capture', venueSlug: roomId, userId, captureEnabled }),
    }).catch(() => {});
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
    if (liveSession?.userId) recordFanMessage(liveSession.userId, userId, displayName);
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', venueSlug: roomId, userId, displayName, text }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) { setErrorMsg(data?.error ?? 'Message failed to send'); return; }
        setErrorMsg('');
        await refresh();
      })
      .catch(() => setErrorMsg('Message failed to send'));
  }

  function sendReaction(emoji: string) {
    const id = `r-${Date.now()}-${Math.random()}`;
    const x = 15 + Math.random() * 70;
    setReactions((prev) => [...prev.slice(-8), { id, emoji, x }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2600);
  }

  const audience = useMemo(() => snapshot?.activeMembers ?? [], [snapshot?.activeMembers]);
  const captureAudience = useMemo(() => audience.filter((m) => m.captureEnabled), [audience]);
  const messages = useMemo(() => snapshot?.messages ?? [], [snapshot?.messages]);
  const mutedUserIds = snapshot?.moderation?.mutedUserIds ?? [];
  const activeSlowModeSeconds = Math.round((snapshot?.moderation?.slowModeMs ?? 0) / 1000);
  useEffect(() => setSlowModeSeconds(activeSlowModeSeconds), [activeSlowModeSeconds]);

  function updateSlowMode() {
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'moderation', moderationAction: 'slow-mode', venueSlug: roomId, slowModeSeconds }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) { setErrorMsg(data?.error ?? 'Failed to update slow mode'); return; }
        setErrorMsg('');
        await refresh();
      })
      .catch(() => setErrorMsg('Failed to update slow mode'));
  }

  function setMuted(targetUserId: string, shouldMute: boolean) {
    void fetch('/api/live/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'moderation', moderationAction: shouldMute ? 'mute' : 'unmute', venueSlug: roomId, targetUserId }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) { setErrorMsg(data?.error ?? 'Moderation update failed'); return; }
        setErrorMsg('');
        await refresh();
      })
      .catch(() => setErrorMsg('Moderation update failed'));
  }

  return (
    <section style={{ border: '1px solid rgba(0,255,255,0.25)', borderRadius: 14, padding: 12, background: 'rgba(5,5,16,0.22)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', marginTop: 14 }}>
      <style>{`@keyframes universalReactionFloat{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-90px) scale(1.4);}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#00FFFF', fontWeight: 800 }}>TMI VENUE</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{snapshot?.present ?? 0} inside · {roomId}</div>
        </div>
        {mode === 'audience' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setJoined((p) => !p)} style={{ border: '1px solid rgba(0,255,136,0.35)', borderRadius: 8, padding: '7px 10px', background: joined ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.06)', color: joined ? '#00FF88' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
              {joined ? 'Inside Venue' : 'Enter Venue'}
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

      {/* ── Stage + 3D ambient crowd ─────────────────────────────────────── */}
      <div style={{ position: 'relative', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#000' }}>
          <LiveRecoveryOverlay status={recoveryStatus} />
          {liveSession && (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ background: '#FF0000', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em' }}>● LIVE</span>
              <span style={{ fontSize: 11, color: '#00FFFF', fontWeight: 800 }}>{liveSession.viewerCount} watching</span>
            </div>
          )}
          {mode === 'performer' ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: '0.08em', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,45,170,0.2), rgba(5,5,16,0.94) 70%)' }}>
              {liveSession ? `🎤 ${liveSession.displayName}${liveSession.title ? ` — ${liveSession.title}` : ''}` : '🎭 SHOW STARTING SOON'}
            </div>
          )}
          <StageCurtain durationMs={3200} />
        </div>

        {/* AudienceScene — canonical ambient crowd visual, plus real named-seat overlay */}
        <div style={{ position: 'relative', marginTop: 4 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', margin: '8px 0 6px', fontWeight: 800, textAlign: 'center' }}>
            {mode === 'audience' && mySeatId ? `YOUR SEAT: ${mySeatId.toUpperCase()} · ${audience.filter((m) => m.seatId).length} seated` : `LIVE VENUE · ${snapshot?.present ?? 0} in seats`}
          </div>
          <AudienceScene
            view={mode === 'performer' ? 'performer' : 'fan'}
            venue={venueIndex}
            watcherCount={snapshot?.present}
            entities={audienceEntities}
            occupancyRatio={snapshot ? Math.min(1, snapshot.present / Math.max(1, snapshot.capacity)) : 0.08}
            onReaction={sendReaction}
            hideControls
            accentColor={mode === 'performer' ? '#FFD700' : '#00FFFF'}
          />
          {audience.length > 0 && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 6, display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap', padding: '0 8px', pointerEvents: 'none' }}>
              {audience.slice(0, 16).map((m) => {
                const isMe = m.seatId === mySeatId;
                const roleEmoji = m.role === 'bot' ? '🤖' : m.role === 'host' ? '🌟' : m.role === 'artist' ? '🎤' : '🎧';
                const shortName = m.displayName.split('|')[0]?.slice(0, 8) ?? 'Fan';
                return (
                  <div key={m.userId} title={`${m.displayName} — ${m.role}${m.seatId ? ` · ${m.seatId.toUpperCase()}` : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 999, fontSize: 8, fontWeight: 800, background: isMe ? 'rgba(0,255,255,0.22)' : 'rgba(0,0,0,0.55)', border: isMe ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.12)', color: isMe ? '#00FFFF' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(3px)' }}>
                    <span>{roleEmoji}</span><span>{isMe ? 'YOU' : shortName}</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Floating reactions */}
          {reactions.map((r) => (
            <div key={r.id} style={{ position: 'absolute', bottom: '35%', left: `${r.x}%`, fontSize: 28, pointerEvents: 'none', animation: 'universalReactionFloat 2.6s ease-out forwards', zIndex: 60 }}>{r.emoji}</div>
          ))}
        </div>

        {revealActive && <SponsorBubbleOverlay sponsors={SHOWTIME_SPONSORS} orbitRadius={120} />}
      </div>

      {/* Reaction bar — fan mode */}
      {mode === 'audience' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['🔥', '❤️', '⚡', '👑', '🎤', '💜', '🎶'] as const).map((emoji) => (
            <button key={emoji} type="button" onClick={() => sendReaction(emoji)} style={{ width: 40, height: 40, borderRadius: 8, fontSize: 19, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>{emoji}</button>
          ))}
        </div>
      )}

      {/* 📸 Capture Moment — Memory Wall capture for all joined participants (BD Phase C Task 2) */}
      {joined && (
        <div style={{ position: 'fixed', bottom: 216, right: 16, zIndex: 998 }}>
          <MemoryCaptureButton
            userId={userId}
            roomId={roomId}
            roomLabel={`Live Room · ${roomId}`}
            accentColor="#FF2DAA"
          />
        </div>
      )}

      {/* Avatar Action Wheel — fixed bottom-right, available to all room participants */}
      {joined && <AvatarActionWheel entityId={userId} roomId={roomId} />}

      {/* Prop Loader — shows equipped prop above the ActionWheel; returns null if no certified prop */}
      {joined && <PropLoader entityId={userId} audienceCount={snapshot?.present ?? 0} />}

      {mode === 'audience' && joined && captureEnabled && (
        <div style={{ marginBottom: 12, border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,255,136,0.04)' }}>
          <div style={{ padding: '8px 10px', fontSize: 10, color: '#00FF88', fontWeight: 800, letterSpacing: '0.1em' }}>YOUR CAMERA PREVIEW (OPTIONAL)</div>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#000' }} />
          {(error || errorMsg) && <div style={{ padding: '6px 10px', color: '#FF7070', fontSize: 11 }}>{error ?? errorMsg}</div>}
        </div>
      )}

      {mode === 'performer' && (
        <>
          <div style={{ marginBottom: 12, border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: 12, background: 'rgba(255,215,0,0.05)' }}>
            <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 10 }}>🎭 STAGE CURTAIN · {curtainState.replace(/_/g, ' ')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => resetStage()} style={{ padding: '7px 14px', fontSize: 10, fontWeight: 800, borderRadius: 7, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>🔄 PREPARE STAGE</button>
              <button type="button" onClick={() => startCountdown()} disabled={curtainState !== 'STAGE_PREP'} style={{ padding: '7px 14px', fontSize: 10, fontWeight: 800, borderRadius: 7, border: '1px solid rgba(255,215,0,0.4)', background: curtainState === 'STAGE_PREP' ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)', color: curtainState === 'STAGE_PREP' ? '#FFD700' : 'rgba(255,255,255,0.3)', cursor: curtainState === 'STAGE_PREP' ? 'pointer' : 'not-allowed' }}>⏱ START COUNTDOWN</button>
              <button type="button" onClick={() => openCurtain()} disabled={curtainState === 'CAMERA_LIVE'} style={{ padding: '7px 14px', fontSize: 10, fontWeight: 800, borderRadius: 7, border: '1px solid rgba(0,255,136,0.4)', background: curtainState !== 'CAMERA_LIVE' ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', color: curtainState !== 'CAMERA_LIVE' ? '#00FF88' : 'rgba(255,255,255,0.3)', cursor: curtainState !== 'CAMERA_LIVE' ? 'pointer' : 'not-allowed' }}>🎬 OPEN CURTAIN</button>
              <button type="button" onClick={() => closeCurtainAndEnd()} disabled={curtainState !== 'CAMERA_LIVE' && curtainState !== 'INTERMISSION'} style={{ padding: '7px 14px', fontSize: 10, fontWeight: 800, borderRadius: 7, border: '1px solid rgba(255,45,170,0.4)', background: (curtainState === 'CAMERA_LIVE' || curtainState === 'INTERMISSION') ? 'rgba(255,45,170,0.15)' : 'rgba(255,255,255,0.04)', color: (curtainState === 'CAMERA_LIVE' || curtainState === 'INTERMISSION') ? '#FF2DAA' : 'rgba(255,255,255,0.3)', cursor: (curtainState === 'CAMERA_LIVE' || curtainState === 'INTERMISSION') ? 'pointer' : 'not-allowed' }}>🚪 CLOSE & END</button>
            </div>
          </div>

          {liveSession?.userId && (
            <>
              <AudienceRecognitionOverlay performerId={liveSession.userId} currentMemberIds={(snapshot?.activeMembers ?? []).map((m) => m.userId)} displayNames={Object.fromEntries((snapshot?.activeMembers ?? []).map((m) => [m.userId, m.displayName]))} />
              <PerformerRelationshipPanel performerId={liveSession.userId} tipTotal={liveSession.tipTotal ?? 0} />
            </>
          )}

          <div style={{ marginBottom: 12, border: '1px solid rgba(255,45,170,0.35)', borderRadius: 10, padding: 10, background: 'rgba(255,45,170,0.05)' }}>
            <div style={{ fontSize: 10, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>CROWD CONTROL + CAPTURE MONITOR</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>💸 Tips: ${(liveSession?.tipTotal ?? 0).toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#00FFFF', fontWeight: 700 }}>👥 {snapshot?.present ?? 0} live</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Slow mode</div>
              <input type="range" min={0} max={20} value={slowModeSeconds} onChange={(e) => setSlowModeSeconds(Number(e.target.value))} style={{ width: 140 }} />
              <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>{slowModeSeconds}s</div>
              <button type="button" onClick={updateSlowMode} style={{ borderRadius: 8, border: '1px solid rgba(255,215,0,0.45)', background: 'rgba(255,215,0,0.16)', color: '#FFD700', fontWeight: 700, padding: '6px 10px', cursor: 'pointer', fontSize: 11 }}>Apply</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {captureAudience.length === 0 && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>No audience members have enabled camera capture yet.</div>}
              {captureAudience.map((member) => (
                <div key={member.userId} style={{ border: '1px solid rgba(0,255,136,0.3)', borderRadius: 8, padding: 8, background: 'rgba(0,0,0,0.28)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#00FF88' }}>{member.displayName}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>POV {member.viewpoint.yaw}° / {member.viewpoint.pitch}°</div>
                  <button type="button" onClick={() => setMuted(member.userId, !mutedUserIds.includes(member.userId))} style={{ marginTop: 6, borderRadius: 7, border: `1px solid ${mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.45)' : 'rgba(255,68,68,0.45)'}`, background: mutedUserIds.includes(member.userId) ? 'rgba(0,255,136,0.12)' : 'rgba(255,68,68,0.12)', color: mutedUserIds.includes(member.userId) ? '#00FF88' : '#FF7070', fontWeight: 700, padding: '5px 8px', cursor: 'pointer', fontSize: 10 }}>
                    {mutedUserIds.includes(member.userId) ? 'Unmute Chat' : 'Mute Chat'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', fontSize: 10, color: '#AA2DFF', fontWeight: 800, letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
          <span>VENUE CHAT</span><span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{snapshot?.present ?? 0} IN ROOM</span>
        </div>
        <div style={{ maxHeight: 150, overflowY: 'auto', padding: 10, display: 'grid', gap: 6, background: 'rgba(0,0,0,0.18)' }}>
          {messages.slice(-40).map((message) => (
            <div key={message.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}><span style={{ color: '#AA2DFF', fontWeight: 700 }}>{message.displayName}:</span> {message.text}</div>
          ))}
          {messages.length === 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>No messages yet.</div>}
        </div>
        {errorMsg && <div style={{ padding: '4px 10px', fontSize: 10, color: '#FF7070', background: 'rgba(255,68,68,0.08)' }}>{errorMsg}</div>}
        <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} placeholder="Say something to the room…" style={{ flex: 1, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '8px 10px', fontSize: 12, outline: 'none' }} />
          <button type="button" onClick={sendMessage} style={{ borderRadius: 8, border: '1px solid rgba(170,45,255,0.5)', background: 'rgba(170,45,255,0.22)', color: '#DDB7FF', fontWeight: 700, padding: '8px 12px', cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </section>
  );
}
