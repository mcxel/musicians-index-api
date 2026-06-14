'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Performer {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  wins: number;
  rank: number;
}

interface BattleSlot {
  id: string;
  artist1: Performer;
  artist2: Performer | null;
  status: 'live' | 'upcoming' | 'open';
  format: '1-song' | '3-song' | '5-song' | 'cypher';
  prize: string;
  xp: number;
  startIn: number; // seconds
}

const GENRE_CONFIG: Record<string, { name: string; emoji: string; accent: string; bg: string; tagline: string }> = {
  'hip-hop':  { name: 'Hip-Hop',   emoji: '🎤', accent: '#FFD700', bg: '#0a0800', tagline: 'The crown is earned here.' },
  'rnb':      { name: 'R&B',       emoji: '🔥', accent: '#FF2DAA', bg: '#0a0008', tagline: 'Soul meets the stage.' },
  'rap':      { name: 'Rap',       emoji: '🎙️', accent: '#39FF14', bg: '#040a04', tagline: 'Bars hit different here.' },
  'edm':      { name: 'EDM',       emoji: '🎧', accent: '#00FFFF', bg: '#00080a', tagline: 'The drop never stops.' },
  'gospel':   { name: 'Gospel',    emoji: '🙏', accent: '#00FF88', bg: '#000a04', tagline: 'Faith, rhythm, stage.' },
  'jazz':     { name: 'Jazz',      emoji: '🎷', accent: '#AA2DFF', bg: '#04000a', tagline: 'Improvise the future.' },
  'pop':      { name: 'Pop',       emoji: '🎀', accent: '#FF6B35', bg: '#0a0400', tagline: 'Chart-toppers enter here.' },
  'soul':     { name: 'Soul',      emoji: '✨', accent: '#C8A2C8', bg: '#060408', tagline: 'Feel every note.' },
  'cypher':   { name: 'Cypher',    emoji: '⚡', accent: '#FF2DAA', bg: '#0a0005', tagline: 'Everyone gets a bar.' },
  'open-mic': { name: 'Open Mic',  emoji: '🎵', accent: '#00FF88', bg: '#000a06', tagline: 'Your stage. Your moment.' },
};

const SEED_PERFORMERS: Performer[] = [
  { id: 'p1', name: 'Wavetek',       emoji: '🎤', xp: 9840, wins: 47, rank: 1  },
  { id: 'p2', name: 'King Verse',    emoji: '🎵', xp: 9120, wins: 31, rank: 2  },
  { id: 'p3', name: 'Cold Spark',    emoji: '⚡', xp: 8760, wins: 28, rank: 3  },
  { id: 'p4', name: 'Mic Titan',     emoji: '🏆', xp: 8340, wins: 22, rank: 4  },
  { id: 'p5', name: 'Bar God',       emoji: '🔥', xp: 7980, wins: 19, rank: 5  },
  { id: 'p6', name: 'Southside Poet',emoji: '🌟', xp: 7610, wins: 16, rank: 6  },
];

function buildQueue(performers: Performer[]): BattleSlot[] {
  return [
    { id: 'q1', artist1: performers[0]!, artist2: performers[1]!, status: 'live',     format: '3-song', prize: '$125 + Belt',  xp: 500,  startIn: 0   },
    { id: 'q2', artist1: performers[2]!, artist2: performers[3]!, status: 'upcoming', format: '1-song', prize: '350 XP',       xp: 350,  startIn: 180 },
    { id: 'q3', artist1: performers[4]!, artist2: performers[5]!, status: 'upcoming', format: '1-song', prize: '250 XP',       xp: 250,  startIn: 360 },
    { id: 'q4', artist1: performers[0]!, artist2: null,           status: 'open',     format: 'cypher', prize: '150 XP',       xp: 150,  startIn: 540 },
  ];
}

function fmtCountdown(sec: number) {
  if (sec <= 0) return 'LIVE';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}

