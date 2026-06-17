"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MediaMonitor from '@/components/video/MediaMonitor';
import TrustKillerFeed from '@/components/admin/TrustKillerFeed';
import UnifiedInbox from '@/components/admin/overseer/UnifiedInbox';

const SYSTEM_HEALTH = [
  { id: 'auth',     label: 'AUTH',     status: 'GREEN', color: '#00FF88' },
  { id: 'db',       label: 'DATABASE', status: 'GREEN', color: '#00FF88' },
  { id: 'stripe',   label: 'STRIPE',   status: 'GREEN', color: '#00FF88' },
  { id: 'webrtc',   label: 'WEBRTC',   status: 'WARN',  color: '#FFD700' },
  { id: 'presence', label: 'PRESENCE', status: 'GREEN', color: '#00FF88' },
];

const CHAIN_OF_COMMAND = [
  { name: 'Big Ace Overseer CEO', role: 'TMI', color: '#FFD700', dot: '#00FF88', blink: '0s'   },
  { name: 'Big Ace',              role: 'Operations Lead · 14', color: '#FFD700', dot: '#00FF88', blink: '.4s'  },
  { name: 'Michael Charlie',      role: 'Systems · Platform',   color: '#FF9500', dot: '#00FF88', blink: '.8s'  },
  { name: 'Big Ace 14',           role: 'Support Staff',        color: '#FF9500', dot: '#FFD700', blink: '0s'   },
];

const MONEY_BILLING = [
  { icon: '🤖', name: 'Ace',            role: 'Owner',   amount: '$1.2k' },
  { icon: '👤', name: 'Big Ace',        role: 'Manager', amount: '$945'  },
  { icon: '👤', name: 'Jay Paul Beats', role: 'Artist',  amount: '$421'  },
  { icon: '👤', name: 'FBi Ace',        role: 'Partner', amount: '$234'  },
];

const BOT_ROSTER = [
  { name: 'Big Ace',       dotColor: '#00FF88', active: true,  delay: '0s'   },
  { name: 'Michael Charlie', dotColor: '#00FF88', active: true,  delay: '.3s'  },
  { name: 'NovaBot',       dotColor: '#FFD700', active: true,  delay: '0s'   },
  { name: 'SecurityBot',   dotColor: '#00FF88', active: true,  delay: '.6s'  },
  { name: 'RevenueBot',    dotColor: 'rgba(255,255,255,0.25)', active: false, delay: '0s'   },
];

const LIVE_FEED_EVENTS = [
  { icon: '🎤', title: 'Live Performance: Ace',    sub: 'Boardroom Event',     live: true  },
  { icon: '⚡', title: 'Cypher Tournament Event',   sub: 'Session (local)',     live: true  },
  { icon: '📢', title: 'Sponsor Segment (PunWorkly)', sub: 'Ad Campaign',      live: true  },
];

const BILLBOARD_RANKINGS = [
  { rank: 1, label: 'Live Performance', stat: '📈 5780' },
  { rank: 2, label: 'Memory Streams',   stat: '👁 1.5k'  },
  { rank: 3, label: 'Jay Paul Beats',   stat: '📈 1.2k'  },
  { rank: 4, label: 'Big Ace',          stat: '📈 1.38'  },
  { rank: 5, label: 'SpontanYall',      stat: '📈 .33'   },
];

const REV_BARS = [30, 45, 62, 80, 96, 76, 86];

const TV_ROOMS = [
  { label: '🎤 Main Stage',   bg: '#0a0002', live: true,  route: '/live/lobby' },
  { label: '⚔️ Battle Arena', bg: '#030a0a', live: true,  route: '/battles'    },
  { label: '🎤 Cypher Lounge', bg: '#00050a', live: true,  route: '/cypher'     },
  { label: '🎵 Chill Beats',  bg: '#00080a', live: false, route: '/live/lobby' },
];

