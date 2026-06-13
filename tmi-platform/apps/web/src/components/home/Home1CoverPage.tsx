'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';

const PERFORMERS = ['Astra Nova', 'Wavetek', 'Lagos Burst', 'DJ Kraze', 'Nova Cipher', 'Flex King', 'Bar God', 'Prism Vex', 'Zion Freq', 'NovaQueen'];
const GENRES_P = ['R&B', 'Hip-Hop', 'Afrobeat', 'DJ', 'Cypher', 'Dance', 'Battle', 'EDM', 'Gospel', 'R&B'];
const EMOJIS = ['🎤', '🎧', '🎵', '💃', '🥁', '🎹', '🎸', '🎺', '🎻', '🎙️', '😂', '🌟'];

const RAIL1_MSGS = ['✦ FREE TO JOIN ✦', '🎤 CREATE YOUR PROFILE TODAY', '🌙 MONDAY NIGHT CYPHER — JOIN NOW', '⚔️ RAPPER VS RAPPER', '🎵 SINGER VS SINGER', '🥁 DRUMMER VS DRUMMER', '🎹 PIANO VS PIANO', '😂 COMEDIAN SHOWCASE', '💃 DANCE CHALLENGE', '📣 ADVERTISE STARTING AT $25', '🎟 SELL TICKETS THROUGH TMI', '💰 EARN TIPS LIVE', '🏢 GET BOOKED BY VENUES', '📻 STREAM & WIN RADIO', '✍️ WRITERS WANTED', '🤝 SPONSORS WANTED', '✦ ALL PERFORMERS WELCOME ✦', '🎧 DJs WANTED — JOIN BATTLE NIGHT', '🏆 CLIMB THE GLOBAL RANKINGS TODAY', '🌍 GET DISCOVERED WORLDWIDE'];
const RAIL2_MSGS = ['★ CHALLENGE YOUR SONG AGAINST ANOTHER SONG', '▶ JOKE-OFFS — BOOING ALLOWED (COMEDY BATTLES ONLY)', '◆ MUSIC NEWS LIVE UPDATE — WAVETEK DEFENDS', '● TMI MAGAZINE ISSUE 1 OUT NOW — READ IT', '◉ BEAT MARKETPLACE OPEN — BUY/SELL BEATS', '▷ WORLD PREMIERE DROPPING TONIGHT AT MIDNIGHT', '◈ CYPHER CHAMPIONS — FINALS THIS SATURDAY', '◆ SPONSOR SPOTLIGHT — BEATS BY TMX ON TMI', '★ NEW ARTISTS JOINING — DISCOVERY CHARTS LIVE', '▶ AUDITIONS OPEN — ALL GENRES ACCEPTED', '🎵 ADD YOUR SONGS TO PLAYLIST, ALL FREE', '⚠️ BOOING POLICY: ALLOWED ONLY FOR COMEDY + JOKE-OFFS'];

const VT_DATA = [
  { names: ['Wavetek', 'Astra Nova', 'Lagos Burst', 'DJ Kraze'], emojis: ['🎤', '🎵', '🎧', '💃'], viewers: [1284, 2140, 847, 3200] },
  { names: ['Nova Cipher', 'Bar God', 'Flex King', 'Prism Vex'], emojis: ['🎹', '🎸', '🎻', '🥁'], viewers: [920, 1650, 440, 2800] },
  { names: ['Zion Freq', 'Beat Lab', 'Verse XL', 'Soul Shaker'], emojis: ['🎺', '🎙️', '😂', '🌟'], viewers: [710, 1380, 590, 2200] },
];

