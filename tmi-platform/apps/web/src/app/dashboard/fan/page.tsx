'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdSenseSlot, { AD_SLOTS } from '@/components/ads/AdSenseSlot';

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }
interface Reaction { id: number; emoji: string; x: number; }

const TRACKS = [
  { title: 'Big Moves',       artist: 'Chario Ace',      label: 'Berntout Perductions', dur: '3:47' },
  { title: 'Wave Rider',      artist: 'BJM The Rapper',  label: 'BJM Beats',            dur: '4:12' },
  { title: 'Thunder Zone',    artist: 'Big KazhDog',     label: 'Big Kash Records',     dur: '3:21' },
  { title: 'Night Frequency', artist: 'Chario Ace',      label: 'Berntout Perductions', dur: '5:02' },
  { title: 'Sound Pressure',  artist: 'BJM The Rapper',  label: 'BJM Beats',            dur: '2:58' },
];

const ROOMS = [
  { name: 'Main Stage Room', genre: 'Hip-Hop · Chario Ace',   views: '1,204', icon: '🎤', featured: true,  live: true,  href: '/live/rooms' },
  { name: 'Battle Arena A',  genre: 'Rap Battle · Open',       views: '876',   icon: '⚔️',  featured: false, live: true,  href: '/battles/live' },
  { name: 'Cypher Lounge',   genre: 'Open Mic · All genres',   views: '432',   icon: '🔥',  featured: false, live: true,  href: '/cypher/live' },
  { name: 'Chill Beats',     genre: 'Lo-Fi · Instrumental',    views: '218',   icon: '🎵',  featured: false, live: false, href: '/live/rooms' },
];

const CROWD_COLORS = [
  { head: '#5C2A00', body: '#3d1a00', border: '#FF2DAA' },
  { head: '#8B2200', body: '#5a1500', border: '#00FFFF' },
  { head: '#2F1B0E', body: '#1e1006', border: '#FFD700' },
  { head: '#6B2C00', body: '#451c00', border: '#AA2DFF' },
  { head: '#4a1e00', body: '#2d1200', border: '#FF9500' },
  { head: '#703200', body: '#4a2000', border: '#00FF88' },
];

