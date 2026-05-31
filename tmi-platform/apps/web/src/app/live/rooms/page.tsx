'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';
import type { FrameStyle, SizePreset } from '@/components/media/TMIUniversalPlayer';

export const dynamic = 'force-dynamic';

// ── All live rooms on the billboard wall ──────────────────────────────────────
const ALL_ROOMS = [
  // Battles
  { id: 'battle-b1',        label: 'Wavetek vs Krypt',       type: 'BATTLE',    emoji: '⚔️',  color: '#FF2DAA', color2: '#AA2DFF', frame: 'neon'        as FrameStyle, size: 'card'    as SizePreset, viewers: 924,  slug: 'battle-b1',        country: 'US', rotate: -1 },
  { id: 'battle-b2',        label: 'Bar God vs Verse Knight', type: 'BATTLE',   emoji: '👑',  color: '#FFD700', color2: '#FF9500', frame: 'gold'        as FrameStyle, size: 'mini'    as SizePreset, viewers: 612,  slug: 'battle-b2',        country: 'JM', rotate:  2 },
  { id: 'battle-b3',        label: 'Overdrive vs FlowMaster', type: 'BATTLE',   emoji: '🔥',  color: '#00FFFF', color2: '#FF2DAA', frame: 'holographic' as FrameStyle, size: 'mini'    as SizePreset, viewers: 280,  slug: 'battle-b3',        country: 'NG', rotate: -2 },
  // Cyphers
  { id: 'cypher-monday',    label: 'Monday Cypher',           type: 'CYPHER',   emoji: '🎤',  color: '#00FFFF', color2: '#AA2DFF', frame: 'circuit'     as FrameStyle, size: 'card'    as SizePreset, viewers: 841,  slug: 'cypher-monday',    country: 'US', rotate:  1, colSpan: 2 },
  { id: 'cypher-gospel',    label: 'Gospel Cypher',           type: 'CYPHER',   emoji: '🙌',  color: '#FFD700', color2: '#FF9500', frame: 'stage'       as FrameStyle, size: 'mini'    as SizePreset, viewers: 440,  slug: 'cypher-gospel',    country: 'GH', rotate: -1 },
  { id: 'cypher-freestyle', label: 'Open Freestyle',          type: 'CYPHER',   emoji: '🎙️', color: '#AA2DFF', color2: '#FF2DAA', frame: 'neon'        as FrameStyle, size: 'mini'    as SizePreset, viewers: 198,  slug: 'cypher-freestyle', country: 'GB', rotate:  3 },
  // Concerts & Shows
  { id: 'world-concert',    label: 'World Concert',           type: 'CONCERT',  emoji: '🌐',  color: '#FFD700', color2: '#00FF88', frame: 'gold'        as FrameStyle, size: 'card'    as SizePreset, viewers: 3400, slug: 'world-concert',    country: 'US', rotate: -2, colSpan: 2, scanLines: true },
  { id: 'monthly-idol',     label: 'Monthly Idol',            type: 'GAME SHOW',emoji: '👑',  color: '#FF2DAA', color2: '#FFD700', frame: 'holographic' as FrameStyle, size: 'card'    as SizePreset, viewers: 2100, slug: 'monthly-idol',     country: 'US', rotate:  1 },
  { id: 'live-concert',     label: 'Nova Cipher LIVE',        type: 'CONCERT',  emoji: '🎸',  color: '#00FF88', color2: '#00FFFF', frame: 'circuit'     as FrameStyle, size: 'mini'    as SizePreset, viewers: 1204, slug: 'live-concert',     country: 'US', rotate: -1 },
  // Sessions
  { id: 'producer-lab',     label: 'Beat Lab Session',        type: 'SESSION',  emoji: '🎛️', color: '#AA2DFF', color2: '#00FFFF', frame: 'glass'       as FrameStyle, size: 'mini'    as SizePreset, viewers: 184,  slug: 'producer-lab',     country: 'DE', rotate:  2 },
  { id: 'vip-lounge',       label: 'VIP Lounge',              type: 'VIP',      emoji: '💎',  color: '#FFD700', color2: '#FF9500', frame: 'gold'        as FrameStyle, size: 'mini'    as SizePreset, viewers: 67,   slug: 'vip-lounge',       country: 'AE', rotate: -3 },
  { id: 'world-dance-party',label: 'World Dance Party',       type: 'DANCE',    emoji: '💃',  color: '#FF2DAA', color2: '#AA2DFF', frame: 'neon'        as FrameStyle, size: 'portrait'as SizePreset, viewers: 888,  slug: 'world-dance-party',country: 'TT', rotate:  1 },
  // Open rooms
  { id: 'radio-station',    label: 'TMI Radio',               type: 'RADIO',    emoji: '📡',  color: '#00FFFF', color2: '#00FF88', frame: 'stage'       as FrameStyle, size: 'mini'    as SizePreset, viewers: 312,  slug: 'radio-station',    country: 'CA', rotate: -2 },
  { id: 'interview-booth',  label: 'Artist Interview',        type: 'INTERVIEW',emoji: '🎙️', color: '#00FF88', color2: '#00FFFF', frame: 'glass'       as FrameStyle, size: 'mini'    as SizePreset, viewers: 88,   slug: 'interview-booth',  country: 'BR', rotate:  2 },
  { id: 'fan-meetup',       label: 'Fan Meet & Greet',        type: 'MEETUP',   emoji: '🤝',  color: '#FF6B35', color2: '#FFD700', frame: 'circuit'     as FrameStyle, size: 'mini'    as SizePreset, viewers: 155,  slug: 'fan-meetup',       country: 'AU', rotate: -1 },
  { id: 'backstage',        label: 'Backstage Pass',          type: 'BACKSTAGE',emoji: '🎪',  color: '#AA2DFF', color2: '#FF2DAA', frame: 'holographic' as FrameStyle, size: 'mini'    as SizePreset, viewers: 44,   slug: 'backstage',        country: 'KR', rotate:  3 },
];

