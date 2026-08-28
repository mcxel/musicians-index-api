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
import dynamic from 'next/dynamic';
import { getGuestId } from '@/lib/identity/getGuestId';
import { useStageWebRTC } from '@/hooks/useStageWebRTC';
import { useLiveSessionHeartbeat } from '@/hooks/useLiveSessionHeartbeat';
import { recordFanJoin, recordFanMessage } from '@/lib/fans/SuperFanMomentumEngine';
import {
  ensureLiveRoomMixerBound,
  markLocalMicSource,
} from '@/lib/audio/mixer/LiveRoomMixerBind';
import PerformerRelationshipPanel from './PerformerRelationshipPanel';
import AudienceRecognitionOverlay from './AudienceRecognitionOverlay';
import { SystemSecurityBot } from '@/lib/bots/SystemSecurityBot';
import LiveRecoveryOverlay, { type RecoveryState } from './LiveRecoveryOverlay';
import SponsorBubbleOverlay, { type BubbleSponsor } from '@/components/sponsor/SponsorBubbleOverlay';
import { useShowtimeReveal } from '@/lib/live/LiveryRevealController';
import StageCurtain from '@/components/live/StageCurtain';
import VenueToolsShellHint from '@/components/hud/VenueToolsShellHint';
import AudienceScene, {
  type VenueIndex,
  type AudienceBobbleheadSeating,
  FAN_TOTAL_SEATS,
  PERF_TOTAL_SEATS,
} from '@/components/live/AudienceScene';
import { useAudienceWorld } from '@/lib/live/useAudienceWorld';
import TMIInteractiveLoungeHud from "@/components/venue-hud/TMIInteractiveLoungeHud";
import VenueToolsPanelHost from "@/components/hud/VenueToolsPanelHost";
import LoungeVideoPresenceFloor from "@/components/live/LoungeVideoPresenceFloor";
import PerformerVideoPresenceFloor from "@/components/live/PerformerVideoPresenceFloor";
import { registerAndAdaptParticipant } from "@/lib/personal-media";
import {
  isLoungeExperience,
  isPerformerLobbyExperience,
  loungeHudMountsForRoom,
} from "@/lib/venue-hud/loungeContainer";
import { joinLoungeVideoPanel, leaveLoungeVideoPanel } from "@/lib/live/loungeVideoPresenceLaw";
import {
  joinPerformerVideoPanel,
  leavePerformerVideoPanel,
} from "@/lib/live/performerLobbyVideoPresenceLaw";
import {
  CANONICAL_WORLD_ZONE,
  auditoriumEntryHref,
  fanAvatarLobbyEntryHref,
  type CanonicalWorldZone,
} from "@/lib/live/canonicalWorldViewport";
import type { VenueSpatialMap, WorldViewMode } from "@/lib/world/WorldScenePlan";
import { canonicalizeWorldViewMode } from "@/lib/world/WorldScenePlan";
import AvatarActionWheel from '@/components/avatars/AvatarActionWheel';
import MemoryCaptureButton from '@/components/memory/MemoryCaptureButton';
import { AttentionDebugOverlay } from '@/components/live/AttentionDebugOverlay';
import { RoomBubbleRail } from '@/components/chat/RoomBubbleRail';
import { useVenueSpeechBubbles, audienceMessageToRoomChat } from '@/components/messaging/useVenueSpeechBubbles';
import VenueInRoomMessagingPanel from '@/components/messaging/VenueInRoomMessagingPanel';
import { RoomBubbleChatEngine } from '@/lib/chat/RoomBubbleChatEngine';
import { resolveBaseVenueSkin } from '@/lib/venues/TierBaseVenueSkin';

const PropLoader = dynamic(() => import('@/components/avatars/PropLoader'), { ssr: false });
import {
  startCountdown,
  openCurtain,
  closeCurtainAndEnd,
  resetStage,
  getStageSnapshot,
  subscribeStage,
} from '@/lib/live/StageLifecycleEngine';

type RendererMode = 'audience' | 'performer';

