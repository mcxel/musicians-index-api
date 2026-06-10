'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

// ── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'lobby' | 'countdown' | 'question' | 'reveal' | 'leaderboard' | 'done';

interface Question {
  id: number;
  text: string;
  options: [string, string, string, string];
  correct: number; // 0-3 index
  category: string;
}

interface Player {
  id: string;
  name: string;
  emoji: string;
  score: number;
  streak: number;
  answeredCorrect: boolean | null;
}

// ── Static data ───────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  { id: 1, text: 'Which year did Kendrick Lamar release "DAMN."?',                        options: ['2015','2016','2017','2018'],          correct: 2, category: 'Hip-Hop' },
  { id: 2, text: 'Which key is the note "A" above middle C?',                             options: ['G Major','A Major','C Major','D Minor'], correct: 1, category: 'Theory' },
  { id: 3, text: 'What BPM is typically associated with Trap music?',                     options: ['85–90','100–120','130–145','145–175'],   correct: 1, category: 'Production' },
  { id: 4, text: '"The Miseducation of Lauryn Hill" was released in which decade?',        options: ['1980s','1990s','2000s','2010s'],         correct: 1, category: 'R&B / Soul' },
  { id: 5, text: 'Which DAW is FL Studio primarily associated with?',                     options: ['Image-Line','Ableton','Apple','Avid'],   correct: 0, category: 'Production' },
  { id: 6, text: 'How many beats are in a standard 4/4 bar?',                             options: ['2','3','4','8'],                         correct: 2, category: 'Theory' },
  { id: 7, text: 'Drake is from which city?',                                             options: ['Atlanta','Chicago','Toronto','Houston'], correct: 2, category: 'Hip-Hop' },
  { id: 8, text: 'Which interval is 7 semitones above the root?',                        options: ['Minor 3rd','Perfect 4th','Perfect 5th','Major 7th'], correct: 2, category: 'Theory' },
  { id: 9, text: '"Purple Rain" is performed by which artist?',                           options: ['James Brown','Michael Jackson','Prince','Stevie Wonder'], correct: 2, category: 'Pop / Rock' },
  { id: 10, text: 'Which streaming service introduced the "Wrapped" year-end feature?',  options: ['Apple Music','Tidal','SoundCloud','Spotify'], correct: 3, category: 'Industry' },
];

const PLAYERS_STUB: Player[] = [
  { id: '1', name: 'NOVA REIGN',   emoji: '👑', score: 0, streak: 0, answeredCorrect: null },
  { id: '2', name: 'JAYLEN X',     emoji: '🎤', score: 0, streak: 0, answeredCorrect: null },
  { id: '3', name: 'TRAXX MONROE', emoji: '🎹', score: 0, streak: 0, answeredCorrect: null },
  { id: '4', name: 'You',          emoji: '⭐', score: 0, streak: 0, answeredCorrect: null },
];

const CHAT_STUBS = [
  { user: 'nova_tribe', msg: 'Game night LOADED 🔥' },
  { user: 'tmifan_7',   msg: 'Theory rounds always get me 😅' },
  { user: 'jaylen_x',  msg: 'Let\'s GOOO' },
];

const Q_TIME = 15; // seconds per question
const ROUND_COUNT = 5;

// ── Component ─────────────────────────────────────────────────────────────────

