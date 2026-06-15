"use client";

import { useState } from 'react';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';
import Home3MainPreviewLobby from './Home3MainPreviewLobby';
import Home3LivewallGrid from './Home3LobbyWallGrid';
import Home3LiveEvents from './Home3LiveEvents';
import Home3JoinRail from './Home3JoinRail';
import Home3OccupancyRail from './Home3OccupancyRail';
import Home3EventCalendarStrip from './Home3EventCalendarStrip';
import Home3HostRail from './Home3HostRail';
import GlobalTopNavRail from './GlobalTopNavRail';
import BreakingNewsTicker from './BreakingNewsTicker';
import SponsorTickerRail from './SponsorTickerRail';
import Home3PremiereRail from './Home3PremiereRail';
import Home3LiveDensityRail from './Home3LiveDensityRail';
import Home3GameShowAudienceWall from './Home3GameShowAudienceWall';
import SubmissionPulseRail from './SubmissionPulseRail';
import GlobalLiveBelt from './GlobalLiveBelt';
import AudienceField from '@/components/live/AudienceField';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import WeeklyContestRail from './WeeklyContestRail';
import WinnerReplayWall from './WinnerReplayWall';
import LiveMagazineVoiceTicker from './LiveMagazineVoiceTicker';
import HomeLobbyVideoWall from './HomeLobbyVideoWall';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import LiveMediaWall from '@/components/media/LiveMediaWall';
import BroadcastDeckWall from '@/components/broadcast/BroadcastDeckWall';
import { HOME3_DECK_SEQUENCE } from '@/lib/broadcast/BroadcastRotationEngine';
import RoomContainer from '@/components/room/RoomContainer';
import ActionCanister from '@/components/room/ActionCanister';
import WidgetDrawer from '@/components/room/WidgetDrawer';
import NeonWaveUnderlay from '@/components/atmosphere/NeonWaveUnderlay';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';

const HOME3_ACTIONS = [
  { id: 'live-rooms',  icon: '🎭', label: 'Live Rooms'  },
  { id: 'messages',    icon: '💬', label: 'Messages'    },
  { id: 'bookings',    icon: '📅', label: 'Bookings'    },
  { id: 'revenue',     icon: '💰', label: 'Revenue'     },
  { id: 'friends',     icon: '👥', label: 'Friends'     },
];