export default function GenreArenaPage({ params }: { params: { genre: string } }) {
  const cfg = GENRE_CONFIG[params.genre] ?? GENRE_CONFIG['hip-hop']!;
  const queue = buildQueue(SEED_PERFORMERS);
  const [slots, setSlots] = useState<BattleSlot[]>(queue);
  const [audience, setAudience] = useState(1842);
  const [votes, setVotes] = useState<Record<string, 1 | 2>>({});
  const [votePct, setVotePct] = useState({ a: 52, b: 48 });
  const [prediction, setPrediction] = useState<string | null>(null);
  const [curtainOpen, setCurtainOpen] = useState(true);
  const [chatLines, setChatLines] = useState<{ name: string; text: string; color: string }[]>([
    { name: 'DJ Blend',   text: 'Let\'s go Wavetek 🔥🔥',          color: '#00FFFF' },
    { name: 'Lani Flame', text: 'King Verse got this no cap 🎵',   color: '#FF2DAA' },
    { name: 'TMI Bot',    text: 'Who\'s winning this round? Vote!', color: '#FFD700' },
    { name: 'Fan_432',    text: 'First time watching — this is 🔥', color: '#AA2DFF' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const liveSlot = slots.find(s => s.status === 'live') ?? slots[0]!;

  // Countdown + audience drift
  useEffect(() => {
    const id = setInterval(() => {
      setSlots(prev => prev.map(s => ({ ...s, startIn: Math.max(0, s.startIn - 1) })));
      setAudience(a => a + Math.floor((Math.random() - 0.35) * 15));
      setVotePct(v => {
        const shift = (Math.random() - 0.5) * 3;
        const a = Math.min(99, Math.max(1, v.a + shift));
        return { a: Math.round(a), b: 100 - Math.round(a) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Bot chat drip
  useEffect(() => {
    const LINES = [
      { name: 'Crowd_1',   text: 'Bars are incredible tonight 🙌',     color: '#00FFFF' },
      { name: 'Big_Fan',   text: 'Vote Artist A let\'s go!',            color: '#FF2DAA' },
      { name: 'TMI Bot',   text: '+25 XP for watching 5 minutes!',      color: '#FFD700' },
      { name: 'Newcomer',  text: 'Just joined — what an entrance 👏',   color: '#AA2DFF' },
      { name: 'OldHead_G', text: 'Classic style from King Verse 🎵',    color: '#00FF88' },
    ];
    let idx = 0;
    const id = setInterval(() => {
      const line = LINES[idx % LINES.length]!;
      setChatLines(prev => [...prev.slice(-30), line]);
      idx++;
    }, 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatLines]);

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLines(prev => [...prev.slice(-30), { name: 'You', text: chatInput.trim(), color: cfg.accent }]);
    setChatInput('');
  }

  return (
    <main style={{ minHeight: '100vh', background: cfg.bg, color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes arenaPulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes curtainOpen{from{scaleY(1)}to{transform:scaleY(0)}}
        @keyframes voteBar{from{width:0}to{width:var(--w)}}
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(0,0,0,0.85)', borderBottom: `1px solid ${cfg.accent}33`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: cfg.accent, textDecoration: 'none', letterSpacing: '0.12em' }}>TMI</Link>
        <Link href="/arena" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Arenas</Link>
        <span style={{ fontSize: 11, color: cfg.accent, fontWeight: 700 }}>{cfg.emoji} {cfg.name} Arena</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', animation: 'arenaPulse 1.2s infinite' }} />
          <span style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.1em' }}>LIVE</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>👁 {audience.toLocaleString()} watching</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* === LEFT: Main Stage === */}
        <div>
          {/* Current battle header */}
          <div style={{ background: `linear-gradient(135deg, ${cfg.accent}14, rgba(5,5,16,0.95))`, border: `1px solid ${cfg.accent}33`, borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', animation: 'arenaPulse 1.2s infinite' }} />
              <span style={{ fontSize: 8, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.2em' }}>LIVE NOW</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>· {liveSlot.format.replace('-', ' ').toUpperCase()} FORMAT</span>
              <div style={{ marginLeft: 'auto', fontSize: 9, color: '#FFD700', fontWeight: 800, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 6, padding: '2px 8px' }}>
                🏆 {liveSlot.prize}
              </div>
            </div>

            {/* Artists vs display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
              {/* Artist A */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{liveSlot.artist1.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{liveSlot.artist1.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>#{liveSlot.artist1.rank} · {liveSlot.artist1.xp.toLocaleString()} XP</div>
                <button
                  onClick={() => setVotes(v => ({ ...v, [liveSlot.id]: 1 }))}
                  style={{
                    marginTop: 10, padding: '7px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 900,
                    background: votes[liveSlot.id] === 1 ? cfg.accent : 'rgba(255,255,255,0.08)',
                    color: votes[liveSlot.id] === 1 ? '#050510' : '#fff',
                    letterSpacing: '0.08em',
                  }}
                >
                  🔥 VOTE A
                </button>
              </div>

              {/* VS */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: cfg.accent, letterSpacing: '0.1em' }}>VS</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>ROUND 1</div>
              </div>

              {/* Artist B */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{liveSlot.artist2?.emoji ?? cfg.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{liveSlot.artist2?.name ?? 'Open Slot'}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{liveSlot.artist2 ? `#${liveSlot.artist2.rank} · ${liveSlot.artist2.xp.toLocaleString()} XP` : 'Join the battle'}</div>
                <button
                  onClick={() => setVotes(v => ({ ...v, [liveSlot.id]: 2 }))}
                  style={{
                    marginTop: 10, padding: '7px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 900,
                    background: votes[liveSlot.id] === 2 ? '#FF2DAA' : 'rgba(255,255,255,0.08)',
                    color: votes[liveSlot.id] === 2 ? '#050510' : '#fff',
                    letterSpacing: '0.08em',
                  }}
                >
                  🎤 VOTE B
                </button>
              </div>
            </div>

            {/* Live vote bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                <span>{liveSlot.artist1.name}: {votePct.a}%</span>
                <span>{liveSlot.artist2?.name ?? 'Open'}: {votePct.b}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${votePct.a}%`, background: `linear-gradient(90deg, ${cfg.accent}, #FF2DAA)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 4, textAlign: 'center' }}>
                {(votes[liveSlot.id] ? '✓ Your vote counted!' : 'Vote for your winner above')}
              </div>
            </div>
          </div>

          {/* Prediction system */}
          {!prediction ? (
            <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: '#FFD700', letterSpacing: '0.15em', marginBottom: 10 }}>🔮 PREDICTION · EARN +50 XP IF CORRECT</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPrediction(liveSlot.artist1.name)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.25)', cursor: 'pointer', background: 'rgba(255,215,0,0.1)', color: '#FFD700', fontSize: 11, fontWeight: 800 }}>
                  I think {liveSlot.artist1.name} wins
                </button>
                <button onClick={() => setPrediction(liveSlot.artist2?.name ?? 'B')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.25)', cursor: 'pointer', background: 'rgba(255,45,170,0.08)', color: '#FF2DAA', fontSize: 11, fontWeight: 800 }}>
                  I think {liveSlot.artist2?.name ?? 'B'} wins
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: '10px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔮</span>
              <span style={{ fontSize: 11, color: '#00FF88', fontWeight: 700 }}>Prediction locked: <strong>{prediction}</strong> wins · +50 XP if correct</span>
            </div>
          )}

          {/* Performer Queue */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>
              UPCOMING · AUDIENCE STAYS SEATED
            </div>
            {slots.filter(s => s.status !== 'live').map((slot, i) => (
              <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                  {i + 2}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                    {slot.artist1.name}{slot.artist2 ? ` vs ${slot.artist2.name}` : ' — Open Challenge'}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                    {slot.format.replace('-', ' ')} · {slot.prize}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>
                    {fmtCountdown(slot.startIn)}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                    {slot.status === 'upcoming' ? 'UP NEXT' : 'OPEN'}
                  </div>
                </div>
              </div>
            ))}

            {/* Join queue CTA */}
            <div style={{ padding: '14px 18px' }}>
              <Link href={`/battles/challenge/new?genre=${params.genre}&arena=true`} style={{
                display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8,
                background: `${cfg.accent}14`, border: `1px solid ${cfg.accent}35`,
                color: cfg.accent, fontSize: 10, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.08em',
              }}>
                + JOIN THE QUEUE
              </Link>
            </div>
          </div>
        </div>

        {/* === RIGHT: Chat + Stats === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Watching', val: audience.toLocaleString(), color: '#00FFFF' },
              { label: 'Genre',    val: cfg.name,                  color: cfg.accent },
              { label: 'XP Prize', val: `${liveSlot.xp}`,         color: '#FFD700'  },
              { label: 'Format',   val: liveSlot.format,           color: '#00FF88'  },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Live chat */}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
              LIVE CHAT
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280 }}>
              {chatLines.map((line, i) => (
                <div key={i} style={{ fontSize: 11, lineHeight: 1.4 }}>
                  <span style={{ color: line.color, fontWeight: 700 }}>{line.name}: </span>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>{line.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Say something..."
                maxLength={120}
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 14px', color: '#fff', fontSize: 12, outline: 'none' }}
              />
              <button type="submit" style={{ padding: '10px 14px', background: 'transparent', border: 'none', color: cfg.accent, fontSize: 14, cursor: 'pointer', fontWeight: 900 }}>
                ↑
              </button>
            </form>
          </div>

          {/* Tip + actions */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: 10 }}>ACTIONS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: '💰 TIP', href: `/tip?target=${liveSlot.artist1.id}`, color: '#FFD700' },
                { label: '🔥 HYPE', href: '#',           color: '#FF2DAA' },
                { label: '📰 ARTICLE', href: `/articles/performer/${liveSlot.artist1.id}`, color: '#00FFFF' },
                { label: '📋 FOLLOW', href: `/profile/performer/${liveSlot.artist1.id}`, color: '#AA2DFF' },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{ flex: '1 1 40%', padding: '8px 4px', borderRadius: 6, border: `1px solid ${a.color}33`, color: a.color, fontSize: 9, fontWeight: 800, textDecoration: 'none', textAlign: 'center', letterSpacing: '0.06em', background: `${a.color}08` }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Other arenas nav */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: 10 }}>MORE ARENAS</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Object.entries(GENRE_CONFIG).filter(([k]) => k !== params.genre).slice(0, 8).map(([slug, g]) => (
                <Link key={slug} href={`/arena/${slug}`} style={{ fontSize: 9, fontWeight: 700, color: g.accent, border: `1px solid ${g.accent}33`, borderRadius: 4, padding: '3px 8px', textDecoration: 'none', background: `${g.accent}08` }}>
                  {g.emoji} {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
