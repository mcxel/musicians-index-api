'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

type BattlePhase = 'QUEUE' | 'COUNTDOWN' | 'ROUND' | 'VOTE' | 'RESULT';

interface Battler {
  id: string;
  name: string;
  genre: string;
  emoji: string;
  votes: number;
}

const QUEUE_STUBS: Battler[] = [
  { id: '1', name: 'JAYLEN CROSS',  genre: 'Hip-Hop',     emoji: '🎤', votes: 0 },
  { id: '2', name: 'NOVA REIGN',    genre: 'Neo-Soul',    emoji: '👑', votes: 0 },
  { id: '3', name: 'TRAXX MONROE',  genre: 'Trap',        emoji: '🎹', votes: 0 },
  { id: '4', name: 'AMIRAH WELLS',  genre: 'R&B',         emoji: '🎶', votes: 0 },
  { id: '5', name: 'DJ CYPHERS',    genre: 'Hip-Hop Mix', emoji: '🎧', votes: 0 },
  { id: '6', name: 'DESTINED',      genre: 'Neo-Soul',    emoji: '✨', votes: 0 },
];

const ROUND_LABEL = ['', 'ROUND 1', 'ROUND 2', 'ROUND 3 — FINAL'];
const ROUND_DURATION = 30; // seconds per round

const CHAT_STUBS = [
  { user: 'cypher_heads', msg: 'This is FIRE 🔥' },
  { user: 'nova_tribe',   msg: 'Nova about to bodybody this 👑' },
  { user: 'trap_gang',    msg: 'JAYLEN NO CAP' },
  { user: 'viewer_882',   msg: 'who voted Jaylen???' },
];

type ChatMsg = { user: string; msg: string };

