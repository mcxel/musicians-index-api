'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';

const PERFORMERS = ['Astra Nova', 'Wavetek', 'Lagos Burst', 'DJ Kraze', 'Nova Cipher', 'Flex King', 'Bar God', 'Prism Vex', 'Zion Freq', 'NovaQueen'];
const GENRES_P = ['R&B', 'Hip-Hop', 'Afrobeat', 'DJ', 'Cypher', 'Dance', 'Battle', 'EDM', 'Gospel', 'R&B'];
const EMOJIS = ['🎤', '🎧', '🎵', '💃', '🥁', '🎹', '🎸', '🎺', '🎻', '🎙️', '😂', '🌟'];

const RAIL1_MSGS = ['✦ ALL PERFORMERS WELCOME ✦', '🎧 DJs WANTED — JOIN BATTLE NIGHT', '😂 COMEDIANS WANTED — DIGITAL COMEDY NIGHT', '💃 DANCERS WANTED — DANCE-OFF CHALLENGES', '🎹 PRODUCERS WANTED — BEAT BATTLES LIVE', '🏢 VENUES WANTED — BOOK TALENT DIRECT', '📣 PROMOTERS WANTED — PROMOTE WORLDWIDE', '💼 SPONSORS WANTED — ADVERTISE FROM $25', '🎵 FREE GLOBAL PROMOTION — SIGN UP NOW', '🏆 CLIMB THE GLOBAL RANKINGS TODAY', '🎟 SELL TICKETS THROUGH TMI', '💰 EARN TIPS LIVE — PERFORMERS & DJs', '⚔️ JOIN BATTLE ARENA — COMPETE TONIGHT', '🎤 CYPHER ARENA OPEN — DROP IN ANYTIME', '🌍 GET DISCOVERED WORLDWIDE'];
const RAIL2_MSGS = ['★ BREAKING: CROWN CROWN CROWN — SEE WHO LEADS', '▶ LATEST BATTLES TONIGHT — TUNE IN NOW', '◆ MUSIC NEWS LIVE UPDATE — WAVETEK DEFENDS', '● TMI MAGAZINE ISSUE 25 OUT NOW — READ IT', '◉ BEAT MARKETPLACE OPEN — BUY/SELL BEATS', '▷ WORLD PREMIERE DROPPING TONIGHT AT MIDNIGHT', '◈ CYPHER CHAMPIONS — FINALS THIS SATURDAY', '◆ SPONSOR SPOTLIGHT — BEATS BY TMX ON TMI', '★ NEW ARTISTS JOINING — DISCOVERY CHARTS LIVE', '▶ AUDITIONS OPEN — ALL GENRES ACCEPTED'];

const VT_DATA = [
  { names: ['Wavetek', 'Astra Nova', 'Lagos Burst', 'DJ Kraze'], emojis: ['🎤', '🎵', '🎧', '💃'], viewers: [1284, 2140, 847, 3200] },
  { names: ['Nova Cipher', 'Bar God', 'Flex King', 'Prism Vex'], emojis: ['🎹', '🎸', '🎻', '🥁'], viewers: [920, 1650, 440, 2800] },
  { names: ['Zion Freq', 'Beat Lab', 'Verse XL', 'Soul Shaker'], emojis: ['🎺', '🎙️', '😂', '🌟'], viewers: [710, 1380, 590, 2200] },
];