const FILTERS = ['ALL', 'BATTLE', 'CYPHER', 'CONCERT', 'GAME SHOW', 'SESSION', 'DANCE', 'VIP'] as const;
type Filter = typeof FILTERS[number];

function roomHref(slug: string) {
  return `/rooms/${slug}?autoSeat=1`;
}

export default function BillboardLobbyWallPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [justJoined, setJustJoined] = useState<number | null>(null);
  const [viewerCounts, setViewerCounts] = useState<number[]>(() => ALL_ROOMS.map(r => r.viewers));
  const [searchQuery, setSearchQuery] = useState('');

  // Tick viewer counts every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setViewerCounts(prev => prev.map((v) => Math.max(5, v + Math.floor((Math.random() - 0.38) * 22))));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Flash "JUST JOINED" every 8s on a random slot
  useEffect(() => {
    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * ALL_ROOMS.length);
      setJustJoined(idx);
      setTimeout(() => setJustJoined(null), 2400);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const handleJoin = useCallback((slug: string, idx: number) => {
    setJustJoined(idx);
    setTimeout(() => router.push(roomHref(slug)), 300);
  }, [router]);

  const visible = ALL_ROOMS.filter((r, i) => {
    const matchesFilter = filter === 'ALL' || r.type === filter;
    const matchesSearch = !searchQuery || r.label.toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalLive = viewerCounts.reduce((s, v) => s + v, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes tmiLobbyBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes tmiLobbyPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.97)} }
      `}</style>

      {/* Sticky top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,5,16,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: '#00FFFF', textDecoration: 'none', letterSpacing: '0.14em', flexShrink: 0 }}>TMI</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2020', display: 'inline-block', animation: 'tmiLobbyBlink 1s step-end infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>LIVE BILLBOARD</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>· {totalLive.toLocaleString()} watching</span>
        </div>
        {/* Search */}
        <input
          type="search"
          placeholder="Search rooms…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 140, maxWidth: 280, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}
        />
        <Link href="/live/go" style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', color: '#fff', fontSize: 10, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          🔴 GO LIVE
        </Link>
      </nav>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px' }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTERS.map(f => {
            const count = f === 'ALL' ? ALL_ROOMS.length : ALL_ROOMS.filter(r => r.type === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 9, fontWeight: 900, cursor: 'pointer', border: 'none', letterSpacing: '0.08em', transition: 'all 0.15s', background: filter === f ? 'rgba(0,255,255,0.18)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#00FFFF' : 'rgba(255,255,255,0.45)', outline: filter === f ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                {f} <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Billboard grid — scrollable, masonry-style */}
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No rooms match "{searchQuery}"</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10,
            alignItems: 'start',
          }}>
            {visible.map((room, i) => {
              const origIdx = ALL_ROOMS.indexOf(room);
              const count = viewerCounts[origIdx] ?? room.viewers;
              const isHovered = hoverIdx === i;
              const isJoined = justJoined === origIdx;

              return (
                <div
                  key={room.id}
                  style={{
                    gridColumn: (room as any).colSpan ? `span ${(room as any).colSpan}` : undefined,
                    transform: `rotate(${room.rotate}deg)`,
                    transition: 'transform 0.25s ease, box-shadow 0.2s ease',
                    borderRadius: 10,
                    outline: isHovered || isJoined ? `2px solid ${room.color}` : 'none',
                    boxShadow: isHovered ? `0 0 22px ${room.color}55` : isJoined ? `0 0 30px ${room.color}77` : 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => handleJoin(room.slug, origIdx)}
                >
                  {/* Live video panel */}
                  <TMIUniversalPlayer
                    mode="avatar"
                    avatarEmoji={room.emoji}
                    avatarName={room.label}
                    frameStyle={room.frame}
                    frameColor={room.color}
                    frameColor2={room.color2}
                    size={room.size}
                    title={isJoined ? '✦ JOINING…' : room.label}
                    subtitle={`${count.toLocaleString()} watching`}
                    scanLines={(room as any).scanLines}
                    countryCode={room.country}
                    showBadge
                    controls={false}
                    privacy="public"
                    autoplay
                    muted
                  />

                  {/* JOIN hover overlay */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 10,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: '10px 10px 12px', pointerEvents: 'none', zIndex: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2020', display: 'inline-block', animation: 'tmiLobbyBlink 1s step-end infinite', flexShrink: 0 }} />
                        <span style={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: '0.14em' }}>LIVE</span>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>{count.toLocaleString()} watching</span>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 5, lineHeight: 1.2 }}>{room.label}</div>
                      <div style={{ padding: '5px 0', borderRadius: 6, background: `${room.color}CC`, color: '#000', fontSize: 9, fontWeight: 900, textAlign: 'center', letterSpacing: '0.1em', boxShadow: `0 0 10px ${room.color}77` }}>
                        ▶ JOIN + SIT
                      </div>
                    </div>
                  )}

                  {/* Room type badge */}
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,0.75)', border: `1px solid ${room.color}44`,
                    borderRadius: 4, padding: '2px 6px',
                    fontSize: 7, fontWeight: 900, color: room.color, letterSpacing: '0.1em',
                    backdropFilter: 'blur(4px)', zIndex: 5, pointerEvents: 'none',
                  }}>
                    {room.type}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'ROOMS LIVE', value: ALL_ROOMS.length.toString(), color: '#00FFFF' },
            { label: 'TOTAL WATCHING', value: totalLive.toLocaleString(), color: '#FF2DAA' },
            { label: 'BATTLES ACTIVE', value: ALL_ROOMS.filter(r => r.type === 'BATTLE').length.toString(), color: '#FFD700' },
            { label: 'CYPHERS OPEN', value: ALL_ROOMS.filter(r => r.type === 'CYPHER').length.toString(), color: '#AA2DFF' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Nav links */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { href: '/battles', label: '⚔️ BATTLES', color: '#FF2DAA' },
            { href: '/cypher', label: '🎤 CYPHERS', color: '#00FFFF' },
            { href: '/rooms/world-concert', label: '🌐 WORLD CONCERT', color: '#FFD700' },
            { href: '/rooms/world-dance-party', label: '💃 DANCE PARTY', color: '#AA2DFF' },
            { href: '/rooms/monthly-idol', label: '👑 MONTHLY IDOL', color: '#00FF88' },
            { href: '/live/go', label: '🔴 GO LIVE', color: '#FF6B35' },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 9, fontWeight: 800, color: n.color, border: `1px solid ${n.color}30`, textDecoration: 'none', background: `${n.color}08`, letterSpacing: '0.08em' }}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
