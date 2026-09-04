'use client';
import { useState, useEffect, useCallback, useRef, type ReactNode, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdRailSlot from '@/components/ads/AdRailSlot';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import LobbyPreviewWindow from '@/components/lobby/LobbyPreviewWindow';
import {
  buildLobbyPreviewTile,
  setLobbyAudioFocus,
  subscribePreviewVisibility,
  unsubscribePreview,
  swipeLobbyPreviewFocus,
  type LobbyPreviewTileState,
} from '@/lib/lobby/LobbyPreviewRuntime';
import { useLobbyPreviewBind } from '@/lib/lobby/useLobbyPreviewBind';
import { resolveLobbyDestination, type LobbyWallKind } from '@/lib/lobby/DestinationResolver';
import { sanitizeWallHostLabel } from '@/lib/lobby/wallPublicIdentity';
import LobbyCategoryPillRow, { type LobbyCategoryPill } from '@/components/lobby/LobbyCategoryPillRow';
import { isoCountryToFlag } from '@/lib/discovery/LiveDiscoveryRecord';
import { styleVsCallout, type PerformerStyleSlot } from '@/lib/competition/PerformerStyleSlots';
import {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  useAdaptiveWorldRuntime,
} from '@/lib/adaptiveWorldRuntime';

// ─── Crayon-box palette — every room gets a unique vivid color ────────────────

const CRAYON_PALETTE = [
  '#FF3B5C', '#FF6B35', '#FFD700', '#00FF88', '#00FFFF',
  '#AA2DFF', '#FF2DAA', '#FF8C00', '#00CC44', '#0099FF',
  '#FF1493', '#7B2D8B', '#FF4500', '#32CD32', '#1E90FF',
  '#FF69B4', '#9400D3', '#00CED1', '#FF6347', '#ADFF2F',
  '#FF007F', '#00FA9A', '#4169E1', '#FF4081', '#76FF03',
  '#E040FB', '#40C4FF', '#FFAB00', '#69F0AE', '#FF6E40',
];

function roomColor(index: number): string {
  return CRAYON_PALETTE[index % CRAYON_PALETTE.length];
}

function mosaicGenreLabel(room: LobbyRoom): string {
  const raw = (room.genre ?? room.type.replace(/-/g, ' ')).trim();
  return raw.length > 0 ? raw : 'Live';
}

function mosaicCastOverlay(room: LobbyRoom): string {
  if (room.overlayLine?.trim()) return room.overlayLine.trim();
  const genre = mosaicGenreLabel(room);
  const kind =
    room.type === 'cypher' || room.type === 'mini-cypher'
      ? 'Cypher'
      : room.type === 'battle'
        ? 'Battle'
        : room.type === 'challenge'
          ? 'Challenge'
          : room.type === 'gauntlet'
            ? 'Gauntlet'
            : room.type.replace(/-/g, ' ');
  if (room.status === 'recruiting') {
    return room.type === 'cypher' || room.type === 'mini-cypher'
      ? `LOOKING FOR PERFORMERS · ${genre} Cypher`
      : `LOOKING FOR PERFORMERS · ${genre} ${kind}`;
  }
  if (room.status === 'starting') return `STARTING SOON · ${genre} ${kind}`;
  if (room.type === 'cypher' || room.type === 'mini-cypher') return `LIVE · ${genre} Cypher`;
  return `LIVE · ${genre} ${kind}`;
}

function mosaicFlag(room: LobbyRoom): string {
  return isoCountryToFlag(room.countryCode ?? 'ZZ');
}

function stableColorForRoomId(roomId: string): string {
  let h = 0;
  for (let i = 0; i < roomId.length; i++) h = (h * 31 + roomId.charCodeAt(i)) >>> 0;
  return CRAYON_PALETTE[h % CRAYON_PALETTE.length];
}

/** Sticky mosaic geometry — assigned once per roomId so polling cannot thrash layout. */
type TileGeometry = {
  gridColumn: string;
  gridRow: string;
  aspectRatio: string;
};

const stickyTileGeometry = new Map<string, TileGeometry>();

function resolveStickyTileGeometry(room: LobbyRoom): TileGeometry {
  const existing = stickyTileGeometry.get(room.id);
  if (existing) return existing;

  const wide = room.type === 'concert' || room.type === 'game' || room.type === 'lounge';
  const tall = room.type === 'battle' || room.type === 'live' || room.type === 'cypher';

  let geom: TileGeometry;
  if (wide) {
    geom = { gridColumn: 'span 2', gridRow: 'span 1', aspectRatio: '21 / 9' };
  } else if (tall) {
    geom = { gridColumn: 'span 1', gridRow: 'span 2', aspectRatio: '3 / 4' };
  } else {
    geom = { gridColumn: 'span 1', gridRow: 'span 1', aspectRatio: '1 / 1' };
  }
  stickyTileGeometry.set(room.id, geom);
  return geom;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LobbyRoom = {
  id: string;
  name: string;
  performerName: string;
  type: 'battle' | 'cypher' | 'mini-cypher' | 'challenge' | 'game' | 'live' | 'gauntlet' | 'lounge' | 'performer-lobby' | 'dance' | 'concert';
  href: string;
  /** Kept for join/energy engines — never shown on mosaic tiles (Rule 20 + mosaic lock). */
  viewerCount: number;
  status: 'live' | 'starting' | 'ended' | 'recruiting';
  genre?: string;
  /** ISO 3166-1 alpha-2; ZZ / missing → unknown flag. */
  countryCode?: string;
  prizePool?: string;
  /** Optional discovery low-res preview URL (HTML video) — not a frozen LIVE photo. */
  previewUrl?: string | null;
  hostUserId?: string;
  /** Cast onto the tile itself (LIVE / LOOKING FOR). Never viewer counts. */
  overlayLine?: string;
  /** Recruiting 3-callout batch — join keeps all unless selectedCallout is set. */
  calloutSlots?: string[];
  selectedCallout?: string;
  /** Paid visibility boost — honest PROMOTED badge (Rule 20). */
  isBoosted?: boolean;
  boostExpiresAt?: number;
  boostKind?: 'lobby_wall' | 'wdp_submission';
};

type LiveLobbyWallGridProps = {
  rooms: LobbyRoom[];
  title: string;
  accentColor?: string;
  typeLabel?: string;
  /**
   * page = full lobby-wall route
   * embedded = full overlay wall
   * quick = compact Brady-Bunch quick-menu panel
   */
  variant?: "page" | "embedded" | "quick";
  /** Optional join override — must still resolve THAT room via DestinationResolver / InstantJoin */
  onRoomJoin?: (room: LobbyRoom) => void;
  /** Hover / audio focus / in-place preview promotion */
  onRoomFocus?: (room: LobbyRoom) => void;
  /**
   * Optional category pill row (additive). Omit entirely to preserve the
   * exact existing single-category page behavior — the 5 real dedicated
   * lobby-wall routes do not pass this and are unaffected by it existing.
   */
  categoryPills?: {
    items: LobbyCategoryPill[];
    activeId: string;
    onSelect: (id: string) => void;
    /** Horizontal swipe on mosaic → next/prev category tab (mobile). */
    onAdvance?: (direction: "next" | "prev") => void;
  };
  /**
   * When provided, replaces the room grid/empty-state section entirely —
   * used for non-room categories (e.g. Avatars/Playlists) that aren't
   * LobbyRoom-shaped data and shouldn't be forced through LobbyCell.
   */
  overrideContent?: ReactNode;
  /**
   * Phone free-roam: touch-drag pans the mosaic surface without restarting
   * WebRTC preview binds (loungeVideoPresenceLaw — skin ≠ stream restart).
   * Collision mesh not live-certified.
   */
  enableMobileRoam?: boolean;
};

function toWallKind(type: LobbyRoom['type']): LobbyWallKind {
  if (type === 'mini-cypher') return 'cypher';
  if (type === 'gauntlet') return 'gauntlet';
  if (type === 'lounge') return 'lounge';
  if (type === 'performer-lobby') return 'performer-lobby';
  if (type === 'dance') return 'dance';
  if (type === 'concert') return 'concert';
  if (type === 'battle' || type === 'cypher' || type === 'challenge' || type === 'game' || type === 'live') {
    return type;
  }
  return 'live';
}

// ─── Single mosaic cell — Browse (tap) promotes in-place monitor; Join is explicit ─

function LobbyCell({
  room,
  color,
  geometry,
  preview,
  selected,
  onSelect,
  onJoinMatchup,
  onPrewarm,
  onFocusAudio,
}: {
  room: LobbyRoom;
  color: string;
  geometry: TileGeometry;
  preview: LobbyPreviewTileState;
  selected: boolean;
  onSelect: (room: LobbyRoom) => void;
  onJoinMatchup?: (room: LobbyRoom, style: string) => void;
  onPrewarm: (room: LobbyRoom) => void;
  onFocusAudio: (roomId: string) => void;
}) {
  const bg = color;
  const cellRef = useRef<HTMLDivElement | null>(null);
  const isLive = room.status === 'live';
  const isRecruiting = room.status === 'recruiting';
  const previewLive = isLive && preview.isLive;
  const hostLabel = sanitizeWallHostLabel(room.performerName, {
    hostUserId: room.hostUserId,
  });
  const { mediaStream } = useLobbyPreviewBind(room.id, {
    subscribed: preview.subscribed || selected,
    focused: preview.focused || selected,
    isLive: previewLive,
    quality: selected ? 'medium' : preview.quality,
  });

  useEffect(() => {
    const el = cellRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      subscribePreviewVisibility(room.id, true);
      return () => unsubscribePreview(room.id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        subscribePreviewVisibility(room.id, Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribePreview(room.id);
    };
  }, [room.id]);

  return (
    <motion.div
      ref={cellRef}
      data-lobby-room-id={room.id}
      layout
      layoutId={`mosaic-tile-${room.id}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, layout: { duration: 0.35, ease: 'easeInOut' } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(room)}
      onMouseEnter={() => {
        onPrewarm(room);
        onFocusAudio(room.id);
      }}
      onTouchStart={() => {
        onPrewarm(room);
        onFocusAudio(room.id);
      }}
      style={{
        position: 'relative',
        gridColumn: geometry.gridColumn,
        gridRow: geometry.gridRow,
        aspectRatio: geometry.aspectRatio,
        borderRadius: 14,
        background: isLive
          ? `radial-gradient(circle at 35% 35%, ${bg}cc, ${bg}55 60%, #050510)`
          : `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), #050510 70%)`,
        border: selected ? `2px solid ${bg}` : `1px solid ${bg}88`,
        boxShadow: isLive
          ? `0 4px 28px rgba(0,0,0,0.55), 0 0 18px ${bg}33`
          : `0 2px 12px rgba(0,0,0,0.4)`,
        cursor: 'pointer',
        overflow: 'hidden',
        minHeight: 0,
        touchAction: 'manipulation',
      }}
    >
      {/* Canonical preview transport (WebRTC / URL video / composed motion) — never static LIVE photo */}
      <LobbyPreviewWindow
        roomId={room.id}
        preview={{ ...preview, focused: selected || preview.focused }}
        accent={bg}
        performerInitial={hostLabel}
        mediaStream={mediaStream}
        previewUrl={room.previewUrl}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.88))',
        pointerEvents: 'none',
        zIndex: 4,
      }} />

      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: 6, zIndex: 5, pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', maxWidth: '72%' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 8, fontWeight: 900, letterSpacing: '0.06em',
            color: '#fff',
            background: isLive ? 'rgba(230,48,0,0.92)' : isRecruiting ? 'rgba(255,215,0,0.88)' : 'rgba(0,0,0,0.55)',
            padding: '3px 7px', borderRadius: 999,
            lineHeight: 1.25,
          }}>
            {isLive ? (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
            ) : null}
            {mosaicCastOverlay(room)}
          </span>
          {isRecruiting && (room.calloutSlots?.length ?? 0) > 1 ? (
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 3, pointerEvents: 'auto' }}>
              {room.calloutSlots!.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onJoinMatchup) onJoinMatchup(room, slot);
                    else onSelect({ ...room, selectedCallout: slot });
                  }}
                  style={{
                    fontSize: 7, fontWeight: 800, letterSpacing: '0.04em',
                    color: '#050510', background: '#FFD700',
                    border: 'none', borderRadius: 999, padding: '2px 6px', cursor: 'pointer',
                  }}
                >
                  {styleVsCallout(slot as PerformerStyleSlot)}
                </button>
              ))}
            </span>
          ) : null}
          <span
            title={room.countryCode && room.countryCode !== 'ZZ' ? room.countryCode : 'Country unknown'}
            style={{
              fontSize: 14, lineHeight: 1, padding: '1px 4px',
              background: 'rgba(0,0,0,0.55)', borderRadius: 6,
            }}
          >
            {mosaicFlag(room)}
          </span>
          {room.isBoosted ? (
            <span
              title="Paid visibility boost — not organic popularity"
              style={{
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: '0.1em',
                color: '#050510',
                background: 'linear-gradient(90deg, #FFD700, #FF2DAA)',
                padding: '2px 6px',
                borderRadius: 999,
              }}
            >
              PROMOTED
            </span>
          ) : null}
        </div>
        <span style={{
          fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
          color: '#000', background: bg,
          padding: '2px 6px', borderRadius: 4,
          maxWidth: '52%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {mosaicGenreLabel(room)}
        </span>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 8px 8px',
        zIndex: 5,
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>
          {room.name}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {hostLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {mediaStream && isLive && (
            <span style={{ fontSize: 8, color: '#00FFFF', fontWeight: 800 }}>PREVIEW LIVE</span>
          )}
          {!mediaStream && isLive && (
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>Connecting preview…</span>
          )}
          {isRecruiting && (
            <span style={{ fontSize: 8, color: '#FFD700', fontWeight: 800 }}>JOIN QUEUE</span>
          )}
          <span style={{ fontSize: 8, color: '#00E5FF', fontWeight: 800, marginLeft: 'auto' }}>
            {isRecruiting ? 'Join →' : 'Watch →'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main wall grid ───────────────────────────────────────────────────────────

export default function LiveLobbyWallGrid({
  rooms,
  title,
  accentColor = '#00FFFF',
  typeLabel = 'LIVE',
  variant = 'page',
  onRoomJoin,
  onRoomFocus,
  categoryPills,
  overrideContent,
  enableMobileRoam = false,
}: LiveLobbyWallGridProps) {
  const router = useRouter();
  useAdaptiveWorldRuntime(LIVE_LOBBY_WALL_CONTRACT_ID);
  const [activeFlowRoom, setActiveFlowRoom] = useState<UniversalRoom | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const [focusedRoomId, setFocusedRoomId] = useState<string | null>(null);
  const [promotedRoomId, setPromotedRoomId] = useState<string | null>(null);
  const [mosaicPan, setMosaicPan] = useState({ x: 0, y: 0 });
  const [roamDrag, setRoamDrag] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  // Public wall: only discoverable active/starting sessions — ended never stay as dead cards.
  const liveRooms = rooms.filter((r) => r.status === 'live' || r.status === 'starting' || r.status === 'recruiting');
  const embedded = variant === 'embedded' || variant === 'quick';
  const quick = variant === 'quick';
  const promotedIndex = promotedRoomId
    ? liveRooms.findIndex((r) => r.id === promotedRoomId)
    : -1;
  const promotedRoom = promotedIndex >= 0 ? liveRooms[promotedIndex] : null;
  const enterRoom = useCallback((room: LobbyRoom) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tmi_handoff_started_at', String(Date.now()));
      sessionStorage.setItem('tmi_handoff_room_id', room.id);
    }
    if (onRoomJoin) {
      onRoomJoin(room);
      return;
    }
    // Exact room only — DestinationResolver, never a random redirect
    const dest = resolveLobbyDestination({
      roomId: room.id,
      kind: toWallKind(room.type),
      href: room.href,
    });
    setActiveFlowRoom({
      id:          room.id,
      title:       room.name,
      hostName:    sanitizeWallHostLabel(room.performerName, { hostUserId: room.hostUserId }),
      genre:       room.genre,
      viewers:     room.viewerCount,
      seatsOpen:   undefined,
      status:      room.status === 'live' ? 'live' : room.status === 'starting' ? 'starting-soon' : room.status === 'recruiting' ? 'starting-soon' : 'upcoming',
      access:      'free',
      accentColor: roomColor(0),
      prizeLabel:  room.prizePool,
      roomRoute:   dest.href,
      venueIndex:  0,
    });
  }, [onRoomJoin]);

  /** Tap tile → in-place monitor promotion (Browse → Watch). Does not navigate. */
  const selectRoom = useCallback((room: LobbyRoom) => {
    setPromotedRoomId(room.id);
    setFocusedRoomId(room.id);
    setLobbyAudioFocus(room.id);
    setFocusTick((n) => n + 1);
    onRoomFocus?.(room);
  }, [onRoomFocus]);

  /** Explicit JOIN / ENTER → exact room via LobbyEntryFlow / DestinationResolver. */
  const joinRoom = useCallback((room: LobbyRoom) => {
    setFocusedRoomId(room.id);
    setLobbyAudioFocus(room.id);
    setFocusTick((n) => n + 1);
    onRoomFocus?.(room);
    enterRoom(room);
  }, [enterRoom, onRoomFocus]);

  const promoteAdjacent = useCallback((direction: 'next' | 'prev') => {
    if (liveRooms.length === 0) return;
    const base = promotedIndex >= 0 ? promotedIndex : 0;
    const next =
      direction === 'next'
        ? (base + 1) % liveRooms.length
        : (base - 1 + liveRooms.length) % liveRooms.length;
    const room = liveRooms[next];
    if (room) selectRoom(room);
  }, [liveRooms, promotedIndex, selectRoom]);

  const prewarmRoom = useCallback((room: LobbyRoom) => {
    const dest = resolveLobbyDestination({
      roomId: room.id,
      kind: toWallKind(room.type),
      href: room.href,
    });
    router.prefetch(dest.href);
    void fetch(`/api/live/audience?venue=${encodeURIComponent(room.id)}`, { cache: 'no-store' }).catch(() => {});
  }, [router]);

  const onFocusAudio = useCallback((roomId: string) => {
    setFocusedRoomId(roomId);
    setLobbyAudioFocus(roomId);
    setFocusTick((n) => n + 1);
    const room = liveRooms.find((r) => r.id === roomId);
    if (room) onRoomFocus?.(room);
  }, [liveRooms, onRoomFocus]);

  const joinRandom = useCallback(() => {
    if (liveRooms.length === 0) return;
    const pick = liveRooms[Math.floor(Math.random() * liveRooms.length)];
    if (pick) joinRoom(pick);
  }, [liveRooms, joinRoom]);

  const onSwipe = useCallback((direction: 'next' | 'prev') => {
    const ids = liveRooms.map((r) => r.id);
    swipeLobbyPreviewFocus(ids, direction);
    setFocusTick((n) => n + 1);
  }, [liveRooms]);

  return (
    <div style={{
      minHeight: embedded ? undefined : '100vh',
      background: embedded ? 'transparent' : '#050510',
      color: '#fff',
      paddingBottom: embedded ? 0 : 80,
      height: embedded ? '100%' : undefined,
      display: embedded ? 'flex' : undefined,
      flexDirection: embedded ? 'column' : undefined,
      minWidth: 0,
    }}>
      {activeFlowRoom && !onRoomJoin && (
        <LobbyEntryFlow
          room={activeFlowRoom}
          instant
          onClose={() => setActiveFlowRoom(null)}
        />
      )}
      <div style={{
        position: embedded ? 'relative' : 'sticky',
        top: 0,
        zIndex: 20,
        flexShrink: 0,
        background: embedded
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.8) 100%)',
        backdropFilter: embedded ? undefined : 'blur(20px)',
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        boxShadow: embedded ? 'none' : '0 10px 30px rgba(0,0,0,0.5)',
        padding: quick ? '6px 2px 8px' : embedded ? '8px 4px 12px' : '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: accentColor, fontWeight: 800 }}>
            {typeLabel} · {quick ? 'QUICK WALL' : 'LOBBY WALL'}
          </div>
          <h1 style={{ margin: 0, fontSize: quick ? 13 : embedded ? 16 : 20, color: '#fff' }}>{title}</h1>
          {embedded && !onRoomJoin && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 700 }}>
              Tap a tile to watch in place · JOIN enters that exact room
            </div>
          )}
          {quick && onRoomJoin && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 700 }}>
              Swipe ← → categories · scroll ↕ tiles · tap to join
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#00FF88' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
            {' '}{liveRooms.filter((r) => r.status === 'live').length} LIVE
            {' · '}{liveRooms.filter((r) => r.status === 'recruiting').length} LOOKING
          </span>
          <button
            type="button"
            onClick={() => (promotedRoom ? promoteAdjacent('prev') : onSwipe('prev'))}
            style={{ padding: embedded ? '6px 8px' : '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            ← PREV
          </button>
          <button
            type="button"
            onClick={() => (promotedRoom ? promoteAdjacent('next') : onSwipe('next'))}
            style={{ padding: embedded ? '6px 8px' : '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            NEXT →
          </button>
          {!embedded && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={joinRandom}
                disabled={liveRooms.length === 0}
                style={{
                  padding: '10px 22px',
                  background: accentColor,
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: liveRooms.length > 0 ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.1em',
                }}
              >
                🎲 RANDOM JOIN
              </motion.button>
              <a href="/home/5" style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.07)', color: '#fff', borderRadius: 8, fontWeight: 800, fontSize: 11, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
                ← BACK
              </a>
            </>
          )}
        </div>
        {categoryPills && (
          <div style={{ width: '100%' }}>
            <LobbyCategoryPillRow
              items={categoryPills.items}
              activeId={categoryPills.activeId}
              onSelect={(id) => {
                setPromotedRoomId(null);
                categoryPills.onSelect(id);
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: embedded ? 'none' : 1280,
          margin: embedded ? 0 : '0 auto',
          padding: embedded ? '8px 4px 12px' : '28px 20px',
          flex: embedded ? 1 : undefined,
          minHeight: 0,
          overflowY: embedded ? 'auto' : undefined,
          overflowX: enableMobileRoam ? 'hidden' : undefined,
          touchAction: quick ? 'pan-y' : enableMobileRoam ? 'none' : undefined,
          WebkitOverflowScrolling: embedded ? 'touch' : undefined,
        }}
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          if (!t) return;
          setTouchStart({ x: t.clientX, y: t.clientY });
          (e.currentTarget as HTMLDivElement).dataset.swipeX = String(t.clientX);
          if (enableMobileRoam) {
            setRoamDrag({
              startX: t.clientX,
              startY: t.clientY,
              originX: mosaicPan.x,
              originY: mosaicPan.y,
            });
          }
        }}
        onTouchMove={(e) => {
          if (!enableMobileRoam || !roamDrag) return;
          const t = e.changedTouches[0];
          if (!t) return;
          setMosaicPan({
            x: roamDrag.originX + (t.clientX - roamDrag.startX),
            y: roamDrag.originY + (t.clientY - roamDrag.startY),
          });
        }}
        onTouchEnd={(e) => {
          const start = touchStart ?? { x: Number((e.currentTarget as HTMLDivElement).dataset.swipeX ?? 0), y: 0 };
          const endTouch = e.changedTouches[0];
          const endX = endTouch?.clientX ?? start.x;
          const endY = endTouch?.clientY ?? start.y;
          const dx = endX - start.x;
          const dy = endY - start.y;
          setTouchStart(null);
          if (enableMobileRoam) {
            setRoamDrag(null);
          }
          const horizontal = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48;
          if (horizontal && categoryPills?.onAdvance) {
            categoryPills.onAdvance(dx < 0 ? 'next' : 'prev');
            return;
          }
          if (enableMobileRoam && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) return;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
            if (promotedRoom) promoteAdjacent(dx < 0 ? 'next' : 'prev');
            else onSwipe(dx < 0 ? 'next' : 'prev');
          }
        }}
      >
        {!embedded && (
          <div style={{ marginBottom: 24, width: '100%' }}>
            <AdRailSlot
              slotId="lobby-wall-featured"
              hasSponsor={false}
            />
          </div>
        )}
        {overrideContent ? (
          overrideContent
        ) : liveRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: embedded ? '40px 0' : '80px 0', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: embedded ? 28 : 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 800, fontSize: embedded ? 14 : 16 }}>No active sessions in this lens</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Switch lenses or check back when creators are broadcasting</div>
          </div>
        ) : (
          <div
            data-live-lobby-wall-grid
            data-lobby-wall-mosaic-roam={enableMobileRoam ? 'true' : undefined}
            data-collision-certified="false"
            style={{
              display: 'grid',
              gridTemplateColumns: quick
                ? 'repeat(2, minmax(0, 1fr))'
                : embedded
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(auto-fill, minmax(140px, 1fr))',
              gridAutoRows: quick ? '110px' : embedded ? '120px' : '140px',
              gap: quick ? 8 : embedded ? 10 : 12,
              gridAutoFlow: 'dense',
              transform: enableMobileRoam
                ? `translate(${mosaicPan.x}px, ${mosaicPan.y}px)`
                : undefined,
              transition: roamDrag ? 'none' : 'transform 120ms ease-out',
              willChange: enableMobileRoam ? 'transform' : undefined,
            }}
          >
            <AnimatePresence>
              {liveRooms.map((room) => {
                const preview = buildLobbyPreviewTile({
                  roomId: room.id,
                  kind: toWallKind(room.type),
                  href: room.href,
                  isLive: room.status === 'live',
                  hasActivePerformer: room.status === 'live',
                  isGauntlet: room.type === 'gauntlet',
                });
                void focusTick;
                const geometry = resolveStickyTileGeometry(room);
                return (
                  <LobbyCell
                    key={room.id}
                    room={room}
                    color={stableColorForRoomId(room.id)}
                    geometry={geometry}
                    preview={{
                      ...preview,
                      focused: focusedRoomId === room.id || preview.focused,
                    }}
                    selected={promotedRoomId === room.id}
                    onSelect={onRoomJoin ? joinRoom : selectRoom}
                    onJoinMatchup={(r, style) => joinRoom({ ...r, selectedCallout: style })}
                    onPrewarm={prewarmRoom}
                    onFocusAudio={onFocusAudio}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* In-place Watch monitor — mosaic stays; JOIN is the only exact-room navigation */}
      <AnimatePresence>
        {promotedRoom && !onRoomJoin && (
          <InPlaceWatchMonitor
            room={promotedRoom}
            index={promotedIndex}
            total={liveRooms.length}
            accent={stableColorForRoomId(promotedRoom.id)}
            onMinimize={() => setPromotedRoomId(null)}
            onPrev={() => promoteAdjacent('prev')}
            onNext={() => promoteAdjacent('next')}
            onJoin={() => joinRoom(promotedRoom)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InPlaceWatchMonitor({
  room,
  index,
  total,
  accent,
  onMinimize,
  onPrev,
  onNext,
  onJoin,
}: {
  room: LobbyRoom;
  index: number;
  total: number;
  accent: string;
  onMinimize: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJoin: () => void;
}) {
  const isLive = room.status === 'live';
  const preview = buildLobbyPreviewTile({
    roomId: room.id,
    kind: toWallKind(room.type),
    href: room.href,
    isLive,
    hasActivePerformer: isLive,
    isGauntlet: room.type === 'gauntlet',
  });
  const hostLabel = sanitizeWallHostLabel(room.performerName, { hostUserId: room.hostUserId });
  const { mediaStream } = useLobbyPreviewBind(room.id, {
    subscribed: true,
    focused: true,
    isLive,
    quality: 'medium',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 16,
        zIndex: 80,
        maxWidth: 720,
        margin: '0 auto',
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${accent}66`,
        background: 'rgba(8,10,28,0.96)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.75)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isLive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E63000' }} />}
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: isLive ? '#FF6B6B' : room.status === 'recruiting' ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
            {mosaicCastOverlay(room)}
          </span>
          <span style={{ fontSize: 12 }} title={room.countryCode ?? 'ZZ'}>{mosaicFlag(room)}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
            {mosaicGenreLabel(room)} · ({Math.max(1, index + 1)} / {total})
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={onPrev} style={monitorChipStyle}>← Prev</button>
          <button type="button" onClick={onNext} style={monitorChipStyle}>Next →</button>
          <button type="button" onClick={onMinimize} style={{ ...monitorChipStyle, borderRadius: 999, width: 28, padding: 0 }} title="Minimize">✕</button>
        </div>
      </div>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#000', maxHeight: 320 }}>
        <LobbyPreviewWindow
          roomId={room.id}
          preview={{ ...preview, focused: true, muted: false }}
          accent={accent}
          performerInitial={hostLabel}
          mediaStream={mediaStream}
          previewUrl={room.previewUrl}
        />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {room.name}
          </div>
          <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 700 }}>
            {hostLabel}
            {room.genre ? ` · ${room.genre}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={onMinimize} style={monitorChipStyle}>Minimize</button>
          <button
            type="button"
            onClick={onJoin}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(90deg,#00FF88,#00E5FF)',
              color: '#000',
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            JOIN ROOM →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const monitorChipStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 10,
  fontWeight: 800,
  cursor: 'pointer',
};