export default function GameNightPage() {
  const [phase, setPhase]           = useState<GamePhase>('lobby');
  const [qIdx,  setQIdx]            = useState(0);
  const [timer, setTimer]           = useState(Q_TIME);
  const [countdown, setCountdown]   = useState(3);
  const [players, setPlayers]       = useState<Player[]>(PLAYERS_STUB);
  const [selected, setSelected]     = useState<number | null>(null);
  const [viewers]       = useState(0);
  const [chatMsgs, setChatMsgs]     = useState(CHAT_STUBS);
  const [chatInput, setChatInput]   = useState('');

  const question = QUESTIONS[qIdx % QUESTIONS.length]!;
  const myPlayer = players.find(p => p.id === '4')!;


  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { setPhase('question'); setTimer(Q_TIME); setSelected(null); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // Question timer
  useEffect(() => {
    if (phase !== 'question') return;
    if (timer === 0) { handleTimeUp(); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timer]);

  const handleTimeUp = useCallback(() => {
    setPlayers(prev => prev.map(p => {
      if (p.id === '4') return { ...p, answeredCorrect: selected === question.correct, score: selected === question.correct ? p.score + 100 : p.score, streak: selected === question.correct ? p.streak + 1 : 0 };
      // Bot scores
      const botCorrect = Math.random() > 0.45;
      return { ...p, answeredCorrect: botCorrect, score: botCorrect ? p.score + Math.floor(Math.random() * 120 + 60) : p.score, streak: botCorrect ? p.streak + 1 : 0 };
    }));
    setPhase('reveal');
  }, [selected, question.correct]);

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null || phase !== 'question') return;
    setSelected(idx);
    // Resolve immediately
    setTimeout(() => {
      setPlayers(prev => prev.map(p => {
        if (p.id === '4') return { ...p, answeredCorrect: idx === question.correct, score: idx === question.correct ? p.score + 100 + (timer * 5) : p.score, streak: idx === question.correct ? p.streak + 1 : 0 };
        const botCorrect = Math.random() > 0.45;
        return { ...p, answeredCorrect: botCorrect, score: botCorrect ? p.score + Math.floor(Math.random() * 120 + 60) : p.score, streak: botCorrect ? p.streak + 1 : 0 };
      }));
      setPhase('reveal');
    }, 900);
  }, [selected, phase, question.correct, timer]);

  function nextQuestion() {
    if (qIdx + 1 >= ROUND_COUNT) {
      setPhase('done');
    } else {
      setQIdx(i => i + 1);
      setCountdown(3);
      setPhase('countdown');
      setSelected(null);
      setPlayers(prev => prev.map(p => ({ ...p, answeredCorrect: null })));
    }
  }

  function startGame() {
    setQIdx(0);
    setPlayers(PLAYERS_STUB.map(p => ({ ...p, score: 0, streak: 0, answeredCorrect: null })));
    setCountdown(3);
    setPhase('countdown');
  }

  function sendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMsgs(m => [...m.slice(-19), { user: 'You', msg }]);
    setChatInput('');
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // ── Colors ───────────────────────────────────────────────────────────────────
  const OPTION_COLORS = ['#AA2DFF', '#FF2DAA', '#FFD700', '#00C8FF'];

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>

          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(180deg, #0a0a1e 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255,215,0,0.15)',
            padding: '24px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>
                TMI GAME NIGHT
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px,3vw,30px)', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em', color: '#FFD700' }}>
                MUSIC TRIVIA — LIVE ARENA
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#FFD70010', border: '1px solid #FFD70033',
                padding: '5px 14px', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: '#FFD700',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD700', boxShadow: '0 0 8px #FFD700', display: 'inline-block' }} />
                GAME LIVE
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>👁 {viewers.toLocaleString()}</div>
              <Link href="/events" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em' }}>← EVENTS</Link>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 24 }}>

            {/* LEFT — Game stage */}
            <div>

              {/* LOBBY */}
              {phase === 'lobby' && (
                <div style={{ border: '2px solid #FFD70033', background: 'rgba(255,215,0,0.03)', padding: '36px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(40px,6vw,72px)', marginBottom: 12 }}>🎵</div>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(24px,4vw,40px)', color: '#FFD700', letterSpacing: '0.06em', marginBottom: 8 }}>
                    MUSIC TRIVIA NIGHT
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.1em' }}>
                    {ROUND_COUNT} ROUNDS · 15 SECONDS PER QUESTION
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                    {['Hip-Hop','Theory','Production','R&B','Industry'].map(cat => (
                      <span key={cat} style={{ border: '1px solid #FFD70044', color: '#FFD700', padding: '3px 10px', fontSize: 8, fontWeight: 900, letterSpacing: '0.12em' }}>{cat}</span>
                    ))}
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase' }}>Players in lobby</div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {players.map(p => (
                        <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ fontSize: 28 }}>{p.emoji}</div>
                          <div style={{ fontSize: 9, color: p.id === '4' ? '#FFD700' : 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>{p.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={startGame} style={{
                    background: 'linear-gradient(90deg, #FFD700, #FF9500)',
                    border: 'none', color: '#050510', padding: '14px 48px',
                    fontSize: 12, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                    boxShadow: '0 0 28px rgba(255,215,0,0.4)',
                  }}>
                    START GAME →
                  </button>
                </div>
              )}

              {/* COUNTDOWN */}
              {phase === 'countdown' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: 340, border: '2px solid #FFD70033', background: 'rgba(255,215,0,0.03)',
                }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#FFD700', fontWeight: 900, marginBottom: 16, textTransform: 'uppercase' }}>
                    ROUND {qIdx + 1} OF {ROUND_COUNT}
                  </div>
                  <div style={{ fontSize: 'clamp(64px,12vw,100px)', fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>{countdown}</div>
                  <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{question.category}</div>
                </div>
              )}

              {/* QUESTION */}
              {(phase === 'question' || phase === 'reveal') && (
                <div>
                  {/* Category + timer bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.25em', color: '#FFD700', fontWeight: 900, textTransform: 'uppercase' }}>
                      Q{qIdx + 1}/{ROUND_COUNT} · {question.category}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: timer <= 5 ? '#FF2DAA' : '#FFD700', minWidth: 40, textAlign: 'right' }}>
                      {phase === 'question' ? `${timer}s` : '✓'}
                    </div>
                  </div>

                  {/* Timer bar */}
                  {phase === 'question' && (
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }}>
                      <div style={{
                        height: '100%',
                        width: `${(timer / Q_TIME) * 100}%`,
                        background: timer <= 5 ? '#FF2DAA' : '#FFD700',
                        transition: 'width 1s linear, background 0.3s',
                      }} />
                    </div>
                  )}

                  {/* Question text */}
                  <div style={{
                    border: '2px solid #FFD70033',
                    background: 'rgba(255,215,0,0.04)',
                    padding: '24px 28px',
                    marginBottom: 18,
                    fontSize: 'clamp(14px,2vw,18px)',
                    fontWeight: 700,
                    lineHeight: 1.5,
                    color: '#fff',
                  }}>
                    {question.text}
                  </div>

                  {/* Answer options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {question.options.map((opt, i) => {
                      const isCorrect = i === question.correct;
                      const isSelected = selected === i;
                      let bg = `${OPTION_COLORS[i]}10`;
                      let border = `${OPTION_COLORS[i]}44`;
                      let textColor = OPTION_COLORS[i];

                      if (phase === 'reveal') {
                        if (isCorrect) { bg = `${OPTION_COLORS[i]}28`; border = OPTION_COLORS[i]!; }
                        else if (isSelected && !isCorrect) { bg = 'rgba(255,45,45,0.15)'; border = '#FF2D2D'; textColor = '#FF2D2D'; }
                      } else if (isSelected) {
                        bg = `${OPTION_COLORS[i]}28`; border = OPTION_COLORS[i]!;
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={phase === 'reveal' || selected !== null}
                          onClick={() => handleAnswer(i)}
                          style={{
                            background: bg,
                            border: `2px solid ${border}`,
                            color: textColor,
                            padding: '14px 16px',
                            textAlign: 'left',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: phase === 'reveal' || selected !== null ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10,
                            transition: 'background 0.2s, border 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 900, opacity: 0.6, minWidth: 18 }}>{String.fromCharCode(65 + i)}.</span>
                          <span>{opt}</span>
                          {phase === 'reveal' && isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reveal feedback */}
                  {phase === 'reveal' && (
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: myPlayer.answeredCorrect ? '#00C8FF' : '#FF2DAA', letterSpacing: '0.1em' }}>
                        {myPlayer.answeredCorrect ? '✓ CORRECT +' + (100 + timer * 5) + ' PTS' : '✗ WRONG — No points'}
                      </div>
                      <button type="button" onClick={nextQuestion} style={{
                        background: '#FFD70022', border: '1px solid #FFD70055', color: '#FFD700',
                        padding: '8px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', cursor: 'pointer', textTransform: 'uppercase',
                      }}>
                        {qIdx + 1 < ROUND_COUNT ? 'NEXT QUESTION →' : 'SEE FINAL SCORES →'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DONE */}
              {phase === 'done' && (
                <div style={{ border: '2px solid #FFD70044', background: 'rgba(255,215,0,0.04)', padding: '40px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(28px,5vw,48px)', color: '#FFD700', letterSpacing: '0.06em', marginBottom: 20 }}>
                    GAME OVER
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, margin: '0 auto 28px' }}>
                    {sortedPlayers.map((p, i) => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        background: i === 0 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${i === 0 ? '#FFD70044' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                        <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>{['🥇','🥈','🥉','4️⃣'][i]}</span>
                        <span style={{ fontSize: 16 }}>{p.emoji}</span>
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: p.id === '4' ? '#FFD700' : 'rgba(255,255,255,0.8)' }}>{p.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>{p.score.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" onClick={startGame} style={{
                      background: 'linear-gradient(90deg,#FFD700,#FF9500)', border: 'none', color: '#050510',
                      padding: '12px 28px', fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', cursor: 'pointer',
                    }}>
                      PLAY AGAIN →
                    </button>
                    <Link href="/events" style={{
                      border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                      padding: '12px 22px', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textDecoration: 'none', display: 'inline-block',
                    }}>
                      ALL EVENTS
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Leaderboard + Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Live scoreboard */}
              <div style={{ border: '1px solid rgba(255,215,0,0.15)', background: 'rgba(255,215,0,0.03)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,215,0,0.12)', fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', textTransform: 'uppercase' }}>
                  LIVE SCORES
                </div>
                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sortedPlayers.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, minWidth: 20 }}>{p.emoji}</span>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: p.id === '4' ? '#FFD700' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      {p.streak >= 2 && <span style={{ fontSize: 8, color: '#FF9500' }}>🔥×{p.streak}</span>}
                      <span style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', minWidth: 40, textAlign: 'right' }}>{p.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', flex: 1 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#AA2DFF', textTransform: 'uppercase' }}>GAME CHAT</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{viewers} watching</span>
                </div>
                <div style={{ height: 220, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ fontSize: 11 }}>
                      <span style={{ color: '#AA2DFF', fontWeight: 700, marginRight: 6 }}>{m.user}</span>
                      <span style={{ color: 'rgba(255,255,255,0.65)' }}>{m.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type here…"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '7px 10px', fontSize: 11, outline: 'none', fontFamily: "'Inter',sans-serif" }}
                  />
                  <button type="button" onClick={sendChat} style={{ background: '#AA2DFF22', border: '1px solid #AA2DFF44', color: '#AA2DFF', padding: '7px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    GO
                  </button>
                </div>
              </div>

              {/* Quick nav */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { href: '/rooms/cypher', label: '🎤 CYPHER ARENA' },
                  { href: '/rooms/trivia', label: '🧠 TRIVIA ROOM' },
                  { href: '/challenges/create', label: '⚔️ CHALLENGE YOUR SONG' },
                  { href: '/events', label: '📅 ALL EVENTS' },
                ].map(l => (
                  <Link key={l.href} href={l.href} style={{
                    display: 'block', padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none', textTransform: 'uppercase',
                  }}>{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
