'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import dynamic from 'next/dynamic';
import MemoryCaptureButton from '@/components/memory/MemoryCaptureButton';

const AvatarLobbyCanvas = dynamic(() => import('@/components/3d/AvatarLobbyCanvas'), { ssr: false });

const ROOMS = [
  { label: "Monday Night Stage",   href: "/rooms/monday-stage",       desc: "Marcel's weekly live show — artist performances every Monday 8PM EST.",       emoji: "🎭", accent: "#FF2DAA", badge: "WEEKLY",   live: true  },
  { label: "Cypher Arena",         href: "/rooms/cypher",             desc: "Live freestyle and rap battle sessions. Queue up and battle for the crown.",   emoji: "🎤", accent: "#AA2DFF", badge: "BATTLES",  live: true  },
  { label: "Live Concert",         href: "/rooms/live-concert",       desc: "Full live concert experiences — artists perform full sets for the audience.",   emoji: "🎸", accent: "#00FFFF", badge: "SHOWS",    live: false },
  { label: "Listening Party",      href: "/rooms/listening-party",    desc: "Album and single drops — listen together in real time with the community.",    emoji: "🎶", accent: "#FFD700", badge: "DROPS",    live: false },
  { label: "DJ Room",              href: "/rooms/dj",                 desc: "Live DJ sets, mixes, and takeovers from top DJs on the Index.",                 emoji: "🎧", accent: "#FF2DAA", badge: "SETS",     live: false },
  { label: "Studio Session",       href: "/rooms/studio",             desc: "Watch artists create music live in the studio — beat making, recording.",       emoji: "🎛️", accent: "#AA2DFF", badge: "CREATIVE", live: false },
  { label: "Contest Performance",  href: "/rooms/contest-performance",desc: "Crown Season submissions and performances — vote for your favorites.",       emoji: "👑", accent: "#FFD700", badge: "CONTEST",  live: false },
  { label: "Watch Party",          href: "/rooms/watch-party",        desc: "Watch music videos, live streams, and events together in sync.",               emoji: "📺", accent: "#00FFFF", badge: "PARTIES",  live: false },
  { label: "Interview Booth",      href: "/rooms/interview-booth",    desc: "Live artist interviews — Q&A sessions with your favorite musicians.",          emoji: "🎙️", accent: "#FF2DAA", badge: "TALK",     live: false },
  { label: "VIP Lounge",           href: "/rooms/vip-lounge",         desc: "Exclusive access for TMI Premium members — private sessions and events.",     emoji: "💎", accent: "#FFD700", badge: "VIP",      live: false },
  { label: "Fan Meet-Up",          href: "/rooms/fan-meetup",         desc: "Artist fan meet-ups — chat directly with your favorite artists.",             emoji: "🤝", accent: "#AA2DFF", badge: "MEET",     live: false },
  { label: "Collaboration Room",   href: "/rooms/collaboration",      desc: "Connect with other artists and creatives to build something together.",        emoji: "✨", accent: "#00FFFF", badge: "COLLAB",   live: false },
  { label: "Band Room",            href: "/rooms/band",               desc: "Multi-stream room for full bands — each member captures live from their rig.",  emoji: "🎸", accent: "#FF2DAA", badge: "BANDS",    live: false },
  { label: "Producer Suite",       href: "/rooms/producer",           desc: "Beat-making sessions — producers showcase production live as it happens.",       emoji: "🎛️", accent: "#AA2DFF", badge: "BEATS",    live: false },
  { label: "Front Row",            href: "/rooms/front-row",          desc: "Premium seats closest to the stage — exclusive view for Diamond members.",      emoji: "🪑", accent: "#FFD700", badge: "VIP",      live: false },
  { label: "Backstage Pass",       href: "/rooms/backstage",          desc: "Go behind the scenes before, during, and after a performance.",                  emoji: "🎭", accent: "#AA2DFF", badge: "BACKSTAGE",live: false },
  { label: "Audience Chamber",     href: "/rooms/audience",           desc: "General crowd room — react, tip, and cheer for your favorite artist.",           emoji: "🙌", accent: "#00FF88", badge: "CROWD",    live: false },
  { label: "Sponsor Event",        href: "/rooms/sponsor-event",      desc: "Brand-sponsored performances and activations — exclusive sponsored shows.",     emoji: "🏆", accent: "#FFD700", badge: "BRANDED",  live: false },
  { label: "Party Lobby",          href: "/rooms/party-lobby",        desc: "Pre-show lobby — mix, mingle, and hype each other before the main event.",      emoji: "🥂", accent: "#FF2DAA", badge: "LOBBY",    live: false },
  { label: "Name That Tune",       href: "/rooms/name-that-tune",     desc: "Competitive music trivia — identify the track before anyone else.",              emoji: "🎵", accent: "#00FFFF", badge: "TRIVIA",   live: false },
  { label: "Lyric Fill",           href: "/rooms/lyric-fill",         desc: "Complete the lyrics challenge — test your knowledge against the crowd.",         emoji: "📝", accent: "#AA2DFF", badge: "GAME",     live: false },
  { label: "Deal or Feud",         href: "/rooms/deal-or-feud",       desc: "Music industry deal negotiation game — artists and labels face off.",            emoji: "🤝", accent: "#FFD700", badge: "GAME",     live: false },
  { label: "Game Room",            href: "/rooms/game",               desc: "Music-themed mini-games — earn XP and compete for leaderboard glory.",          emoji: "🎮", accent: "#00FF88", badge: "GAMES",    live: false },
  { label: "Interview Stage",      href: "/rooms/interview",          desc: "Artist deep-dives — intimate one-on-one or panel interviews.",                   emoji: "🎙️", accent: "#00FFFF", badge: "TALK",     live: false },
  { label: "Cover Art Zoom",       href: "/rooms/cover-art-zoom",     desc: "Reveal and discuss cover art — artists walk fans through visual concepts.",     emoji: "🖼️", accent: "#FF2DAA", badge: "ART",      live: false },
];

