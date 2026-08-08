'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  useAdaptiveWorldRuntime,
  getGovernedIdleFallbackPolicy,
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type LobbyRoom = {
  id: string;
  name: string;
  performerName: string;
  type: 'battle' | 'cypher' | 'mini-cypher' | 'challenge' | 'game' | 'live' | 'gauntlet' | 'lounge' | 'dance' | 'concert';
  href: string;
  viewerCount: number;
  status: 'live' | 'starting' | 'ended';
  genre?: string;
  prizePool?: string;
  /** Optional discovery low-res preview URL (HTML video) — not a frozen LIVE photo. */
  previewUrl?: string | null;
  hostUserId?: string;
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
  /** Hover / audio focus only — tap always instant-joins */
  onRoomFocus?: (room: LobbyRoom) => void;
};

function toWallKind(type: LobbyRoom['type']): LobbyWallKind {
  if (type === 'mini-cypher') return 'cypher';
  if (type === 'gauntlet') return 'gauntlet';
  if (type === 'lounge') return 'lounge';
  if (type === 'dance') return 'dance';
  if (type === 'concert') return 'concert';
  if (type === 'battle' || type === 'cypher' || type === 'challenge' || type === 'game' || type === 'live') {
    return type;
  }
  return 'live';
}

// ─── Single Brady-Bunch cell — Continuous Live Lobby Wall Standard ───────────

