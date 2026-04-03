'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import StageCurtain, { type StageState } from '@/components/stage/StageCurtain';

const SHOW_TITLE  = "MARCEL'S MONDAY NIGHT STAGE";
const ROOM_ID     = 'monday-stage';

const LINEUP = [
  { time: '8:00 PM',  artist: 'DJ Cyphers',    genre: 'Hip-Hop / Mix',  status: 'DONE'    },
  { time: '8:45 PM',  artist: 'Amirah Wells',   genre: 'R&B / Soul',     status: 'DONE'    },
  { time: '9:30 PM',  artist: 'Jaylen Cross',   genre: 'Hip-Hop',        status: 'LIVE'    },
  { time: '10:15 PM', artist: 'Nova Reign',      genre: 'Neo-Soul',       status: 'NEXT'    },
  { time: '11:00 PM', artist: 'Traxx Monroe',    genre: 'Trap',           status: 'UPCOMING'},
];

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  DONE:     { color: '#444',   label: 'DONE'    },
  LIVE:     { color: '#FF2DAA', label: '● LIVE' },
  NEXT:     { color: '#FFD700', label: 'NEXT'   },
  UPCOMING: { color: '#555',   label: 'SOON'   },
};

const CHAT_STUBS = [
  { user: 'jaylen_fan99', msg: 'JAYLEN IS GOING CRAZY TONIGHT 🔥' },
  { user: 'r_n_b_queen',  msg: 'Amirah set was perfect 😭💕' },
  { user: 'marcels_boy',  msg: 'Monday Night never misses!' },
  { user: 'traxx_stan',   msg: 'Can\'t wait for Traxx at 11 🎹' },
  { user: 'nova_tribe',   msg: 'Nova is about to eat 🙌' },
];

type ChatMsg = { user: string; msg: string };

