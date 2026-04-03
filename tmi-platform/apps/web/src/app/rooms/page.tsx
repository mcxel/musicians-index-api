'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

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
];

export default function RoomsPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '32px 32px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>LIVE ROOMS</div>
            <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: 3, margin: '0 0 8px' }}>JOIN A ROOM</h1>
            <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Watch a show, battle in the cypher, or hang with the community.</p>
          </div>

          {/* Live rooms first */}
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#FF2DAA', fontWeight: 800, marginBottom: 16 }}>● LIVE NOW</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 36 }}>
            {ROOMS.filter((r) => r.live).map((room, i) => (
              <motion.div key={room.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={room.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div whileHover={{ y: -3, borderColor: room.accent }}
                    style={{ background: `${room.accent}08`, border: `1px solid ${room.accent}44`, borderRadius: 14, padding: '22px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
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
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#555', fontWeight: 800, marginBottom: 16 }}>ALL ROOMS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {ROOMS.filter((r) => !r.live).map((room, i) => (
              <motion.div key={room.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04 }}>
                <Link href={room.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div whileHover={{ y: -2, borderColor: `${room.accent}55` }}
                    style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 12, padding: '18px 18px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
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
      <FooterHUD />
    </PageShell>
  );
}
