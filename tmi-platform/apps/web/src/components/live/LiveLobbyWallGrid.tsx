'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdRailSlot from '@/components/ads/AdRailSlot';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import {
  buildLobbyPreviewTile,
  setLobbyAudioFocus,
  subscribePreviewVisibility,
  unsubscribePreview,
  swipeLobbyPreviewFocus,
  type LobbyPreviewTileState,
} from '@/lib/lobby/LobbyPreviewRuntime';
import { resolveLobbyDestination, type LobbyWallKind } from '@/lib/lobby/DestinationResolver';

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
};

type LiveLobbyWallGridProps = {
  rooms: LobbyRoom[];
  title: string;
  accentColor?: string;
  typeLabel?: string;
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

      {/* Preview surface: live motion OR honest ready animation — never fake humans / frozen LIVE photo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isLive
          ? `linear-gradient(160deg, ${bg}44 0%, transparent 50%, rgba(0,0,0,0.4) 100%)`
          : 'linear-gradient(160deg, rgba(0,255,255,0.08), transparent 55%, rgba(0,0,0,0.5))',
      }}>
        {isLive ? (
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(120deg, transparent 30%, ${bg}33 50%, transparent 70%)`,
              backgroundSize: '200% 200%',
              opacity: preview.quality === 'off' ? 0.2 : 0.85,
            }}
          />
        ) : (
          <motion.div
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 45%, rgba(0,255,255,0.12), transparent 60%)',
            }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          pointerEvents: 'none',
        }} />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none',
        zIndex: 4,
      }} />

      {!isLive && (
        <div style={{
          position: 'absolute',
          top: '42%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.45)',
          zIndex: 2,
          textAlign: 'center',
        }}>
          {preview.readyState === 'waiting' ? 'WAITING' : 'READY'}
          <div style={{ fontSize: 9, marginTop: 4, fontWeight: 600 }}>{preview.camera.label}</div>
        </div>
      )}

      {isLive && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 44, height: 44,
          borderRadius: '50%',
          background: `${bg}55`,
          border: `2px solid ${bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 900, color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          zIndex: 2,
        }}>
          {room.performerName.charAt(0).toUpperCase()}
        </div>
      )}

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
          {room.performerName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: isLive ? '#00FF88' : 'rgba(255,255,255,0.4)' }}>
            {isLive ? `👁 ${room.viewerCount.toLocaleString()}` : 'No live audience'}
          </span>
          <span style={{ fontSize: 9, color: preview.muted ? 'rgba(255,255,255,0.35)' : '#FFD700' }}>
            {preview.muted ? '🔇' : '🔊 FOCUS'}
          </span>
          {room.prizePool && <span style={{ fontSize: 9, color: '#FFD700' }}>🏆 {room.prizePool}</span>}
          {room.genre && <span style={{ fontSize: 9, color: `${bg}`, fontWeight: 700 }}>{room.genre}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main wall grid ───────────────────────────────────────────────────────────

export default function LiveLobbyWallGrid({ rooms, title, accentColor = '#00FFFF', typeLabel = 'LIVE' }: LiveLobbyWallGridProps) {
  const router = useRouter();
  const [colorOffset, setColorOffset] = useState(0);
  const [activeFlowRoom, setActiveFlowRoom] = useState<UniversalRoom | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const liveRooms = rooms.filter((r) => r.status !== 'ended');

  useEffect(() => {
    const t = setInterval(() => setColorOffset((p) => (p + 1) % CRAYON_PALETTE.length), 30000);
    return () => clearInterval(t);
  }, []);

  const joinRoom = useCallback((room: LobbyRoom) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tmi_handoff_started_at', String(Date.now()));
      sessionStorage.setItem('tmi_handoff_room_id', room.id);
    }
    const dest = resolveLobbyDestination({
      roomId: room.id,
      kind: toWallKind(room.type),
      href: room.href,
    });
    setActiveFlowRoom({
      id:          room.id,
      title:       room.name,
      hostName:    room.performerName,
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
  }, []);

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
    setLobbyAudioFocus(roomId);
    setFocusTick((n) => n + 1);
  }, []);

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
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      {activeFlowRoom && (
        <LobbyEntryFlow room={activeFlowRoom} onClose={() => setActiveFlowRoom(null)} />
      )}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.8) 100%)', backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(255,255,255,0.1)`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: accentColor, fontWeight: 800 }}>{typeLabel} · LOBBY WALL</div>
          <h1 style={{ margin: 0, fontSize: 20, color: '#fff' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#00FF88' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
            {' '}{liveRooms.filter((r) => r.status === 'live').length} LIVE
          </span>
          <button
            type="button"
            onClick={() => onSwipe('prev')}
            style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            ← FOCUS
          </button>
          <button
            type="button"
            onClick={() => onSwipe('next')}
            style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
          >
            FOCUS →
          </button>
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
        </div>
      </div>

      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}
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
        <div style={{ marginBottom: 24, width: '100%' }}>
          <AdRailSlot
            slotId="lobby-wall-featured"
            hasSponsor={false}
          />
        </div>
        {liveRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>No active rooms</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Go live or check back when creators are broadcasting</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
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
                    preview={preview}
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