// ─── Progressive stadium fill (Rule 15 / CLAUDE.md) ─────────────────────────
// When a performer goes live the venue starts empty and fills to 92% max:
//   0% → 12% instantly, then +6% every 250ms until 92%.
// Real fan joins take precedence — the ratio never drops BELOW the real count.
// Bots visually occupy the remaining gap between real fans and the animated target.
function useProgressiveStadiumFill(isLive: boolean, realPresent: number, capacity: number) {
  const [animatedFill, setAnimatedFill] = useState(0);
  const firstLiveRef = useRef(false);

  useEffect(() => {
    if (!isLive) {
      // Reset when show ends so next go-live starts fresh
      setAnimatedFill(0);
      firstLiveRef.current = false;
      return;
    }

    if (!firstLiveRef.current) {
      firstLiveRef.current = true;
      setAnimatedFill(0.12); // instant 12% on first live detection
    }

    let current = firstLiveRef.current ? 0.12 : 0;
    const interval = setInterval(() => {
      current = Math.min(0.92, current + 0.06);
      setAnimatedFill(current);
      if (current >= 0.92) clearInterval(interval);
    }, 250);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const realRatio = realPresent / Math.max(1, capacity);
  // Final ratio: bot-fill target OR real audience, whichever is higher — capped at 92%
  return Math.min(0.92, Math.max(realRatio, animatedFill));
}

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
  performerTier?: string;
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
  /**
   * When true, activates the progressive stadium-fill animation immediately
   * regardless of whether a live session is detected in the registry.
   * Use in GoLiveStudio performer view where the room ID may differ from
   * the Daily.co room ID assigned at broadcast start.
   */
  forceStadiumFill?: boolean;
  /**
   * Instant Go Live: show empty seating on first paint. Occupancy follows
   * real presence only — no bot stadium fill, no inflated watching count.
   */
  instantEmptyStage?: boolean;
  /** Hub Monitor B — venue/audience only; never request local camera here. */
  hubVenueOnly?: boolean;
  /** FOH vs BOH viewport role when embedded in Command Center monitor player. */
  hubViewportRole?: "foh" | "boh";
  /** Named zone of the one canonical world (lounge side-room suppresses avatars). */
  canonicalZone?: CanonicalWorldZone;
  /** Force-disable AudienceScene / BotCrowdFill / avatar seating (lounge law). */
  suppressAvatars?: boolean;
  /**
   * PREVIEW VENUE / VENUE TEST — same renderer as GO LIVE, never published as live.
   * When set, occupancy uses forcedOccupancyRatio and HUD must label TEST (Rule 20).
   */
  isPreview?: boolean;
  /** 0–1 TEST occupancy override. Ignored unless isPreview. */
  forcedOccupancyRatio?: number | null;
  /** Capacity for TEST occupancy math / labeling. */
  previewCapacity?: number;
  /**
   * World Director immersive view mode — same coordinate integrity for
   * PC mouse-look and phone touch-drag (framing only until Gate 3 GLB).
   */
  viewMode?: WorldViewMode;
  /** Square-feet spatial map from WorldScenePlan (registry estimate until measured GLB). */
  spatialMap?: VenueSpatialMap | null;
}

function publicName(name: string): string {
  if (!name.includes('@')) return name;
  const [local] = name.split('@');
  if (!local) return 'Audience Member';
  return local.length <= 2 ? `${local[0] ?? 'u'}*` : `${local.slice(0, 2)}***`;
}

/** Map seat id → AudienceScene fill index for local Fan AvatarRig (never Performer). */
function seatIdToBobblePinIndex(
  seatId: string | null,
  view: "fan" | "performer",
  occupiedCount: number,
): number | null {
  if (!seatId || occupiedCount <= 0) return null;
  const total = view === "fan" ? FAN_TOTAL_SEATS : PERF_TOTAL_SEATS;
  let h = 5381;
  for (let i = 0; i < seatId.length; i++) h = ((h << 5) + h) ^ seatId.charCodeAt(i);
  h = Math.abs(h);
  if (view === "performer") {
    const start = Math.max(0, total - occupiedCount);
    return start + (h % Math.max(1, occupiedCount));
  }
  const frontStart = Math.max(0, occupiedCount - Math.min(occupiedCount, 18));
  return frontStart + (h % Math.max(1, occupiedCount - frontStart));
}

const securityBot = new SystemSecurityBot();

const SHOWTIME_SPONSORS: BubbleSponsor[] = [
  { id: 'sp-1', name: 'Fender',  logoUrl: '', type: 'major', tierColor: '#FFD700' },
  { id: 'sp-2', name: 'Sony',    logoUrl: '', type: 'major', tierColor: '#AA2DFF' },
  { id: 'sp-3', name: 'Beats',   logoUrl: '', type: 'major', tierColor: '#FF2DAA' },
  { id: 'sp-4', name: 'Nike',    logoUrl: '', type: 'local', tierColor: '#00FFFF' },
  { id: 'sp-5', name: 'Walmart', logoUrl: '', type: 'local', tierColor: '#00FF88' },
];

export default function UniversalVenueRenderer({ roomId, mode, venueIndex = 1, fanIdOverride, forceStadiumFill = false, instantEmptyStage = false, hubVenueOnly = false, hubViewportRole, canonicalZone, suppressAvatars = false, isPreview = false, forcedOccupancyRatio = null, previewCapacity, viewMode = "FREE_ROAM_3D", spatialMap = null }: Props) {
  const canonicalView = canonicalizeWorldViewMode(viewMode);  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
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
  const loungePresentIdsRef = useRef<Set<string>>(new Set());
  const performerPresentIdsRef = useRef<Set<string>>(new Set());
  const revealActive = useShowtimeReveal(liveSession?.stageState);
  const canonicalHudFamilyIsLounge = loungeHudMountsForRoom(roomId);
  const isPerformerLobby = isPerformerLobbyExperience(roomId, canonicalZone);
  const isLoungeSideRoom =
    !isPerformerLobby &&
    (suppressAvatars ||
      isLoungeExperience(roomId, canonicalZone) ||
      canonicalHudFamilyIsLounge);
  const isVideoPanelRoom = isLoungeSideRoom || isPerformerLobby;
  const requestLocalMedia =
    !hubVenueOnly &&
    (isVideoPanelRoom
      ? captureEnabled
      : mode === "performer" || (mode === "audience" && captureEnabled));

  const { stream, error, videoRef } = useStageWebRTC({
    video: requestLocalMedia,
    audio: requestLocalMedia,
    hd: false,
  });

  useLiveSessionHeartbeat({ enabled: mode === 'performer', viewerCount: snapshot?.present ?? 0 });

  // Phase C2: canonical entity world for AudienceScene — skipped in lounge (no avatars).
  const { entities: audienceEntities } = useAudienceWorld(
    roomId,
    8,
    12,
    undefined,
    {
      enabled: !isVideoPanelRoom,
      // Instant GO LIVE / empty house — real seats only, no bot/host fill (Rule 20)
      botFill: !instantEmptyStage && forceStadiumFill,
    },
  );

  // Progressive stadium fill — used in performer view so the room never looks
  // empty right after going live (Rule 15, CLAUDE.md).
  // forceStadiumFill lets callers (e.g. GoLiveStudio) trigger the fill without
  // relying on liveSession, since the Daily.co room ID differs from roomId.
  // Instant Go Live overrides: empty seats until real fans (Rule 20 — no fake watching).
  // Lounge: never bot-fill a video hangout as if it were the auditorium.
  const stadiumFillRatio = useProgressiveStadiumFill(
    !isVideoPanelRoom && !instantEmptyStage && (forceStadiumFill || liveSession !== null),
    snapshot?.present ?? 0,
    snapshot?.capacity ?? 100,
  );
  const realOccupancyRatio = Math.min(
    1,
    (snapshot?.present ?? 0) / Math.max(1, snapshot?.capacity ?? 100),
  );
  const occupancyForScene = isPreview && forcedOccupancyRatio != null
    ? Math.min(1, Math.max(0, forcedOccupancyRatio))
    : isVideoPanelRoom
    ? realOccupancyRatio
    : instantEmptyStage
      ? realOccupancyRatio
      : mode === "performer"
        ? stadiumFillRatio
        : snapshot
          ? realOccupancyRatio
          : 0.08;
  const tierSkin = resolveBaseVenueSkin(liveSession?.performerTier ?? 'FREE');
  const watchingCount = isPreview
    ? Math.round(
        (forcedOccupancyRatio ?? 0) *
          Math.max(1, previewCapacity ?? snapshot?.capacity ?? 1000),
      )
    : snapshot?.present ?? 0;
  const loungeContextParticipantId = snapshot?.activeMembers?.[0]?.userId;

  /** Fan AvatarRig seating — same BobbleheadRuntimeCharacter as Fan lobby. Rule 26: no Performer rig. */
  const audienceSceneView: "fan" | "performer" = mode === "audience" ? "fan" : "performer";
  const bobbleOccupiedCount = Math.floor(
    (audienceSceneView === "fan" ? FAN_TOTAL_SEATS : PERF_TOTAL_SEATS) *
      Math.min(1, Math.max(0, occupancyForScene)),
  );
  const bobbleheadSeating = useMemo((): AudienceBobbleheadSeating | undefined => {
    if (isVideoPanelRoom) return undefined;
    // Performer mode: still show Fan/[TEST] audience bobbleheads — never a performer-owned AvatarRig
    const localFanSeatIndex =
      mode === "audience" && mySeatId && bobbleOccupiedCount > 0
        ? seatIdToBobblePinIndex(mySeatId, audienceSceneView, bobbleOccupiedCount)
        : mode === "audience" && mySeatId
          ? seatIdToBobblePinIndex(mySeatId, audienceSceneView, 1)
          : null;
    return {
      localFanSeatIndex,
      localFanLabel: mode === "audience" ? `${publicName(displayName)} (you)` : undefined,
      testOccupancy: Boolean(isPreview),
      maxRigInstances: isPreview ? 12 : 8,
    };
  }, [
    isVideoPanelRoom,
    mode,
    mySeatId,
    audienceSceneView,
    bobbleOccupiedCount,
    displayName,
    isPreview,
  ]);

  useEffect(() => {
    if (!isLoungeSideRoom) return;
    const members = snapshot?.activeMembers ?? [];
    const localVideoTrack = stream?.getVideoTracks?.()[0] ?? null;
    const localAudioTrack = stream?.getAudioTracks?.()[0] ?? null;
    const nextIds = new Set<string>();
    for (const member of members) {
      nextIds.add(member.userId);
      const isLocalCapture = member.userId === userId && Boolean(stream);
      const videoTrackId = isLocalCapture ? localVideoTrack?.id ?? null : null;
      registerAndAdaptParticipant({
        participantId: member.userId,
        canonicalIdentityId: member.userId,
        roomId,
        displayName: member.displayName,
        videoTrackRef: isLocalCapture ? localVideoTrack : null,
        audioTrackRef: isLocalCapture ? localAudioTrack : null,
        spatialPodId: `lounge-panel-${member.userId}`,
      });
      if (!loungePresentIdsRef.current.has(member.userId)) {
        joinLoungeVideoPanel({
          userId: member.userId,
          streamId: videoTrackId ?? `identity-${member.userId}`,
          chassisSkinId: "tv",
        });
      }
    }
    for (const prevId of loungePresentIdsRef.current) {
      if (!nextIds.has(prevId)) leaveLoungeVideoPanel(prevId);
    }
    loungePresentIdsRef.current = nextIds;
  }, [isLoungeSideRoom, snapshot?.activeMembers, roomId, stream, userId]);

  useEffect(() => {
    if (!isPerformerLobby) return;
    const members = snapshot?.activeMembers ?? [];
    const localVideoTrack = stream?.getVideoTracks?.()[0] ?? null;
    const localAudioTrack = stream?.getAudioTracks?.()[0] ?? null;
    const nextIds = new Set<string>();
    for (const member of members) {
      nextIds.add(member.userId);
      const isLocalCapture = member.userId === userId && Boolean(stream);
      const videoTrackId = isLocalCapture ? localVideoTrack?.id ?? null : null;
      registerAndAdaptParticipant({
        participantId: member.userId,
        canonicalIdentityId: member.userId,
        roomId,
        displayName: member.displayName,
        videoTrackRef: isLocalCapture ? localVideoTrack : null,
        audioTrackRef: isLocalCapture ? localAudioTrack : null,
        spatialPodId: `performer-panel-${member.userId}`,
      });
      if (!performerPresentIdsRef.current.has(member.userId)) {
        joinPerformerVideoPanel({
          userId: member.userId,
          streamId: videoTrackId ?? `identity-${member.userId}`,
        });
      }
    }
    for (const prevId of performerPresentIdsRef.current) {
      if (!nextIds.has(prevId)) leavePerformerVideoPanel(prevId);
    }
    performerPresentIdsRef.current = nextIds;
  }, [isPerformerLobby, snapshot?.activeMembers, roomId, stream, userId]);

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

  // Bind ChannelMixerDirector → TMIAudioSafetyMixer on room presence (audience or performer)
  useEffect(() => {
    if (!joined || hubVenueOnly || isPreview) return;
    ensureLiveRoomMixerBound({
      roomId,
      liveSessionId: liveSession ? `live:${roomId}` : `session:${roomId}`,
      experienceType: isLoungeSideRoom ? 'LOUNGE' : 'LIVE',
    });
  }, [joined, roomId, liveSession, isLoungeSideRoom, hubVenueOnly, isPreview]);

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
      markLocalMicSource(false);
      void fetch('/api/live/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', venueSlug: roomId, userId }),
      }).catch(() => {});
    };
  }, [mode, joined, roomId, userId, displayName, captureEnabled, refresh]);

  // Local capture mic availability only — no fake crowd.
  // OPEN: UVR/arena has no Daily/WebRTC remote peer track attach path yet —
  // remote participants register via LiveRoomMixerBind at GoLiveStudio / VideoRoom /
  // media TMIVideoRoom / useLobbyPeerMediaSession call sites, not here.
  useEffect(() => {
    if (!joined) {
      markLocalMicSource(false);
      return;
    }
    const hasLocalAudio = Boolean(stream?.getAudioTracks?.().some((t) => t.readyState === 'live'));
    markLocalMicSource(hasLocalAudio && requestLocalMedia);
  }, [joined, stream, requestLocalMedia]);

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
  const seatByUser = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const m of audience) map[m.userId] = m.seatId;
    return map;
  }, [audience]);
  const { bubbles: speechBubbles } = useVenueSpeechBubbles(messages, seatByUser);
  const whisperEngineRef = useRef<RoomBubbleChatEngine | null>(null);
  const [whisperBubbles, setWhisperBubbles] = useState<ReturnType<RoomBubbleChatEngine['getActiveBubbles']>>([]);
  const mutedUserIds = snapshot?.moderation?.mutedUserIds ?? [];
  const activeSlowModeSeconds = Math.round((snapshot?.moderation?.slowModeMs ?? 0) / 1000);
  useEffect(() => setSlowModeSeconds(activeSlowModeSeconds), [activeSlowModeSeconds]);

  useEffect(() => {
    if (!whisperEngineRef.current) whisperEngineRef.current = new RoomBubbleChatEngine(8);
    const onIncoming = (event: Event) => {
      const detail = (event as CustomEvent<{ fromName?: string; preview?: string; fromAvatarUrl?: string }>).detail;
      if (!detail?.preview) return;
      const engine = whisperEngineRef.current!;
      const now = Date.now();
      const msg = audienceMessageToRoomChat({
        id: `whisper-${now}`,
        userId: 'dm',
        displayName: detail.fromName ?? 'Friend',
        text: detail.preview,
        createdAt: now,
        avatarUrl: detail.fromAvatarUrl,
      });
      engine.createBubble(msg, { x: 0.72, y: 0.38 }, 5200, now);
      setWhisperBubbles(engine.getActiveBubbles(now));
    };
    window.addEventListener('tmi:incoming-dm', onIncoming);
    const tick = window.setInterval(() => {
      const engine = whisperEngineRef.current;
      if (!engine) return;
      setWhisperBubbles(engine.getActiveBubbles(Date.now()));
    }, 150);
    return () => {
      window.removeEventListener('tmi:incoming-dm', onIncoming);
      window.clearInterval(tick);
    };
  }, []);

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

  /**
   * Hub monitor player — ONE canonical world, viewport window only.
   * AudienceScene fills the entire monitor box (stage + seating in one canvas).
   * StageCurtain overlays the stage zone — curtain, stage, and seating are
   * all parts of this same world, not separate sections.
   * BOH perspective (fan looking at stage) → view="fan"
   * FOH perspective (performer looking at audience) → view="performer"
   */
  if (hubVenueOnly) {
    const audienceView = mode === "audience" ? "fan" : "performer";
    const viewportRole = hubViewportRole ?? (mode === "audience" ? "boh" : "foh");
    const viewportLabel = isLoungeSideRoom
      ? "LOUNGE · GROUP / ROOM VIEW"
      : viewportRole === "boh"
        ? "BOH · HOUSE VIEW"
        : "FOH · STAGE VIEW";
    const accentCol = isLoungeSideRoom ? "#AA2DFF" : mode === "performer" ? "#FFD700" : "#00FFFF";
    const viewFraming =
      canonicalView === "PANORAMA_180"
        ? "perspective(900px) rotateY(-6deg)"
        : canonicalView === "SPHERICAL_360"
          ? "perspective(1100px) scale(1.02)"
          : undefined;

    return (
      <div
        data-hub-uvr-embedded="true"
        data-canonical-viewport={viewportRole}
        data-canonical-zone={isLoungeSideRoom ? CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM : (canonicalZone ?? viewportRole)}
        data-lounge-avatars="false"
        data-world-coverage="360x180-4pi"
        data-view-mode={canonicalView}
        data-spatial-units={spatialMap?.units ?? "ft"}
        data-spatial-area-sqft={spatialMap?.floor.areaSqFt ?? undefined}
        data-spatial-geometry={spatialMap?.geometryStatus ?? "REGISTRY_ESTIMATE"}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#010308",
          transform: viewFraming,
          transformOrigin: "center center",
        }}
      >
        <style>{`@keyframes universalReactionFloat{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-90px) scale(1.4);}}`}</style>

        <div style={{ position: "absolute", inset: 0 }}>
          {isLoungeSideRoom ? (
            <div
              data-lounge-group-view="true"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: "radial-gradient(circle at 50% 28%, rgba(170,45,255,0.14), #010308 72%)",
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.4 }}>📹</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)" }}>
                LOUNGE GROUP VIEW · VIDEO-FIRST · NO AVATARS
              </span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                {watchingCount > 0
                  ? `${watchingCount} in conversation · cameras after CAM ON`
                  : "No cameras on · CAM ON to appear"}
              </span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)" }}>
                Unlabeled plane is still not photoreal
              </span>
            </div>
          ) : (
            <AudienceScene
              view={audienceView}
              venue={venueIndex}
              watcherCount={watchingCount}
              entities={instantEmptyStage ? [] : audienceEntities}
              occupancyRatio={instantEmptyStage ? realOccupancyRatio : occupancyForScene}
              onReaction={sendReaction}
              hideControls
              accentColor={accentCol}
              bobbleheadSeating={instantEmptyStage ? undefined : bobbleheadSeating}
              screenLabel={
                liveSession || !instantEmptyStage
                  ? undefined
                  : watchingCount > 0
                    ? "● LIVE"
                    : "STAGE OPEN"
              }
              screenSubLabel={
                liveSession || !instantEmptyStage
                  ? undefined
                  : watchingCount > 0
                    ? undefined
                    : "EMPTY HOUSE · REAL FANS ONLY"
              }
            />
          )}
        </div>

        {!isLoungeSideRoom ? (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <StageCurtain durationMs={3200} />
          </div>
        ) : null}

        {/* Viewport label — bottom-left corner */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            zIndex: 10,
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: `${accentCol}cc`,
            background: "rgba(1,3,8,0.72)",
            borderRadius: 3,
            padding: "2px 6px",
            pointerEvents: "none",
          }}
        >
          {viewportLabel} · 360°×180° · same room
        </div>

        {/* Live / idle status badge — top-left */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            zIndex: 10,
            display: "flex",
            gap: 6,
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {isPreview ? (
            <>
              <span style={{ background: "rgba(255,215,0,0.25)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.55)", borderRadius: 4, padding: "2px 6px", fontSize: 7, fontWeight: 900, letterSpacing: "0.1em" }}>
                ● VENUE TEST
              </span>
              <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 800 }}>
                TEST: {watchingCount.toLocaleString()} / {(previewCapacity ?? snapshot?.capacity ?? 1000).toLocaleString()} OCCUPANCY
              </span>
            </>
          ) : liveSession ? (
            <>
              <span style={{ background: "#FF0000", color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 7, fontWeight: 900, letterSpacing: "0.1em" }}>
                ● LIVE
              </span>
              <span style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800 }}>
                {liveSession.viewerCount ?? watchingCount} watching
              </span>
            </>
          ) : (
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.42)", fontWeight: 700 }}>
              {watchingCount > 0 ? `${watchingCount} inside` : "Venue open · empty seats"}
            </span>
          )}
        </div>

        {/* Floating reactions */}
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{
              position: "absolute",
              bottom: "35%",
              left: `${r.x}%`,
              fontSize: 24,
              pointerEvents: "none",
              animation: "universalReactionFloat 2.6s ease-out forwards",
              zIndex: 60,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section
      data-canonical-zone={
        isPerformerLobby
          ? CANONICAL_WORLD_ZONE.PERFORMER_LOBBY
          : isLoungeSideRoom
            ? CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM
            : (canonicalZone ?? undefined)
      }
      data-lounge-avatars={isVideoPanelRoom ? "false" : undefined}
      data-performer-lobby={isPerformerLobby ? "true" : undefined}
      data-view-mode={canonicalView}
      data-spatial-units={spatialMap?.units ?? "ft"}
      data-spatial-width-ft={spatialMap?.floor.widthFt ?? undefined}
      data-spatial-depth-ft={spatialMap?.floor.depthFt ?? undefined}
      data-spatial-area-sqft={spatialMap?.floor.areaSqFt ?? undefined}
      data-spatial-geometry={spatialMap?.geometryStatus ?? "REGISTRY_ESTIMATE"}
      style={{
        border: `1px solid ${tierSkin.accent}40`,
        borderRadius: 14,
        padding: 12,
        transform:
          canonicalView === "PANORAMA_180"
            ? "perspective(900px) rotateY(-6deg)"
            : canonicalView === "SPHERICAL_360"
              ? "perspective(1100px) scale(1.02)"
              : undefined,
        transformOrigin: "center center",
        background: `radial-gradient(ellipse at 50% 0%, ${tierSkin.accent}0a 0%, rgba(5,5,16,0.22) 60%)`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        marginTop: 14,
        ['--tier-accent' as string]: tierSkin.accent,
        ['--tier-trim' as string]: tierSkin.trim,
        ['--tier-lighting-layers' as string]: String(tierSkin.lightingLayers),
        ['--tier-prestige-fx' as string]: tierSkin.prestigeFx ? '1' : '0',
      } as React.CSSProperties
    }>
      <style>{`@keyframes universalReactionFloat{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-90px) scale(1.4);}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', color: isPerformerLobby ? '#FF2DAA' : isLoungeSideRoom ? '#AA2DFF' : tierSkin.accent, fontWeight: 800 }}>
            {isPerformerLobby
              ? "TMI PERFORMER LOBBY · REHEARSAL / BACKROOM · NO AVATARS"
              : isLoungeSideRoom
                ? "TMI LOUNGE · CONNECTED SIDE ROOM · NO AVATARS"
                : `TMI VENUE · ${tierSkin.label.toUpperCase()}`}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{snapshot?.present ?? 0} inside · {roomId}</div>
          {isLoungeSideRoom ? (
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <a href={fanAvatarLobbyEntryHref(roomId, { from: "lounge-side-room" })} style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", textDecoration: "none" }}>
                ← FAN AVATAR LOBBY
              </a>
              <a href={auditoriumEntryHref(roomId, { from: "lounge-side-room" })} style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", textDecoration: "none" }}>
                ENTER AUDITORIUM →
              </a>
            </div>
          ) : null}
        </div>
        {mode === 'audience' || isVideoPanelRoom ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setJoined((p) => !p)} style={{ border: '1px solid rgba(0,255,136,0.35)', borderRadius: 8, padding: '7px 10px', background: joined ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.06)', color: joined ? '#00FF88' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
              {joined
                ? (isPerformerLobby ? 'In Performer Lobby' : isLoungeSideRoom ? 'In Lounge' : 'Inside Venue')
                : (isPerformerLobby ? 'Enter Performer Lobby' : isLoungeSideRoom ? 'Enter Lounge' : 'Enter Venue')}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
              <input type="checkbox" checked={captureEnabled} onChange={(e) => setCaptureEnabled(e.target.checked)} />
              {isVideoPanelRoom ? "CAM ON (explicit — no auto camera)" : "Audience camera capture"}
            </label>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>Performer Control View</div>
        )}
      </div>

      {/* ── Stage + 3D ambient crowd ─────────────────────────────────────── */}
      <div style={{ position: 'relative', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 12 }}>
        {isLoungeSideRoom ? (
          <TMIInteractiveLoungeHud
            loungeId={roomId}
            loungeTitle={`Lounge ${roomId}`}
            loungeMode={roomId.toLowerCase().includes("playlist") ? "PLAYLIST_LOUNGE" : "CHILL_LOUNGE"}
            userRole={mode === "performer" ? "performer" : "fan"}
            userId={userId}
            isLoungeHost={mode === "performer" || liveSession?.userId === userId}
            contextParticipantId={loungeContextParticipantId}
            occupancyPresent={snapshot?.present ?? 0}
            occupancyCapacity={snapshot?.capacity}
          />
        ) : null}
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#000' }}>
          <LiveRecoveryOverlay status={recoveryStatus} />
          {isPreview ? (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,215,0,0.25)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.55)', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em' }}>● VENUE TEST</span>
              <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 800 }}>
                TEST: {watchingCount.toLocaleString()} / {(previewCapacity ?? snapshot?.capacity ?? 1000).toLocaleString()} OCCUPANCY
              </span>
            </div>
          ) : liveSession ? (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#FF0000', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em' }}>● LIVE</span>
              <span style={{ fontSize: 11, color: '#00FFFF', fontWeight: 800 }}>
                {liveSession.viewerCount ?? watchingCount} watching
              </span>
            </div>
          ) : instantEmptyStage ? (
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
                Venue Open · {watchingCount} watching{watchingCount === 0 ? ' · empty seats' : ''}
              </span>
            </div>
          ) : null}
          {isVideoPanelRoom && captureEnabled ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
          ) : isPerformerLobby ? (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: '0.08em', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,45,170,0.18), rgba(5,5,16,0.94) 70%)' }}>
              PERFORMER LOBBY · CAM OFF · tap CAM ON for your panel
            </div>
          ) : isLoungeSideRoom ? (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: '0.08em', background: 'radial-gradient(ellipse at 50% 40%, rgba(170,45,255,0.18), rgba(5,5,16,0.94) 70%)' }}>
              LOUNGE CONVERSATION · CAM OFF · tap CAM ON for self feed
            </div>
          ) : mode === 'performer' && !hubVenueOnly ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
          ) : mode === 'performer' && hubVenueOnly ? (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.08em', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,45,170,0.12), rgba(5,5,16,0.94) 70%)' }}>
              🎭 VENUE VIEW · CAMERA ON MONITOR A
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: '0.08em', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,45,170,0.2), rgba(5,5,16,0.94) 70%)' }}>
              {liveSession ? `🎤 ${liveSession.displayName}${liveSession.title ? ` — ${liveSession.title}` : ''}` : '🎭 SHOW STARTING SOON'}
            </div>
          )}
          {!isVideoPanelRoom ? <StageCurtain durationMs={3200} /> : null}
        </div>

        {/* Video-panel floors — no AudienceScene / avatars */}
        {isPerformerLobby ? (
          <div data-performer-lobby-group-view="true" data-lounge-avatars="false" style={{ position: 'relative', marginTop: 4 }}>
            <PerformerVideoPresenceFloor
              roomId={roomId}
              localUserId={userId}
              lobbyMode="SOCIAL"
              members={audience
                .filter((m) => m.role !== "bot")
                .slice(0, 16)
                .map((m) => ({ userId: m.userId, displayName: m.displayName }))}
            />
          </div>
        ) : isLoungeSideRoom ? (
          <div data-lounge-group-view="true" data-lounge-avatars="false" style={{ position: 'relative', marginTop: 4 }}>
            <LoungeVideoPresenceFloor
              roomId={roomId}
              localUserId={userId}
              members={audience
                .filter((m) => m.role !== "bot")
                .slice(0, 16)
                .map((m) => ({ userId: m.userId, displayName: m.displayName, chassis: "tv" as const }))}
            />
          </div>
        ) : (
        <div style={{ position: 'relative', marginTop: 4 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', margin: '8px 0 6px', fontWeight: 800, textAlign: 'center' }}>
            {isPreview
              ? `VENUE TEST · TEST: ${watchingCount.toLocaleString()} / ${(previewCapacity ?? 1000).toLocaleString()} OCCUPANCY · same runtime as GO LIVE`
              : mode === 'audience' && mySeatId
              ? `YOUR SEAT: ${mySeatId.toUpperCase()} · ${audience.filter((m) => m.seatId).length} seated`
              : mode === 'performer' && instantEmptyStage
                ? `LIVE VENUE · ${watchingCount} watching · empty seats until real fans arrive`
                : mode === 'performer'
                  ? `LIVE VENUE · ${snapshot?.present ?? 0} fans · ${Math.round(stadiumFillRatio * 100)}% full`
                  : `LIVE VENUE · ${snapshot?.present ?? 0} in seats`}
          </div>
          <AudienceScene
            view={mode === 'performer' ? 'performer' : 'fan'}
            venue={venueIndex}
            watcherCount={watchingCount}
            entities={audienceEntities}
            occupancyRatio={occupancyForScene}
            onReaction={sendReaction}
            hideControls
            accentColor={mode === 'performer' ? '#FFD700' : '#00FFFF'}
            bobbleheadSeating={bobbleheadSeating}
          />
          {/* Comic speech bubbles over the crowd */}
          <RoomBubbleRail bubbles={[...speechBubbles, ...whisperBubbles]} variant="comic" maxVisible={14} />
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
        )}

        {revealActive && <SponsorBubbleOverlay sponsors={SHOWTIME_SPONSORS} orbitRadius={120} />}
      </div>

      {/* Debug Overlay — Engineering validation (G-1B.2 Checkpoint 1) */}
      <AttentionDebugOverlay
        roomId={roomId}
        avatarIds={audienceEntities.map((e) => e.id)}
        performerId={liveSession?.userId}
        enabled={process.env.NODE_ENV === "development" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugRuntime") === "1"}
        contained
      />

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
      {joined && !isVideoPanelRoom && <AvatarActionWheel entityId={userId} roomId={roomId} />}

      {/* Prop Loader — shows equipped prop above the ActionWheel; returns null if no certified prop */}
      {joined && !isVideoPanelRoom && <PropLoader entityId={userId} audienceCount={snapshot?.present ?? 0} />}

      {mode === 'audience' && joined && captureEnabled && (
        <div style={{ marginBottom: 12, border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,255,136,0.04)' }}>
          <div style={{ padding: '8px 10px', fontSize: 10, color: '#00FF88', fontWeight: 800, letterSpacing: '0.1em' }}>YOUR CAMERA PREVIEW (OPTIONAL)</div>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: '#000' }} />
          {(error || errorMsg) && <div style={{ padding: '6px 10px', color: '#FF7070', fontSize: 11 }}>{error ?? errorMsg}</div>}
        </div>
      )}

      {mode === 'performer' && (
        <>
          <VenueToolsShellHint roomId={roomId} compact />

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

      <VenueInRoomMessagingPanel
        members={audience.map((m) => ({ userId: m.userId, displayName: m.displayName }))}
        selfUserId={userId}
        roomLabel={roomId}
      />

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

      {isLoungeSideRoom && !hubVenueOnly ? (
        <VenueToolsPanelHost
          userId={userId}
          role={mode === "performer" ? "performer" : "fan"}
          defaultRoomId={roomId}
        />
      ) : null}
    </section>
  );
}
