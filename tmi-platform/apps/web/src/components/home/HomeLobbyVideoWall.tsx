'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';
import type { FrameStyle, SizePreset } from '@/components/media/TMIUniversalPlayer';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';

interface LobbySlot {
  avatarEmoji:  string;
  avatarName:   string;
  frameStyle:   FrameStyle;
  frameColor:   string;
  frameColor2:  string;
  size:         SizePreset;
  title?:       string;
  rotate:       number;
  viewers?:     number;
  scanLines?:   boolean;
  colSpan?:     number;
  rowSpan?:     number;
  youtubeId?:   string;
  src?:         string;
  roomId?:      string;
  countryCode?: string;
  isFan?:       boolean;
  sponsorCount?: number;
  sponsorRevCents?: number;
  performerSlug?: string;
}

const LOBBY_SLOTS: LobbySlot[] = [
  { avatarEmoji:'🎤', avatarName:'Astra Nova',   frameStyle:'neon',        frameColor:'#FF2DAA', frameColor2:'#AA2DFF', size:'card',    title:'R&B Stage — Live', rotate:-2, viewers:847,  colSpan:2, countryCode:'US', performerSlug:'astra-nova',  sponsorCount:6,  sponsorRevCents:42500  },
  { avatarEmoji:'🎧', avatarName:'Koda Rush',    frameStyle:'holographic', frameColor:'#00FFFF', frameColor2:'#FF2DAA', size:'mini',    title:'Beat Lab',         rotate:3,  viewers:312,  countryCode:'JM', performerSlug:'koda-rush',   sponsorCount:3,  sponsorRevCents:17500  },
  { avatarEmoji:'🕺', avatarName:'Fan #2841',    frameStyle:'glass',       frameColor:'#AA2DFF', frameColor2:'#00FFFF', size:'mini',                              rotate:-1, viewers:22,   countryCode:'GB', isFan:true },
  { avatarEmoji:'🎹', avatarName:'Velvet Sol',   frameStyle:'circuit',     frameColor:'#00FF88', frameColor2:'#00FFFF', size:'portrait',title:'Keys Session',     rotate:2,  viewers:134,  countryCode:'BR', performerSlug:'velvet-sol',  sponsorCount:2,  sponsorRevCents:7500   },
  { avatarEmoji:'🎸', avatarName:'Torque Sin',   frameStyle:'gold',        frameColor:'#FFD700', frameColor2:'#FF9500', size:'mini',    title:'Rock Arena',       rotate:-3, viewers:219,  countryCode:'GB', performerSlug:'torque-sin',  sponsorCount:4,  sponsorRevCents:22000  },
  { avatarEmoji:'💃', avatarName:'Fan #7703',    frameStyle:'neon',        frameColor:'#FF2DAA', frameColor2:'#FFD700', size:'mini',                              rotate:1,  viewers:18,   countryCode:'MX', isFan:true },
  { avatarEmoji:'🎺', avatarName:'Ivory Arc',    frameStyle:'stage',       frameColor:'#4488FF', frameColor2:'#FFD700', size:'card',    title:'Jazz Lounge',      rotate:-2, viewers:88,   colSpan:2, countryCode:'FR', performerSlug:'ivory-arc',   sponsorCount:1,  sponsorRevCents:5000   },
  { avatarEmoji:'🎤', avatarName:'Lagos Burst',  frameStyle:'holographic', frameColor:'#FF6B35', frameColor2:'#00C853', size:'mini',    title:'Afrobeat',         rotate:4,  viewers:563,  countryCode:'NG', performerSlug:'lagos-burst',  sponsorCount:7,  sponsorRevCents:63000  },
  { avatarEmoji:'🎛️', avatarName:'Prism Vex',   frameStyle:'circuit',     frameColor:'#FF2DAA', frameColor2:'#00FFFF', size:'mini',    title:'EDM Drop',         rotate:-2, viewers:701,  countryCode:'DE', performerSlug:'prism-vex',   sponsorCount:5,  sponsorRevCents:37500  },
  { avatarEmoji:'🎵', avatarName:'Fan #1190',    frameStyle:'glass',       frameColor:'#00FFFF', frameColor2:'#AA2DFF', size:'mini',                              rotate:3,  viewers:31,   countryCode:'CA', isFan:true },
  { avatarEmoji:'👑', avatarName:'Zion Freq',    frameStyle:'gold',        frameColor:'#FFD700', frameColor2:'#FF9500', size:'card',    title:'Gospel Crown',     rotate:-1, viewers:1204, colSpan:2, scanLines:true, countryCode:'US', performerSlug:'zion-freq',   sponsorCount:9,  sponsorRevCents:88500  },
  { avatarEmoji:'🥊', avatarName:'Fan #4455',    frameStyle:'neon',        frameColor:'#00FF88', frameColor2:'#00FFFF', size:'mini',    title:'Battle Floor',     rotate:2,  viewers:45,   countryCode:'ZA', isFan:true },
  { avatarEmoji:'🎶', avatarName:'Wave Echo',    frameStyle:'circuit',     frameColor:'#AA2DFF', frameColor2:'#FF2DAA', size:'mini',    title:'Late Night',       rotate:-3, viewers:67,   countryCode:'AU', performerSlug:'wave-echo',   sponsorCount:2,  sponsorRevCents:10000  },
  { avatarEmoji:'🔥', avatarName:'Cipher Bot',   frameStyle:'holographic', frameColor:'#FF6B35', frameColor2:'#FFD700', size:'mini',    title:'Freestyle',        rotate:2,  viewers:93,   countryCode:'TT', performerSlug:'cipher-bot',  sponsorCount:0,  sponsorRevCents:0      },
  { avatarEmoji:'🌐', avatarName:'Global Arc',   frameStyle:'neon',        frameColor:'#00FFFF', frameColor2:'#00FF88', size:'mini',    title:'World Stage',      rotate:-1, viewers:155,  countryCode:'GH', performerSlug:'global-arc',  sponsorCount:3,  sponsorRevCents:15000  },
  { avatarEmoji:'🎯', avatarName:'Fan #9002',    frameStyle:'glass',       frameColor:'#FF2DAA', frameColor2:'#AA2DFF', size:'mini',                              rotate:4,  viewers:12,   countryCode:'JP', isFan:true },
  { avatarEmoji:'💫', avatarName:'Neon Psalms',  frameStyle:'stage',       frameColor:'#00FF88', frameColor2:'#4488FF', size:'mini',    title:'Soul Session',     rotate:-2, viewers:204,  countryCode:'KR', performerSlug:'neon-psalms', sponsorCount:4,  sponsorRevCents:28000  },
  { avatarEmoji:'⚡', avatarName:'Grid Walk',    frameStyle:'circuit',     frameColor:'#FFD700', frameColor2:'#FF6B35', size:'mini',    title:'Cypher',           rotate:3,  viewers:78,   countryCode:'NG', performerSlug:'grid-walk',   sponsorCount:1,  sponsorRevCents:2500   },
];