export default function OverseerDeckPage() {
  const router = useRouter();
  const [feedFilter, setFeedFilter] = useState<'live' | 'genre' | 'trending'>('live');
  const [feedSearch, setFeedSearch] = useState('');
  const [lastPulse, setLastPulse] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#020205', color: '#fff', padding: 16, fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        @keyframes overseerBlink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes overseerScan{0%{top:-5%}100%{top:105%}}
        @keyframes overseerTicker{from{transform:translateX(110%)}to{transform:translateX(-110%)}}
        .ov-blink{animation:overseerBlink 1.2s ease-in-out infinite}
        .ov-monitor-scan::before{content:'';position:absolute;top:-5%;left:0;right:0;height:1px;background:rgba(0,180,200,.3);animation:overseerScan 3s linear infinite;z-index:2;pointer-events:none}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: '7px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 18 }}>🛰️</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 900, color: '#E63000', textTransform: 'uppercase', letterSpacing: '.08em' }}>BerntoutGlobal — OVERSEER DECK</div>
            <div style={{ fontSize: 8, color: 'rgba(255,140,0,.5)' }}>MISSION CONTROL V1.0</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span className="ov-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 5px #00FF88', display: 'inline-block' }} />
            <span style={{ fontSize: 8, color: '#00FF88' }}>LIVE</span>
          </div>
          <span style={{ fontSize: 8, color: 'rgba(255,140,0,.4)' }}>11:45 AM EST</span>
          <button
            onClick={() => { router.refresh(); setLastPulse(new Date().toLocaleTimeString()); }}
            style={{ fontSize: 7, padding: '3px 8px', background: 'transparent', border: '1px solid rgba(220,70,0,.5)', color: 'rgba(255,140,0,.8)', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}
          >
            ⚡ CHAIN PULSE{lastPulse ? ` · ${lastPulse}` : ''}
          </button>
          <Link href="/hub/artist" style={{ fontSize: 7, padding: '3px 8px', background: 'transparent', border: '1px solid rgba(220,70,0,.5)', color: 'rgba(255,140,0,.8)', borderRadius: 4, textDecoration: 'none', fontWeight: 700 }}>🤖 Summon Big Ace</Link>
          <Link href="/admin/inbox" style={{ fontSize: 7, padding: '3px 8px', background: 'rgba(220,70,0,.15)', border: '1px solid #E63000', color: '#FF9500', borderRadius: 4, textDecoration: 'none', fontWeight: 700 }}>Approve Digest</Link>
        </div>
      </div>

      {/* System Health Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
        {SYSTEM_HEALTH.map(sys => (
          <div key={sys.id} style={{ background: 'rgba(8,14,38,.95)', border: `1px solid ${sys.color}40`, borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em' }}>{sys.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: sys.color, boxShadow: `0 0 6px ${sys.color}`, display: 'inline-block' }} />
              <span style={{ fontSize: 8, fontWeight: 900, color: sys.color }}>{sys.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 210px', gap: 8, marginBottom: 10 }}>

        {/* LEFT RAIL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Chain of Command */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>Chain of Command</div>
            {CHAIN_OF_COMMAND.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, padding: '4px 6px', background: 'rgba(220,70,0,.07)', borderRadius: 4 }}>
                <span className="ov-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: m.dot, boxShadow: `0 0 4px ${m.dot}`, display: 'inline-block', flexShrink: 0, animationDelay: m.blink }} />
                <div>
                  <div style={{ fontSize: 9, color: m.color, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Money & Billing */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>Money &amp; Billing</div>
            {MONEY_BILLING.map(m => (
              <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 10 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 9 }}>{m.name}</div>
                    <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>{m.role}</div>
                  </div>
                </div>
                <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, color: '#FFD700', fontSize: 9 }}>{m.amount}</span>
              </div>
            ))}
            <Link href="/admin/billing" style={{ display: 'block', textAlign: 'center', marginTop: 6, fontSize: 8, fontWeight: 700, color: '#FFD700', border: '1px solid rgba(255,215,0,.3)', borderRadius: 4, textDecoration: 'none', padding: '3px 0' }}>VIEW PAYOUTS →</Link>
          </div>

          {/* Bot Roster & Summon */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>Bot Roster &amp; Summon</div>
            {BOT_ROSTER.map(b => (
              <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span className={b.active ? 'ov-blink' : ''} style={{ width: 5, height: 5, borderRadius: '50%', background: b.dotColor, display: 'inline-block', animationDelay: b.delay }} />
                  <span style={{ fontSize: 9 }}>{b.name}</span>
                </div>
                <Link href="/hub/artist" style={{ fontSize: 7, padding: '1px 6px', background: 'transparent', border: b.active ? '1px solid rgba(0,255,136,.4)' : '1px solid rgba(255,255,255,.15)', color: b.active ? '#00FF88' : 'rgba(255,255,255,.3)', borderRadius: 3, textDecoration: 'none', fontWeight: 700 }}>⚡</Link>
              </div>
            ))}
          </div>

          {/* TrustKillerFeed — existing Claude component */}
          <TrustKillerFeed />

          <Link href="/admin/inbox" style={{ display: 'block', textAlign: 'center', padding: '6px', border: '1px solid rgba(0,255,255,.25)', borderRadius: 6, fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(0,255,255,.03)' }}>
            Full Inbox →
          </Link>
        </div>

        {/* CENTRE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* TV Screen Router */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>TV Screen Router — Boardroom Live</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {TV_ROOMS.map(room => (
                <div key={room.label} onClick={() => router.push(room.route)} role="button" tabIndex={0} style={{ height: 60, background: room.bg, border: `1px solid ${room.live ? '#E63000' : 'rgba(220,70,0,.3)'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', fontSize: 9, color: room.live ? '#FFD700' : 'rgba(255,255,255,.4)' }}>
                  {room.label}
                  {room.live && (
                    <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span className="ov-blink" style={{ width: 4, height: 4, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 4px #00FF88', display: 'inline-block' }} />
                      <span style={{ fontSize: 6, color: '#00FF88' }}>LIVE</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Room Monitors — existing Claude components */}
          <div style={{ background: 'rgba(5,5,16,.6)', border: '1px solid rgba(0,255,255,.2)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#00FFFF', letterSpacing: '.15em', marginBottom: 10 }}>LIVE ROOM MONITORS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'ROOM 1: CYPHER ARENA',     mode: 'standby' as const,     active: false },
                { label: 'ROOM 2: NOVA CIPHER (LIVE)', mode: 'remote-view' as const, active: true  },
                { label: 'ROOM 3: FAN THEATER',       mode: 'standby' as const,     active: false },
                { label: 'ROOM 4: MONDAY STAGE',      mode: 'standby' as const,     active: false },
              ].map(m => (
                <div key={m.label} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 10, background: 'rgba(0,0,0,.8)', padding: '3px 6px', borderRadius: 3, fontSize: 8, color: '#fff', fontWeight: 800 }}>{m.label}</div>
                  <MediaMonitor mode={m.mode} isActive={m.active} />
                </div>
              ))}
            </div>
          </div>

          {/* Live Feed Explorer */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 5 }}>Live Feed Explorer</div>
            <input
              value={feedSearch}
              onChange={e => setFeedSearch(e.target.value)}
              placeholder="Search Artists or Events..."
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(12,20,50,.9)', border: '1px solid rgba(220,70,0,.4)', color: 'rgba(255,140,0,.8)', fontSize: 9, outline: 'none', borderRadius: 4, padding: '5px 8px', marginBottom: 5, fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {(['live','genre','trending'] as const).map(f => (
                <button key={f} onClick={() => setFeedFilter(f)} style={{ fontSize: 7, padding: '2px 8px', background: feedFilter === f ? 'rgba(220,70,0,.3)' : 'transparent', border: `1px solid ${feedFilter === f ? '#E63000' : 'rgba(220,70,0,.35)'}`, color: feedFilter === f ? '#FFD700' : 'rgba(255,140,0,.7)', borderRadius: 3, cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
                  {f === 'live' ? 'Live Now' : f === 'genre' ? 'Genre: Hip-Hop' : 'Top Trending'}
                </button>
              ))}
            </div>
            {LIVE_FEED_EVENTS.map(ev => (
              <div key={ev.title} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '5px 8px', background: 'rgba(220,70,0,.06)', border: '1px solid rgba(220,70,0,.2)', borderRadius: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{ev.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 600 }}>{ev.title}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,140,0,.45)' }}>{ev.sub}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="ov-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF88', display: 'inline-block' }} />
                  <span style={{ fontSize: 7, color: '#00FF88' }}>LIVE</span>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics + Billboard */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 5 }}>Artist Analytics &amp; Revenue</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 50 }}>
                  {REV_BARS.map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: h > 80 ? '#FFD700' : h > 55 ? '#FF8C00' : '#E63000', height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 5 }}>Billboard Rankings</div>
                {BILLBOARD_RANKINGS.map(r => (
                  <div key={r.rank} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 8 }}>
                    <span style={{ color: 'rgba(255,255,255,.5)' }}>{r.rank}. {r.label}</span>
                    <span style={{ color: '#FFD700', fontWeight: 700 }}>{r.stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Security Sentinel Wall */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>Security Sentinel Wall</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9 }}>100 Sentinels</span>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(220,70,0,.3)" strokeWidth="4"/>
                <circle cx="22" cy="22" r="17" fill="none" stroke="#00FF7F" strokeWidth="4" strokeDasharray="76 24" strokeDashoffset="17" transform="rotate(-90 22 22)"/>
                <text x="22" y="26" textAnchor="middle" fill="#00FF7F" fontSize="9" fontFamily="monospace">76%</text>
              </svg>
            </div>
            <div style={{ fontSize: 8, color: '#00FF88', marginBottom: 5 }}>● THREAT LEVEL: STABLE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 8 }}>
              <span style={{ color: 'rgba(255,140,0,.45)' }}>Vulns</span>
              <span style={{ color: '#FFD700', fontWeight: 700 }}>2 open</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 8 }}>
              <span style={{ color: 'rgba(255,140,0,.45)' }}>Alerts</span>
              <span style={{ color: '#E63000', fontWeight: 700 }}>11+</span>
            </div>
          </div>

          {/* Platform stats */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.4)', borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,140,0,.7)', textTransform: 'uppercase', marginBottom: 6 }}>Platform Activity</div>
            {[
              ['Total users online', '3,271', '#00FF88'],
              ['Tips sent today',    '$4.2k', '#FFD700'],
              ['Tickets sold',       '847',   '#FFD700'],
              ['Active sponsors',    '12',    '#00FFFF'],
              ['Radio streams',      '50k+',  '#AA2DFF'],
              ['New signups today',  '+124',  '#00FF88'],
            ].map(([lbl, val, color]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 9 }}>
                <span style={{ color: 'rgba(255,255,255,.45)' }}>{lbl}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* UnifiedInbox — existing Claude component */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <UnifiedInbox />
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(220,70,0,.35)', borderRadius: 6, padding: '5px 10px', overflow: 'hidden' }}>
        <div style={{ animation: 'overseerTicker 22s linear infinite', whiteSpace: 'nowrap', fontSize: 8, color: '#FFD700' }}>
          💰 Tips: $4.2k today &nbsp;&nbsp;&nbsp; 🎟 Tickets: 847 sold &nbsp;&nbsp;&nbsp; 📢 Sponsors: 12 active &nbsp;&nbsp;&nbsp; 🎵 Streams: 50k+ &nbsp;&nbsp;&nbsp; 👥 +124 signups today &nbsp;&nbsp;&nbsp; 💳 3,271 active subs &nbsp;&nbsp;&nbsp; 🔴 LIVE: Chario Ace — Main Stage &nbsp;&nbsp;&nbsp; 🏆 Billboard #1: Big KazhDog &nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}