export default function Home3LiveWorldSurface() {
  enforceRouteOwnership('/home/3');
  getVisualSlot('home-3-hero');

  const [pending, setPending] = useState<UniversalRoom | null>(null);

  function openRoom(id: string, title: string, color: string) {
    setPending({ id, title, viewers: 0, status: 'live', access: 'free', accentColor: color, roomRoute: `/live/rooms/${id}?from=lobby-wall`, venueIndex: 0, shape: 'hex' });
  }

  const roomStack = [
    { id: 'monthly-idol', title: 'Main Lobby',   occupancy: '84%', tickets: '120', color: '#00FFFF', glyph: '🏟️' },
    { id: 'cypher-arena', title: 'Cypher East',  occupancy: '71%', tickets: '42',  color: '#FF2DAA', glyph: '🎤' },
    { id: 'venue-room',   title: 'Producer Lab', occupancy: '67%', tickets: '35',  color: '#FFD700', glyph: '🎛️' },
  ];

  const burstRooms = [
    { id: 'monday-night-stage', href: '/live/rooms/vip-lounge',   title: 'VIP Lounge',     subtitle: 'Host interviews',      color: '#AA2DFF', glyph: '🛋️' },
    { id: 'deal-or-feud',       href: '/live/rooms/battle-floor', title: 'Battle Floor',   subtitle: 'Crowd vote live',       color: '#00FF88', glyph: '🥊' },
    { id: '',                   href: '/live/lobby', title: 'Event Timeline', subtitle: 'Premieres + lock times', color: '#FF6B35', glyph: '🗓️' },
  ];

  return (
    <RoomContainer roomId="home-3" title="Live World" accentColor="#00FF88" bpm={128}>
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 80% 20%, rgba(0,255,136,0.1), transparent 50%), #050510', color: '#fff', paddingBottom: 80, position: 'relative' }}>
      {pending && <LobbyEntryFlow room={pending} onClose={() => setPending(null)} />}
      <NeonWaveUnderlay colorA="#00FF88" colorB="#00FFFF" colorC="#AA2DFF" opacity={0.1} zIndex={0} />
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <LiveMagazineVoiceTicker pageId="home-3" accent="#00FFFF" />

      {/* ══ LIVE WORLD MASTHEAD — tmi_billboard_live_lobby_wall_system blueprint ══ */}
      <div style={{ background: 'linear-gradient(180deg,rgba(0,229,255,.12),rgba(0,255,136,.06),rgba(5,8,21,1))', borderBottom: '2px solid rgba(0,229,255,.3)', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-orbitron,"Orbitron",sans-serif)', fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 900, color: '#00E5FF', textShadow: '0 0 14px #00E5FF88', letterSpacing: '.05em', lineHeight: 1.1 }}>
              LIVE WORLD
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.12em', marginTop: 2 }}>
              WHAT SHOULD I WATCH? · THE NETWORK · THE BIGGEST PAGE
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(230,48,0,.15)', border: '1px solid rgba(230,48,0,.4)', borderRadius: 4, padding: '4px 10px', fontSize: 9, fontWeight: 800, color: '#E63000', letterSpacing: '.1em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E63000', animation: 'none', display: 'inline-block' }} />
              LIVE
            </div>
            <span style={{ color: '#E63000', fontSize: 11, fontWeight: 700 }}>21 rooms live now</span>
          </div>
        </div>
        {/* Broadcast mode tabs */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { label: '🌐 Global live', href: '/live/lobby', active: true },
            { label: '🎤 Hip-Hop takeover', href: '/live/lobby?genre=hip-hop' },
            { label: '🎮 Games network', href: '/games' },
            { label: '🎪 Concert mode', href: '/live/concert' },
            { label: '👑 Monthly Idol', href: '/events/monthly-idol' },
          ].map((m) => (
            <a key={m.label} href={m.href} style={{ padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${m.active ? '#00E5FF' : 'rgba(255,255,255,.15)'}`, fontSize: 10, cursor: 'pointer', background: m.active ? 'rgba(0,229,255,.15)' : 'transparent', color: m.active ? '#00E5FF' : 'rgba(255,255,255,.55)', whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: m.active ? 700 : 400 }}>
              {m.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── AD BREAK 1 — leaderboard after ticker ── */}
      <UnifiedAdSlot venue="home-3" slotKey="liveLobbyBanner" format="horizontal" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 90 }} accentColor="#00FF88" />

      <Home3LiveDensityRail />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 20px' }}>
        <SubmissionPulseRail accentColor="#00FFFF" title="JUST UPLOADED · LIVE WORLD" maxItems={4} />
      </section>

      {/* Game show audience wall — 6 shows, live audience view, emotes, prizes */}
      <Home3GameShowAudienceWall />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '34px 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
          LIVE WORLD ACTIVITY BELT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 12 }}>
          <div style={{ borderRadius: 12, border: '1px solid rgba(0,255,255,0.35)', background: 'linear-gradient(145deg, rgba(0,255,255,0.12), rgba(5,5,16,0.82))', padding: 12 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.16em', color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>ACTIVE ROOMS</div>
            {roomStack.map((room) => (
              <button key={room.id} onClick={() => openRoom(room.id, room.title, room.color)} style={{ textDecoration: 'none', color: '#fff', display: 'block', marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0 }}>
                <div style={{ borderRadius: 10, border: `1px solid ${room.color}55`, background: `${room.color}14`, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{room.glyph} {room.title}</span>
                    <span style={{ fontSize: 8, color: room.color, letterSpacing: '0.14em', fontWeight: 800 }}>{room.occupancy}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>Ticket queue {room.tickets}</div>
                </div>
              </button>
            ))}
          </div>

          <button onClick={() => openRoom('monthly-idol', 'Main Lobby', '#00FFFF')} style={{ textDecoration: 'none', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}>
            <div style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.35)', background: 'linear-gradient(145deg, rgba(0,255,255,0.25), rgba(5,5,16,0.82))', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'inline-flex', fontSize: 8, letterSpacing: '0.14em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.45)', borderRadius: 4, padding: '3px 6px', width: 'fit-content' }}>JOIN ROOM RUNTIME</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.8vw,2.1rem)' }}>Enter Live Venue World</h1>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>Join room, interact, tip, and return to Home 3 in one continuous flow.</p>
              </div>
            </div>
          </button>

          <div style={{ borderRadius: 12, border: '1px solid rgba(255,45,170,0.35)', background: 'linear-gradient(145deg, rgba(255,45,170,0.12), rgba(5,5,16,0.82))', padding: 12 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.16em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>BURST ROOMS</div>
            {burstRooms.map((room, i) => {
              const inner = (
                <div style={{ borderRadius: 10, border: `1px solid ${room.color}55`, background: `${room.color}14`, padding: '9px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{room.glyph} {room.title}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{room.subtitle}</div>
                </div>
              );
              return room.href ? (
                <a key={i} href={room.href} style={{ textDecoration: 'none', color: '#fff', display: 'block', marginBottom: 8 }}>{inner}</a>
              ) : (
                <button key={i} onClick={() => openRoom(room.id, room.title, room.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'block', marginBottom: 8, width: '100%', textAlign: 'left', padding: 0 }}>{inner}</button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <BroadcastDeckWall
          sequence={HOME3_DECK_SEQUENCE}
          title="LIVE WORLD"
          accentColor="#00FFFF"
          maxTiles={8}
          intervalMs={13000}
        />
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 12px' }}>
        <AudienceField />
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 24px' }}>
        <AvatarMiniPreview variant="mini" accentColor="#00FFFF" />
      </section>

      {/* Main preview lobby */}
      <Home3MainPreviewLobby />

      {/* Live world video wall */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <LiveMediaWall roomId="R-101" title="LIVE WORLD FEED — ALL ROOMS" mode="billboard" nodeCount={9} accentColor="#00FFFF" enterHref="/live/rooms" />
      </section>

      {/* Lobby wall grid */}
      <HomeLobbyVideoWall accentColor="#00FFFF" />
      <Home3LivewallGrid />

      {/* Live events */}
      <Home3LiveEvents />

      {/* Event calendar strip */}
      <Home3EventCalendarStrip />

      {/* Premiere rail */}
      <Home3PremiereRail />

      {/* Join rail */}
      <Home3JoinRail />

      {/* Room occupancy rail */}
      <Home3OccupancyRail />

      {/* ── AD BREAK 2 — mid-page rectangle ── */}
      <UnifiedAdSlot venue="home-3" slotKey="homepageMid" format="rectangle" label="ADVERTISEMENT" style={{ margin: '0 24px 8px', minHeight: 250 }} accentColor="#00FF88" />

      {/* Host rail */}
      <Home3HostRail />

      {/* Weekly contests + winner replays */}
      <WeeklyContestRail />
      <WinnerReplayWall />

      {/* Global live belt */}
      <GlobalLiveBelt />
      <ActionCanister actions={HOME3_ACTIONS} />
      <WidgetDrawer />
    </main>
    </RoomContainer>
  );
}