export default function RoomsPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #1a0a2e 0%, #050510 60%)', color: '#fff', padding: '32px 32px 80px', position: 'relative', overflow: 'hidden' }}>
          
          {/* 3D Background Layer */}
          <AvatarLobbyCanvas activeCount={7} />

          {/* UI Foreground Layer */}
          <div style={{ marginBottom: 32, position: 'relative', zIndex: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>LIVE ROOMS</div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: 3, margin: '0 0 8px' }}>JOIN A ROOM</h1>
            <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Watch a show, battle in the cypher, or hang with the community.</p>
          </div>

          {/* Live rooms first */}
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#FF2DAA', fontWeight: 800, marginBottom: 16, position: 'relative', zIndex: 10 }}>● LIVE NOW</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 36, position: 'relative', zIndex: 10 }}>
            {ROOMS.filter((r) => r.live).map((room, i) => (
              <motion.div key={room.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={room.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div whileHover={{ y: -3, borderColor: room.accent }}
                    style={{ background: `rgba(5, 5, 16, 0.6)`, backdropFilter: 'blur(12px)', border: `1px solid ${room.accent}44`, borderRadius: 14, padding: '22px 20px', cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: `0 8px 32px ${room.accent}15` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 32 }}>{room.emoji}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <motion.div animate={{ opacity: [1,0,1] }} transition={{ duration: 1, repeat: Infinity }}
                          style={{ fontSize: 8, fontWeight: 900, letterSpacing: 2, color: '#FF2DAA' }}>● LIVE</motion.div>
                        <div style={{ fontSize: 8, color: room.accent, fontWeight: 700, letterSpacing: 2, background: `${room.accent}15`, padding: '3px 8px', borderRadius: 10, border: `1px solid ${room.accent}30` }}>{room.badge}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: 1 }}>{room.label}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{room.desc}</div>
                    <div style={{ marginTop: 14, fontSize: 10, color: room.accent, fontWeight: 700, letterSpacing: 2 }}>JOIN ROOM →</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* All rooms */}
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#555', fontWeight: 800, marginBottom: 16, position: 'relative', zIndex: 10 }}>ALL ROOMS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, position: 'relative', zIndex: 10 }}>
            {ROOMS.filter((r) => !r.live).map((room, i) => (
              <motion.div key={room.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04 }}>
                <Link href={room.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div whileHover={{ y: -2, borderColor: `${room.accent}55` }}
                    style={{ background: 'rgba(10, 10, 20, 0.65)', backdropFilter: 'blur(10px)', border: '1px solid #1a1a2e', borderRadius: 12, padding: '18px 18px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 26 }}>{room.emoji}</div>
                      <div style={{ fontSize: 8, color: room.accent, fontWeight: 700, letterSpacing: 2, background: `${room.accent}12`, padding: '3px 8px', borderRadius: 8, border: `1px solid ${room.accent}25` }}>{room.badge}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ddd', marginBottom: 6 }}>{room.label}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{room.desc}</div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </HUDFrame>
      {/* Memory capture for Avatar Lobby surface (Task 2) */}
      <div style={{ position: "fixed", bottom: 216, right: 16, zIndex: 998 }}>
        <MemoryCaptureButton userId="avatar-lobby" roomId="rooms-lobby" />
      </div>
      <FooterHUD />
    </PageShell>
  );
}
