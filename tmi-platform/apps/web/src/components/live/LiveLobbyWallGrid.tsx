'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AdRailSlot from '@/components/ads/AdRailSlot';

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
  type: 'battle' | 'cypher' | 'mini-cypher' | 'challenge' | 'game' | 'live';
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

// ─── Single Brady-Bunch cell ──────────────────────────────────────────────────

function LobbyCell({ room, colorIndex, onJoin }: { room: LobbyRoom; colorIndex: number; onJoin: (room: LobbyRoom) => void }) {
  const bg = roomColor(colorIndex);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 1800 + colorIndex * 130);
    return () => clearInterval(t);
  }, [colorIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: colorIndex * 0.04 }}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      onClick={() => onJoin(room)}
      style={{
        position: 'relative',
        borderRadius: 12,
        aspectRatio: '4/3',
        background: `radial-gradient(circle at 35% 35%, ${bg}cc, ${bg}55 60%, #050510)`,
        border: `1px solid rgba(255,255,255,0.1)`,
        boxShadow: pulse && room.status === 'live'
          ? `0 4px 35px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)`
          : `0 2px 12px rgba(0,0,0,0.4)`,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Live status dot */}
      {room.status === 'live' && (
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

      {/* WebRTC-style video placeholder — colored gradient with scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${bg}44 0%, transparent 50%, rgba(0,0,0,0.4) 100%)`,
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Glass reflection */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none',
        zIndex: 4,
      }} />

      {/* Performer initials avatar */}
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

      {/* Type badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        fontSize: 8, fontWeight: 800, letterSpacing: '0.15em',
        color: '#000', background: bg,
        padding: '2px 6px', borderRadius: 3, zIndex: 3,
      }}>
        {room.type.toUpperCase()}
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
        padding: '16px 8px 8px',
        zIndex: 3,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>
          {room.performerName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#00FF88' }}>👁 {room.viewerCount.toLocaleString()}</span>
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
  const liveRooms = rooms.filter((r) => r.status !== 'ended');

  // Rotate color assignments every 30 seconds so rooms periodically change shade
  useEffect(() => {
    const t = setInterval(() => setColorOffset((p) => (p + 1) % CRAYON_PALETTE.length), 30000);
    return () => clearInterval(t);
  }, []);

  const joinRoom = useCallback((room: LobbyRoom) => {
    router.push(room.href);
  }, [router]);

  const joinRandom = useCallback(() => {
    if (liveRooms.length === 0) return;
    const pick = liveRooms[Math.floor(Math.random() * liveRooms.length)];
    router.push(pick.href);
  }, [liveRooms, router]);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.8) 100%)', backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(255,255,255,0.1)`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: accentColor, fontWeight: 800 }}>{typeLabel} · LOBBY WALL</div>
          <h1 style={{ margin: 0, fontSize: 20, color: '#fff' }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#00FF88' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
            {' '}{liveRooms.length} LIVE
          </span>
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

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ marginBottom: 24, width: '100%' }}>
          <AdRailSlot
            slotId="lobby-wall-featured"
            hasSponsor={false}
          />
        </div>
        {liveRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>No live rooms right now</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Check back soon — sessions launch all day</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            <AnimatePresence>
              {liveRooms.map((room, idx) => (
                <LobbyCell
                  key={room.id}
                  room={room}
                  colorIndex={(idx + colorOffset) % CRAYON_PALETTE.length}
                  onJoin={joinRoom}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