// Scoped CSS — all class rules prefixed with .h1covpage to prevent bleed into other pages
const H1_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400;600;700;800;900&family=Anton&display=swap');
.h1covpage * { box-sizing: border-box; margin: 0; padding: 0; }
:root { --h1-pink: #FF2DAA; --h1-gold: #FFD700; --h1-cyan: #00E5FF; --h1-red: #E63000; --h1-green: #00FF7F; --h1-purple: #7B00FF; --h1-amber: #FF8C00; }
@keyframes h1blink { 0%,100%{opacity:1}50%{opacity:0} }
@keyframes h1orbit { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
@keyframes h1counterOrbit { from{transform:rotate(0deg)}to{transform:rotate(-360deg)} }
@keyframes h1scrollLeft { from{transform:translateX(0)}to{transform:translateX(-50%)} }
@keyframes h1scrollRight { from{transform:translateX(-50%)}to{transform:translateX(0%)} }
@keyframes h1typeColor { 0%{color:#fff}25%{color:var(--h1-gold)}50%{color:#00FF7F}75%{color:var(--h1-red)}100%{color:#fff} }
@keyframes h1centerGlow { 0%,100%{box-shadow:0 0 20px rgba(0,229,255,.5),0 0 40px rgba(255,45,170,.3)}50%{box-shadow:0 0 40px rgba(0,229,255,.9),0 0 70px rgba(255,45,170,.5)} }
@keyframes h1panelIn { from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)} }
@keyframes h1panelInR { from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)} }
@keyframes h1badgePulse { 0%,100%{box-shadow:0 0 6px rgba(255,45,170,.4)}50%{box-shadow:0 0 16px rgba(255,45,170,.8)} }
@keyframes h1colorBg { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
@keyframes h1floatStar { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(5deg)} }
@keyframes h1tileFlip { 0%{opacity:1;transform:rotateY(0deg)}40%{opacity:0;transform:rotateY(90deg)}60%{opacity:0;transform:rotateY(-90deg)}100%{opacity:1;transform:rotateY(0deg)} }
@keyframes h1scanline { 0%{top:-5%}100%{top:105%} }
@keyframes h1challengeSlot0 { 0%,20%{opacity:1;transform:translateY(0)}25%,100%{opacity:0;transform:translateY(-14px)} }
@keyframes h1challengeSlot1 { 0%,24%{opacity:0}25%,45%{opacity:1;transform:translateY(0)}50%,100%{opacity:0;transform:translateY(-14px)} }
@keyframes h1challengeSlot2 { 0%,49%{opacity:0}50%,70%{opacity:1;transform:translateY(0)}75%,100%{opacity:0;transform:translateY(-14px)} }
@keyframes h1challengeSlot3 { 0%,74%{opacity:0}75%,95%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-14px)} }
.h1covpage .live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#FF2020;animation:h1blink 1s infinite;vertical-align:middle;margin-right:4px}
.h1covpage .twl{animation:h1typeColor 4s ease-in-out infinite}
.h1covpage .orbit-ring{animation:h1orbit 38s linear infinite;transform-origin:center}
.h1covpage .node-ctr{animation:h1counterOrbit 38s linear infinite;transform-origin:center}
.h1covpage .rail-l{animation:h1scrollLeft 22s linear infinite;display:flex;white-space:nowrap;width:max-content}
.h1covpage .rail-r{animation:h1scrollRight 18s linear infinite;display:flex;white-space:nowrap;width:max-content}
.h1covpage .btn{font-family:'Exo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:5px;padding:6px 12px;border:none;transition:all .14s;text-transform:uppercase;font-size:10px;letter-spacing:.05em}
.h1covpage .btn:hover{transform:scale(1.04);filter:brightness(1.2)}
.h1covpage .tab-btn{font-family:'Exo 2',sans-serif;font-size:9px;font-weight:800;cursor:pointer;border-radius:4px;padding:3px 8px;border:none;text-transform:uppercase;letter-spacing:.06em;flex:1;transition:all .14s}
.h1covpage .center-glow{animation:h1centerGlow 3s ease-in-out infinite}
.h1covpage .video-tile{position:relative;border-radius:5px;overflow:hidden;cursor:pointer;background:#060f1e;border:1px solid rgba(255,255,255,.1)}
.h1covpage .video-tile::before{content:'';position:absolute;top:-100%;left:0;right:0;height:2px;background:rgba(0,229,255,.3);animation:h1scanline 3s linear infinite;z-index:3}
.h1covpage .video-tile .live-badge{position:absolute;top:4px;left:4px;background:var(--h1-red);color:#fff;font-size:6px;font-weight:900;padding:1px 5px;border-radius:3px;z-index:4;letter-spacing:.1em}
.h1covpage .video-tile .v-name{position:absolute;bottom:3px;left:4px;color:#fff;font-size:7px;font-weight:700;z-index:4}
.h1covpage .video-tile .v-count{position:absolute;top:4px;right:4px;background:rgba(0,0,0,.65);color:var(--h1-cyan);font-size:6px;padding:1px 4px;border-radius:3px;z-index:4}
.h1covpage .geo{position:absolute;pointer-events:none;opacity:.2}
.h1covpage .mag-panel{display:inline-flex;flex-direction:column;width:210px;flex-shrink:0;border:3px solid #000;overflow:hidden;vertical-align:top}
.h1covpage .typewriter-cursor{animation:h1blink .7s ease-in-out infinite;color:var(--h1-gold)}
.h1covpage .left-panel-body{animation:h1panelIn .3s ease-out}
.h1covpage .right-panel-body{animation:h1panelInR .3s ease-out}
.h1covpage .performer-img-circle{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
.h1covpage .tmi-paper{position:fixed;inset:0;z-index:0;background:#e8d5aa;opacity:0.035;pointer-events:none;mix-blend-mode:multiply}
.h1covpage .tmi-halftone{position:fixed;inset:0;z-index:1;background-image:radial-gradient(circle,rgba(0,0,0,0.9) 1px,transparent 1px);background-size:5px 5px;opacity:0.05;pointer-events:none}
.h1covpage .tmi-grain{position:fixed;inset:0;z-index:92;background-image:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.9'/></svg>");mix-blend-mode:multiply;opacity:0.14;pointer-events:none}
.h1covpage .tmi-gloss{position:fixed;inset:0;z-index:93;background:linear-gradient(130deg,rgba(255,255,255,0.07) 0%,transparent 40%,rgba(0,0,0,0.06) 100%);mix-blend-mode:overlay;opacity:0.5;pointer-events:none}
`;

export default function Home1CoverPage() {
  const [lTab, setLTab] = useState(0);
  const [rTab, setRTab] = useState(0);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [underlayDir, setUnderlayDir] = useState<'left' | 'right'>('right');
  const [magText, setMagText] = useState('');
  const [vtIdx, setVtIdx] = useState([0, 0, 0]);
  const [vtViewers, setVtViewers] = useState([VT_DATA[0].viewers[0], VT_DATA[1].viewers[0], VT_DATA[2].viewers[0]]);
  const [vtFlip, setVtFlip] = useState([false, false, false]);
  const [stats, setStats] = useState({ votes: 4948, watchers: 9282, tips: 4200 });

  // Typewriter
  useEffect(() => {
    const MAG_TEXT = 'MAGAZINE';
    let idx = 0, phase = 'typing';
    let timeout: NodeJS.Timeout;
    const tick = () => {
      if (phase === 'typing') {
        setMagText(MAG_TEXT.slice(0, idx)); idx++;
        if (idx > MAG_TEXT.length) { phase = 'holding'; timeout = setTimeout(() => { phase = 'erasing'; tick(); }, 1000); return; }
        timeout = setTimeout(tick, 110);
      } else if (phase === 'erasing') {
        setMagText(''); idx = 0; phase = 'typing'; timeout = setTimeout(tick, 400);
      }
    };
    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Independent video tile timers
  useEffect(() => {
    const intervals = [9500, 13200, 17000];
    const offsets = [0, 2300, 4600];
    const startTimeouts: NodeJS.Timeout[] = [];
    const rotateIntervals: NodeJS.Timeout[] = [];
    const flipTimeouts: NodeJS.Timeout[] = [];
    intervals.forEach((interval, i) => {
      const startId = setTimeout(() => {
        const intervalId = setInterval(() => {
          setVtFlip(prev => { const n = [...prev]; n[i] = true; return n; });
          const flipId = setTimeout(() => {
            let nextIndex = 0;
            setVtIdx(prev => { const n = [...prev]; nextIndex = (n[i] + 1) % VT_DATA[i].names.length; n[i] = nextIndex; return n; });
            setVtViewers(prev => { const n = [...prev]; n[i] = VT_DATA[i].viewers[nextIndex] + Math.floor(Math.random() * 200) - 100; return n; });
            setVtFlip(prev => { const n = [...prev]; n[i] = false; return n; });
          }, 300);
          flipTimeouts.push(flipId);
        }, interval);
        rotateIntervals.push(intervalId);
      }, offsets[i]);
      startTimeouts.push(startId);
    });
    return () => { startTimeouts.forEach(clearTimeout); rotateIntervals.forEach(clearInterval); flipTimeouts.forEach(clearTimeout); };
  }, []);

  // Live stats tick
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        votes: prev.votes + Math.floor(Math.random() * 8) + 2,
        watchers: Math.max(8500, prev.watchers + Math.floor((Math.random() - 0.35) * 40)),
        tips: prev.tips + Math.floor(Math.random() * 18)
      }));
      setVtViewers(prev => prev.map(v => Math.max(10, v + Math.floor((Math.random() - 0.4) * 80))));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const renderLeftContent = () => {
    if (lTab === 0) return (
      <>
        <div style={{ color: '#FF2DAA', fontWeight: 800, letterSpacing: '.1em', fontSize: '8px', marginBottom: '6px' }}>⭐ FREE PROMO SLOTS</div>
        {PERFORMERS.slice(0, 3).map((n, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,45,170,.2)', borderRadius: '5px', padding: '5px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <div className="performer-img-circle" style={{ background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.4)' }}>{EMOJIS[i]}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{GENRES_P[i]}</div></div>
              <Link href="/dashboard/performer"><button className="btn" style={{ background: 'rgba(255,45,170,.2)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,.3)', padding: '1px 5px', fontSize: '6px' }}>BOOST</button></Link>
            </div>
            <div style={{ fontSize: '8px', color: '#00FF7F' }}>▲ {[2140, 980, 540][i].toLocaleString()} views</div>
          </div>
        ))}
        <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: 'rgba(255,215,0,.05)', border: '1px dashed rgba(255,215,0,.3)', borderRadius: '5px', padding: '6px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '11px', marginBottom: '1px' }}>+</div><div style={{ fontSize: '8px', color: '#FFD700', fontWeight: 700 }}>Claim Free Slot</div>
          </div>
        </Link>
      </>
    );
    if (lTab === 1) return (
      <>
        <div style={{ color: '#FF8C00', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>🏟 VENUE BOOKING</div>
        {[['SAT', 'Main Arena'], ['SUN', 'Theater'], ['MON', 'Club Stage']].map(([d, v], i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,140,0,.2)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '8px', fontWeight: 700, color: '#FF8C00' }}>{d} · {v}</div></div>
            <Link href="/venues"><button className="btn" style={{ background: 'rgba(0,255,127,.12)', color: '#00FF7F', border: '1px solid rgba(0,255,127,.3)', fontSize: '7px', padding: '1px 5px' }}>BOOK</button></Link>
          </div>
        ))}
        <Link href="/venues" style={{ textDecoration: 'none', display: 'block' }}><button className="btn" style={{ width: '100%', background: '#FF8C00', color: '#000', marginTop: '3px', padding: '5px' }}>Browse Dates</button></Link>
      </>
    );
    return (
      <>
        <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📢 AD SPACES</div>
        {[['Homepage Banner', '$120/day', 'HOT'], ['Arena Sidebar', '$80/day', 'OPEN'], ['Lobby Wall', '$60/day', 'OPEN']].map(([n, p, s], i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(0,229,255,.18)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '8px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: '#FFD700' }}>{p}</div></div>
            <div style={{ fontSize: '7px', fontWeight: 800, color: s === 'HOT' ? '#E63000' : '#00FF7F', background: s === 'HOT' ? 'rgba(230,48,0,.15)' : 'rgba(0,255,127,.1)', borderRadius: '3px', padding: '2px 5px' }}>{s}</div>
          </div>
        ))}
        <Link href="/advertise" style={{ textDecoration: 'none', display: 'block' }}><button className="btn" style={{ width: '100%', background: '#00E5FF', color: '#000', marginTop: '3px', padding: '5px', fontSize: '8px' }}>Buy Ad Slot</button></Link>
      </>
    );
  };

  const renderRightContent = () => {
    if (rTab === 0) return (
      <>
        <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>👑 LIVE RANKINGS</div>
        {PERFORMERS.slice(0, 8).map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <div className="performer-img-circle" style={{ background: i === 0 ? 'rgba(255,45,170,.18)' : 'rgba(255,215,0,.12)', border: `1px solid ${i === 0 ? 'rgba(255,45,170,.3)' : 'rgba(255,215,0,.3)'}`, fontSize: '9px' }}>{EMOJIS[i]}</div>
            <span style={{ color: ['#FFD700', '#C0C0C0', '#CD7F32', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)'][i], fontWeight: 800, fontSize: '9px', minWidth: '14px' }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{GENRES_P[i]}</div></div>
            {i < 3 && <span className="live-dot" style={{ width: '4px', height: '4px' }}></span>}
          </div>
        ))}
        <Link href="/leaderboard" style={{ textDecoration: 'none', display: 'block' }}><button className="btn" style={{ width: '100%', background: 'rgba(255,215,0,.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,.25)', marginTop: '5px', padding: '4px', fontSize: '8px' }}>Full Leaderboard →</button></Link>
      </>
    );
    if (rTab === 1) return (
      <>
        <div style={{ color: '#FF8C00', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📺 ACTIVE ADS</div>
        {[['Beats By TMX', '$86K', '72%'], ['BerntoutStudio AI', '$38K', '45%']].map(([n, s, p], i) => (
          <div key={i} style={{ background: 'rgba(0,229,255,.06)', border: '1px solid rgba(0,229,255,.2)', borderRadius: '5px', padding: '6px', marginBottom: '5px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#00E5FF', marginBottom: '2px' }}>{n}</div>
            <div style={{ height: '4px', background: 'rgba(0,229,255,.15)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}><div style={{ height: '4px', background: '#00E5FF', width: p }}></div></div>
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>{p} · {s} spent</div>
          </div>
        ))}
        <Link href="/advertise" style={{ textDecoration: 'none', display: 'block' }}><button className="btn" style={{ width: '100%', background: '#FF8C00', color: '#000', padding: '5px', fontSize: '8px' }}>Advertise Here →</button></Link>
      </>
    );
    return (
      <>
        <div style={{ color: '#FF2DAA', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📣 PROMOTERS</div>
        {[['Promo Jay', '12 events', '$2.4K'], ['EventKing', '8 events', '$1.8K'], ['NightOwl', '6 events', '$980']].map(([n, e, r], i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,45,170,.18)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{e}</div></div>
            <div style={{ fontSize: '8px', fontWeight: 700, color: '#00FF7F' }}>{r}</div>
          </div>
        ))}
        <Link href="/promoter" style={{ textDecoration: 'none', display: 'block' }}><button className="btn" style={{ width: '100%', background: 'rgba(255,45,170,.18)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,.3)', marginTop: '3px', padding: '5px', fontSize: '8px' }}>Become Promoter →</button></Link>
      </>
    );
  };

  const panels = [
    { bg: '#FFD700', hdr: '#FF1493', title: 'WHO TOOK THE CROWN?', sub: 'COVER PERFORMER', artist: 'BIG ACE', tag: 'HIP-HOP · 4,812 VOTES', cta: 'CYPHER OPEN', c1: '#00BFFF' },
    { bg: '#FF1493', hdr: '#000', title: 'BATTLE NIGHT CHAMPION', sub: 'REIGNING CHAMP', artist: 'WAVETEK', tag: '47 WINS · HIP-HOP', cta: '⚔️ CHALLENGE 8PM', c1: '#FFD700' },
    { bg: '#00BFFF', hdr: '#000', title: "WHO'S GOT THE BARS?", sub: 'ON THE MIC NOW', artist: 'NOVA CIPHER', tag: 'CYPHER OPEN · 841 WATCHING', cta: 'DROP IN ANYTIME', c1: '#FF1493' },
    { bg: '#000', hdr: '#FFD700', title: 'CHALLENGE THE CROWN', sub: 'DEFENDING NOW', artist: 'BEAT THE BEAT', tag: 'WAVETEK · 841 VOTES', cta: 'ARENA SEATS 18,500', c1: '#FF1493' },
    { bg: '#9B59B6', hdr: '#FFD700', title: 'DJ BATTLE NIGHT', sub: 'CURRENT #1 DJ', artist: 'DJ KRAZE', tag: 'DJ · TURNTABLIST', cta: 'JOIN BATTLE QUEUE', c1: '#00BFFF' },
  ];

  return (
    <div className="h1covpage" style={{ background: 'linear-gradient(135deg,#06021a 0%,#0a0528 40%,#08031e 100%)', fontFamily: "'Exo 2',sans-serif", color: '#fff', overflowX: 'hidden', position: 'relative', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: H1_STYLES }} />

      {/* 80s print texture overlays */}
      <div className="tmi-paper" aria-hidden="true" />
      <div className="tmi-halftone" aria-hidden="true" />

      {/* Background geometric accents */}
      <div className="geo" style={{ top: 80, right: 60, width: 60, height: 60, background: '#FFD700', transform: 'rotate(45deg)' }} />
      <div className="geo" style={{ top: 200, left: 20, width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: '42px solid #FF2DAA' }} />
      <div className="geo" style={{ bottom: 200, right: 30, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '30px solid #00E5FF' }} />
      <div className="geo" style={{ top: 500, left: 40, width: 40, height: 40, background: '#7B00FF', borderRadius: '50%' }} />
      <div className="geo" style={{ bottom: 350, left: 80, width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '26px solid #FFD700' }} />
      <div className="geo" style={{ top: 350, right: 100, width: 35, height: 35, background: '#FF2DAA', transform: 'rotate(20deg)' }} />

      {/* BETA BAR */}
      <div style={{ background: 'rgba(230,48,0,.2)', borderBottom: '1px solid rgba(230,48,0,.35)', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
        <div style={{ color: '#E63000', fontWeight: 700, letterSpacing: '.12em' }}>✦ TMI BETA SEASON</div>
        <div style={{ color: 'rgba(255,255,255,.5)' }}>Founding Beta Member · Purchases & unlocks persist permanently</div>
        <Link href="/beta" style={{ textDecoration: 'none' }}><div style={{ color: '#FFD700', fontWeight: 700, cursor: 'pointer' }}>DETAILS →</div></Link>
      </div>

      {/* NAV */}
      <div style={{ background: 'rgba(6,2,26,.97)', borderBottom: '1px solid rgba(255,215,0,.15)', padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '15px', fontWeight: 900, color: '#FF2DAA' }}>TMI</div></Link>
        <div style={{ display: 'flex', gap: '3px' }}>
          <Link href="/home/1"><button className="btn" style={{ background: '#FF2DAA', color: '#fff', borderRadius: '12px', padding: '3px 10px' }}>1</button></Link>
          <Link href="/home/1-2"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 9px' }}>1-2</button></Link>
          <Link href="/home/2"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>2</button></Link>
          <Link href="/home/3"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>3</button></Link>
          <Link href="/home/4"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>4</button></Link>
          <Link href="/home/5"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>5</button></Link>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <Link href="/auth"><button className="btn" style={{ background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.25)' }}>Log In</button></Link>
          <Link href="/signup"><button className="btn" style={{ background: '#FF2DAA', color: '#fff' }}>Sign Up</button></Link>
        </div>
      </div>

      {/* MOVING RAIL #1 — left direction */}
      <div style={{ background: 'rgba(0,0,0,.5)', borderBottom: '1px solid rgba(255,215,0,.2)', overflow: 'hidden', height: '22px', position: 'relative' }}>
        <div className="rail-l">
          {Array(4).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {RAIL1_MSGS.map((m, j) => (
                <span key={`${i}-${j}`} style={{ fontSize: '9px', fontWeight: 700, color: '#FFD700', padding: '0 20px', lineHeight: '22px', whiteSpace: 'nowrap' }}>{m}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MAGAZINE HEADER */}
      <div style={{ background: 'linear-gradient(180deg,rgba(255,45,170,.2) 0%,rgba(6,2,26,1) 100%)', padding: '14px 16px 8px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: 30, fontSize: 16, opacity: .3, animation: 'h1floatStar 3s ease-in-out infinite' }}>⭐</div>
        <div style={{ position: 'absolute', top: 20, right: 40, fontSize: 12, opacity: .3, animation: 'h1floatStar 4s ease-in-out infinite .5s' }}>✦</div>

        {/* Status badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.6)', borderRadius: '4px', padding: '3px 10px', animation: 'h1badgePulse 2s ease-in-out infinite' }}>
            <span className="live-dot" /><span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', color: '#FF2DAA' }}>VOTING LIVE</span>
          </div>
          <div style={{ background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.5)', borderRadius: '4px', padding: '3px 12px', fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 700, color: '#FFD700' }}>{stats.votes.toLocaleString()} VOTES</div>
          <div style={{ background: 'rgba(230,48,0,.2)', border: '1px solid rgba(230,48,0,.5)', borderRadius: '4px', padding: '3px 10px', fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', color: '#E63000' }}>CROWN UPDATING</div>
        </div>

        {/* Title — per-letter color cycle */}
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: '46px', lineHeight: 1, letterSpacing: '.02em', marginBottom: '3px' }}>
          {['T','H','E'].map((c, i) => <span key={i} className="twl" style={{ animationDelay: `${i * .07}s` }}>{c}</span>)}
          <span style={{ color: 'rgba(255,255,255,.2)' }}> </span>
          {['M','U','S','I','C','I','A','N',"'",'S'].map((c, i) => <span key={i} className="twl" style={{ animationDelay: `${.21 + i * .07}s` }}>{c}</span>)}
          <span style={{ color: 'rgba(255,255,255,.2)' }}> </span>
          {['I','N','D','E','X'].map((c, i) => <span key={i} className="twl" style={{ animationDelay: `${.91 + i * .07}s` }}>{c}</span>)}
        </div>

        {/* Typewriter subtitle */}
        <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, letterSpacing: '.3em', color: '#FFD700' }}>{magText}</span>
          <span className="typewriter-cursor" style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', color: '#FFD700' }}>|</span>
        </div>

        {/* Challenge banner */}
        <Link href="/challenges" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(123,0,255,.25),rgba(255,45,170,.15))', border: '1px solid rgba(123,0,255,.5)', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%)', animation: 'h1colorBg 3s ease infinite', backgroundSize: '400% 100%' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', letterSpacing: '.12em', marginBottom: '3px' }}>⚔️ CHALLENGE YOUR SONG HERE</div>
              <div style={{ height: '18px', overflow: 'hidden', position: 'relative' }}>
                {['SONG FOR SONG · VIDEO FOR VIDEO · WORK FOR WORK', 'PUT YOUR MUSIC IN THE ARENA — AUDIENCE VOTES', 'TWO SCREENS · ONE WINNER · CROWD DECIDES', 'PASTE A LINK · CHALLENGE GOES LIVE NOW'].map((txt, i) => (
                  <div key={i} style={{ fontSize: '9px', color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '.06em', position: 'absolute', width: '100%', animation: `h1challengeSlot${i} 14s ease-in-out infinite`, animationDelay: `${i * 3.5}s` }}>{txt}</div>
                ))}
              </div>
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.4)', borderRadius: '20px', padding: '3px 12px' }}>
                <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#FFD700', letterSpacing: '.1em' }}>ARENA OPEN — CHALLENGE NOW</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <Link href="/signup"><button className="btn" style={{ background: 'rgba(0,255,127,.15)', color: '#00FF7F', border: '1px solid rgba(0,255,127,.4)' }}>JOIN FREE</button></Link>
          <Link href="/auth"><button className="btn" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.2)' }}>LOGIN</button></Link>
          <Link href="/challenges"><button className="btn" style={{ background: 'rgba(255,215,0,.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,.35)' }}>CHALLENGE SONG</button></Link>
          <Link href="/cypher"><button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: '#00E5FF', border: '1px solid rgba(0,229,255,.3)' }}>CYPHER ARENA</button></Link>
          <Link href="/magazine"><button className="btn" style={{ background: 'rgba(255,45,170,.12)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,.3)' }}>MAGAZINE</button></Link>
          <Link href="/sponsor"><button className="btn" style={{ background: 'rgba(155,89,182,.12)', color: '#9B59B6', border: '1px solid rgba(155,89,182,.3)' }}>SPONSOR</button></Link>
          <Link href="/advertise"><button className="btn" style={{ background: 'rgba(230,48,0,.12)', color: '#E63000', border: '1px solid rgba(230,48,0,.3)' }}>ADVERTISE</button></Link>
        </div>
      </div>

      {/* ORBITAL + PANELS SECTION */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Tabloid direction controls */}
        <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '5px', alignItems: 'center' }}>
          <button onClick={() => setUnderlayDir('left')} className="btn" style={{ background: underlayDir === 'left' ? 'rgba(255,215,0,.8)' : 'rgba(255,215,0,.15)', color: underlayDir === 'left' ? '#000' : '#FFD700', fontSize: '8px', padding: '2px 8px', border: underlayDir === 'right' ? '1px solid rgba(255,215,0,.3)' : 'none' }}>◀ TABLOID</button>
          <button onClick={() => setUnderlayDir('right')} className="btn" style={{ background: underlayDir === 'right' ? 'rgba(255,215,0,.8)' : 'rgba(255,215,0,.15)', color: underlayDir === 'right' ? '#000' : '#FFD700', border: underlayDir === 'left' ? '1px solid rgba(255,215,0,.3)' : 'none', fontSize: '8px', padding: '2px 8px' }}>TABLOID ▶</button>
        </div>

        {/* Tabloid underlay */}
        <div style={{ overflow: 'hidden', position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: underlayDir === 'left' ? 'h1scrollLeft 16s linear infinite' : 'h1scrollRight 16s linear infinite', opacity: .9, width: 'max-content' }}>
            {Array(3).fill(0).map((_, repIdx) => (
              <React.Fragment key={repIdx}>
                {panels.map((p, i) => (
                  <div key={`${repIdx}-${i}`} className="mag-panel" style={{ background: p.bg, height: '200px' }}>
                    <div style={{ background: p.hdr, padding: '6px 8px' }}><div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>THE MUSICIAN'S INDEX · VOL.1 · $4.99</div></div>
                    <div style={{ padding: '10px 8px', flex: 1 }}>
                      <div style={{ fontFamily: "'Anton',sans-serif", fontSize: '22px', color: p.hdr === '#000' ? (p.bg === '#FF1493' ? '#FFD700' : '#FFD700') : '#000', lineHeight: 1, marginBottom: '5px' }}>{p.title}</div>
                      <div style={{ background: p.c1, padding: '4px 6px', marginBottom: '3px' }}><div style={{ fontSize: '7px', fontWeight: 800, color: '#000' }}>{p.sub}</div><div style={{ fontFamily: "'Anton',sans-serif", fontSize: '14px', color: '#000' }}>{p.artist}</div></div>
                      <div style={{ fontSize: '7px', color: 'rgba(0,0,0,.6)' }}>{p.tag}</div>
                    </div>
                    <div style={{ background: '#000', padding: '4px 8px', fontSize: '7px', fontWeight: 700, color: p.hdr === '#000' ? p.c1 : '#FFD700' }}>{p.cta}</div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Vignette overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 88% at center,transparent 20%,rgba(6,2,26,.9) 100%)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(6,2,26,.9) 0%,transparent 18%,transparent 82%,rgba(6,2,26,.9) 100%)', pointerEvents: 'none', zIndex: 2 }} />

        {/* 3-rail layout */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'stretch', minHeight: '420px' }}>

          {/* LEFT PANEL */}
          <div style={{ display: 'flex', alignItems: 'stretch', marginRight: '6px', padding: '10px 0 10px 8px' }}>
            <div style={{ width: leftOpen ? '152px' : '0px', transition: 'all .35s ease', overflow: 'hidden' }}>
              <div className="left-panel-body" style={{ background: 'rgba(6,2,26,.95)', border: '1px solid rgba(255,45,170,.35)', borderRadius: '8px 0 0 8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '2px', padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <button className="tab-btn" onClick={() => setLTab(0)} style={{ background: lTab === 0 ? 'rgba(255,45,170,.25)' : 'rgba(255,255,255,.06)', color: lTab === 0 ? '#FF2DAA' : 'rgba(255,255,255,.4)' }}>PROMO</button>
                  <button className="tab-btn" onClick={() => setLTab(1)} style={{ background: lTab === 1 ? 'rgba(255,140,0,.2)' : 'rgba(255,255,255,.06)', color: lTab === 1 ? '#FF8C00' : 'rgba(255,255,255,.4)' }}>VENUE</button>
                  <button className="tab-btn" onClick={() => setLTab(2)} style={{ background: lTab === 2 ? 'rgba(0,229,255,.15)' : 'rgba(255,255,255,.06)', color: lTab === 2 ? '#00E5FF' : 'rgba(255,255,255,.4)' }}>ADS</button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '6px 7px', fontSize: '9px' }}>
                  {renderLeftContent()}
                </div>
              </div>
            </div>
            <div onClick={() => setLeftOpen(!leftOpen)} style={{ background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.4)', borderRadius: '0 5px 5px 0', width: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: '7px', fontWeight: 800, color: '#FF2DAA', letterSpacing: '.1em', userSelect: 'none' }}>
              {leftOpen ? '◂ PANEL' : '▸ PANEL'}
            </div>
          </div>

          {/* ORBITAL CENTER */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ position: 'absolute', top: '4px', left: 0, right: 0, textAlign: 'center', zIndex: 15 }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', fontWeight: 900, color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,.6)' }}>WEEKLY CROWN ORBIT</div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.15em' }}>TOP RANKED · LIVE NOW · REAL TIME</div>
            </div>

            <div style={{ position: 'relative', width: '340px', height: '340px' }}>
              <svg viewBox="0 0 340 340" width="340" height="340" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <circle cx="170" cy="170" r="164" fill="none" stroke="rgba(255,215,0,.12)" strokeWidth="1"/>
                <circle cx="170" cy="170" r="142" fill="none" stroke="rgba(255,45,170,.15)" strokeWidth=".7" strokeDasharray="4 9"/>
                <circle cx="170" cy="170" r="94" fill="none" stroke="rgba(0,229,255,.12)" strokeWidth=".6" strokeDasharray="3 11"/>
                <circle cx="170" cy="170" r="60" fill="rgba(6,2,26,.97)" stroke="rgba(0,229,255,.6)" strokeWidth="1.5"/>
                <circle cx="170" cy="170" r="56" fill="none" stroke="rgba(255,215,0,.2)" strokeWidth=".4"/>
                <circle cx="170" cy="170" r="164" fill="none" stroke="rgba(255,215,0,.04)" strokeWidth="30"/>
              </svg>

              {/* Rotating performer nodes */}
              <div className="orbit-ring" style={{ position: 'absolute', inset: 0, transformOrigin: '170px 170px' }}>
                {[
                  { pos: { top: '14px', left: '134px' }, origin: '36px 156px', color: '#FF2DAA', rank: '#1', name: 'ASTRA NOVA', genre: 'R&B', live: true },
                  { pos: { top: '46px', right: '24px' }, origin: '-92px 124px', color: '#FFD700', rank: '#2', name: 'PRISM VEX', genre: 'EDM', live: false },
                  { pos: { top: '122px', right: '10px' }, origin: '-124px 48px', color: '#00FF7F', rank: '#3', name: 'ZION FREQ', genre: 'Gospel', live: false },
                  { pos: { bottom: '62px', right: '20px' }, origin: '-98px -128px', color: '#00E5FF', rank: '#4', name: 'FLEX KING', genre: 'Dance', live: false },
                  { pos: { bottom: '16px', left: '170px' }, origin: '-42px -156px', color: '#9B59B6', rank: '#5', name: 'SONG CHALL', genre: 'Hip-Hop', live: false },
                  { pos: { bottom: '16px', left: '130px' }, origin: '40px -156px', color: '#FF8C00', rank: '#6', name: 'MAIN LOBBY', genre: 'Various', live: false },
                  { pos: { bottom: '62px', left: '10px' }, origin: '112px -126px', color: '#E63000', rank: '#7', name: 'BATTLE FLR', genre: 'LIVE', live: true },
                  { pos: { top: '122px', left: '10px' }, origin: '126px 48px', color: '#FFD700', rank: '#8', name: 'LAGOS BURST', genre: 'Afrobeat', live: false },
                  { pos: { top: '46px', left: '24px' }, origin: '92px 124px', color: '#00E5FF', rank: '#9', name: 'NOVA LAUGH', genre: 'Comedy', live: false },
                  { pos: { top: '14px', left: '110px' }, origin: '60px 156px', color: '#FF2DAA', rank: '#10', name: 'DANCE CREW', genre: 'Dance', live: false },
                ].map((node, i) => (
                  <div key={i} className="node-ctr" style={{ position: 'absolute', ...node.pos, transformOrigin: node.origin }}>
                    <div style={{ background: `rgba(${i===0?'255,45,170':i===6?'230,48,0':'255,255,255'},.14)`, border: `1.5px solid ${node.color}`, borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}>
                      <div style={{ fontSize: '6px', color: node.color, fontWeight: 800 }}>{node.rank} {node.live && <span className="live-dot" style={{ width: '4px', height: '4px' }} />}</div>
                      <div style={{ fontSize: '8px', fontWeight: 800 }}>{node.name}</div>
                      <div style={{ fontSize: '6.5px', color: 'rgba(255,255,255,.45)' }}>{node.genre}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center hub */}
              <div className="center-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '116px', height: '116px', borderRadius: '50%', background: 'rgba(6,2,26,.98)', border: '2px solid rgba(0,229,255,.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 15 }}>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.15em' }}>HOME 1/6</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: '#FF2DAA', lineHeight: 1.2, margin: '2px 0' }}>ASTRA<br/>NOVA</div>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.4)' }}>R&B · LIVE</div>
                <span className="live-dot" style={{ marginTop: '3px' }} />
              </div>
            </div>

            <div style={{ position: 'absolute', left: 0, bottom: '8px' }}>
              <Link href="/home/5"><button className="btn" style={{ background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '5px 10px', borderRadius: '16px' }}>◀ BACK</button></Link>
            </div>
            <div style={{ position: 'absolute', right: 0, bottom: '8px' }}>
              <Link href="/home/1-2"><button className="btn" style={{ background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '5px 10px', borderRadius: '16px' }}>NEXT ▶</button></Link>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: '6px', padding: '10px 8px 10px 0' }}>
            <div onClick={() => setRightOpen(!rightOpen)} style={{ background: 'rgba(255,215,0,.18)', border: '1px solid rgba(255,215,0,.4)', borderRadius: '5px 0 0 5px', width: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: '7px', fontWeight: 800, color: '#FFD700', letterSpacing: '.1em', userSelect: 'none', transform: 'rotate(180deg)' }}>
              {rightOpen ? '◂ PANEL' : '▸ PANEL'}
            </div>
            <div style={{ width: rightOpen ? '152px' : '0px', transition: 'all .35s ease', overflow: 'hidden' }}>
              <div className="right-panel-body" style={{ background: 'rgba(6,2,26,.95)', border: '1px solid rgba(255,215,0,.35)', borderRadius: '0 8px 8px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '2px', padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <button className="tab-btn" onClick={() => setRTab(0)} style={{ background: rTab === 0 ? 'rgba(255,215,0,.25)' : 'rgba(255,255,255,.06)', color: rTab === 0 ? '#FFD700' : 'rgba(255,255,255,.4)' }}>RANKS</button>
                  <button className="tab-btn" onClick={() => setRTab(1)} style={{ background: rTab === 1 ? 'rgba(255,140,0,.2)' : 'rgba(255,255,255,.06)', color: rTab === 1 ? '#FF8C00' : 'rgba(255,255,255,.4)' }}>ADS</button>
                  <button className="tab-btn" onClick={() => setRTab(2)} style={{ background: rTab === 2 ? 'rgba(255,45,170,.2)' : 'rgba(255,255,255,.06)', color: rTab === 2 ? '#FF2DAA' : 'rgba(255,255,255,.4)' }}>PROMO</button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '6px 7px', fontSize: '9px' }}>
                  {renderRightContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOVING RAIL #2 — right direction */}
      <div style={{ background: 'linear-gradient(90deg,#FF2DAA,#7B00FF,#00E5FF,#FFD700,#FF2DAA)', backgroundSize: '400% 100%', animation: 'h1colorBg 8s ease infinite', overflow: 'hidden', height: '24px', position: 'relative', borderTop: '1px solid rgba(255,255,255,.15)', borderBottom: '1px solid rgba(255,255,255,.15)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} />
        <div className="rail-r" style={{ position: 'relative', zIndex: 2 }}>
          {Array(4).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {RAIL2_MSGS.map((m, j) => (
                <span key={`${i}-${j}`} style={{ fontSize: '9px', fontWeight: 700, color: '#00E5FF', padding: '0 20px', lineHeight: '22px', whiteSpace: 'nowrap' }}>{m}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* VIDEO MONITORS */}
      <div style={{ background: 'rgba(0,0,0,.4)', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em' }}>🎬 LIVE PREVIEW MONITORS — HOME 1</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,.3)' }}>Each tile updates independently</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {[0, 1, 2].map(i => (
            <Link key={i} href="/battles" style={{ textDecoration: 'none' }}>
              <div className="video-tile" style={{ aspectRatio: '16/9', animation: vtFlip[i] ? 'h1tileFlip .6s ease' : 'none' }}>
                <div className="live-badge">LIVE</div>
                <div className="v-count">{vtViewers[i].toLocaleString()}</div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', opacity: .6 }}>{VT_DATA[i].emojis[vtIdx[i]]}</div>
                <div className="v-name">{VT_DATA[i].names[vtIdx[i]]}</div>
              </div>
            </Link>
          ))}
        </div>
        {/* Sponsor Ad Rail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div style={{ background: 'rgba(255,215,0,.06)', border: '1px solid rgba(255,215,0,.2)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>🎵 Beats By TMX</span>
            <Link href="/sponsor"><button className="btn" style={{ background: 'rgba(255,215,0,.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,.25)', fontSize: '7px', padding: '2px 6px' }}>VISIT</button></Link>
          </div>
          <div style={{ background: 'rgba(0,229,255,.05)', border: '1px solid rgba(0,229,255,.2)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>🎙 BerntoutStudio AI</span>
            <Link href="/magazine"><button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: '#00E5FF', border: '1px solid rgba(0,229,255,.25)', fontSize: '7px', padding: '2px 6px' }}>TRY</button></Link>
          </div>
          <div style={{ background: 'rgba(255,45,170,.05)', border: '1px solid rgba(255,45,170,.25)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: '#FF2DAA' }}>📢 ADVERTISE FROM $25</span>
            <Link href="/advertise"><button className="btn" style={{ background: '#FF2DAA', color: '#fff', fontSize: '7px', padding: '2px 6px' }}>→</button></Link>
          </div>
        </div>
      </div>

      {/* BILLBOARD LIVE WALL */}
      <div style={{ padding: '16px 12px 12px', background: 'rgba(0,0,0,.45)', borderTop: '1px solid rgba(0,229,255,.12)', borderBottom: '1px solid rgba(0,229,255,.1)' }}>
        <BillboardLiveWall mode="home" maxTiles={12} title="LIVE RIGHT NOW" showActions />
      </div>

      {/* NEWS + INTERVIEWS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(255,215,0,.15)' }}>
        <div style={{ background: 'rgba(6,2,26,.98)', borderRight: '1px solid rgba(255,255,255,.07)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: '#fff' }}>NEWS BELT</div>
            <div style={{ background: 'rgba(255,45,170,.2)', border: '1px solid #FF2DAA', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, color: '#FF2DAA' }}>ROLLING</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href="/magazine" style={{ textDecoration: 'none' }}><div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer' }}>⚔️ Battle Night — Wavetek holds crown 3rd week</div></Link>
            <Link href="/cypher" style={{ textDecoration: 'none' }}><div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)', cursor: 'pointer' }}>🎤 Cypher Arena breaks attendance record</div></Link>
            <Link href="/magazine" style={{ textDecoration: 'none' }}><div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0', cursor: 'pointer' }}>🌍 Krypt drops album midnight tonight</div></Link>
          </div>
        </div>
        <div style={{ background: 'rgba(6,2,26,.98)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: '#fff' }}>INTERVIEWS</div>
            <div style={{ background: 'rgba(0,255,127,.15)', border: '1px solid rgba(0,255,127,.4)', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, color: '#00FF7F' }}>NEW</div>
            <span className="live-dot" style={{ width: '5px', height: '5px' }} /><span style={{ fontSize: '8px', color: '#E63000' }}>LIVE</span>
          </div>
          <Link href="/magazine" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFD700', marginBottom: '2px', cursor: 'pointer' }}>Amirah Wells: Touring, Healing</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>Exclusive sit-down about her journey from streets to stage. TMI's top R&B artist.</div>
          </Link>
        </div>
      </div>

      {/* MAIN CTA BUTTONS */}
      <div style={{ background: 'rgba(6,2,26,.97)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '5px' }}>
          <Link href="/signup"><button className="btn" style={{ background: '#7B00FF', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px', width: '100%' }}>JOIN TMI</button></Link>
          <Link href="/magazine"><button className="btn" style={{ background: '#00E5FF', color: '#000', padding: '9px', fontSize: '11px', borderRadius: '7px', width: '100%' }}>READ MAGAZINE</button></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '5px' }}>
          <Link href="/battles"><button className="btn" style={{ background: '#FF2DAA', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px', width: '100%' }}>VOTE LIVE</button></Link>
          <Link href="/battles"><button className="btn" style={{ background: '#E63000', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px', width: '100%' }}>JOIN BATTLE</button></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <Link href="/rooms"><button className="btn" style={{ background: '#FFD700', color: '#000', padding: '7px', borderRadius: '6px', width: '100%' }}>SEE ROOMS</button></Link>
          <Link href="/cypher"><button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: '#00E5FF', border: '1px solid rgba(0,229,255,.3)', padding: '7px', borderRadius: '6px', width: '100%' }}>CYPHER</button></Link>
          <Link href="/sponsor"><button className="btn" style={{ background: 'rgba(155,89,182,.15)', color: '#9B59B6', border: '1px solid rgba(155,89,182,.3)', padding: '7px', borderRadius: '6px', width: '100%' }}>SPONSOR</button></Link>
        </div>

        {/* Live stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px', padding: '5px 10px', background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,215,0,.12)', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: '#FF2DAA' }}>11</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.08em' }}>LIVE</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: '#FFD700' }}>{stats.watchers.toLocaleString()}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>WATCHING</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: '#00FF7F' }}>${stats.tips >= 1000 ? (stats.tips / 1000).toFixed(1) + 'K' : stats.tips}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>TIPS</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: '#00E5FF' }}>{stats.votes.toLocaleString()}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>VOTES</div></div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ background: 'rgba(6,2,26,.97)', borderTop: '1px solid rgba(255,255,255,.07)', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Link href="/auth"><button className="btn" style={{ background: 'rgba(255,45,170,.18)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,.35)' }}>SIGN IN</button></Link>
          <Link href="/submit"><button className="btn" style={{ background: '#FFD700', color: '#000' }}>+ SUBMIT</button></Link>
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,.3)' }}><span className="live-dot" style={{ width: '4px', height: '4px' }} />11 VENUES LIVE</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Link href="/guide"><button className="btn" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.15)' }}>OPEN GUIDE</button></Link>
          <Link href="/feedback"><button className="btn" style={{ background: 'rgba(230,48,0,.15)', color: '#E63000', border: '1px solid rgba(230,48,0,.3)' }}>BETA FEEDBACK</button></Link>
        </div>
      </div>

      {/* Grain + gloss overlays (top of everything) */}
      <div className="tmi-grain" aria-hidden="true" />
      <div className="tmi-gloss" aria-hidden="true" />
    </div>
  );
}