function LobbyCell({
  room,
  colorIndex,
  preview,
  onJoin,
  onPrewarm,
  onFocusAudio,
}: {
  room: LobbyRoom;
  colorIndex: number;
  preview: LobbyPreviewTileState;
  onJoin: (room: LobbyRoom) => void;
  onPrewarm: (room: LobbyRoom) => void;
  onFocusAudio: (roomId: string) => void;
}) {
  const bg = roomColor(colorIndex);
  const cellRef = useRef<HTMLDivElement | null>(null);
  const isLive = room.status === 'live' && preview.isLive;
  const hostLabel = sanitizeWallHostLabel(room.performerName, {
    hostUserId: room.hostUserId,
  });
  const { mediaStream } = useLobbyPreviewBind(room.id, {
    subscribed: preview.subscribed,
    focused: preview.focused,
    isLive,
    quality: preview.quality,
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
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: colorIndex * 0.04 }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      onClick={() => onJoin(room)}
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
        borderRadius: 12,
        aspectRatio: '4/3',
        background: isLive
          ? `radial-gradient(circle at 35% 35%, ${bg}cc, ${bg}55 60%, #050510)`
          : `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), #050510 70%)`,
        border: preview.focused ? `1px solid ${bg}` : `1px solid rgba(255,255,255,0.1)`,
        boxShadow: isLive
          ? `0 4px 35px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)`
          : `0 2px 12px rgba(0,0,0,0.4)`,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {isLive && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: '#00FF88',
            boxShadow: '0 0 8px #00FF88',
            zIndex: 3,
          }}
        />
      )}

      {/* Same-room preview bind (Daily receive-only / URL / composed motion) */}
      <LobbyPreviewWindow
        roomId={room.id}
        preview={preview}
        accent={bg}
        performerInitial={hostLabel}
        mediaStream={mediaStream}
        previewUrl={room.previewUrl}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none',
        zIndex: 4,
      }} />

      <div style={{
        position: 'absolute', top: 8, left: 8,
        fontSize: 8, fontWeight: 800, letterSpacing: '0.15em',
        color: '#000', background: bg,
        padding: '2px 6px', borderRadius: 3, zIndex: 3,
      }}>
        {room.type.toUpperCase()}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
        padding: '16px 8px 8px',
        zIndex: 3,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>
          {hostLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: isLive ? '#00FF88' : 'rgba(255,255,255,0.4)' }}>
            {isLive
              ? (room.viewerCount > 0 ? `👁 ${room.viewerCount.toLocaleString()}` : 'No audience yet')
              : 'No live audience'}
          </span>
          <span style={{ fontSize: 9, color: preview.muted ? 'rgba(255,255,255,0.35)' : '#FFD700' }}>
            {preview.muted ? '🔇' : '🔊 FOCUS'}
          </span>
          {mediaStream && (
            <span style={{ fontSize: 9, color: '#00FFFF', fontWeight: 700 }}>PREVIEW LIVE</span>
          )}
          {room.prizePool && <span style={{ fontSize: 9, color: '#FFD700' }}>🏆 {room.prizePool}</span>}
          {room.genre && <span style={{ fontSize: 9, color: `${bg}`, fontWeight: 700 }}>{room.genre}</span>}
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
}: LiveLobbyWallGridProps) {
  const router = useRouter();
  useAdaptiveWorldRuntime(LIVE_LOBBY_WALL_CONTRACT_ID);
  const [colorOffset, setColorOffset] = useState(0);
  const [activeFlowRoom, setActiveFlowRoom] = useState<UniversalRoom | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const [focusedRoomId, setFocusedRoomId] = useState<string | null>(null);
  const liveRooms = rooms.filter((r) => r.status !== 'ended');
  const embedded = variant === 'embedded' || variant === 'quick';
  const quick = variant === 'quick';

  useEffect(() => {
    let timer = window.setInterval(
      () => setColorOffset((p) => (p + 1) % CRAYON_PALETTE.length),
      getGovernedIdleFallbackPolicy().rotationIntervalMs,
    );
    const resync = window.setInterval(() => {
      window.clearInterval(timer);
      timer = window.setInterval(
        () => setColorOffset((p) => (p + 1) % CRAYON_PALETTE.length),
        getGovernedIdleFallbackPolicy().rotationIntervalMs,
      );
    }, 15000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(resync);
    };
  }, []);

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
      status:      room.status === 'live' ? 'live' : room.status === 'starting' ? 'starting-soon' : 'upcoming',
      access:      'free',
      accentColor: roomColor(0),
      prizeLabel:  room.prizePool,
      roomRoute:   dest.href,
      venueIndex:  0,
    });
  }, [onRoomJoin]);

  /** Marcel: tile tap → INSTANT join that exact panel (Star Wars LobbyEntryFlow, no black screen). */
  const joinRoom = useCallback((room: LobbyRoom) => {
    setFocusedRoomId(room.id);
    setLobbyAudioFocus(room.id);
    setFocusTick((n) => n + 1);
    onRoomFocus?.(room);
    enterRoom(room);
  }, [enterRoom, onRoomFocus]);

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
          {embedded && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontWeight: 700 }}>
              Tap any live tile → instant join (Star Wars seat entry)
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#00FF88' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
            {' '}{liveRooms.filter((r) => r.status === 'live').length} LIVE
          </span>
          <button
            type="button"
            onClick={() => onSwipe('prev')}
            style={{ padding: embedded ? '6px 8px' : '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            ← FOCUS
          </button>
          <button
            type="button"
            onClick={() => onSwipe('next')}
            style={{ padding: embedded ? '6px 8px' : '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            FOCUS →
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
                🎲 RANDOM ROOM
              </motion.button>
              <a href="/home/5" style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.07)', color: '#fff', borderRadius: 8, fontWeight: 800, fontSize: 11, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
                ← BACK
              </a>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth: embedded ? 'none' : 1280,
          margin: embedded ? 0 : '0 auto',
          padding: embedded ? '8px 4px 12px' : '28px 20px',
          flex: embedded ? 1 : undefined,
          minHeight: 0,
          overflowY: embedded ? 'auto' : undefined,
        }}
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          if (t) (e.currentTarget as HTMLDivElement).dataset.swipeX = String(t.clientX);
        }}
        onTouchEnd={(e) => {
          const start = Number((e.currentTarget as HTMLDivElement).dataset.swipeX ?? 0);
          const end = e.changedTouches[0]?.clientX ?? start;
          const dx = end - start;
          if (Math.abs(dx) > 48) onSwipe(dx < 0 ? 'next' : 'prev');
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
        {liveRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: embedded ? '40px 0' : '80px 0', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: embedded ? 28 : 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 800, fontSize: embedded ? 14 : 16 }}>No active rooms</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Go live or check back when creators are broadcasting</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: quick
              ? 'repeat(auto-fill, minmax(120px, 1fr))'
              : embedded
                ? 'repeat(auto-fill, minmax(160px, 1fr))'
                : 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: quick ? 8 : embedded ? 10 : 12,
          }}>
            <AnimatePresence>
              {liveRooms.map((room, idx) => {
                const preview = buildLobbyPreviewTile({
                  roomId: room.id,
                  kind: toWallKind(room.type),
                  href: room.href,
                  isLive: room.status === 'live',
                  hasActivePerformer: room.status === 'live',
                  isGauntlet: room.type === 'gauntlet',
                });
                // focusTick forces re-read of audio focus after swipe/hover
                void focusTick;
                return (
                  <LobbyCell
                    key={room.id}
                    room={room}
                    colorIndex={(idx + colorOffset) % CRAYON_PALETTE.length}
                    preview={{
                      ...preview,
                      focused: focusedRoomId === room.id || preview.focused,
                    }}
                    onJoin={joinRoom}
                    onPrewarm={prewarmRoom}
                    onFocusAudio={onFocusAudio}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
