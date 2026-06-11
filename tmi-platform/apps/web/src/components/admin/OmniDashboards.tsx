'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type DashTab = 'fan' | 'artist' | 'overseer' | 'admin';
type MsgState = 'OPEN' | 'REVIEW' | 'RESOLVED' | 'ESCALATED';
type MsgPriority = 'HIGH' | 'MEDIUM' | 'LOW';
type Channel = 'Booking' | 'Support' | 'Safety' | 'Sponsor' | 'Editorial' | 'System';

interface Msg { id: string; channel: Channel; subject: string; from: string; state: MsgState; priority: MsgPriority; time: string; }

const MSGS: Msg[] = [
  { id: 'm01', channel: 'Booking',   subject: 'Venue date change — Club Nova → April 30',         from: 'Wavetek',         state: 'OPEN',      priority: 'HIGH',   time: '8m ago'  },
  { id: 'm02', channel: 'Support',   subject: 'Billing dispute — payout delay',                   from: 'Zuri Bloom',      state: 'REVIEW',    priority: 'HIGH',   time: '22m ago' },
  { id: 'm03', channel: 'Safety',    subject: 'Abuse report — offensive content in Cypher room',  from: '[User Report]',   state: 'ESCALATED', priority: 'HIGH',   time: '34m ago' },
  { id: 'm04', channel: 'Sponsor',   subject: 'Campaign slot confirmation — PrimeWave April run', from: 'PrimeWave Audio', state: 'OPEN',      priority: 'MEDIUM', time: '1h ago'  },
  { id: 'm05', channel: 'Editorial', subject: 'Article submission — Wavetek interview draft',     from: 'TMI Editorial',   state: 'REVIEW',    priority: 'MEDIUM', time: '2h ago'  },
  { id: 'm06', channel: 'System',    subject: 'Webhook failure — Stripe checkout endpoint',       from: 'System Monitor',  state: 'REVIEW',    priority: 'HIGH',   time: '5h ago'  },
  { id: 'm07', channel: 'Safety',    subject: 'Spam detection — 40+ duplicate messages',          from: 'System Monitor',  state: 'RESOLVED',  priority: 'MEDIUM', time: '1d ago'  },
];

const CH_COLOR: Record<Channel, string> = {
  Booking: '#00FFFF', Support: '#FF2DAA', Safety: '#FF4444',
  Sponsor: '#FFD700', Editorial: '#AA2DFF', System: '#FF8C00',
};
const ST_COLOR: Record<MsgState, string> = {
  OPEN: '#00FFFF', REVIEW: '#FFD700', RESOLVED: '#00FF88', ESCALATED: '#FF4444',
};

