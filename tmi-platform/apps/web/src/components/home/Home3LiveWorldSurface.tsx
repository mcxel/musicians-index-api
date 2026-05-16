'use client';
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
import GlobalLiveBelt from './GlobalLiveBelt';
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';

export default function Home3LiveWorldSurface() {
  enforceRouteOwnership('/home/3');
  getVisualSlot('home-3-hero');

  const roomStack = [
    { href: '/live/rooms/monthly-idol', title: 'Main Lobby', occupancy: '84%', tickets: '120', color: '#00FFFF', glyph: '🏟️' },
    { href: '/live/rooms/cypher-arena', title: 'Cypher East', occupancy: '71%', tickets: '42', color: '#FF2DAA', glyph: '🎤' },
    { href: '/live/rooms/venue-room', title: 'Producer Lab', occupancy: '67%', tickets: '35', color: '#FFD700', glyph: '🎛️' },
  ] as const;

  const burstRooms = [
    { href: '/live/rooms/monday-night-stage', title: 'VIP Lounge', subtitle: 'Host interviews', color: '#AA2DFF', glyph: '🛋️' },
    { href: '/live/rooms/deal-or-feud', title: 'Battle Floor', subtitle: 'Crowd vote live', color: '#00FF88', glyph: '🥊' },
    { href: '/live/lobby', title: 'Event Timeline', subtitle: 'Premieres + lock times', color: '#FF6B35', glyph: '🗓️' },
  ] as const;

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 80% 20%, rgba(0,255,136,0.1), transparent 50%), #050510', color: '#fff', paddingBottom: 80 }}>
      <GlobalTopNavRail />
      <BreakingNewsTicker />
      <SponsorTickerRail />
      <Home3LiveDensityRail />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '34px 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
          LIVE WORLD ACTIVITY BELT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 12 }}>
          <div style={{ borderRadius: 12, border: '1px solid rgba(0,255,255,0.35)', background: 'linear-gradient(145deg, rgba(0,255,255,0.12), rgba(5,5,16,0.82))', padding: 12 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.16em', color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>ACTIVE ROOMS</div>
            {roomStack.map((room) => (
              <a key={room.href} href={room.href} style={{ textDecoration: 'none', color: '#fff', display: 'block', marginBottom: 8 }}>
                <div style={{ borderRadius: 10, border: `1px solid ${room.color}55`, background: `${room.color}14`, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{room.glyph} {room.title}</span>
                    <span style={{ fontSize: 8, color: room.color, letterSpacing: '0.14em', fontWeight: 800 }}>{room.occupancy}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>Ticket queue {room.tickets}</div>
                </div>
              </a>
            ))}
          </div>

          <a href="/live/rooms/monthly-idol" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.35)', background: 'linear-gradient(145deg, rgba(0,255,255,0.25), rgba(5,5,16,0.82))', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'inline-flex', fontSize: 8, letterSpacing: '0.14em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.45)', borderRadius: 4, padding: '3px 6px', width: 'fit-content' }}>JOIN ROOM RUNTIME</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.8vw,2.1rem)' }}>Enter Live Venue World</h1>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>Join room, interact, tip, and return to Home 3 in one continuous flow.</p>
              </div>
            </div>
          </a>

          <div style={{ borderRadius: 12, border: '1px solid rgba(255,45,170,0.35)', background: 'linear-gradient(145deg, rgba(255,45,170,0.12), rgba(5,5,16,0.82))', padding: 12 }}>
            <div style={{ fontSize: 8, letterSpacing: '0.16em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>BURST ROOMS</div>
            {burstRooms.map((room) => (
              <a key={room.href} href={room.href} style={{ textDecoration: 'none', color: '#fff', display: 'block', marginBottom: 8 }}>
                <div style={{ borderRadius: 10, border: `1px solid ${room.color}55`, background: `${room.color}14`, padding: '9px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{room.glyph} {room.title}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{room.subtitle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main preview lobby */}
      <Home3MainPreviewLobby />

      {/* Lobby wall grid */}
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

      {/* Host rail */}
      <Home3HostRail />

      {/* Global live belt */}
      <GlobalLiveBelt />
    </main>
  );
}
