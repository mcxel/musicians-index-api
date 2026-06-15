'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LobbyEntryFlow, type UniversalRoom } from '@/components/room/UniversalLobbyEntry';

// ── Game catalog ──────────────────────────────────────────────────────────────
const GAMES = [
  { id:'deal-or-feud',    title:'Deal or Feud 1000',          icon:'🎲', cat:'competition', status:'live'     as const, viewers:2284, seats:438,  prize:'$1,000 Cash',         href:'/games/deal-or-feud',    color:'#FF2DAA', round:'Round 3/5',   scoreA:74, scoreB:13 },
  { id:'dirty-dozens',    title:'Dirty Dozens',                icon:'🎤', cat:'competition', status:'live'     as const, viewers:289,  seats:1200, prize:'XP + Crown Points',    href:'/games/dirty-dozens',    color:'#AA2DFF', round:'Round 1/3',   scoreA:0,  scoreB:0  },
  { id:'monthly-idol',    title:'Monthly Idol',                icon:'👑', cat:'competition', status:'live'     as const, viewers:1840, seats:600,  prize:'$2,000 + Season Pass', href:'/monthly-idol',          color:'#FFD700', round:'Elimination', scoreA:0,  scoreB:0  },
  { id:'monday-night',    title:"Marcel's Monday Night Stage", icon:'🌙', cat:'music',       status:'live'     as const, viewers:412,  seats:800,  prize:'$500 Weekly Prize',    href:'/games/monday-night',    color:'#00FFFF', round:'Open Stage',  scoreA:0,  scoreB:0  },
  { id:'name-that-tune',  title:'Name That Tune',              icon:'🎵', cat:'music',       status:'live'     as const, viewers:88,   seats:400,  prize:'XP + Fan Points',      href:'/games/name-that-tune',  color:'#00E5FF', round:'Round 2',     scoreA:0,  scoreB:0  },
  { id:'song-battle',     title:'Song Battle',                 icon:'⚔️', cat:'competition', status:'live'     as const, viewers:412,  seats:300,  prize:'$500 Weekly Prize',    href:'/song-battle',           color:'#FF2DAA', round:'Battle Mode', scoreA:0,  scoreB:0  },
  { id:'circle-squares',  title:'Circle and Squares',          icon:'🔷', cat:'social',      status:'upcoming' as const, viewers:0,    seats:500,  prize:'XP + Badges',          href:'/games/circle-squares',  color:'#00FF88', round:'—',           scoreA:0,  scoreB:0  },
  { id:'joke-offs',       title:'Joke-Offs',                   icon:'😂', cat:'comedy',      status:'upcoming' as const, viewers:0,    seats:350,  prize:'XP + Bragging Rights', href:'/games/joke-offs',       color:'#FF6B35', round:'—',           scoreA:0,  scoreB:0  },
  { id:'dance-offs',      title:'Dance-Offs',                  icon:'💃', cat:'party',       status:'upcoming' as const, viewers:0,    seats:800,  prize:'XP + Dance Trophy',    href:'/games/dance-offs',      color:'#AA2DFF', round:'—',           scoreA:0,  scoreB:0  },
  { id:'world-dance',     title:'World Dance Party',           icon:'🌍', cat:'party',       status:'upcoming' as const, viewers:0,    seats:1000, prize:'Global XP Multiplier', href:'/games/dance-offs',      color:'#00FF88', round:'—',           scoreA:0,  scoreB:0  },
  { id:'stream-win',      title:'Stream & Win Radio',          icon:'📻', cat:'music',       status:'live'     as const, viewers:630,  seats:999,  prize:'Streaming Bonuses',    href:'/games/stream-and-win',  color:'#FFD700', round:'LIVE Radio',  scoreA:0,  scoreB:0  },
  { id:'open-mic',        title:'Open Mic Competition',        icon:'🎙️',cat:'music',       status:'upcoming' as const, viewers:0,    seats:200,  prize:'XP + Spotlight',       href:'/cypher',                color:'#FF2DAA', round:'—',           scoreA:0,  scoreB:0  },
  { id:'trivia',          title:'Trivia Night',                icon:'❓', cat:'competition', status:'upcoming' as const, viewers:0,    seats:400,  prize:'XP + Badges',          href:'/games/trivia',          color:'#AA2DFF', round:'—',           scoreA:0,  scoreB:0  },
  { id:'lyric-fill',      title:'Lyric Fill',                  icon:'📝', cat:'music',       status:'upcoming' as const, viewers:0,    seats:300,  prize:'XP + Crown Points',    href:'/games/lyric-fill',      color:'#00FFFF', round:'—',           scoreA:0,  scoreB:0  },
  { id:'dj-mix-off',      title:'DJ Mix-Off',                  icon:'🎧', cat:'music',       status:'live'     as const, viewers:177,  seats:250,  prize:'Producer Badge',       href:'/games/dj-mix-off',      color:'#00FFFF', round:'Set 2',       scoreA:0,  scoreB:0  },
];