export default function Home1CoverPage() {
  const [lTab, setLTab] = useState(0);
  const [rTab, setRTab] = useState(0);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [underlayDir, setUnderlayDir] = useState<'left' | 'right'>('right');
  const [magText, setMagText] = useState('');
  
  // Independent video tiles state
  const [vtIdx, setVtIdx] = useState([0, 0, 0]);
  const [vtViewers, setVtViewers] = useState([
    VT_DATA[0].viewers[0],
    VT_DATA[1].viewers[0],
    VT_DATA[2].viewers[0]
  ]);
  const [vtFlip, setVtFlip] = useState([false, false, false]);

  const [stats, setStats] = useState({ votes: 4948, watchers: 9282, tips: 4200 });

  // Typewriter effect
  useEffect(() => {
    const MAG_TEXT = 'MAGAZINE';
    let idx = 0;
    let phase = 'typing';
    let timeout: NodeJS.Timeout;

    const tick = () => {
      if (phase === 'typing') {
        setMagText(MAG_TEXT.slice(0, idx));
        idx++;
        if (idx > MAG_TEXT.length) {
          phase = 'holding';
          timeout = setTimeout(() => { phase = 'erasing'; tick(); }, 1000);
          return;
        }
        timeout = setTimeout(tick, 110);
      } else if (phase === 'erasing') {
        setMagText('');
        idx = 0;
        phase = 'typing';
        timeout = setTimeout(tick, 400);
      }
    };
    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Independent video tile timers
  useEffect(() => {
    const intervals = [9500, 13200, 17000];
    const offsets = [0, 2300, 4600];
    const timeouts: NodeJS.Timeout[] = [];
    const intervalRefs: NodeJS.Timeout[] = [];

    intervals.forEach((interval, i) => {
      timeouts.push(
        setTimeout(() => {
          intervalRefs.push(
            setInterval(() => {
              setVtFlip(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
              
              setTimeout(() => {
                setVtIdx(prev => {
                  const next = [...prev];
                  next[i] = (next[i] + 1) % VT_DATA[i].names.length;
                  return next;
                });
                setVtViewers(prev => {
                  const next = [...prev];
                  const currentIdx = (vtIdx[i] + 1) % VT_DATA[i].names.length;
                  next[i] = VT_DATA[i].viewers[currentIdx] + Math.floor(Math.random() * 200) - 100;
                  return next;
                });
                setVtFlip(prev => {
                  const next = [...prev];
                  next[i] = false;
                  return next;
                });
              }, 300);
            }, interval)
          );
        }, offsets[i])
      );
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervalRefs.forEach(clearInterval);
    };
  }, [vtIdx]);

  // Live Stats Tick
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
    if (lTab === 0) {
      return (
        <>
          <div style={{ color: 'var(--pink)', fontWeight: 800, letterSpacing: '.1em', fontSize: '8px', marginBottom: '6px' }}>⭐ FREE PROMO SLOTS</div>
          {PERFORMERS.slice(0, 3).map((n, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,45,170,.2)', borderRadius: '5px', padding: '5px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                <div className="performer-img-circle" style={{ background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.4)' }}>{EMOJIS[i]}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{GENRES_P[i]}</div></div>
                <button className="btn" style={{ background: 'rgba(255,45,170,.2)', color: 'var(--pink)', border: '1px solid rgba(255,45,170,.3)', padding: '1px 5px', fontSize: '6px' }}>BOOST</button>
              </div>
              <div style={{ fontSize: '8px', color: 'var(--green)' }}>▲ {[2140, 980, 540][i].toLocaleString()} views</div>
            </div>
          ))}
          <div style={{ background: 'rgba(255,215,0,.05)', border: '1px dashed rgba(255,215,0,.3)', borderRadius: '5px', padding: '6px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '11px', marginBottom: '1px' }}>+</div><div style={{ fontSize: '8px', color: 'var(--gold)', fontWeight: 700 }}>Claim Free Slot</div>
          </div>
        </>
      );
    } else if (lTab === 1) {
      return (
        <>
          <div style={{ color: 'var(--amber)', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>🏟 VENUE BOOKING</div>
          {[['SAT', 'Main Arena'], ['SUN', 'Theater'], ['MON', 'Club Stage']].map(([d, v], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,140,0,.2)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: '8px', fontWeight: 700, color: 'var(--amber)' }}>{d} · {v}</div></div>
              <button className="btn" style={{ background: 'rgba(0,255,127,.12)', color: 'var(--green)', border: '1px solid rgba(0,255,127,.3)', fontSize: '7px', padding: '1px 5px' }}>BOOK</button>
            </div>
          ))}
          <button className="btn" style={{ width: '100%', background: 'var(--amber)', color: '#000', marginTop: '3px', padding: '5px' }}>Browse Dates</button>
        </>
      );
    } else {
      return (
        <>
          <div style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📢 AD SPACES</div>
          {[['Homepage Banner', '$120/day', 'HOT'], ['Arena Sidebar', '$80/day', 'OPEN'], ['Lobby Wall', '$60/day', 'OPEN']].map(([n, p, s], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(0,229,255,.18)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: '8px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: 'var(--gold)' }}>{p}</div></div>
              <div style={{ fontSize: '7px', fontWeight: 800, color: s === 'HOT' ? 'var(--red)' : 'var(--green)', background: s === 'HOT' ? 'rgba(230,48,0,.15)' : 'rgba(0,255,127,.1)', borderRadius: '3px', padding: '2px 5px' }}>{s}</div>
            </div>
          ))}
          <button className="btn" style={{ width: '100%', background: 'var(--cyan)', color: '#000', marginTop: '3px', padding: '5px', fontSize: '8px' }}>Buy Ad Slot</button>
        </>
      );
    }
  };

  const renderRightContent = () => {
    if (rTab === 0) {
      return (
        <>
          <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>👑 LIVE RANKINGS</div>
          {PERFORMERS.slice(0, 8).map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <div className="performer-img-circle" style={{ background: i === 0 ? 'rgba(255,45,170,.18)' : 'rgba(255,215,0,.12)', border: `1px solid ${i === 0 ? 'rgba(255,45,170,.3)' : 'rgba(255,215,0,.3)'}`, fontSize: '9px' }}>{EMOJIS[i]}</div>
              <span style={{ color: ['var(--gold)', '#C0C0C0', '#CD7F32', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.5)'][i], fontWeight: 800, fontSize: '9px', minWidth: '14px' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{GENRES_P[i]}</div></div>
              {i < 3 && <span className="live-dot" style={{ width: '4px', height: '4px' }}></span>}
            </div>
          ))}
          <button className="btn" style={{ width: '100%', background: 'rgba(255,215,0,.12)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,.25)', marginTop: '5px', padding: '4px', fontSize: '8px' }}>Full Leaderboard →</button>
        </>
      );
    } else if (rTab === 1) {
      return (
        <>
          <div style={{ color: 'var(--amber)', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📺 ACTIVE ADS</div>
          {[['Beats By TMX', '$86K', '72%'], ['BerntoutStudio AI', '$38K', '45%']].map(([n, s, p], i) => (
            <div key={i} style={{ background: 'rgba(0,229,255,.06)', border: '1px solid rgba(0,229,255,.2)', borderRadius: '5px', padding: '6px', marginBottom: '5px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--cyan)', marginBottom: '2px' }}>{n}</div>
              <div style={{ height: '4px', background: 'rgba(0,229,255,.15)', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}><div style={{ height: '4px', background: 'var(--cyan)', width: p }}></div></div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>{p} · {s} spent</div>
            </div>
          ))}
          <button className="btn" style={{ width: '100%', background: 'var(--amber)', color: '#000', padding: '5px', fontSize: '8px' }}>Advertise Here →</button>
        </>
      );
    } else {
      return (
        <>
          <div style={{ color: 'var(--pink)', fontWeight: 800, fontSize: '8px', letterSpacing: '.1em', marginBottom: '6px' }}>📣 PROMOTERS</div>
          {[['Promo Jay', '12 events', '$2.4K'], ['EventKing', '8 events', '$1.8K'], ['NightOwl', '6 events', '$980']].map(([n, e, r], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,45,170,.18)', borderRadius: '5px', padding: '5px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.35)' }}>{e}</div></div>
              <div style={{ fontSize: '8px', fontWeight: 700, color: 'var(--green)' }}>{r}</div>
            </div>
          ))}
          <button className="btn" style={{ width: '100%', background: 'rgba(255,45,170,.18)', color: 'var(--pink)', border: '1px solid rgba(255,45,170,.3)', marginTop: '3px', padding: '5px', fontSize: '8px' }}>Become Promoter →</button>
        </>
      );
    }
  };

  const panels = [
    { bg: '#FFD700', hdr: '#FF1493', title: 'WHO TOOK THE CROWN?', sub: 'COVER PERFORMER', artist: 'BIG ACE', tag: 'HIP-HOP · 4,812 VOTES', cta: 'CYPHER OPEN', c1: '#00BFFF' },
    { bg: '#FF1493', hdr: '#000', title: 'BATTLE NIGHT CHAMPION', sub: 'REIGNING CHAMP', artist: 'WAVETEK', tag: '47 WINS · HIP-HOP', cta: '⚔️ CHALLENGE 8PM', c1: '#FFD700' },
    { bg: '#00BFFF', hdr: '#000', title: "WHO'S GOT THE BARS?", sub: 'ON THE MIC NOW', artist: 'NOVA CIPHER', tag: 'CYPHER OPEN · 841 WATCHING', cta: 'DROP IN ANYTIME', c1: '#FF1493' },
    { bg: '#000', hdr: '#FFD700', title: 'CHALLENGE THE CROWN', sub: 'DEFENDING NOW', artist: 'BEAT THE BEAT', tag: 'WAVETEK · 841 VOTES', cta: 'ARENA SEATS 18,500', c1: '#FF1493' },
    { bg: '#9B59B6', hdr: '#FFD700', title: 'DJ BATTLE NIGHT', sub: 'CURRENT #1 DJ', artist: 'DJ KRAZE', tag: 'DJ · TURNTABLIST', cta: 'JOIN BATTLE QUEUE', c1: '#00BFFF' },
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg,#06021a 0%,#0a0528 40%,#08031e 100%)', fontFamily: "'Exo 2',sans-serif", color: '#fff', overflowX: 'hidden', position: 'relative', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400;600;700;800;900&family=Anton&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #06021a; --pink: #FF2DAA; --gold: #FFD700; --cyan: #00E5FF; --red: #E63000; --green: #00FF7F; --purple: #7B00FF; --amber: #FF8C00; }
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes counterOrbit { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
        @keyframes scrollLeft { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes scrollRight { from { transform: translateX(-50%) } to { transform: translateX(0%) } }
        @keyframes typeColor { 0% { color: #fff } 25% { color: var(--gold) } 50% { color: #00FF7F } 75% { color: var(--red) } 100% { color: #fff } }
        @keyframes centerGlow { 0%, 100% { box-shadow: 0 0 20px rgba(0,229,255,.5), 0 0 40px rgba(255,45,170,.3) } 50% { box-shadow: 0 0 40px rgba(0,229,255,.9), 0 0 70px rgba(255,45,170,.5) } }
        @keyframes panelIn { from { opacity: 0; transform: translateX(-14px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes panelInR { from { opacity: 0; transform: translateX(14px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes badgePulse { 0%, 100% { box-shadow: 0 0 6px rgba(255,45,170,.4) } 50% { box-shadow: 0 0 16px rgba(255,45,170,.8) } }
        @keyframes colorBg { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes floatStar { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-8px) rotate(5deg) } }
        @keyframes tileFlip { 0% { opacity: 1; transform: rotateY(0deg) } 40% { opacity: 0; transform: rotateY(90deg) } 60% { opacity: 0; transform: rotateY(-90deg) } 100% { opacity: 1; transform: rotateY(0deg) } }
        .live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #FF2020; animation: blink 1s infinite; vertical-align: middle; margin-right: 4px; }
        .twl { animation: typeColor 4s ease-in-out infinite; }
        .orbit-ring { animation: orbit 38s linear infinite; transform-origin: center; }
        .node-ctr { animation: counterOrbit 38s linear infinite; transform-origin: center; }
        .rail-l { animation: scrollLeft 22s linear infinite; display: flex; white-space: nowrap; width: max-content; }
        .rail-r { animation: scrollRight 18s linear infinite; display: flex; white-space: nowrap; width: max-content; }
        .btn { font-family: 'Exo 2', sans-serif; font-weight: 800; cursor: pointer; border-radius: 5px; padding: 6px 12px; border: none; transition: all .14s; text-transform: uppercase; font-size: 10px; letter-spacing: .05em; }
        .btn:hover { transform: scale(1.04); filter: brightness(1.2); }
        .tab-btn { font-family: 'Exo 2', sans-serif; font-size: 9px; font-weight: 800; cursor: pointer; border-radius: 4px; padding: 3px 8px; border: none; text-transform: uppercase; letter-spacing: .06em; flex: 1; transition: all .14s; }
        .center-glow { animation: centerGlow 3s ease-in-out infinite; }
        .video-tile { position: relative; border-radius: 5px; overflow: hidden; cursor: pointer; background: #060f1e; border: 1px solid rgba(255,255,255,.1); }
        .video-tile::before { content: ''; position: absolute; top: -100%; left: 0; right: 0; height: 2px; background: rgba(0,229,255,.3); animation: scanline 3s linear infinite; z-index: 3; }
        @keyframes scanline { 0% { top: -5% } 100% { top: 105% } }
        .video-tile .live-badge { position: absolute; top: 4px; left: 4px; background: var(--red); color: #fff; font-size: 6px; font-weight: 900; padding: 1px 5px; border-radius: 3px; z-index: 4; letter-spacing: .1em; }
        .video-tile .v-name { position: absolute; bottom: 3px; left: 4px; color: #fff; font-size: 7px; font-weight: 700; z-index: 4; }
        .video-tile .v-count { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,.65); color: var(--cyan); font-size: 6px; padding: 1px 4px; border-radius: 3px; z-index: 4; }
        .geo { position: absolute; pointer-events: none; opacity: .2; }
        .mag-panel { display: inline-flex; flex-direction: column; width: 210px; flex-shrink: 0; border: 3px solid #000; overflow: hidden; vertical-align: top; }
        .typewriter-cursor { animation: blink .7s ease-in-out infinite; color: var(--gold); }
        .left-panel-body { animation: panelIn .3s ease-out; }
        .right-panel-body { animation: panelInR .3s ease-out; }
        .performer-img-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
        .tmi-paper { position: fixed; inset: 0; z-index: 0; background: #e8d5aa; opacity: 0.035; pointer-events: none; mix-blend-mode: multiply; }
        .tmi-halftone { position: fixed; inset: 0; z-index: 1; background-image: radial-gradient(circle, rgba(0,0,0,0.9) 1px, transparent 1px); background-size: 5px 5px; opacity: 0.05; pointer-events: none; }
        .tmi-grain { position: fixed; inset: 0; z-index: 92; background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.9'/></svg>"); mix-blend-mode: multiply; opacity: 0.14; pointer-events: none; }
        .tmi-gloss { position: fixed; inset: 0; z-index: 93; background: linear-gradient(130deg, rgba(255,255,255,0.07) 0%, transparent 40%, rgba(0,0,0,0.06) 100%); mix-blend-mode: overlay; opacity: 0.5; pointer-events: none; }
        .challenge-loop { animation: challengeCycle 3.5s ease-in-out infinite; }
        @keyframes challengeCycle { 0%,8%{opacity:1;transform:translateY(0)} 16%,24%{opacity:0;transform:translateY(-8px)} 32%,40%{opacity:0;transform:translateY(8px)} 48%,100%{opacity:1;transform:translateY(0)} }
        @keyframes challengeSlot0 { 0%,20%{opacity:1;transform:translateY(0)} 25%,100%{opacity:0;transform:translateY(-14px)} }
        @keyframes challengeSlot1 { 0%,24%{opacity:0} 25%,45%{opacity:1;transform:translateY(0)} 50%,100%{opacity:0;transform:translateY(-14px)} }
        @keyframes challengeSlot2 { 0%,49%{opacity:0} 50%,70%{opacity:1;transform:translateY(0)} 75%,100%{opacity:0;transform:translateY(-14px)} }
        @keyframes challengeSlot3 { 0%,74%{opacity:0} 75%,95%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-14px)} }
      `}} />

      {/* 80s magazine print layers */}
      <div className="tmi-paper" aria-hidden="true" />
      <div className="tmi-halftone" aria-hidden="true" />

      {/* Background geometric accents */}
      <div className="geo" style={{ top: 80, right: 60, width: 60, height: 60, background: 'var(--gold)', transform: 'rotate(45deg)' }}></div>
      <div className="geo" style={{ top: 200, left: 20, width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: '42px solid var(--pink)' }}></div>
      <div className="geo" style={{ bottom: 200, right: 30, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderBottom: '30px solid var(--cyan)' }}></div>
      <div className="geo" style={{ top: 500, left: 40, width: 40, height: 40, background: 'var(--purple)', borderRadius: '50%' }}></div>
      <div className="geo" style={{ bottom: 350, left: 80, width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '26px solid var(--gold)' }}></div>
      <div className="geo" style={{ top: 350, right: 100, width: 35, height: 35, background: 'var(--pink)', transform: 'rotate(20deg)' }}></div>

      {/* BETA BAR */}
      <div style={{ background: 'rgba(230,48,0,.2)', borderBottom: '1px solid rgba(230,48,0,.35)', padding: '3px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
        <div style={{ color: 'var(--red)', fontWeight: 700, letterSpacing: '.12em' }}>✦ TMI BETA SEASON</div>
        <div style={{ color: 'rgba(255,255,255,.5)' }}>Founding Beta Member · Purchases & unlocks persist permanently</div>
        <div style={{ color: 'var(--gold)', fontWeight: 700, cursor: 'pointer' }}>DETAILS →</div>
      </div>

      {/* NAV */}
      <div style={{ background: 'rgba(6,2,26,.97)', borderBottom: '1px solid rgba(255,215,0,.15)', padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '15px', fontWeight: 900, color: 'var(--pink)' }}>TMI</div>
        <div style={{ display: 'flex', gap: '3px' }}>
          <Link href="/home/1"><button className="btn" style={{ background: 'var(--pink)', color: '#fff', borderRadius: '12px', padding: '3px 10px' }}>1</button></Link>
          <Link href="/home/1-2"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 9px' }}>1-2</button></Link>
          <Link href="/home/2"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>2</button></Link>
          <Link href="/home/3"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>3</button></Link>
          <Link href="/home/4"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>4</button></Link>
          <Link href="/home/5"><button className="btn" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', borderRadius: '12px', padding: '3px 10px' }}>5</button></Link>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn" style={{ background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.25)' }}>Log In</button>
          <button className="btn" style={{ background: 'var(--pink)', color: '#fff' }}>Sign Up</button>
        </div>
      </div>

      {/* MOVING RAIL #1 (TOP) → LEFT DIRECTION */}
      <div style={{ background: 'rgba(0,0,0,.5)', borderBottom: '1px solid rgba(255,215,0,.2)', overflow: 'hidden', height: '22px', position: 'relative' }}>
        <div className="rail-l">
          {Array(4).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {RAIL1_MSGS.map((m, j) => (
                <span key={`${i}-${j}`} style={{ fontSize: '9px', fontWeight: 700, color: 'var(--gold)', padding: '0 20px', lineHeight: '22px', whiteSpace: 'nowrap' }}>{m}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MAGAZINE HEADER */}
      <div style={{ background: 'linear-gradient(180deg,rgba(255,45,170,.2) 0%,rgba(6,2,26,1) 100%)', padding: '14px 16px 8px', textAlign: 'center', position: 'relative' }}>
        {/* Decorative stars */}
        <div style={{ position: 'absolute', top: 10, left: 30, fontSize: 16, opacity: .3, animation: 'floatStar 3s ease-in-out infinite' }}>⭐</div>
        <div style={{ position: 'absolute', top: 20, right: 40, fontSize: 12, opacity: .3, animation: 'floatStar 4s ease-in-out infinite .5s' }}>✦</div>

        {/* Status badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.6)', borderRadius: '4px', padding: '3px 10px', animation: 'badgePulse 2s ease-in-out infinite' }}>
            <span className="live-dot"></span><span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--pink)' }}>VOTING LIVE</span>
          </div>
          <div style={{ background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.5)', borderRadius: '4px', padding: '3px 12px', fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 700, color: 'var(--gold)' }}>{stats.votes.toLocaleString()} VOTES</div>
          <div style={{ background: 'rgba(230,48,0,.2)', border: '1px solid rgba(230,48,0,.5)', borderRadius: '4px', padding: '3px 10px', fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--red)' }}>CROWN UPDATING</div>
        </div>

        {/* MAIN TITLE - Per-letter color cycling */}
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: '46px', lineHeight: 1, letterSpacing: '.02em', marginBottom: '3px' }}>
          <span className="twl" style={{ animationDelay: '0s' }}>T</span><span className="twl" style={{ animationDelay: '.07s' }}>H</span><span className="twl" style={{ animationDelay: '.14s' }}>E</span>
          <span style={{ color: 'rgba(255,255,255,.2)' }}> </span>
          <span className="twl" style={{ animationDelay: '.21s' }}>M</span><span className="twl" style={{ animationDelay: '.28s' }}>U</span><span className="twl" style={{ animationDelay: '.35s' }}>S</span><span className="twl" style={{ animationDelay: '.42s' }}>I</span><span className="twl" style={{ animationDelay: '.49s' }}>C</span><span className="twl" style={{ animationDelay: '.56s' }}>I</span><span className="twl" style={{ animationDelay: '.63s' }}>A</span><span className="twl" style={{ animationDelay: '.7s' }}>N</span><span className="twl" style={{ animationDelay: '.77s' }}>'</span><span className="twl" style={{ animationDelay: '.84s' }}>S</span>
          <span style={{ color: 'rgba(255,255,255,.2)' }}> </span>
          <span className="twl" style={{ animationDelay: '.91s' }}>I</span><span className="twl" style={{ animationDelay: '.98s' }}>N</span><span className="twl" style={{ animationDelay: '1.05s' }}>D</span><span className="twl" style={{ animationDelay: '1.12s' }}>E</span><span className="twl" style={{ animationDelay: '1.19s' }}>X</span>
        </div>
        
        {/* MAGAZINE TYPEWRITER SUBTITLE */}
        <div style={{ height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, letterSpacing: '.3em', color: 'var(--gold)' }}>{magText}</span><span className="typewriter-cursor" style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', color: 'var(--gold)' }}>|</span>
        </div>

        {/* Challenge banner — animated rotating challenge types */}
        <Link href="/challenge/arena" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(123,0,255,.25),rgba(255,45,170,.15))', border: '1px solid rgba(123,0,255,.5)', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {/* animated bg shimmer */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%)', animation: 'colorBg 3s ease infinite', backgroundSize: '400% 100%' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', letterSpacing: '.12em', marginBottom: '3px' }}>⚔️ CHALLENGE YOUR SONG HERE</div>
              <div style={{ height: '18px', overflow: 'hidden', position: 'relative' }}>
                {['SONG FOR SONG · VIDEO FOR VIDEO · WORK FOR WORK', 'PUT YOUR MUSIC IN THE ARENA — AUDIENCE VOTES', 'TWO SCREENS · ONE WINNER · CROWD DECIDES', 'PASTE A LINK · CHALLENGE GOES LIVE NOW'].map((txt, i) => (
                  <div key={i} style={{ fontSize: '9px', color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '.06em', position: 'absolute', width: '100%', animation: `challengeSlot${i} 14s ease-in-out infinite`, animationDelay: `${i * 3.5}s` }}>{txt}</div>
                ))}
              </div>
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,.15)', border: '1px solid rgba(255,215,0,.4)', borderRadius: '20px', padding: '3px 12px' }}>
                <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '.1em' }}>ARENA OPEN — CHALLENGE NOW</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: 'rgba(0,255,127,.15)', color: '#00FF7F', border: '1px solid rgba(0,255,127,.4)' }}>JOIN FREE</button>
          <button className="btn" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.2)' }}>LOGIN</button>
          <button className="btn" style={{ background: 'rgba(255,215,0,.15)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,.35)' }}>CHALLENGE SONG</button>
          <button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,.3)' }}>CYPHER ARENA</button>
          <button className="btn" style={{ background: 'rgba(255,45,170,.12)', color: 'var(--pink)', border: '1px solid rgba(255,45,170,.3)' }}>MAGAZINE</button>
          <button className="btn" style={{ background: 'rgba(155,89,182,.12)', color: '#9B59B6', border: '1px solid rgba(155,89,182,.3)' }}>SPONSOR</button>
          <button className="btn" style={{ background: 'rgba(230,48,0,.12)', color: 'var(--red)', border: '1px solid rgba(230,48,0,.3)' }}>ADVERTISE</button>
        </div>
      </div>

      {/* ORBITAL + PANELS SECTION */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>

        {/* DIRECTION CONTROLS for tabloid underlay */}
        <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '5px', alignItems: 'center' }}>
          <button onClick={() => setUnderlayDir('left')} className="btn" style={{ background: underlayDir === 'left' ? 'rgba(255,215,0,.8)' : 'rgba(255,215,0,.15)', color: underlayDir === 'left' ? '#000' : 'var(--gold)', fontSize: '8px', padding: '2px 8px', border: underlayDir === 'right' ? '1px solid rgba(255,215,0,.3)' : 'none' }}>◀ TABLOID</button>
          <button onClick={() => setUnderlayDir('right')} className="btn" style={{ background: underlayDir === 'right' ? 'rgba(255,215,0,.8)' : 'rgba(255,215,0,.15)', color: underlayDir === 'right' ? '#000' : 'var(--gold)', border: underlayDir === 'left' ? '1px solid rgba(255,215,0,.3)' : 'none', fontSize: '8px', padding: '2px 8px' }}>TABLOID ▶</button>
        </div>

        {/* THE BIG TABLOID UNDERLAY (BEHIND orbital) */}
        <div style={{ overflow: 'hidden', position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: underlayDir === 'left' ? 'scrollLeft 16s linear infinite' : 'scrollRight 16s linear infinite', opacity: .9, width: 'max-content' }}>
            {Array(3).fill(0).map((_, idx) => (
              <React.Fragment key={idx}>
                {panels.map((p, i) => (
                  <div key={`${idx}-${i}`} className="mag-panel" style={{ background: p.bg, height: '200px' }}>
                    <div style={{ background: p.hdr, padding: '6px 8px' }}><div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>THE MUSICIAN'S INDEX · VOL.1 · $4.99</div></div>
                    <div style={{ padding: '10px 8px', flex: 1 }}>
                      <div style={{ fontFamily: "'Anton',sans-serif", fontSize: '22px', color: p.hdr === '#000' ? (p.bg === '#FF1493' ? '#FFD700' : p.bg === '#000' ? '#FFD700' : '#000') : '#000', lineHeight: 1, marginBottom: '5px' }}>{p.title}</div>
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

        {/* Radial vignette overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 88% at center,transparent 20%,rgba(6,2,26,.9) 100%)', pointerEvents: 'none', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(6,2,26,.9) 0%,transparent 18%,transparent 82%,rgba(6,2,26,.9) 100%)', pointerEvents: 'none', zIndex: 2 }}></div>

        {/* MAIN 3-RAIL LAYOUT */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'stretch', minHeight: '420px' }}>

          {/* LEFT PANEL */}
          <div style={{ display: 'flex', alignItems: 'stretch', marginRight: '6px', padding: '10px 0 10px 8px' }}>
            <div style={{ width: leftOpen ? '152px' : '0px', transition: 'all .35s ease', overflow: 'hidden' }}>
              <div className="left-panel-body" style={{ background: 'rgba(6,2,26,.95)', border: '1px solid rgba(255,45,170,.35)', borderRadius: '8px 0 0 8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '2px', padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <button className="tab-btn" onClick={() => setLTab(0)} style={{ background: lTab === 0 ? 'rgba(255,45,170,.25)' : 'rgba(255,255,255,.06)', color: lTab === 0 ? 'var(--pink)' : 'rgba(255,255,255,.4)' }}>PROMO</button>
                  <button className="tab-btn" onClick={() => setLTab(1)} style={{ background: lTab === 1 ? 'rgba(255,140,0,.2)' : 'rgba(255,255,255,.06)', color: lTab === 1 ? 'var(--amber)' : 'rgba(255,255,255,.4)' }}>VENUE</button>
                  <button className="tab-btn" onClick={() => setLTab(2)} style={{ background: lTab === 2 ? 'rgba(0,229,255,.15)' : 'rgba(255,255,255,.06)', color: lTab === 2 ? 'var(--cyan)' : 'rgba(255,255,255,.4)' }}>ADS</button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '6px 7px', fontSize: '9px' }}>
                  {renderLeftContent()}
                </div>
              </div>
            </div>
            <div onClick={() => setLeftOpen(!leftOpen)} style={{ background: 'rgba(255,45,170,.2)', border: '1px solid rgba(255,45,170,.4)', borderRadius: '0 5px 5px 0', width: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: '7px', fontWeight: 800, color: 'var(--pink)', letterSpacing: '.1em', userSelect: 'none' }}>
              {leftOpen ? '◂ PANEL' : '▸ PANEL'}
            </div>
          </div>

          {/* ORBITAL CENTER */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            {/* Weekly Crown Orbit label */}
            <div style={{ position: 'absolute', top: '4px', left: 0, right: 0, textAlign: 'center', zIndex: 15 }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', fontWeight: 900, color: 'var(--gold)', textShadow: '0 0 15px rgba(255,215,0,.6)' }}>WEEKLY CROWN ORBIT</div>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.15em' }}>TOP RANKED · LIVE NOW · REAL TIME</div>
            </div>

            {/* Orbital SVG rings */}
            <div style={{ position: 'relative', width: '340px', height: '340px' }}>
              <svg viewBox="0 0 340 340" width="340" height="340" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <circle cx="170" cy="170" r="164" fill="none" stroke="rgba(255,215,0,.12)" strokeWidth="1"/>
                <circle cx="170" cy="170" r="142" fill="none" stroke="rgba(255,45,170,.15)" strokeWidth=".7" strokeDasharray="4 9"/>
                <circle cx="170" cy="170" r="94" fill="none" stroke="rgba(0,229,255,.12)" strokeWidth=".6" strokeDasharray="3 11"/>
                <circle cx="170" cy="170" r="60" fill="rgba(6,2,26,.97)" stroke="rgba(0,229,255,.6)" strokeWidth="1.5"/>
                <circle cx="170" cy="170" r="56" fill="none" stroke="rgba(255,215,0,.2)" strokeWidth=".4"/>
                {/* Color glow behind orbital */}
                <circle cx="170" cy="170" r="164" fill="none" stroke="rgba(255,215,0,.04)" strokeWidth="30"/>
              </svg>

              {/* Rotating performer nodes */}
              <div className="orbit-ring" style={{ position: 'absolute', inset: 0, transformOrigin: '170px 170px' }}>
                <div className="node-ctr" style={{ position: 'absolute', top: '14px', left: '134px', transformOrigin: '36px 156px' }}><div style={{ background: 'rgba(255,45,170,.22)', border: '1.5px solid var(--pink)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--pink)', fontWeight: 800 }}>#1 <span className="live-dot" style={{ width: '4px', height: '4px' }}></span></div><div style={{ fontSize: '8px', fontWeight: 800 }}>ASTRA NOVA</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>R&B</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', top: '46px', right: '24px', transformOrigin: '-92px 124px' }}><div style={{ background: 'rgba(255,215,0,.18)', border: '1.5px solid var(--gold)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--gold)', fontWeight: 800 }}>#2</div><div style={{ fontSize: '8px', fontWeight: 800 }}>PRISM VEX</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>EDM</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', top: '122px', right: '10px', transformOrigin: '-124px 48px' }}><div style={{ background: 'rgba(0,255,127,.12)', border: '1.5px solid #00FF7F', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: '#00FF7F', fontWeight: 800 }}>#3</div><div style={{ fontSize: '8px', fontWeight: 800 }}>ZION FREQ</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Gospel</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', bottom: '62px', right: '20px', transformOrigin: '-98px -128px' }}><div style={{ background: 'rgba(0,229,255,.12)', border: '1.5px solid var(--cyan)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--cyan)', fontWeight: 800 }}>#4</div><div style={{ fontSize: '8px', fontWeight: 800 }}>FLEX KING</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Dance</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', bottom: '16px', left: '170px', transformOrigin: '-42px -156px' }}><div style={{ background: 'rgba(155,89,182,.18)', border: '1.5px solid #9B59B6', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: '#9B59B6', fontWeight: 800 }}>#5</div><div style={{ fontSize: '8px', fontWeight: 800 }}>SONG CHALL</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Hip-Hop</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', bottom: '16px', left: '130px', transformOrigin: '40px -156px' }}><div style={{ background: 'rgba(255,140,0,.14)', border: '1.5px solid var(--amber)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--amber)', fontWeight: 800 }}>#6</div><div style={{ fontSize: '8px', fontWeight: 800 }}>MAIN LOBBY</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Various</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', bottom: '62px', left: '10px', transformOrigin: '112px -126px' }}><div style={{ background: 'rgba(230,48,0,.18)', border: '1.5px solid var(--red)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--red)', fontWeight: 800 }}>#7 <span className="live-dot" style={{ width: '4px', height: '4px' }}></span></div><div style={{ fontSize: '8px', fontWeight: 800 }}>BATTLE FLR</div><div style={{ fontSize: '6px', color: 'var(--red)' }}>LIVE</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', top: '122px', left: '10px', transformOrigin: '126px 48px' }}><div style={{ background: 'rgba(255,215,0,.1)', border: '1.5px solid rgba(255,215,0,.4)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--gold)', fontWeight: 800 }}>#8</div><div style={{ fontSize: '8px', fontWeight: 800 }}>LAGOS BURST</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Afrobeat</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', top: '46px', left: '24px', transformOrigin: '92px 124px' }}><div style={{ background: 'rgba(0,229,255,.1)', border: '1.5px solid rgba(0,229,255,.35)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--cyan)', fontWeight: 800 }}>#9</div><div style={{ fontSize: '8px', fontWeight: 800 }}>NOVA LAUGH</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Comedy</div></div></div>
                <div className="node-ctr" style={{ position: 'absolute', top: '14px', left: '110px', transformOrigin: '60px 156px' }}><div style={{ background: 'rgba(255,45,170,.1)', border: '1.5px solid rgba(255,45,170,.3)', borderRadius: '6px', padding: '4px 7px', textAlign: 'center', minWidth: '72px' }}><div style={{ fontSize: '6px', color: 'var(--pink)', fontWeight: 800 }}>#10</div><div style={{ fontSize: '8px', fontWeight: 800 }}>DANCE CREW</div><div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)' }}>Dance</div></div></div>
              </div>

              {/* Center hub */}
              <div className="center-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '116px', height: '116px', borderRadius: '50%', background: 'rgba(6,2,26,.98)', border: '2px solid rgba(0,229,255,.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 15 }}>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.15em' }}>HOME 1/6</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: 'var(--pink)', lineHeight: 1.2, margin: '2px 0' }}>ASTRA<br/>NOVA</div>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.4)' }}>R&B · LIVE</div>
                <span className="live-dot" style={{ marginTop: '3px' }}></span>
              </div>
            </div>

            {/* BACK/NEXT arrows */}
            <div style={{ position: 'absolute', left: 0, bottom: '8px' }}><button className="btn" style={{ background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '5px 10px', borderRadius: '16px' }}>◀ BACK</button></div>
            <div style={{ position: 'absolute', right: 0, bottom: '8px' }}><button className="btn" style={{ background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '5px 10px', borderRadius: '16px' }}>NEXT ▶</button></div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: '6px', padding: '10px 8px 10px 0' }}>
            <div onClick={() => setRightOpen(!rightOpen)} style={{ background: 'rgba(255,215,0,.18)', border: '1px solid rgba(255,215,0,.4)', borderRadius: '5px 0 0 5px', width: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-lr', fontSize: '7px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '.1em', userSelect: 'none', transform: 'rotate(180deg)' }}>
              {rightOpen ? '◂ PANEL' : '▸ PANEL'}
            </div>
            <div style={{ width: rightOpen ? '152px' : '0px', transition: 'all .35s ease', overflow: 'hidden' }}>
              <div className="right-panel-body" style={{ background: 'rgba(6,2,26,.95)', border: '1px solid rgba(255,215,0,.35)', borderRadius: '0 8px 8px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '2px', padding: '5px 5px 4px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <button className="tab-btn" onClick={() => setRTab(0)} style={{ background: rTab === 0 ? 'rgba(255,215,0,.25)' : 'rgba(255,255,255,.06)', color: rTab === 0 ? 'var(--gold)' : 'rgba(255,255,255,.4)' }}>RANKS</button>
                  <button className="tab-btn" onClick={() => setRTab(1)} style={{ background: rTab === 1 ? 'rgba(255,140,0,.2)' : 'rgba(255,255,255,.06)', color: rTab === 1 ? 'var(--amber)' : 'rgba(255,255,255,.4)' }}>ADS</button>
                  <button className="tab-btn" onClick={() => setRTab(2)} style={{ background: rTab === 2 ? 'rgba(255,45,170,.2)' : 'rgba(255,255,255,.06)', color: rTab === 2 ? 'var(--pink)' : 'rgba(255,255,255,.4)' }}>PROMO</button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '6px 7px', fontSize: '9px' }}>
                  {renderRightContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOVING RAIL #2 (BELOW ORBITAL) ← RIGHT DIRECTION */}
      <div style={{ background: 'linear-gradient(90deg,var(--pink),var(--purple),var(--cyan),var(--gold),var(--pink))', backgroundSize: '400% 100%', animation: 'colorBg 8s ease infinite', overflow: 'hidden', height: '24px', position: 'relative', borderTop: '1px solid rgba(255,255,255,.15)', borderBottom: '1px solid rgba(255,255,255,.15)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }}></div>
        <div className="rail-r" style={{ position: 'relative', zIndex: 2 }}>
          {Array(4).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {RAIL2_MSGS.map((m, j) => (
                <span key={`${i}-${j}`} style={{ fontSize: '9px', fontWeight: 700, color: 'var(--cyan)', padding: '0 20px', lineHeight: '22px', whiteSpace: 'nowrap' }}>{m}</span>
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
            <div key={i} className="video-tile" style={{ aspectRatio: '16/9', animation: vtFlip[i] ? 'tileFlip .6s ease' : 'none' }}>
              <div className="live-badge">LIVE</div><div className="v-count">{vtViewers[i].toLocaleString()}</div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', opacity: .6 }}>{VT_DATA[i].emojis[vtIdx[i]]}</div>
              <div className="v-name">{VT_DATA[i].names[vtIdx[i]]}</div>
            </div>
          ))}
        </div>
        {/* Sponsor Ad Rail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div style={{ background: 'rgba(255,215,0,.06)', border: '1px solid rgba(255,215,0,.2)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>🎵 Beats By TMX</span>
            <button className="btn" style={{ background: 'rgba(255,215,0,.15)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,.25)', fontSize: '7px', padding: '2px 6px' }}>VISIT</button>
          </div>
          <div style={{ background: 'rgba(0,229,255,.05)', border: '1px solid rgba(0,229,255,.2)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>🎙 BerntoutStudio AI</span>
            <button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,.25)', fontSize: '7px', padding: '2px 6px' }}>TRY</button>
          </div>
          <div style={{ background: 'rgba(255,45,170,.05)', border: '1px solid rgba(255,45,170,.25)', borderRadius: '5px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', color: 'var(--pink)' }}>📢 ADVERTISE FROM $25</span>
            <button className="btn" style={{ background: 'var(--pink)', color: '#fff', fontSize: '7px', padding: '2px 6px' }}>→</button>
          </div>
        </div>
      </div>

      {/* BILLBOARD LIVE WALL — octagon/hexagon/torn-edge performer grid */}
      <div style={{ padding: '16px 12px 12px', background: 'rgba(0,0,0,.45)', borderTop: '1px solid rgba(0,229,255,.12)', borderBottom: '1px solid rgba(0,229,255,.1)' }}>
        <BillboardLiveWall mode="home" maxTiles={12} title="LIVE RIGHT NOW" showActions />
      </div>

      {/* NEWS + INTERVIEWS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(255,215,0,.15)' }}>
        <div style={{ background: 'rgba(6,2,26,.98)', borderRight: '1px solid rgba(255,255,255,.07)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: '#fff' }}>NEWS BELT</div>
            <div style={{ background: 'rgba(255,45,170,.2)', border: '1px solid var(--pink)', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, color: 'var(--pink)' }}>ROLLING</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>⚔️ Battle Night — Wavetek holds crown 3rd week</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>🎤 Cypher Arena breaks attendance record</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', padding: '3px 0' }}>🌍 Krypt drops album midnight tonight</div>
          </div>
        </div>
        <div style={{ background: 'rgba(6,2,26,.98)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900, color: '#fff' }}>INTERVIEWS</div>
            <div style={{ background: 'rgba(0,255,127,.15)', border: '1px solid rgba(0,255,127,.4)', borderRadius: '3px', padding: '1px 6px', fontSize: '8px', fontWeight: 700, color: '#00FF7F' }}>NEW</div>
            <span className="live-dot" style={{ width: '5px', height: '5px' }}></span><span style={{ fontSize: '8px', color: 'var(--red)' }}>LIVE</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', marginBottom: '2px' }}>Amirah Wells: Touring, Healing</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>Exclusive sit-down about her journey from streets to stage. TMI's top R&B artist.</div>
        </div>
      </div>

      {/* CTA BUTTONS */}
      <div style={{ background: 'rgba(6,2,26,.97)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '5px' }}>
          <button className="btn" style={{ background: 'var(--purple)', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px' }}>JOIN TMI</button>
          <button className="btn" style={{ background: 'var(--cyan)', color: '#000', padding: '9px', fontSize: '11px', borderRadius: '7px' }}>READ MAGAZINE</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '5px' }}>
          <button className="btn" style={{ background: 'var(--pink)', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px' }}>VOTE LIVE</button>
          <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '9px', fontSize: '11px', borderRadius: '7px' }}>JOIN BATTLE</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <button className="btn" style={{ background: 'var(--gold)', color: '#000', padding: '7px', borderRadius: '6px' }}>SEE ROOMS</button>
          <button className="btn" style={{ background: 'rgba(0,229,255,.12)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,.3)', padding: '7px', borderRadius: '6px' }}>CYPHER</button>
          <button className="btn" style={{ background: 'rgba(155,89,182,.15)', color: '#9B59B6', border: '1px solid rgba(155,89,182,.3)', padding: '7px', borderRadius: '6px' }}>SPONSOR</button>
        </div>
        {/* Live stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px', padding: '5px 10px', background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,215,0,.12)', borderRadius: '6px' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: 'var(--pink)' }}>11</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)', letterSpacing: '.08em' }}>LIVE</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: 'var(--gold)' }}>{stats.watchers.toLocaleString()}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>WATCHING</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: 'var(--green)' }}>${(stats.tips >= 1000 ? (stats.tips / 1000).toFixed(1) + 'K' : stats.tips)}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>TIPS</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: 'var(--cyan)' }}>{stats.votes.toLocaleString()}</div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.3)' }}>VOTES</div></div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ background: 'rgba(6,2,26,.97)', borderTop: '1px solid rgba(255,255,255,.07)', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn" style={{ background: 'rgba(255,45,170,.18)', color: 'var(--pink)', border: '1px solid rgba(255,45,170,.35)' }}>SIGN IN</button>
          <button className="btn" style={{ background: 'var(--gold)', color: '#000' }}>+ SUBMIT</button>
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,.3)' }}><span className="live-dot" style={{ width: '4px', height: '4px' }}></span>11 VENUES LIVE</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.15)' }}>OPEN GUIDE</button>
          <button className="btn" style={{ background: 'rgba(230,48,0,.15)', color: 'var(--red)', border: '1px solid rgba(230,48,0,.3)' }}>BETA FEEDBACK</button>
        </div>
      </div>

      {/* 80s magazine print grain + gloss (rendered on top of everything) */}
      <div className="tmi-grain" aria-hidden="true" />
      <div className="tmi-gloss" aria-hidden="true" />
    </div>
  );
}