'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TMIHeadline, TMIConfetti, TMIPill } from '@/components/shared/TMIGeoBlock';

const CHALLENGE_TYPES = [
  { id: 'song',         label: 'Song Challenge',     icon: '🎵', color: '#FF2DAA', desc: 'Submit a song link. Best song wins.' },
  { id: 'video',        label: 'Video Challenge',    icon: '📹', color: '#AA2DFF', desc: 'Submit a performance video link.' },
  { id: 'battle',       label: 'Rap Battle',         icon: '⚔️', color: '#FF6B00', desc: 'Bars vs bars. Crowd votes.' },
  { id: 'dance-off',    label: 'Dance Off',          icon: '💃', color: '#00D4FF', desc: 'Dance video vs dance video.' },
  { id: 'dirty-dozen',  label: 'Dirty Dozen',        icon: '🎤', color: '#FFD700', desc: 'Comedy roast battle.' },
  { id: 'beat-battle',  label: 'Beat Battle',        icon: '🥁', color: '#00A896', desc: 'Producer vs producer. Your best beat.' },
  { id: 'sing-off',     label: 'Sing Off',           icon: '🎶', color: '#6B2FB3', desc: 'Vocal competition. Crowd decides.' },
  { id: 'freestyle',    label: 'Freestyle',          icon: '🔥', color: '#FF2DAA', desc: 'Open mic freestyle battle.' },
  { id: 'joke-off',     label: 'Joke Off',           icon: '😂', color: '#39FF14', desc: 'Comedy set. Funniest wins.' },
  { id: 'dance-battle', label: 'Dance Battle',       icon: '🕺', color: '#AA2DFF', desc: 'Choreography head-to-head.' },
  { id: 'live',         label: 'Go Live Now',        icon: '🔴', color: '#CC2200', desc: 'Start a live stream challenge now.' },
  { id: 'cypher',       label: 'Cypher Entry',       icon: '🎙️',  color: '#00D4FF', desc: 'Enter the open cypher round.' },
] as const;

type ChallengeTypeId = (typeof CHALLENGE_TYPES)[number]['id'];

const GENRES = ['Hip-Hop','R&B','Gospel','Jazz','EDM','Pop','Soul','Rap','Dance','Comedy','Spoken Word','Afrobeat'];

const URL_PLATFORMS = [
  { label: 'YouTube',     icon: '▶️',  placeholder: 'https://youtube.com/watch?v=...' },
  { label: 'Spotify',     icon: '🎵',  placeholder: 'https://open.spotify.com/track/...' },
  { label: 'SoundCloud',  icon: '🔊',  placeholder: 'https://soundcloud.com/...' },
  { label: 'TikTok',      icon: '📱',  placeholder: 'https://tiktok.com/@user/video/...' },
  { label: 'Instagram',   icon: '📸',  placeholder: 'https://instagram.com/p/...' },
  { label: 'Direct Link', icon: '🔗',  placeholder: 'https://...' },
];