export default function MondayStagePage() {
  const [stageState, setStageState]   = useState<StageState>('CURTAIN_CLOSED');
  const [chatMsgs, setChatMsgs]       = useState<ChatMsg[]>(CHAT_STUBS);
  const [chatInput, setChatInput]     = useState('');
  const [viewers, setViewers]         = useState(1847);
  const [tipping, setTipping]         = useState(false);
  const [tipSent, setTipSent]         = useState(false);
  const [tipsTotal, setTipsTotal]     = useState(342);
  const currentArtist = LINEUP.find((l) => l.status === 'LIVE');

  // Poll stage status
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`/api/stage/status?roomId=${ROOM_ID}`);
        if (r.ok) {
          const data = await r.json();
          setStageState(data.state as StageState);
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);

  // Simulate viewer drift
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const openCurtain = useCallback(async () => {
    setStageState('CURTAIN_OPENING');
    await fetch('/api/stage/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId: ROOM_ID, showTitle: SHOW_TITLE, artistName: currentArtist?.artist }),
    });
    setTimeout(() => setStageState('LIVE'), 2000);
  }, [currentArtist]);

  const closeCurtain = useCallback(async () => {
    setStageState('CURTAIN_CLOSING');
    await fetch('/api/stage/end', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId: ROOM_ID }),
    });
    setTimeout(() => setStageState('ENDED'), 2000);
  }, []);

  const sendTip = () => {
    setTipping(false);
    setTipSent(true);
    setTipsTotal((t) => t + 5);
    setTimeout(() => setTipSent(false), 3000);
  };

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMsgs((m) => [...m.slice(-19), { user: 'You', msg }]);
    setChatInput('');
  };

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '0 0 80px' }}>

          {/* ── HEADER ── */}
          <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 6 }}>
                LIVE ROOM
              </div>
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 900, letterSpacing: 3, color: '#fff', margin: 0 }}>
                {SHOW_TITLE}
              </h1>
              <div style={{ fontSize: 11, color: '#555', marginTop: 4, letterSpacing: 1 }}>
                Hosted by Marcel · Every Monday 8PM EST
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: stageState === 'LIVE' ? '#FF2DAA' : '#555',
                  background: stageState === 'LIVE' ? '#FF2DAA18' : '#111',
                  border: `1px solid ${stageState === 'LIVE' ? '#FF2DAA44' : '#222'}`,
                  padding: '6px 14px', borderRadius: 20 }}
              >
                {stageState === 'LIVE' ? '● LIVE' : stageState === 'CURTAIN_CLOSED' ? 'AWAITING SHOW' : stageState.replace('_', ' ')}
              </motion.div>
              <div style={{ fontSize: 11, color: '#888' }}>
                👁 {viewers.toLocaleString()} watching
              </div>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>

            {/* LEFT — Stage + Controls */}
            <div>
              {/* Stage Curtain */}
              <StageCurtain
                state={stageState}
                showTitle={SHOW_TITLE}
                artistName={currentArtist?.artist}
              />

              {/* Host Controls (demo — in prod gated by role) */}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={openCurtain}
                  disabled={stageState === 'LIVE' || stageState === 'CURTAIN_OPENING'}
                  style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #AA2DFF44', background: '#AA2DFF22', color: '#AA2DFF', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', opacity: stageState === 'LIVE' ? 0.4 : 1 }}
                >
                  OPEN CURTAIN
                </button>
                <button
                  onClick={closeCurtain}
                  disabled={stageState !== 'LIVE'}
                  style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #FF2DAA44', background: '#FF2DAA22', color: '#FF2DAA', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', opacity: stageState !== 'LIVE' ? 0.4 : 1 }}
                >
                  CLOSE CURTAIN
                </button>
              </div>

              {/* Reaction + Tip row */}
              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {['🔥', '🎤', '👑', '💜', '🎶'].map((emoji) => (
                  <motion.button key={emoji} whileTap={{ scale: 1.3 }}
                    style={{ fontSize: 22, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
                <div style={{ flex: 1 }} />
                <AnimatePresence>
                  {tipSent && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>
                      💰 Tip sent!
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => setTipping((t) => !t)}
                  style={{ padding: '7px 18px', borderRadius: 20, border: '1px solid #FFD70044', background: '#FFD70018', color: '#FFD700', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer' }}>
                  TIP 💰
                </button>
              </div>

              {/* Tip modal */}
              <AnimatePresence>
                {tipping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 12, background: '#0d0019', border: '1px solid #FFD70033', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700, marginRight: 4 }}>Send tip:</div>
                    {[1, 5, 10, 25].map((amt) => (
                      <button key={amt} onClick={sendTip}
                        style={{ padding: '6px 16px', borderRadius: 12, border: '1px solid #FFD70044', background: '#FFD70018', color: '#FFD700', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ${amt}
                      </button>
                    ))}
                    <span style={{ fontSize: 10, color: '#555', marginLeft: 8 }}>Total tips: ${tipsTotal}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tonight's Lineup */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 16 }}>TONIGHT'S LINEUP</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {LINEUP.map((act, i) => {
                    const s = STATUS_STYLES[act.status];
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 10, background: act.status === 'LIVE' ? '#FF2DAA0A' : '#0a0a14', border: `1px solid ${act.status === 'LIVE' ? '#FF2DAA33' : '#1a1a2e'}` }}>
                        <div style={{ fontSize: 11, color: '#555', minWidth: 60 }}>{act.time}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: act.status === 'LIVE' ? '#fff' : '#888' }}>{act.artist}</div>
                          <div style={{ fontSize: 10, color: '#444' }}>{act.genre}</div>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: s.color }}>{s.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: 24 }}>
              <div style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: '#00FFFF', fontWeight: 800 }}>LIVE CHAT</div>
                  <div style={{ fontSize: 9, color: '#555' }}>{viewers.toLocaleString()} viewers</div>
                </div>
                <div style={{ height: 340, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <span style={{ color: '#AA2DFF', fontWeight: 700, marginRight: 6 }}>{m.user}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: 8 }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Say something…"
                    style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button onClick={sendChat} style={{ padding: '8px 14px', borderRadius: 8, background: '#AA2DFF22', border: '1px solid #AA2DFF44', color: '#AA2DFF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    SEND
                  </button>
                </div>
              </div>

              {/* Back to rooms */}
              <Link href="/rooms" style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 10, color: '#555', textDecoration: 'none', letterSpacing: 2 }}>
                ← ALL LIVE ROOMS
              </Link>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