// Prime-ish intervals — 12 tiles never sync up
const TILE_INTERVALS = [9500, 11300, 13100, 15200, 17000, 19300, 10700, 12500, 14100, 16700, 18400, 21200];

function roomHref(slot: LobbySlot): string {
  if (slot.roomId) return `/rooms/${slot.roomId}?autoSeat=1`;
  if (slot.performerSlug) return `/rooms/${slot.performerSlug}?autoSeat=1`;
  return '/live/rooms';
}

function IndependentLobbyTile({
  startIdx, intervalMs, viewerCounts, justJoined, onJoin,
}: {
  startIdx: number; intervalMs: number; viewerCounts: number[];
  justJoined: number | null; onJoin: (slot: LobbySlot) => void;
}) {
  const [slotIdx, setSlotIdx] = useState(startIdx % LOBBY_SLOTS.length);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSlotIdx(prev => (prev + 1) % LOBBY_SLOTS.length), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const slot = LOBBY_SLOTS[slotIdx]!;
  const count = viewerCounts[slotIdx] ?? 0;
  const isFlash = justJoined === slotIdx;

  return (
    <div
      style={{
        gridColumn: slot.colSpan ? `span ${slot.colSpan}` : undefined,
        gridRow: slot.rowSpan ? `span ${slot.rowSpan}` : undefined,
        transform: `rotate(${slot.rotate}deg)`,
        transition: 'transform 0.25s ease',
        outline: isFlash || hover ? `2px solid ${slot.frameColor}` : 'none',
        boxShadow: isFlash ? `0 0 24px ${slot.frameColor}88` : hover ? `0 0 18px ${slot.frameColor}66` : 'none',
        borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4,
        position: 'relative', cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onJoin(slot)}
    >
      {hover && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          zIndex: 10, display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '10px 10px 12px', pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020', display: 'inline-block', animation: 'tmiLobbyBlink 1s step-end infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>LIVE</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', marginLeft: 4 }}>{count.toLocaleString()} watching</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>{slot.avatarName}</div>
          <div style={{
            padding: '6px 0', borderRadius: 6, background: `${slot.frameColor}CC`,
            color: '#000', fontSize: 10, fontWeight: 900, textAlign: 'center',
            letterSpacing: '0.1em', boxShadow: `0 0 12px ${slot.frameColor}88`, pointerEvents: 'none',
          }}>▶ JOIN ROOM</div>
        </div>
      )}
      <TMIUniversalPlayer
        mode={slot.roomId ? 'webrtc' : slot.youtubeId ? 'youtube' : slot.src ? 'hls' : 'avatar'}
        roomId={slot.roomId} youtubeId={slot.youtubeId} src={slot.src}
        avatarEmoji={slot.avatarEmoji} avatarName={slot.avatarName}
        frameStyle={slot.frameStyle} frameColor={slot.frameColor} frameColor2={slot.frameColor2}
        size={slot.size} title={isFlash ? '✦ JUST JOINED' : slot.title}
        subtitle={count > 0 ? `${count.toLocaleString()} in room` : undefined}
        scanLines={slot.scanLines} countryCode={slot.countryCode}
        showBadge controls={false} privacy="public" autoplay muted
      />
      {!slot.isFan && slot.performerSlug !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap',
        }}>
          {slot.sponsorCount !== undefined && slot.sponsorCount > 0 ? (
            <>
              <span style={{ fontSize: 7, fontWeight: 800, color: '#FFD700', letterSpacing: '0.08em', flexShrink: 0 }}>{slot.sponsorCount} sponsors</span>
              <span style={{ width: 1, height: 8, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#00FF88', letterSpacing: '0.06em', flexShrink: 0 }}>${Math.round((slot.sponsorRevCents ?? 0) / 100).toLocaleString()}/mo</span>
              <Link href={`/hub/sponsor?target=performer&slug=${slot.performerSlug}`} style={{ marginLeft: 'auto', fontSize: 6, fontWeight: 900, letterSpacing: '0.1em', color: slot.frameColor, border: `1px solid ${slot.frameColor}55`, padding: '1px 6px', borderRadius: 4, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>Sponsor →</Link>
            </>
          ) : (
            <>
              <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', flex: 1 }}>No sponsors yet</span>
              <Link href={`/hub/sponsor?target=performer&slug=${slot.performerSlug}`} style={{ fontSize: 6, fontWeight: 900, letterSpacing: '0.1em', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', padding: '1px 6px', borderRadius: 4, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>Be First →</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomeLobbyVideoWall({ accentColor = '#00FFFF' }: { accentColor?: string }) {
  const [viewerCounts, setViewerCounts] = useState<number[]>(
    () => LOBBY_SLOTS.map(s => s.viewers ?? 0)
  );
  const [justJoined, setJustJoined] = useState<number | null>(null);
  const [pending, setPending] = useState<UniversalRoom | null>(null);

  const handleJoin = useCallback((slot: LobbySlot) => {
    const id = slot.roomId ?? slot.performerSlug ?? 'live-lobby';
    setPending({
      id,
      title: slot.avatarName,
      viewers: slot.viewers ?? 0,
      status: 'live',
      access: 'free',
      accentColor: slot.frameColor,
      roomRoute: roomHref(slot),
      venueIndex: 0,
      shape: 'hex',
    });
  }, []);

  // Viewer count simulation — ticks every 3.2s
  useEffect(() => {
    const id = setInterval(() => {
      setViewerCounts(prev => prev.map(v => {
        if (v === 0) return v;
        return Math.max(5, v + Math.floor((Math.random() - 0.4) * 18));
      }));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // "Just joined" flash — random slot every 9s
  useEffect(() => {
    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * LOBBY_SLOTS.length);
      setJustJoined(idx);
      setTimeout(() => setJustJoined(null), 2200);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{
      padding: '20px 12px 14px',
      position: 'relative',
      borderTop: `1px solid ${accentColor}22`,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 100%)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
    }}>
      {pending && <LobbyEntryFlow room={pending} onClose={() => setPending(null)} />}
      <style>{`@keyframes tmiLobbyBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Scanline underlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)',
        backgroundSize: '100% 4px',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, position: 'relative', zIndex: 2 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#FF2DAA',
          boxShadow: '0 0 8px #FF2DAA', display: 'inline-block',
          animation: 'tmiRingGlow 1.4s ease-in-out infinite',
        }} />
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.28em', color: '#FF2DAA' }}>
          LIVE NOW
        </span>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${accentColor}44,transparent)` }} />
        <Link href="/live/rooms" style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '0.15em',
          color: accentColor, border: `1px solid ${accentColor}44`,
          padding: '2px 10px', borderRadius: 20, textDecoration: 'none',
        }}>
          JOIN LOBBY →
        </Link>
      </div>

      {/* Independent tile grid — each position rotates on its own timer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
        position: 'relative',
        zIndex: 2,
      }}>
        {TILE_INTERVALS.map((ms, pos) => (
          <IndependentLobbyTile
            key={pos}
            startIdx={pos}
            intervalMs={ms}
            viewerCounts={viewerCounts}
            justJoined={justJoined}
            onJoin={handleJoin}
          />
        ))}
      </div>

      {/* Bottom CTA strip */}
      <div style={{
        marginTop: 12, textAlign: 'center', position: 'relative', zIndex: 2,
        display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <Link href="/live/rooms" style={{
          padding: '7px 20px', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
          background: `linear-gradient(135deg,#FF2DAA,#AA2DFF)`, color: '#fff',
          borderRadius: 20, textDecoration: 'none',
        }}>
          🔴 SEE EVERYONE LIVE
        </Link>
        <Link href="/signup" style={{
          padding: '7px 20px', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', borderRadius: 20, textDecoration: 'none',
        }}>
          ADD YOUR VIDEO →
        </Link>
      </div>
    </section>
  );
}
