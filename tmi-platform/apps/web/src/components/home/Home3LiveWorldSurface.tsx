"use client";

import { useState, useEffect } from 'react';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';
import { getPerformerById } from '@/lib/performers/PerformerRegistry';
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
import { enforceRouteOwnership } from '@/lib/routes/TmiVisualRouteMap';
import { getVisualSlot } from '@/lib/visuals/TmiVisualSlotRegistry';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import BroadcastDeckWall from '@/components/broadcast/BroadcastDeckWall';
import { getLiveVenues } from '@/lib/venues/VenueRegistry';
import { HOME3_DECK_SEQUENCE } from '@/lib/broadcast/BroadcastRotationEngine';
import RoomContainer from '@/components/room/RoomContainer';
import WidgetDrawer from '@/components/room/WidgetDrawer';
import NeonWaveUnderlay from '@/components/atmosphere/NeonWaveUnderlay';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';
import AudienceDirectorWindow from '@/components/live/AudienceDirectorWindow';

interface FeaturedPerformer {
  roomId: string;
  name: string;
  isLive: boolean;
  liveRoomRoute: string;
  introVideoUrl?: string;
  motionPosterUrl?: string;
  profileImageUrl?: string;
  audienceCount: number;
}

interface LiveApiSession {
  userId: string;
  displayName: string;
  roomId: string;
  viewerCount: number;
  avatarUrl: string | null;
}