export default function OmniDashboards() {
  const [activeTab, setActiveTab] = useState<DashTab>('admin');
  const [activeMsg, setActiveMsg] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; em: string; x: number }[]>([]);
  const [chatMsg, setChatMsg] = useState('');

  function addReaction(em: string) {
    const id = Date.now();
    setReactions(r => [...r, { id, em, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2800);
  }

  return (
    <div style={{ background: '#050815', minHeight: '100vh', color: '#FF8C00', fontFamily: 'var(--font-orbitron), monospace' }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#030610', borderBottom: '1px solid rgba(220,70,0,0.5)', padding: '10px 20px', gap: '12px', flexWrap: 'wrap' }}>
        {([
          { id: 'fan',      label: '🎭 FAN THEATER'   },
          { id: 'artist',   label: '🎤 ARTIST STUDIO'  },
          { id: 'overseer', label: '👁 OVERSEER DECK'  },
          { id: 'admin',    label: '⚙️ ADMIN HUB'      },
        ] as { id: DashTab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(230,48,0,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#FFD700' : 'rgba(255,140,0,0.5)',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #E63000' : '2px solid transparent',
              padding: '8px 16px', fontWeight: 800, cursor: 'pointer', borderRadius: '4px 4px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>

        {/* ── FAN THEATER ─────────────────────────────────────────── */}
        {activeTab === 'fan' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 4 }}>FAN EXPERIENCE</div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>Fan Theater View</h2>
              </div>
              <Link href="/dashboard/fan" style={{ fontSize: 9, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 6, padding: '6px 12px', textDecoration: 'none', fontWeight: 700 }}>Open Full →</Link>
            </div>

            {/* Marquee screen */}
            <div style={{ background: '#111', borderRadius: 12, height: 160, position: 'relative', overflow: 'hidden', border: '2px solid rgba(255,45,170,0.4)', marginBottom: 16 }}>
              <div style={{ position: 'absolute', top: 8, left: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2DAA', display: 'inline-block', boxShadow: '0 0 8px #FF2DAA' }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.14em' }}>LIVE</span>
              </div>
              {/* Bobblehead crowd */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', gap: 4, padding: '0 12px 12px' }}>
                {'🎭🎵🎤🎭🎵🎶🎭🎤🎵🎭🎶🎤'.split('').map((em, i) => (
                  <span key={i} style={{ fontSize: i % 3 === 0 ? 24 : 18, filter: 'drop-shadow(0 0 4px rgba(255,45,170,0.5))', transform: `translateY(${(i % 2) * 6}px)` }}>{em}</span>
                ))}
              </div>
              {/* Floating reactions */}
              {reactions.map(r => (
                <span key={r.id} style={{ position: 'absolute', bottom: 20, left: `${r.x}%`, fontSize: 22, pointerEvents: 'none', animation: 'float 2.8s ease-out forwards' }}>{r.em}</span>
              ))}
            </div>

            {/* Stats + Reaction dock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 12, letterSpacing: '0.1em' }}>FAN STATS</div>
                {[{ label: 'XP Points', val: '4,820', color: '#FFD700' }, { label: 'Followers', val: '312', color: '#00FFFF' }, { label: 'Contests', val: '7', color: '#FF2DAA' }].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,45,170,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 12, letterSpacing: '0.1em' }}>REACTIONS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['👍', '❤️', '✋', '🎉', '⚡', '🎵'].map(em => (
                    <button key={em} onClick={() => addReaction(em)} style={{ fontSize: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>{em}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Chat..." onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) { addReaction('💬'); setChatMsg(''); } }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 11, outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* Playlist Engine preview */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>NOW PLAYING</div>
              {['Chario Ace — Electric City', 'Wavetek — The Drop', 'Kreach — Diamond Flow', 'KG — Soul Frequency', 'Zuri Bloom — Rise'].map((track, i) => (
                <div key={track} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 9, color: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.25)', width: 14, textAlign: 'right' }}>{i + 1}</span>
                  <span style={{ fontSize: 12, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)', flex: 1 }}>{track}</span>
                  {i === 0 && <span style={{ fontSize: 9, color: '#00FFFF', fontWeight: 700 }}>▶ PLAYING</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ARTIST STUDIO ────────────────────────────────────────── */}
        {activeTab === 'artist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 800, marginBottom: 4 }}>ARTIST EXPERIENCE</div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>Artist Studio View</h2>
              </div>
              <Link href="/dashboard/artist" style={{ fontSize: 9, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.3)', borderRadius: 6, padding: '6px 12px', textDecoration: 'none', fontWeight: 700 }}>Open Full →</Link>
            </div>

            {/* Live toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setIsLive(false)} style={{ flex: 1, padding: '10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', background: !isLive ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${!isLive ? '#00FF88' : 'rgba(255,255,255,0.1)'}`, color: !isLive ? '#00FF88' : 'rgba(255,255,255,0.4)', borderRadius: 8, cursor: 'pointer' }}>
                🟢 GREEN ROOM
              </button>
              <button onClick={() => setIsLive(true)} style={{ flex: 1, padding: '10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', background: isLive ? 'rgba(255,45,170,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isLive ? '#FF2DAA' : 'rgba(255,255,255,0.1)'}`, color: isLive ? '#FF2DAA' : 'rgba(255,255,255,0.4)', borderRadius: 8, cursor: 'pointer' }}>
                🔴 ON AIR
              </button>
            </div>

            {!isLive ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 9, color: '#00FF88', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>SHOW COUNTDOWN</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: 3, marginBottom: 8 }}>02:34:18</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Until your next scheduled set</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>SET LIST</div>
                  {['Electric City (Opener)', 'The Drop (New)', 'Diamond Flow', 'Soul Frequency', 'Rise (Closer)'].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,255,255,0.1)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(255,45,170,0.08)', border: '1px solid rgba(255,45,170,0.35)', borderRadius: 10, padding: '16px', marginBottom: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.2em', marginBottom: 8 }}>● ON AIR — LIVE NOW</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                    {[{ label: 'VIEWERS', val: '1,204' }, { label: 'TIPS', val: '$84' }, { label: 'RATING', val: '4.9★' }].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.val}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.1em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[{ amt: '$20', icon: '💎' }, { amt: '$15', icon: '⚡' }, { amt: '$10', icon: '❤️' }].map(tip => (
                    <div key={tip.amt} style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '10px', textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: 18 }}>{tip.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#FFD700', marginTop: 4 }}>{tip.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue bar */}
            <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 10, padding: '14px 16px', marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 9, color: '#FFD700', fontWeight: 700, letterSpacing: '0.1em' }}>REVENUE — THIS MONTH</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#FFD700' }}>$3,845</span>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
                {[60, 75, 45, 90, 80, 70, 95].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(255,215,0,${0.2 + (h / 100) * 0.6})`, borderRadius: '3px 3px 0 0' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── OVERSEER DECK ────────────────────────────────────────── */}
        {activeTab === 'overseer' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 800, marginBottom: 4 }}>PLATFORM INTELLIGENCE</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>Overseer Deck</h2>
            </div>

            {/* Platform health grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '🤖', label: 'Bots Active',     val: '62/62',   color: '#00FF88' },
                { icon: '🎭', label: 'Live Rooms',       val: '14',      color: '#FF2DAA' },
                { icon: '🏆', label: 'Active Contests',  val: '3',       color: '#FFD700' },
                { icon: '🔐', label: 'Auth Rate',        val: '99.8%',   color: '#00FF88' },
                { icon: '💳', label: 'Stripe Health',    val: 'LIVE',    color: '#00FF88' },
                { icon: '📡', label: 'CDN Uptime',       val: '100%',    color: '#00FF88' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(170,45,255,0.05)', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 4 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Bot roster preview */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(170,45,255,0.25)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: '#AA2DFF', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>BOT ROSTER — ACTIVE AGENTS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {['Big Ace', 'Michael Charlie', 'Hype Bot', 'Score Engine', 'DJ Rotation', 'Contest Watcher', 'Leaderboard Bot', 'Safety Shield'].map(bot => (
                  <div key={bot} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 6, padding: '6px 10px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{bot}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform laws */}
            <div style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 9, color: '#FF4444', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>PLATFORM LAWS — HARDCODED</div>
              {[
                'Big Ace must approve all cash payouts',
                'August 8 = Marcel\'s birthday (contest registration gate)',
                'Diamond tier: facethebully916@gmail.com + bjmbeat@berntoutglobal.com',
                'World Dance Party = DanceArena3D only, NO SEATS EVER',
                'Crown holder = real performer, never seed order',
                'Seed accounts never hold competitive positions',
              ].map(law => (
                <div key={law} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                  <span style={{ color: '#FF4444', flexShrink: 0, marginTop: 1 }}>⚖</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{law}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ADMIN HUB ────────────────────────────────────────────── */}
        {activeTab === 'admin' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '12px 20px', borderRadius: 8, marginBottom: 20 }}>
              <h2 style={{ color: '#E63000', margin: 0, textTransform: 'uppercase', letterSpacing: 2, fontSize: 16 }}>BerntoutGlobal — Administration Hub</h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#00FF7F', fontSize: 11, fontWeight: 800 }}>● SYSTEM ONLINE</span>
                <Link href="/admin" style={{ background: '#E63000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 800, cursor: 'pointer', fontSize: 10, textDecoration: 'none' }}>Admin Home →</Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { icon: '👥', label: 'Total Users',   val: '12,841', trend: '+124',   color: '#00FF7F' },
                { icon: '🟢', label: 'Online Now',    val: '1,204',  trend: '+8',     color: '#00FF7F' },
                { icon: '💳', label: 'Paid Members',  val: '3,271',  trend: '+22',    color: '#00FF7F' },
                { icon: '💰', label: 'Revenue Today', val: '$8,940', trend: '+$1.2k', color: '#00FF7F' },
                { icon: '🎤', label: 'Live Now',      val: '14',     trend: '+3',     color: '#00FF7F' },
                { icon: '📢', label: 'Ad Revenue',    val: '$520',   trend: '+$80',   color: '#00E5FF' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,140,0,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 20, color: '#FFD700', fontWeight: 900 }}>{stat.val}</div>
                  <div style={{ fontSize: 10, color: stat.color, marginTop: 4, fontWeight: 800 }}>{stat.trend}</div>
                </div>
              ))}
            </div>

            {/* System health */}
            <div style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: 20, borderRadius: 8, marginBottom: 24 }}>
              <h3 style={{ color: '#FF8C00', fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>System Health Monitors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Auth Service', status: 'Operational', color: '#00FF7F' },
                  { label: 'PostgreSQL',   status: 'Operational', color: '#00FF7F' },
                  { label: 'Stripe Hooks', status: 'Operational', color: '#00FF7F' },
                  { label: 'WebRTC',       status: 'Operational', color: '#00FF7F' },
                  { label: 'Redis Cache',  status: 'Degraded',    color: '#FFD700' },
                  { label: 'CDN Storage',  status: 'Operational', color: '#00FF7F' },
                ].map(sys => (
                  <div key={sys.label} style={{ background: 'rgba(12,20,50,0.9)', padding: 12, borderRadius: 6, border: '1px solid rgba(220,70,0,0.3)', textAlign: 'center' }}>
                    <div style={{ color: sys.color, marginBottom: 6, fontSize: 14 }}>●</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,140,0,0.7)', textTransform: 'uppercase', marginBottom: 4 }}>{sys.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: sys.color }}>{sys.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MESSAGE MONITOR ── */}
            <div style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: 20, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#FF8C00', fontSize: 13, textTransform: 'uppercase', margin: 0, letterSpacing: 1 }}>Message Monitor</h3>
                <Link href="/admin/messages" style={{ fontSize: 9, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 5, padding: '4px 10px', textDecoration: 'none', fontWeight: 700 }}>View All →</Link>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Open',      val: MSGS.filter(m => m.state === 'OPEN').length,      color: '#FF2DAA' },
                  { label: 'Escalated', val: MSGS.filter(m => m.state === 'ESCALATED').length, color: '#FF4444' },
                  { label: 'High Pri.', val: MSGS.filter(m => m.priority === 'HIGH').length,   color: '#FFD700' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 3 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Channel badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {(['Booking', 'Support', 'Safety', 'Sponsor', 'Editorial', 'System'] as Channel[]).map(ch => {
                  const cnt = MSGS.filter(m => m.channel === ch).length;
                  return (
                    <span key={ch} style={{ fontSize: 8, fontWeight: 700, color: CH_COLOR[ch], background: `${CH_COLOR[ch]}12`, border: `1px solid ${CH_COLOR[ch]}30`, borderRadius: 5, padding: '3px 8px' }}>
                      {ch} ({cnt})
                    </span>
                  );
                })}
              </div>

              {/* Message list */}
              <div style={{ display: 'grid', gap: 8 }}>
                {MSGS.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => setActiveMsg(activeMsg === msg.id ? null : msg.id)}
                    style={{
                      border: `1px solid ${msg.state === 'ESCALATED' ? 'rgba(255,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 8,
                      background: msg.state === 'ESCALATED' ? 'rgba(255,68,68,0.04)' : 'rgba(255,255,255,0.01)',
                      padding: '10px 14px', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.08em', color: CH_COLOR[msg.channel], background: `${CH_COLOR[msg.channel]}15`, border: `1px solid ${CH_COLOR[msg.channel]}30`, borderRadius: 3, padding: '2px 6px' }}>{msg.channel.toUpperCase()}</span>
                        <span style={{ fontSize: 7, fontWeight: 700, color: msg.priority === 'HIGH' ? '#FF4444' : msg.priority === 'MEDIUM' ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>{msg.priority}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{msg.time}</span>
                        <span style={{ fontSize: 7, fontWeight: 800, color: ST_COLOR[msg.state], background: `${ST_COLOR[msg.state]}15`, border: `1px solid ${ST_COLOR[msg.state]}30`, borderRadius: 999, padding: '2px 7px' }}>{msg.state}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{msg.subject}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>From: {msg.from}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px);opacity:0} }
        .fade-in { animation: fadein 0.25s ease; }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
