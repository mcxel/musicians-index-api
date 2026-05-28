'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

const ROOM_CATALOG = [
  { id: 'cypher-1',     label: 'Cypher Room',       icon: '🎤', color: '#FF2DAA', desc: 'Open-mic battles & freestyle sessions',     href: '/cypher' },
  { id: 'lobby-main',   label: 'Main Lobby',        icon: '🏟️', color: '#00FFFF', desc: 'General hangout — all roles welcome',       href: '/live/lobby' },
  { id: 'stage-1',      label: 'Live Stage',        icon: '🎶', color: '#00FF88', desc: 'Full concert stream — performers on stage',  href: '/live/stages' },
  { id: 'backstage-1',  label: 'Backstage',         icon: '🎪', color: '#AA2DFF', desc: 'Artist-only pre-show area',                 href: '/live/backstage' },
  { id: 'green-room-1', label: 'Green Room',        icon: '🟢', color: '#FFD700', desc: 'Warm-up and artist prep zone',              href: '/live/green-room' },
  { id: 'lobby-wall-1', label: 'Lobby Wall',        icon: '🎨', color: '#00FFFF', desc: 'Visual shoutouts & fan submissions',         href: '/live/lobby-wall' },
  { id: 'billboard-1',  label: 'Live Billboard',    icon: '📡', color: '#FF9500', desc: 'Rankings, charts & live crown board',       href: '/live/billboards' },
  { id: 'chat-1',       label: 'Live Chat Room',    icon: '💬', color: '#00FF88', desc: 'Text chat with performers and fans',        href: '/live/chat' },
];

export default function LiveRoomsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px 80px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>TMI LIVE NETWORK</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, margin: 0, letterSpacing: 2 }}>LIVE ROOMS</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Pick a room and join the energy</p>
        </div>

        {/* Go Live hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, rgba(255,45,170,0.12), rgba(170,45,255,0.1))', border: '1.5px solid rgba(255,45,170,0.35)', borderRadius: 14, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 800, marginBottom: 6 }}>🎤 PERFORMERS</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Ready to go live?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Start your own session from the Cypher or Stage.</div>
          </div>
          <Link href="/live/go" style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', borderRadius: 8, color: '#fff', fontWeight: 900, fontSize: 12, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            GO LIVE NOW →
          </Link>
        </motion.div>

        {/* Room grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {ROOM_CATALOG.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={room.href} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '18px', background: `${room.color}08`, border: `1px solid ${room.color}22`, borderRadius: 12, textDecoration: 'none', height: '100%', boxSizing: 'border-box' }}>
                <span style={{ fontSize: 26 }}>{room.icon}</span>
                <div style={{ fontSize: 12, fontWeight: 800, color: room.color, letterSpacing: '0.08em' }}>{room.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{room.desc}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: room.color, marginTop: 'auto', letterSpacing: '0.12em' }}>ENTER →</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/live" style={{ fontSize: 10, fontWeight: 700, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.2)', padding: '7px 14px', borderRadius: 6, textDecoration: 'none' }}>ALL LIVE</Link>
          <Link href="/battles" style={{ fontSize: 10, fontWeight: 700, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.2)', padding: '7px 14px', borderRadius: 6, textDecoration: 'none' }}>BATTLES</Link>
          <Link href="/home/1" style={{ fontSize: 10, fontWeight: 700, color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)', padding: '7px 14px', borderRadius: 6, textDecoration: 'none' }}>HOME STAGE</Link>
        </div>

      </div>
    </main>
  );
}