export default function Home3LiveWorldSurface() {
  enforceRouteOwnership('/home/3');
  getVisualSlot('home-3-hero');

  const [pending, setPending] = useState<UniversalRoom | null>(null);
  const [featuredPerformer, setFeaturedPerformer] = useState<FeaturedPerformer | null>(null);
  // Rule 20: live room count comes from real session registry via API, never hardcoded
  const [liveRoomCount, setLiveRoomCount] = useState(0);

  // Real GlobalLiveSessionRegistry data via /api/live/go — not the static
  // PERFORMER_REGISTRY.isLive seed flag, which never reflects an actual broadcast.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        const sessions = data.sessions ?? [];
        if (!cancelled) setLiveRoomCount(sessions.length);
        const top = sessions[0];
        if (cancelled) return;
        if (!top) { setFeaturedPerformer(null); return; }
        const profile = getPerformerById(top.userId);
        setFeaturedPerformer({
          roomId: top.roomId,
          name: profile?.name ?? top.displayName,
          isLive: true,
          liveRoomRoute: profile?.liveRoomRoute ?? `/live/rooms/${top.roomId}`,
          introVideoUrl: profile?.introVideoUrl,
          motionPosterUrl: profile?.motionPosterUrl,
          profileImageUrl: profile?.profileImageUrl ?? top.avatarUrl ?? undefined,
          audienceCount: top.viewerCount,
        });
      } catch {
        if (!cancelled) setFeaturedPerformer(null);
      }
    };
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  function openRoom(id: string, title: string, color: string) {
    setPending({ id, title, viewers: 0, status: 'live', access: 'free', accentColor: color, roomRoute: `/live/rooms/${id}?from=lobby-wall`, venueIndex: 0, shape: 'hex' });
  }

  const liveVenues = getLiveVenues().slice(0, 3);
  const VENUE_GLYPHS: Record<string, string> = { Arena: '🏟️', Club: '🎤', Stadium: '🏆', Studio: '🎛️', Theater: '🎭', Lounge: '🛋️', Outdoor: '🌿', Virtual: '🌐' };
  const VENUE_COLORS = ['#00FFFF', '#FF2DAA', '#FFD700'];
  const BURST_COLORS = ['#AA2DFF', '#00FF88', '#FF6B35'];

  const roomStack = liveVenues.map((v, i) => ({
    id: v.roomId,
    title: v.name,
    occupancy: `${v.occupancyPct}%`,
    tickets: String(v.openTickets),
    color: VENUE_COLORS[i] ?? '#00FFFF',
    glyph: VENUE_GLYPHS[v.category] ?? '🎤',
  }));

  const burstRooms = liveVenues.map((v, i) => ({
    id: v.roomId,
    href: v.liveRoomRoute,
    title: v.name,
    subtitle: `${v.audienceCount.toLocaleString()} watching`,
    color: BURST_COLORS[i] ?? '#AA2DFF',
    glyph: VENUE_GLYPHS[v.category] ?? '🎤',
  }));

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
            <span style={{ color: '#E63000', fontSize: 11, fontWeight: 700 }}>{liveRoomCount === 0 ? 'No active rooms right now' : `${liveRoomCount} ${liveRoomCount === 1 ? 'room' : 'rooms'} live now`}</span>
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
        <div data-home3-activity-belt style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 12 }}>
          <style>{`
            @media (max-width: 767px) {
              [data-home3-activity-belt] {
                grid-template-columns: 1fr !important;
              }
            }
            @media (min-width: 768px) and (max-width: 1023px) {
              [data-home3-activity-belt] {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>
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

          <button
            onClick={() => featuredPerformer
              ? openRoom(featuredPerformer.roomId, featuredPerformer.name, '#00FFFF')
              : openRoom('monthly-idol', 'Main Lobby', '#00FFFF')}
            style={{ textDecoration: 'none', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
          >
            <div style={{ minHeight: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.35)', position: 'relative' }}>
              {/* Discovery surface — performer/host video first, never an audience grid (Audience Visibility Rule) */}
              <MotionPosterPlayer
                isLive={featuredPerformer?.isLive ?? false}
                liveRoomRoute={featuredPerformer?.liveRoomRoute}
                introVideoUrl={featuredPerformer?.introVideoUrl}
                motionPosterUrl={featuredPerformer?.motionPosterUrl}
                staticImageUrl={featuredPerformer?.profileImageUrl ?? '/images/tmi-placeholder.jpg'}
                alt={featuredPerformer?.name ?? 'Live performer'}
                audienceCount={featuredPerformer?.audienceCount}
                height={220}
                showLiveOverlay={false}
              />
              {/* Overlay text */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220, background: 'linear-gradient(to top, rgba(5,5,16,0.82) 0%, transparent 60%)', pointerEvents: 'none' }}>
                <div style={{ display: 'inline-flex', fontSize: 8, letterSpacing: '0.14em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.45)', borderRadius: 4, padding: '3px 6px', width: 'fit-content', background: 'rgba(5,5,16,0.6)' }}>🔴 {featuredPerformer ? `${featuredPerformer.name.toUpperCase()} · LIVE` : 'JOIN ROOM RUNTIME'}</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem,2.5vw,1.8rem)', fontWeight: 900, textShadow: '0 2px 12px rgba(0,255,255,0.4)' }}>
                    {featuredPerformer ? `${featuredPerformer.name} is live` : 'Enter Live Venue World'}
                  </h2>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.78)' }}>
                    {featuredPerformer ? `${featuredPerformer.audienceCount.toLocaleString()} watching · join the room and seat yourself.` : 'Join room, interact, tip, and return in one continuous flow.'}
                  </p>
                </div>
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

      {/* ── AUDIENCE PREVIEW WINDOWS — Broadcast Director System (Audience Visibility Rule v2) ──
          Rotating crowd shots (wide/cluster/VIP/dance-floor/reaction), never a static seat grid. */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 14 }}>
          AUDIENCE CAM · LIVE CROWD PREVIEW
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {roomStack.map((room) => (
            <AudienceDirectorWindow
              key={room.id}
              roomId={room.id}
              label={room.title}
              accentColor={room.color}
              onJoin={() => openRoom(room.id, room.title, room.color)}
            />
          ))}
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

      {/* ══ LIVE WORLD WALL — registry-driven performer tiles ══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 28px' }}>
        <BillboardLiveWall mode="home" maxTiles={9} title="LIVE WORLD FEED — ALL ROOMS" showActions />
      </section>

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
      <WidgetDrawer />
    </main>
    </RoomContainer>
  );
}