export default function CypherRoomPage() {
  const [queue]               = useState<Battler[]>(QUEUE_STUBS);
  const [phase, setPhase]       = useState<BattlePhase>('QUEUE');
  const [round, setRound]       = useState(1);
  const [timer, setTimer]       = useState(ROUND_DURATION);
  const [left, setLeft]         = useState<Battler | null>(null);
  const [right, setRight]       = useState<Battler | null>(null);
  const [leftVotes, setLeftVotes]   = useState(0);
  const [rightVotes, setRightVotes] = useState(0);
  const [voted, setVoted]       = useState(false);
  const [winner, setWinner]     = useState<Battler | null>(null);
  const [viewers, setViewers]   = useState(643);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(CHAT_STUBS);
  const [chatInput, setChatInput] = useState('');
  const [countdown, setCountdown] = useState(3);

  // Viewer count drift
  useEffect(() => {
    const id = setInterval(() => setViewers((v) => v + Math.floor(Math.random() * 4) - 1), 5000);
    return () => clearInterval(id);
  }, []);

  // Round timer
  useEffect(() => {
    if (phase !== 'ROUND') return;
    if (timer === 0) { setPhase('VOTE'); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timer]);

  // Countdown
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;
    if (countdown === 0) { setPhase('ROUND'); setTimer(ROUND_DURATION); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  const startBattle = useCallback(() => {
    const [a, b] = queue;
    setLeft(a); setRight(b);
    setLeftVotes(0); setRightVotes(0);
    setVoted(false); setWinner(null);
    setCountdown(3); setRound(1);
    setPhase('COUNTDOWN');
  }, [queue]);

  const vote = (side: 'left' | 'right') => {
    if (voted) return;
    setVoted(true);
    if (side === 'left') setLeftVotes((v) => v + 1);
    else setRightVotes((v) => v + 1);
  };

  const endVote = () => {
    const w = (leftVotes + (voted && right ? 0 : 0)) >= rightVotes ? left : right;
    if (round < 3) {
      setRound((r) => r + 1);
      setLeftVotes(0); setRightVotes(0);
      setVoted(false);
      setCountdown(3);
      setPhase('COUNTDOWN');
    } else {
      setWinner(leftVotes >= rightVotes ? left : right);
      setPhase('RESULT');
    }
  };

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMsgs((m) => [...m.slice(-19), { user: 'You', msg }]);
    setChatInput('');
  };

  const totalVotes = leftVotes + rightVotes;
  const leftPct  = totalVotes ? Math.round((leftVotes  / totalVotes) * 100) : 50;
  const rightPct = totalVotes ? Math.round((rightVotes / totalVotes) * 100) : 50;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '0 0 80px' }}>

          {/* ── HEADER ── */}
          <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 4 }}>LIVE ROOM</div>
              <h1 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, letterSpacing: 3, margin: 0 }}>CYPHER ARENA</h1>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: phase === 'ROUND' ? '#FF2DAA' : '#555',
                  background: phase === 'ROUND' ? '#FF2DAA18' : '#111', border: `1px solid ${phase === 'ROUND' ? '#FF2DAA44' : '#222'}`, padding: '5px 14px', borderRadius: 20 }}>
                {phase === 'ROUND' ? '● BATTLE LIVE' : phase === 'QUEUE' ? 'QUEUE OPEN' : phase.replace('_',' ')}
              </motion.div>
              <div style={{ fontSize: 11, color: '#666' }}>👁 {viewers.toLocaleString()}</div>
              <Link href="/rooms" style={{ fontSize: 10, color: '#555', textDecoration: 'none', letterSpacing: 1 }}>← ROOMS</Link>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24 }}>

            {/* LEFT — Stage */}
            <div>

              {/* QUEUE phase */}
              {phase === 'QUEUE' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 14, padding: '24px 24px 20px' }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 20 }}>BATTLE QUEUE</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {queue.map((b, i) => (
                      <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 10,
                        background: i < 2 ? '#AA2DFF0A' : 'transparent', border: `1px solid ${i < 2 ? '#AA2DFF33' : '#1a1a2e'}` }}>
                        <div style={{ fontSize: 9, color: '#555', minWidth: 20, fontWeight: 700 }}>#{i + 1}</div>
                        <div style={{ fontSize: 24 }}>{b.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: i < 2 ? '#fff' : '#888' }}>{b.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>{b.genre}</div>
                        </div>
                        {i < 2 && <div style={{ fontSize: 9, color: '#AA2DFF', fontWeight: 800, letterSpacing: 2 }}>NEXT UP</div>}
                      </div>
                    ))}
                  </div>
                  <button onClick={startBattle}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'linear-gradient(90deg, #AA2DFF, #FF2DAA)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: 'pointer' }}>
                    START BATTLE
                  </button>
                </motion.div>
              )}

              {/* COUNTDOWN phase */}
              {phase === 'COUNTDOWN' && (
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, background: '#0a0a14', border: '1px solid #AA2DFF33', borderRadius: 14 }}>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', marginBottom: 16 }}>BATTLE STARTING</div>
                  <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{countdown}</div>
                  <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>{left?.name} vs {right?.name}</div>
                </motion.div>
              )}

              {/* ROUND phase */}
              {(phase === 'ROUND' || phase === 'VOTE') && left && right && (
                <div>
                  {/* Round label + timer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: '#AA2DFF' }}>{ROUND_LABEL[round]}</div>
                    {phase === 'ROUND' && (
                      <motion.div animate={{ color: timer <= 10 ? ['#FF2DAA','#fff','#FF2DAA'] : ['#FFD700'] }}
                        transition={{ duration: 0.5, repeat: timer <= 10 ? Infinity : 0 }}
                        style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>
                        {timer}s
                      </motion.div>
                    )}
                  </div>

                  {/* Battler cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                    <motion.div whileHover={{ scale: 1.02 }}
                      style={{ background: 'linear-gradient(135deg, #AA2DFF18, #0a0a1a)', border: '1px solid #AA2DFF44', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 44 }}>{left.emoji}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 2, color: '#fff', marginTop: 10 }}>{left.name}</div>
                      <div style={{ fontSize: 10, color: '#AA2DFF', marginTop: 4 }}>{left.genre}</div>
                      {phase === 'ROUND' && (
                        <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity }}
                          style={{ marginTop: 14, fontSize: 9, color: '#AA2DFF', letterSpacing: 3 }}>● PERFORMING</motion.div>
                      )}
                    </motion.div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#555' }}>VS</div>
                    <motion.div whileHover={{ scale: 1.02 }}
                      style={{ background: 'linear-gradient(135deg, #FF2DAA18, #0a0a1a)', border: '1px solid #FF2DAA44', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: 44 }}>{right.emoji}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 2, color: '#fff', marginTop: 10 }}>{right.name}</div>
                      <div style={{ fontSize: 10, color: '#FF2DAA', marginTop: 4 }}>{right.genre}</div>
                      {phase === 'ROUND' && (
                        <motion.div animate={{ opacity: [1,0.4,1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                          style={{ marginTop: 14, fontSize: 9, color: '#FF2DAA', letterSpacing: 3 }}>● LISTENING</motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Vote section */}
                  {phase === 'VOTE' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 14, padding: '20px' }}>
                      <div style={{ fontSize: 9, letterSpacing: 4, color: '#FFD700', fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>AUDIENCE VOTE</div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <button disabled={voted} onClick={() => vote('left')}
                          style={{ flex: 1, padding: '14px', borderRadius: 10, background: voted ? '#111' : '#AA2DFF22', border: `2px solid ${voted ? '#222' : '#AA2DFF'}`, color: voted ? '#555' : '#AA2DFF', fontSize: 12, fontWeight: 800, cursor: voted ? 'default' : 'pointer', letterSpacing: 2 }}>
                          VOTE {left.name}
                        </button>
                        <button disabled={voted} onClick={() => vote('right')}
                          style={{ flex: 1, padding: '14px', borderRadius: 10, background: voted ? '#111' : '#FF2DAA22', border: `2px solid ${voted ? '#222' : '#FF2DAA'}`, color: voted ? '#555' : '#FF2DAA', fontSize: 12, fontWeight: 800, cursor: voted ? 'default' : 'pointer', letterSpacing: 2 }}>
                          VOTE {right.name}
                        </button>
                      </div>
                      {/* Vote bar */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ flex: leftPct, height: 8, background: '#AA2DFF', borderRadius: '4px 0 0 4px', transition: 'flex 0.5s' }} />
                        <div style={{ flex: rightPct, height: 8, background: '#FF2DAA', borderRadius: '0 4px 4px 0', transition: 'flex 0.5s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666' }}>
                        <span>{leftPct}% ({leftVotes})</span>
                        <span>{totalVotes} votes</span>
                        <span>{rightPct}% ({rightVotes})</span>
                      </div>
                      {voted && (
                        <button onClick={endVote}
                          style={{ marginTop: 14, width: '100%', padding: '12px', borderRadius: 10, background: '#FFD70022', border: '1px solid #FFD70044', color: '#FFD700', fontSize: 11, fontWeight: 800, cursor: 'pointer', letterSpacing: 2 }}>
                          {round < 3 ? `NEXT: ${ROUND_LABEL[round + 1]}` : 'CROWN WINNER →'}
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* RESULT phase */}
              {phase === 'RESULT' && winner && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, #FFD70010, #050510)', border: '1px solid #FFD70033', borderRadius: 14 }}>
                  <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ fontSize: 64, marginBottom: 16 }}>👑</motion.div>
                  <div style={{ fontSize: 11, letterSpacing: 5, color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>WINNER</div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: '#fff' }}>{winner.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>{leftVotes + rightVotes} total votes cast</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
                    <button onClick={() => { setPhase('QUEUE'); setWinner(null); }}
                      style={{ padding: '10px 24px', borderRadius: 20, background: '#AA2DFF22', border: '1px solid #AA2DFF44', color: '#AA2DFF', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer' }}>
                      NEW BATTLE
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT — Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'sticky', top: 24, height: 'fit-content' }}>
              <div style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: '#AA2DFF', fontWeight: 800 }}>CYPHER CHAT</div>
                  <div style={{ fontSize: 9, color: '#555' }}>{viewers} live</div>
                </div>
                <div style={{ height: 320, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <span style={{ color: '#AA2DFF', fontWeight: 700, marginRight: 6 }}>{m.user}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: 8 }}>
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Drop your vote…"
                    style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none' }} />
                  <button onClick={sendChat} style={{ padding: '8px 14px', borderRadius: 8, background: '#AA2DFF22', border: '1px solid #AA2DFF44', color: '#AA2DFF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    GO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