const CATS = ['all','music','competition','social','party','comedy'] as const;
type Cat = typeof CATS[number];
const CAT_LABEL: Record<Cat, string> = { all:'🎮 All games', music:'🎵 Music games', competition:'🏆 Competition', social:'🤝 Social games', party:'🎉 Party / Dance', comedy:'😂 Comedy' };

// ── Component ─────────────────────────────────────────────────────────────────
function gameToRoom(g: typeof GAMES[number]): UniversalRoom {
  return {
    id:           g.id,
    title:        g.title,
    hostEmoji:    g.icon,
    viewers:      g.viewers,
    seatsOpen:    g.seats,
    status:       g.status === 'live' ? 'live' : 'upcoming',
    access:       'free',
    accentColor:  g.color,
    prizeLabel:   g.prize,
    roomRoute:    g.href,
    venueIndex:   1,  // Arena
    shape:        'oct',
  };
}

export default function GameNightHub() {
  const [cat, setCat]     = useState<Cat>('all');
  const [rot, setRot]     = useState(13);
  const [pending, setPending] = useState<UniversalRoom | null>(null);

  // 13-second rotation counter
  useEffect(() => {
    const t = setInterval(() => setRot(r => r <= 1 ? 13 : r - 1), 1000);
    return () => clearInterval(t);
  }, []);

  const liveGames     = GAMES.filter(g => g.status === 'live' && (cat === 'all' || g.cat === cat));
  const upcomingGames = GAMES.filter(g => g.status === 'upcoming' && (cat === 'all' || g.cat === cat));
  const featured      = GAMES[0]!; // Deal or Feud 1000

  return (
    <main style={{ minHeight:'100vh', background:'#050510', color:'#fff', paddingBottom:80 }}>
      {pending && <LobbyEntryFlow room={pending} onClose={() => setPending(null)} />}
      <style>{`
        @keyframes blinkLive{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes heatPulse{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes scanIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        .game-card{animation:scanIn .3s ease-out;transition:transform .18s,box-shadow .18s}
        .game-card:hover{transform:translateY(-3px)}
        .live-dot{animation:blinkLive 1.4s ease-in-out infinite}
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 0' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.28em', color:'#FF2DAA', marginBottom:4 }}>TMI LIVE GAMES DISCOVERY NETWORK</div>
            <h1 style={{ fontSize:'clamp(1.4rem,4vw,2.2rem)', fontWeight:900, margin:'0 0 4px' }}>Games &amp; Challenges</h1>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
              Live preview broadcast · Nothing is a dead click ·{' '}
              <span style={{ color:'#E63000' }}>{liveGames.length} games live now</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, color:'rgba(255,255,255,0.4)' }}>
            Rotating in <span style={{ color:'#FFD700', fontWeight:800, minWidth:18, textAlign:'center' }}>{rot}</span>s
            <Link href="/home/3" style={{ fontSize:9, color:'#00FFFF', textDecoration:'none', fontWeight:800, letterSpacing:'0.1em', border:'1px solid rgba(0,229,255,0.25)', borderRadius:20, padding:'5px 12px' }}>
              LIVE WORLD →
            </Link>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:'5px 12px', fontSize:10, fontWeight: cat===c ? 700 : 400, cursor:'pointer',
              background: cat===c ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `0.5px solid ${cat===c ? '#00E5FF' : 'rgba(255,255,255,0.1)'}`,
              borderRadius:20, color: cat===c ? '#00E5FF' : 'rgba(255,255,255,0.45)',
              transition:'all .15s',
            }}>{CAT_LABEL[c]}</button>
          ))}
        </div>

        {/* ── Featured game: Deal or Feud 1000 ── */}
        {(cat === 'all' || cat === 'competition') && (
          <div className="game-card" style={{
            display:'grid', gridTemplateColumns:'1.2fr 1fr', borderRadius:14, overflow:'hidden',
            border:'1.5px solid rgba(255,215,0,0.4)', marginBottom:20, boxShadow:'0 4px 24px rgba(255,45,170,0.1)',
          }}>
            {/* Scoreboard preview */}
            <div style={{ background:'linear-gradient(135deg,#1a0a00,#2a1500)', padding:20, position:'relative' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:'monospace', fontSize:14, fontWeight:900, color:'#FFD700' }}>DEAL OR FEUD 1000</div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.45)', marginTop:2 }}>Live Scoreboard · Round 3/5</div>
                </div>
                <span className="live-dot" style={{ background:'#E63000', color:'#fff', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:3, letterSpacing:'0.08em' }}>LIVE</span>
              </div>
              {/* Teams */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:8, alignItems:'center', marginBottom:12 }}>
                <div style={{ background:'rgba(255,45,170,.1)', border:'1px solid rgba(255,45,170,.3)', borderRadius:6, padding:'8px', textAlign:'center' }}>
                  <div style={{ fontSize:8, fontWeight:700, color:'#FF2DAA' }}>TEAM A</div>
                  <div style={{ fontSize:24, fontWeight:900 }}>{featured.scoreA}</div>
                  <div style={{ fontSize:7, color:'rgba(255,255,255,.35)' }}>Live Scorers</div>
                </div>
                <div style={{ fontSize:12, fontWeight:900, color:'rgba(255,255,255,.4)' }}>VS</div>
                <div style={{ background:'rgba(0,229,255,.08)', border:'1px solid rgba(0,229,255,.2)', borderRadius:6, padding:'8px', textAlign:'center' }}>
                  <div style={{ fontSize:8, fontWeight:700, color:'#00E5FF' }}>TEAM B</div>
                  <div style={{ fontSize:24, fontWeight:900 }}>{featured.scoreB}</div>
                  <div style={{ fontSize:7, color:'rgba(255,255,255,.35)' }}>Challengers</div>
                </div>
              </div>
              {/* Heat meter */}
              <div style={{ height:4, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
                <div className="live-dot" style={{ height:4, width:'74%', background:'#FF2DAA', borderRadius:2 }} />
              </div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,.35)' }}>👁 {featured.viewers.toLocaleString()} watching · 💬 Active chat</div>
            </div>
            {/* Join panel */}
            <div style={{ padding:20, display:'flex', flexDirection:'column', justifyContent:'space-between', background:'rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>Deal or Feud 1000</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:12, lineHeight:1.5 }}>Survey-style team competition · Teams guess top answers · Audience votes and reacts · Live scoreboard</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14, fontSize:11, color:'rgba(255,255,255,.4)' }}>
                  <div>👥 {featured.viewers.toLocaleString()} in audience · {featured.seats} seats open</div>
                  <div>🚪 FREE entry · Arena</div>
                  <div>🏆 {featured.prize}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button onClick={() => setPending(gameToRoom(featured))} style={{
                  padding:'10px 20px', background:'#FF2DAA', color:'#fff', borderRadius:8,
                  fontSize:11, fontWeight:900, border:'none', cursor:'pointer', letterSpacing:'0.06em',
                }}>
                  JOIN LOBBY →
                </button>
                <Link href={`${featured.href}?mode=watch`} style={{
                  padding:'10px 16px', background:'transparent', color:'rgba(255,255,255,.55)',
                  border:'0.5px solid rgba(255,255,255,.15)', borderRadius:8,
                  fontSize:11, textDecoration:'none',
                }}>
                  Watch Mode
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Live game cards ── */}
        {liveGames.filter(g => g.id !== 'deal-or-feud' || cat !== 'all').length > 0 && (
          <>
            <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.2em', color:'#E63000', marginBottom:12 }}>🔴 LIVE NOW</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12, marginBottom:24 }}>
              {liveGames.filter(g => g.id !== 'deal-or-feud' || cat !== 'all').map(g => (
                <div key={g.id} className="game-card" style={{
                  background:`${g.color}0c`, border:`1px solid ${g.color}40`, borderRadius:12, overflow:'hidden',
                }}>
                  {/* Preview top bar */}
                  <div style={{ height:4, background:`linear-gradient(90deg,${g.color},${g.color}44)` }} />
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <span className="live-dot" style={{ background:'#E63000', color:'#fff', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:3, letterSpacing:'0.08em' }}>LIVE</span>
                      <span style={{ fontSize:9, color:'rgba(255,255,255,.35)' }}>👁 {g.viewers.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize:24, marginBottom:8 }}>{g.icon}</div>
                    <div style={{ fontSize:14, fontWeight:900, color:'#fff', marginBottom:4 }}>{g.title}</div>
                    {g.round !== '—' && <div style={{ fontSize:8, color:g.color, fontWeight:700, letterSpacing:'0.1em', marginBottom:6 }}>{g.round}</div>}
                    {/* Heat meter */}
                    <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden', marginBottom:10 }}>
                      <div style={{ height:3, background:g.color, borderRadius:2, width:`${Math.min(100, (g.viewers / 3000) * 100 + 10)}%` }} />
                    </div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', marginBottom:12 }}>{g.seats} seats open · 🏆 {g.prize}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setPending(gameToRoom(g))} style={{
                        flex:1, padding:'8px 0', background:g.color, color:'#050310',
                        borderRadius:7, fontSize:10, fontWeight:900, border:'none',
                        cursor:'pointer', letterSpacing:'0.06em',
                      }}>
                        JOIN LOBBY
                      </button>
                      <Link href={`${g.href}?mode=watch`} style={{
                        padding:'8px 12px', background:'rgba(255,255,255,.05)',
                        border:'0.5px solid rgba(255,255,255,.12)', borderRadius:7,
                        fontSize:10, color:'rgba(255,255,255,.5)', textDecoration:'none',
                      }}>
                        Watch
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Upcoming game cards ── */}
        {upcomingGames.length > 0 && (
          <>
            <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.2em', color:'rgba(255,255,255,.3)', marginBottom:12 }}>UPCOMING GAMES</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10, marginBottom:28 }}>
              {upcomingGames.map(g => (
                <div key={g.id} className="game-card" style={{
                  background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.08)',
                  borderRadius:10, padding:'14px 16px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:22 }}>{g.icon}</span>
                    <div style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,.8)' }}>{g.title}</div>
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.35)', marginBottom:8, lineHeight:1.4 }}>{g.seats.toLocaleString()} capacity · {g.prize}</div>
                  <Link href={g.href} style={{
                    display:'block', textAlign:'center', padding:'7px 0', fontSize:9, fontWeight:900,
                    background:`${g.color}12`, border:`0.5px solid ${g.color}40`,
                    borderRadius:6, color:g.color, textDecoration:'none', letterSpacing:'0.1em',
                  }}>
                    REMIND ME →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Join flow info bar */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, marginBottom:24, flexWrap:'wrap', fontSize:10 }}>
          <span style={{ color:'rgba(255,255,255,.35)', fontWeight:600 }}>JOIN FLOW:</span>
          {['Preview','Join Lobby','Access Check','Seat Assignment','AudienceScene','Watch / Participate'].map((s,i,a) => (
            <span key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'rgba(255,255,255,.6)' }}>{s}</span>
              {i < a.length-1 && <span style={{ color:'rgba(255,255,255,.2)' }}>→</span>}
            </span>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20, display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { href:'/arena',       label:'⚔️ Arena',         color:'#FF2DAA' },
            { href:'/battles',     label:'🥊 Battles',       color:'#FF2DAA' },
            { href:'/cypher',      label:'🎤 Cypher',        color:'#00E5FF' },
            { href:'/challenges',  label:'🏆 Challenges',    color:'#FFD700' },
            { href:'/leaderboard', label:'👑 Leaderboard',   color:'#FFD700' },
            { href:'/magazine',    label:'📰 Magazine',      color:'rgba(255,255,255,.4)' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              padding:'9px 18px', borderRadius:24, fontSize:11, fontWeight:800,
              background:`${l.color}10`, border:`1px solid ${l.color}30`,
              color:l.color, textDecoration:'none',
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