export default function ChallengesCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams?.get('type') ?? 'song') as ChallengeTypeId;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<ChallengeTypeId>(defaultType);
  const [genre, setGenre] = useState('Hip-Hop');
  const [mediaUrl, setMediaUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState(0);
  const [openToAll, setOpenToAll] = useState(true);
  const [opponentSlug, setOpponentSlug] = useState('');
  const [usePointsWager, setUsePointsWager] = useState(false);
  const [pointsWager, setPointsWager] = useState(100);
  const [submitted, setSubmitted] = useState(false);
  const [ticker, setTicker] = useState(0);

  const selectedType = CHALLENGE_TYPES.find(t => t.id === type) ?? CHALLENGE_TYPES[0]!;

  useEffect(() => {
    const id = setInterval(() => setTicker(t => (t + 1) % 4), 1100);
    return () => clearInterval(id);
  }, []);

  function handleSubmit() {
    if (!mediaUrl.trim() && type !== 'live') return;
    setSubmitted(true);
    fetch('/api/challenges/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type, genre, title, mediaUrl,
        pointsWager: usePointsWager ? pointsWager : 0,
      }),
    }).catch(() => {});
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#050510', display: 'grid', placeItems: 'center', padding: 24 }}>
        <style>{`@keyframes tmiConfirmPop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{ textAlign: 'center', maxWidth: 480, animation: 'tmiConfirmPop 0.4s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔥</div>
          <TMIHeadline color="#FFD700" size="lg" align="center">CHALLENGE SUBMITTED!</TMIHeadline>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter',sans-serif", fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
            Your {selectedType.label} has been entered into the arena.<br />
            The crowd will vote. Winners are announced every week.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/battles" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#FF2DAA', color: '#fff', padding: '10px 24px', fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>VIEW ARENA</div>
            </Link>
            <Link href="/cypher/stage" style={{ textDecoration: 'none' }}>
              <div style={{ border: '2px solid #00C8FF', color: '#00C8FF', padding: '10px 24px', fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>JOIN CYPHER</div>
            </Link>
            <button type="button" onClick={() => { setSubmitted(false); setStep(1); setMediaUrl(''); setTitle(''); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)', padding: '10px 24px', fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
              CHALLENGE AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#f8f7f1', fontFamily: "'Bebas Neue','Impact',sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <TMIConfetti count={20} />
      <style>{`
        @keyframes tmiBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes tmiGlow{0%,100%{box-shadow:0 0 18px #FF2DAA66}50%{box-shadow:0 0 36px #FF2DAA99,0 0 60px #AA2DFF44}}
        input, textarea { outline: none; }
        input:focus, textarea:focus { border-color: #FF2DAA !important; }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(16px,3vw,32px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/challenges" style={{ textDecoration: 'none', fontSize: 9, fontFamily: "'Inter',sans-serif", fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ← CHALLENGES
          </Link>
        </div>

        <TMIHeadline color="#FF2DAA" size="lg">🎤 CHALLENGE YOUR SONG</TMIHeadline>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 900, color: '#FFD700', letterSpacing: '0.18em', marginTop: 4, marginBottom: 24 }}>
          SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO
        </div>

        {/* CMYK stripe */}
        <div style={{ display: 'flex', height: 5, marginBottom: 24 }}>
          {(['#FF2DAA','#FFD700','#AA2DFF','#00FF88','#FF4400'] as const).map(c => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, overflow: 'hidden' }}>
          {[1,2,3].map(s => (
            <div
              key={s}
              style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: step === s ? selectedType.color : step > s ? '#1a1a2e' : 'rgba(255,255,255,0.04)',
                borderRight: s < 3 ? '2px solid #050510' : undefined,
                cursor: step > s ? 'pointer' : 'default',
                transition: 'background 0.3s ease',
              }}
              onClick={() => step > s && setStep(s as 1|2|3)}
            >
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: step === s ? '#050510' : step > s ? '#FFD700' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                {step > s ? '✓' : `STEP ${s}`}
              </div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 7, color: step === s ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                {s === 1 ? 'CHALLENGE TYPE' : s === 2 ? 'YOUR MEDIA' : 'CONFIRM'}
              </div>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Challenge Type ── */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
              SELECT CHALLENGE TYPE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, marginBottom: 28 }}>
              {CHALLENGE_TYPES.map(ct => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setType(ct.id)}
                  style={{
                    background: type === ct.id ? `${ct.color}22` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${type === ct.id ? ct.color : 'rgba(255,255,255,0.1)'}`,
                    padding: '14px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: type === ct.id ? `0 0 16px ${ct.color}44` : 'none',
                    transition: 'all 0.2s ease',
                    animation: type === ct.id ? 'tmiGlow 2s ease infinite' : 'none',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ct.icon}</div>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: type === ct.id ? ct.color : '#fff', letterSpacing: '0.04em' }}>{ct.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>{ct.desc}</div>
                </button>
              ))}
            </div>

            {/* Genre select */}
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              GENRE
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {GENRES.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  style={{
                    background: genre === g ? selectedType.color : 'transparent',
                    border: `1px solid ${genre === g ? selectedType.color : 'rgba(255,255,255,0.2)'}`,
                    color: genre === g ? '#050510' : 'rgba(255,255,255,0.6)',
                    padding: '5px 14px', fontSize: 9, fontFamily: "'Inter',sans-serif",
                    fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                background: selectedType.color, color: '#fff',
                border: 'none', padding: '14px 40px',
                fontFamily: "'Bebas Neue','Impact',sans-serif",
                fontSize: 20, letterSpacing: '0.04em', cursor: 'pointer',
                boxShadow: `0 0 24px ${selectedType.color}66`,
                clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
              }}
            >
              NEXT: ADD YOUR MEDIA →
            </button>
          </div>
        )}

        {/* ── STEP 2: Media ── */}
        {step === 2 && (
          <div>
            <div style={{ background: `${selectedType.color}14`, border: `2px solid ${selectedType.color}44`, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>{selectedType.icon}</span>
              <div>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: selectedType.color }}>{selectedType.label} · {genre}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{selectedType.desc}</div>
              </div>
            </div>

            {type !== 'live' ? (
              <>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                  PLATFORM
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {URL_PLATFORMS.map((p, i) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setPlatform(i); setMediaUrl(''); }}
                      style={{
                        background: platform === i ? 'rgba(255,255,255,0.12)' : 'transparent',
                        border: `1px solid ${platform === i ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                        color: platform === i ? '#fff' : 'rgba(255,255,255,0.5)',
                        padding: '6px 12px', fontSize: 9, fontFamily: "'Inter',sans-serif",
                        fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
                      }}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>

                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
                  PASTE YOUR LINK
                </div>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder={URL_PLATFORMS[platform]?.placeholder ?? 'https://...'}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.15)', color: '#fff',
                    padding: '12px 16px', fontSize: 13,
                    fontFamily: "'Inter',sans-serif", marginBottom: 16, boxSizing: 'border-box',
                  }}
                />

                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
                  CHALLENGE TITLE (OPTIONAL)
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={`My ${selectedType.label} — ${genre}`}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.15)', color: '#fff',
                    padding: '12px 16px', fontSize: 13,
                    fontFamily: "'Inter',sans-serif", marginBottom: 20, boxSizing: 'border-box',
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter',sans-serif", fontSize: 13 }}>
                You'll go live immediately after confirming. Make sure your camera is ready.
              </div>
            )}

            {/* Points wager */}
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              STAKE YOUR POINTS (OPTIONAL)
            </div>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: `2px solid ${usePointsWager ? '#FFD700' : 'rgba(255,255,255,0.1)'}`, padding: '14px 16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: usePointsWager ? 14 : 0 }}>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 900, color: '#FFD700', marginBottom: 3 }}>
                    ⭐ Use Points as Entry Fee
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Stake points on yourself. Winner takes both stacks. Points don&apos;t expire — put them to work.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUsePointsWager(v => !v)}
                  style={{
                    background: usePointsWager ? '#FFD700' : 'rgba(255,255,255,0.08)',
                    border: 'none', borderRadius: 20, padding: '6px 14px',
                    color: usePointsWager ? '#050510' : 'rgba(255,255,255,0.5)',
                    fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 9,
                    letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    flexShrink: 0, marginLeft: 12,
                  }}
                >
                  {usePointsWager ? 'ON' : 'OFF'}
                </button>
              </div>
              {usePointsWager && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    {[50, 100, 250, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPointsWager(amt)}
                        style={{
                          background: pointsWager === amt ? '#FFD700' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${pointsWager === amt ? '#FFD700' : 'rgba(255,255,255,0.15)'}`,
                          color: pointsWager === amt ? '#050510' : 'rgba(255,255,255,0.6)',
                          padding: '5px 14px', borderRadius: 4, cursor: 'pointer',
                          fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 10,
                        }}
                      >{amt}</button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={50} max={2000} step={50}
                    value={pointsWager}
                    onChange={e => setPointsWager(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#FFD700', marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter',sans-serif", fontSize: 10 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Your stake: <strong style={{ color: '#FFD700' }}>{pointsWager} pts</strong></span>
                    <span style={{ color: '#00FF88', fontWeight: 900 }}>🏆 Winner pool: {pointsWager * 2} pts</span>
                  </div>
                </div>
              )}
            </div>

            {/* Open challenge vs specific opponent */}
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              CHALLENGE WHO?
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: openToAll ? 24 : 16 }}>
              {[true, false].map(v => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setOpenToAll(v)}
                  style={{
                    background: openToAll === v ? selectedType.color : 'transparent',
                    border: `2px solid ${openToAll === v ? selectedType.color : 'rgba(255,255,255,0.2)'}`,
                    color: openToAll === v ? '#050510' : 'rgba(255,255,255,0.6)',
                    padding: '10px 20px', fontFamily: "'Inter',sans-serif",
                    fontWeight: 900, fontSize: 9, letterSpacing: '0.12em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  {v ? '🌐 OPEN CHALLENGE (ANYONE)' : '🎯 SPECIFIC OPPONENT'}
                </button>
              ))}
            </div>
            {!openToAll && (
              <input
                type="text"
                value={opponentSlug}
                onChange={e => setOpponentSlug(e.target.value)}
                placeholder="Opponent username or profile slug..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '12px 16px', fontSize: 13,
                  fontFamily: "'Inter',sans-serif", marginBottom: 20, boxSizing: 'border-box',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '12px 24px', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, cursor: 'pointer' }}>← BACK</button>
              <button
                type="button"
                onClick={() => (mediaUrl.trim() || type === 'live') && setStep(3)}
                style={{
                  background: (mediaUrl.trim() || type === 'live') ? selectedType.color : 'rgba(255,255,255,0.1)',
                  color: '#fff', border: 'none', padding: '12px 40px',
                  fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 20,
                  letterSpacing: '0.04em', cursor: 'pointer',
                  clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
                  boxShadow: (mediaUrl.trim() || type === 'live') ? `0 0 24px ${selectedType.color}66` : 'none',
                }}
              >
                NEXT: CONFIRM →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && (
          <div>
            <div style={{ border: `2px solid ${selectedType.color}66`, background: `${selectedType.color}0a`, padding: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, color: selectedType.color, marginBottom: 16 }}>
                {selectedType.icon} CONFIRM YOUR CHALLENGE
              </div>

              {[
                ['TYPE', selectedType.label],
                ['GENRE', genre],
                ...(type !== 'live' && mediaUrl ? [['LINK', mediaUrl.length > 60 ? mediaUrl.slice(0, 60) + '…' : mediaUrl]] : []),
                ...(title ? [['TITLE', title]] : []),
                ['OPPONENT', openToAll ? 'Open — Anyone Can Accept' : opponentSlug || 'Pending…'],
                ...(usePointsWager ? [['POINTS STAKE', `${pointsWager} pts each · winner takes ${pointsWager * 2} pts`]] : [['POINTS STAKE', 'None (free entry)']]),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: selectedType.color, letterSpacing: '0.18em', textTransform: 'uppercase', minWidth: 80 }}>{k}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#fff', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Prize display */}
            <div style={{ background: 'rgba(255,215,0,0.08)', border: '2px solid #FFD70044', padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: '#FFD700' }}>
                  WIN XP + PRIZES{usePointsWager ? ` + ${pointsWager * 2} POINTS` : ''}
                </div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Crowd votes decide the winner · Results each week
                  {usePointsWager && ` · Both stacks go to winner — ${pointsWager} pts each`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(2)} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '12px 24px', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, cursor: 'pointer' }}>← BACK</button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
                  color: '#fff', border: 'none', padding: '14px 48px',
                  fontFamily: "'Bebas Neue','Impact',sans-serif",
                  fontSize: 22, letterSpacing: '0.04em', cursor: 'pointer',
                  clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
                  boxShadow: '0 0 32px rgba(255,45,170,0.6)',
                }}
              >
                🔥 SUBMIT CHALLENGE
              </button>
            </div>
          </div>
        )}

        {/* Bottom separator */}
        <div style={{ marginTop: 40, borderTop: '2px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'VIEW ALL CHALLENGES', href: '/challenges', color: '#00C8FF' },
            { label: 'CYPHER ARENA', href: '/cypher/stage', color: '#AA2DFF' },
            { label: 'BATTLES', href: '/battles', color: '#FF6B00' },
            { label: 'WINNERS', href: '/winners', color: '#FFD700' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, color: l.color, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {l.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