export default function FanDashboardPage() {
  const router = useRouter();
  const [user, setUser]           = useState<MeUser | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTrack, setActiveTrack] = useState(0);
  const [playing, setPlaying]     = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [chatMsg, setChatMsg]     = useState('');
  const rxIdRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        const r = (data.user.role ?? '').toLowerCase();
        if (r !== 'fan' && r !== 'user') { router.replace('/dashboard'); return; }
        setUser(data.user);
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  const fireReaction = useCallback((emoji: string) => {
    const id = ++rxIdRef.current;
    const x = 8 + Math.random() * 82;
    setReactions(prev => [...prev.slice(-10), { id, emoji, x }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 1500);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#00FFFF', fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING FAN HUB...</span>
    </div>
  );

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Fan';
  const displayTier = (user?.tier ?? 'free').toUpperCase();
  const track = TRACKS[activeTrack];

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Exo 2', 'Inter', sans-serif" }}>
      <style>{`
        @keyframes tmi-bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes tmi-blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes tmi-ticker{from{transform:translateX(110%)}to{transform:translateX(-110%)}}
        @keyframes tmi-spin-cd{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes tmi-eq{0%,100%{height:4px}50%{height:var(--eqh,12px)}}
        @keyframes tmi-float{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(.2);opacity:0}}
        @keyframes tmi-ad-pulse{0%,100%{opacity:.8}50%{opacity:1}}
        @keyframes tmi-flicker{0%,93%,100%{text-shadow:0 0 12px #FF2DAA,0 0 24px rgba(255,45,170,.4)}94%,99%{text-shadow:none}}
        .tmi-bobble{animation:tmi-bobble 1.8s ease-in-out infinite}
        .tmi-blink{animation:tmi-blink 1.2s ease-in-out infinite}
        .tmi-ticker{animation:tmi-ticker 18s linear infinite;white-space:nowrap}
        .tmi-spin-cd{animation:tmi-spin-cd 4s linear infinite}
        .tmi-eq{animation:tmi-eq .5s ease-in-out infinite}
        .tmi-float{animation:tmi-float 1.5s ease-out forwards}
        .tmi-ad-pulse{animation:tmi-ad-pulse 3s ease-in-out infinite}
        .tmi-flicker{animation:tmi-flicker 4s ease-in-out infinite}
        .tmi-room-card{background:rgba(12,20,50,.9);border:1px solid rgba(255,45,170,.35);border-radius:6px;overflow:hidden;cursor:pointer;transition:all .15s}
        .tmi-room-card:hover{border-color:#FF2DAA;box-shadow:0 0 10px rgba(255,45,170,.2)}
        .tmi-room-card.featured{border-color:#FFD700;box-shadow:0 0 8px rgba(255,215,0,.15)}
        .tmi-ptrack{padding:5px 8px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background .12s}
        .tmi-ptrack:hover{background:rgba(255,45,170,.15)}
        .tmi-ptrack.active{background:rgba(255,45,170,.25);border-left:2px solid #FF2DAA}
        .tmi-action-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 6px;background:transparent;border:1px solid rgba(255,45,170,.4);color:rgba(255,140,0,.9);font-size:7px;font-weight:700;cursor:pointer;border-radius:4px;flex:1;min-width:38px;transition:all .15s}
        .tmi-action-btn:hover{background:rgba(255,45,170,.2);color:#FFD700}
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{ background: '#030610', borderBottom: '1px solid rgba(255,45,170,.3)', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span className="tmi-flicker" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 900, color: '#FF2DAA', letterSpacing: '.08em', textTransform: 'uppercase' }}>FAN THEATER ☠</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#00FFFF', fontWeight: 700 }}>{displayName}</span>
          <span style={{ fontSize: 9, background: 'rgba(255,215,0,.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,.3)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{displayTier}</span>
          <Link href="/pricing" style={{ fontSize: 9, color: '#FFD700', border: '1px solid rgba(255,215,0,.3)', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 700 }}>⭐ UPGRADE</Link>
          <Link href="/settings" style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.1)', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: 700 }}>⚙️</Link>
        </div>
      </div>

      <div style={{ padding: '8px 12px' }}>

        {/* ── TOP GRID: main area + sidebar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 162px', gap: 8, marginBottom: 8 }}>

          {/* LEFT MAIN */}
          <div>
            {/* Artist Spotlight */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase', marginBottom: 2 }}>Artist Spotlight</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 700, color: '#FFD700' }}>Chario Ace</div>
                <div style={{ fontSize: 10, color: '#FF2DAA', fontWeight: 600 }}>HIP-HOP</div>
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <Link href="/live/stages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', background: 'transparent', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', fontSize: 17, fontWeight: 700 }}>
                  <span>📡</span><span style={{ fontSize: 7 }}>SPIN</span>
                </Link>
                <Link href="/battles/live" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', background: 'transparent', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', fontSize: 17, fontWeight: 700 }}>
                  <span>✓</span><span style={{ fontSize: 7 }}>VOTE</span>
                </Link>
                <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 4, padding: '6px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.7)', textTransform: 'uppercase' }}>Next Show</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, color: '#FFD700' }}>8:00 PM</div>
                </div>
              </div>
            </div>

            {/* Marquee screen */}
            <div style={{ position: 'relative', border: '2px solid #FF2DAA', borderRadius: 8, overflow: 'hidden', background: '#06000a', height: 174, marginBottom: 6, boxShadow: '0 0 18px rgba(255,45,170,.3)' }}>
              <div style={{ position: 'absolute', inset: 12, borderRadius: 4, background: 'linear-gradient(to bottom, #0a0020, #050510)', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10 }}>
                {CROWD_COLORS.concat(CROWD_COLORS).map((c, i) => (
                  <div key={i} className="tmi-bobble" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${i * 0.13}s`, margin: '0 4px' }}>
                    <div style={{ width: 18 + (i % 3) * 3, height: 18 + (i % 3) * 3, borderRadius: '50%', background: c.head, border: `2px solid ${c.border}` }} />
                    <div style={{ width: 12 + (i % 3) * 2, height: 20, borderRadius: '3px 3px 0 0', background: c.body }} />
                  </div>
                ))}
              </div>
              {/* Floating reactions overlay */}
              {reactions.map(r => (
                <div key={r.id} className="tmi-float" style={{ position: 'absolute', bottom: 20, left: `${r.x}%`, fontSize: 20, pointerEvents: 'none', zIndex: 10 }}>{r.emoji}</div>
              ))}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#FF2DAA,transparent)' }} />
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="tmi-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 5px #00FF88', display: 'inline-block' }} />
                <span style={{ fontSize: 8, fontWeight: 900, color: '#00FF88', letterSpacing: 1 }}>LIVE</span>
              </div>
            </div>

            {/* Reaction dock */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 6, marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[['👍','Thank You'],['❤️','Hearts'],['✋','Flicker'],['🎉','Confetti'],['⚡','Spark'],['🎵','Vibe']].map(([em, lbl]) => (
                  <button key={lbl} className="tmi-action-btn" onClick={() => fireReaction(em)}>
                    <span style={{ fontSize: 15 }}>{em}</span>{lbl}
                  </button>
                ))}
                <div className="tmi-ad-pulse" style={{ flex: 1, minWidth: 50, background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.3)', borderRadius: 5, padding: '5px 4px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ position: 'absolute', top: 2, right: 3, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,140,0,.9)' }}>SPONSOR</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>Your Ad Here</div>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) { fireReaction('💬'); setChatMsg(''); }}}
              placeholder="Say something to the crowd..."
              style={{ width: '100%', background: 'rgba(12,20,50,.9)', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', fontSize: 11, outline: 'none', borderRadius: 4, padding: '7px 11px', boxSizing: 'border-box', marginBottom: 6 }}
            />

            {/* Fan analytics */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase' }}>Fan Analytics</span>
                <span style={{ fontSize: 9, color: '#00FFFF' }}>24 min session</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  {[['Watch time','24h'],['Tips sent','8'],['Artists followed','3']].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,140,0,.5)' }}>{lbl}</span>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#FFD700', fontSize: 11 }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
                  {[35,58,25,80,100,70,88].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 75 ? '#FFD700' : h > 55 ? '#FF9500' : '#FF2DAA', borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Cosmetic Shop */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 7 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>Cosmetic Shop</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                {[['🔴','FREE'],['💧','RAF'],['⭕','EPIC']].map(([em, lbl]) => (
                  <Link key={lbl} href="/store/fan" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 2px', background: 'transparent', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center' as const }}>
                    {em}<span style={{ fontSize: 7 }}>{lbl}</span>
                  </Link>
                ))}
              </div>
              <div className="tmi-ad-pulse" style={{ background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.28)', borderRadius: 5, padding: '5px 6px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', top: 2, right: 3, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#FF9500' }}>🎯 Upgrade to Gold</div>
                <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)', marginTop: 1 }}>Remove ads + bonus XP</div>
              </div>
            </div>

            {/* Billboard Fans */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 7, textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase', marginBottom: 4 }}>Billboard Fans</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#FFD700', fontSize: 18 }}>38.5K</div>
              <div style={{ fontSize: 9, color: '#FF9500', marginTop: 2 }}>SByeeGil</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 9, marginTop: 4 }}>
                <span>❤️ <strong style={{ color: '#FFD700' }}>8</strong></span>
                <span>🟡 <strong style={{ color: '#FFD700' }}>6</strong></span>
              </div>
            </div>

            {/* XP Points */}
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 7, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                <span>🟠</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase' }}>XP Points</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 5 }}>⭐⭐⭐⭐⭐</div>
              <Link href="/pricing" style={{ display: 'block', width: '100%', padding: '4px', fontSize: 8, fontWeight: 700, border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', textAlign: 'center' as const, letterSpacing: '.05em', textTransform: 'uppercase' as const }}>UPGRADE</Link>
            </div>

            {/* Memory Wall */}
            <Link href="/live/lobby-wall" style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 7, textAlign: 'center' as const, textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,149,0,.8)', textTransform: 'uppercase', marginBottom: 3 }}>Memory Wall</div>
              <div style={{ fontSize: 16, marginBottom: 2 }}>🎞</div>
              <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>Videos · Audio · Images</div>
            </Link>

            {/* Sidebar AD */}
            <div className="tmi-ad-pulse" style={{ background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.28)', borderRadius: 5, padding: '9px 7px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 2, right: 3, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,140,0,.9)', marginBottom: 3 }}>🎵 BerntoutStudio AI</div>
              <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)', marginBottom: 5 }}>Make beats with AI. Free trial.</div>
              <Link href="/store" style={{ display: 'block', width: '100%', padding: '3px', fontSize: 8, fontWeight: 700, border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>TRY FREE</Link>
            </div>
          </div>
        </div>

        {/* ── PLAYLIST ENGINE ── */}
        <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid #00FFFF', borderRadius: 6, padding: 10, marginBottom: 8, boxShadow: '0 0 8px rgba(0,255,255,.25), 0 0 16px rgba(0,255,255,.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#00FFFF', fontWeight: 700 }}>🎵 PLAYLIST ENGINE</span>
              <span style={{ fontSize: 8, color: 'rgba(255,140,0,.5)', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', padding: '2px 6px', borderRadius: 3 }}>SUBMARINE SKIN v1</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['🔀 SHUFFLE','🔁 LOOP'].map(lbl => (
                <button key={lbl} style={{ fontSize: 8, padding: '3px 7px', background: 'transparent', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            {/* Spinning CD */}
            <div className="tmi-spin-cd" style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%,#1a0020,#050510)', border: '2px solid #00FFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animationPlayState: playing ? 'running' : 'paused' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#050510', border: '1px solid rgba(255,140,0,.4)' }} />
            </div>

            {/* Now playing */}
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: '#FFD700' }}>{track.title} – {track.artist}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,140,0,.5)', marginBottom: 5 }}>{track.label} · HIP-HOP</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
                {[16,12,16,14,10,16,13,16].map((h, i) => (
                  <span key={i} className={playing ? 'tmi-eq' : ''} style={{ ['--eqh' as string]: `${h}px`, height: playing ? `${Math.floor(h * 0.55)}px` : '4px', display: 'inline-block', width: 3, borderRadius: 1, background: '#FF2DAA', verticalAlign: 'bottom', margin: '0 1px', animationDelay: `${i * 0.07}s`, transition: 'height .2s' }} />
                ))}
              </div>
              <div style={{ marginTop: 5, height: 3, background: 'rgba(0,229,255,.2)', borderRadius: 2 }}>
                <div style={{ height: 3, background: '#00FFFF', borderRadius: 2, width: '38%', transition: 'width .5s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>1:24</span>
                <span style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>{track.dur}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => setActiveTrack(t => (t - 1 + TRACKS.length) % TRACKS.length)} style={{ fontSize: 11, padding: '4px 7px', background: 'transparent', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: 4, cursor: 'pointer' }}>⏮</button>
                <button onClick={() => setPlaying(p => !p)} style={{ fontSize: 13, padding: '4px 8px', background: 'transparent', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: 4, cursor: 'pointer' }}>{playing ? '⏸' : '▶'}</button>
                <button onClick={() => setActiveTrack(t => (t + 1) % TRACKS.length)} style={{ fontSize: 11, padding: '4px 7px', background: 'transparent', border: '1px solid #00FFFF', color: '#00FFFF', borderRadius: 4, cursor: 'pointer' }}>⏭</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9 }}>🔊</span>
                <input type="range" min="0" max="100" defaultValue="75" style={{ width: 60, accentColor: '#00FFFF' }} />
              </div>
            </div>
          </div>

          {/* Track list */}
          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
            {TRACKS.map((t, i) => (
              <div key={i} className={`tmi-ptrack${activeTrack === i ? ' active' : ''}`} onClick={() => setActiveTrack(i)}>
                <span style={{ fontSize: 8, color: 'rgba(255,140,0,.4)', width: 14 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: activeTrack === i ? '#FFD700' : 'rgba(255,140,0,.9)' }}>{t.title}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>{t.artist} · {t.label}</div>
                </div>
                <span style={{ fontSize: 7, color: activeTrack === i ? '#00FFFF' : 'rgba(255,140,0,.4)' }}>{t.dur}</span>
              </div>
            ))}
          </div>
          <div className="tmi-ad-pulse" style={{ background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.28)', borderRadius: 5, padding: '5px 8px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginTop: 7 }}>
            <span style={{ position: 'absolute', top: 2, right: 3, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
            <div style={{ fontSize: 8, color: 'rgba(255,140,0,.9)' }}>🎧 Rent-A-Charge Kiosks — Find one near you</div>
          </div>
        </div>

        {/* ── LIVE LOBBY WALL ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: '#FF2DAA', textTransform: 'uppercase', letterSpacing: '.08em' }}>🎭 LIVE LOBBY</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {['ALL ROOMS','HIP-HOP','BATTLES','CHILL'].map((f, i) => (
                <button key={f} style={{ fontSize: 8, padding: '3px 8px', background: i === 0 ? 'rgba(255,45,170,.25)' : 'transparent', border: '1px solid rgba(255,45,170,.4)', color: i === 0 ? '#FFD700' : 'rgba(255,140,0,.6)', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Bobblehead theater */}
          <div style={{ background: 'rgba(4,2,12,.98)', border: '1px solid rgba(255,45,170,.4)', borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 16px' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                {CROWD_COLORS.map((c, i) => (
                  <div key={i} className="tmi-bobble" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${i * 0.25}s` }}>
                    <div style={{ width: 20 + (i % 2) * 4, height: 20 + (i % 2) * 4, borderRadius: '50%', background: c.head, border: `2px solid ${c.border}` }} />
                    <div style={{ width: 14 + (i % 2) * 3, height: 22, borderRadius: '3px 3px 0 0', background: c.body }} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(255,140,0,.45)' }}>👁 WATCHING NOW</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#FFD700', fontSize: 22 }}>2,730</div>
                <div style={{ fontSize: 8, color: '#00FF88' }}>FANS IN LOBBY</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                {CROWD_COLORS.map((c, i) => (
                  <div key={i} className="tmi-bobble" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${i * 0.18 + 0.1}s` }}>
                    <div style={{ width: 20 + (i % 2) * 3, height: 20 + (i % 2) * 3, borderRadius: '50%', background: c.head, border: `2px solid ${CROWD_COLORS[(i + 2) % 6].border}` }} />
                    <div style={{ width: 14 + (i % 2) * 2, height: 22, borderRadius: '3px 3px 0 0', background: c.body }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#FF2DAA,transparent)', marginTop: 6 }} />
          </div>

          {/* Room card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 7 }}>
            {ROOMS.map((room, i) => (
              <Link key={i} href={room.href} style={{ textDecoration: 'none' }}>
                <div className={`tmi-room-card${room.featured ? ' featured' : ''}`}>
                  <div style={{ height: 64, background: room.featured ? '#0a0002' : '#030a0a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {room.icon}
                    {room.featured && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(transparent,#0a0002)' }} />}
                    <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span className={room.live ? 'tmi-blink' : ''} style={{ width: 5, height: 5, borderRadius: '50%', background: room.live ? '#00FF88' : '#FFD700', boxShadow: room.live ? '0 0 5px #00FF88' : '0 0 5px #FFD700', display: 'inline-block' }} />
                      <span style={{ fontSize: 7, color: room.live ? '#00FF88' : '#FFD700', fontWeight: 900 }}>{room.live ? 'LIVE' : 'SOON'}</span>
                    </div>
                    {room.featured && <div style={{ position: 'absolute', top: 4, right: 4, background: '#FFD700', borderRadius: 2, fontSize: 6, padding: '1px 4px', color: '#000', fontWeight: 700 }}>FEATURED</div>}
                  </div>
                  <div style={{ padding: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: room.featured ? '#FFD700' : 'rgba(255,140,0,.9)', marginBottom: 2 }}>{room.name}</div>
                    <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)', marginBottom: 4 }}>{room.genre}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,140,0,.7)' }}>👁 {room.views}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, border: `1px solid ${room.featured ? '#FFD700' : 'rgba(255,45,170,.4)'}`, color: room.featured ? '#FFD700' : 'rgba(255,140,0,.9)', borderRadius: 4, padding: '2px 6px' }}>ENTER</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Second lobby row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 7 }}>
            {[['🥁','Beat Factory','Production · 89 watching','/live/rooms'],['🎸','Rock Room','Rock · 142 watching','/live/rooms'],['🎹','Jazz Corner','Jazz · 67 watching','/live/rooms']].map(([icon, name, sub, href]) => (
              <Link key={name} href={href} style={{ textDecoration: 'none' }}>
                <div className="tmi-room-card">
                  <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(255,140,0,.9)', fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>{sub}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 700, border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, padding: '2px 5px' }}>JOIN</span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="tmi-ad-pulse" style={{ minWidth: 130, background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.28)', borderRadius: 5, padding: '7px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <span style={{ position: 'absolute', top: 2, right: 3, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#FF9500' }}>🎟 Stream &amp; Win Radio</div>
              <div style={{ fontSize: 7, color: 'rgba(255,140,0,.4)' }}>Win prizes every hour</div>
              <Link href="/radio" style={{ fontSize: 7, padding: '3px 8px', background: 'transparent', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' as const }}>LISTEN</Link>
            </div>
          </div>
        </div>

        {/* Footer banner AD */}
        <div className="tmi-ad-pulse" style={{ background: 'rgba(4,8,26,.95)', border: '1px solid rgba(255,140,0,.28)', borderRadius: 5, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', marginBottom: 8 }}>
          <span style={{ position: 'absolute', top: 2, right: 4, background: 'rgba(255,140,0,.18)', border: '1px solid rgba(255,140,0,.25)', borderRadius: 3, fontSize: 6, fontWeight: 700, color: 'rgba(255,140,0,.55)', padding: '1px 3px' }}>AD</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,140,0,.9)' }}>📺 HotScreens — Digital Billboard Network</div>
            <div style={{ fontSize: 8, color: 'rgba(255,140,0,.4)' }}>Advertise your music on 500+ screens nationwide</div>
          </div>
          <Link href="/advertiser" style={{ fontSize: 9, padding: '5px 12px', background: 'transparent', border: '1px solid rgba(255,45,170,.4)', color: 'rgba(255,140,0,.9)', borderRadius: 4, textDecoration: 'none', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' as const }}>LEARN MORE</Link>
        </div>

        {/* AdSense slot */}
        <AdSenseSlot slot={AD_SLOTS.dashboardSidebar} format="horizontal" label="ADVERTISEMENT" style={{ marginBottom: 8 }} />

        {/* Ticker */}
        <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,45,170,.35)', borderRadius: 6, padding: '5px 8px', overflow: 'hidden', marginBottom: 8 }}>
          <div className="tmi-ticker" style={{ fontSize: 8, color: '#FFD700' }}>
            🔴 LIVE: Chario Ace — Main Stage &nbsp;&nbsp;&nbsp; 🔥 Battle Arena: 3 rounds in progress &nbsp;&nbsp;&nbsp; 🆕 BJM The Rapper joined Cypher Lounge &nbsp;&nbsp;&nbsp; 💰 $2,400 in tips sent today &nbsp;&nbsp;&nbsp; 🎯 Beat Battle Tournament — 8PM Tonight &nbsp;&nbsp;&nbsp; 🏆 Billboard #1: Big KazhDog this week &nbsp;&nbsp;&nbsp;
          </div>
        </div>

      </div>
    </main>
  );
}
