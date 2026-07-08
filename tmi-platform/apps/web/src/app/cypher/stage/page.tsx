'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AudienceScene from '@/components/live/AudienceScene';
import { MaskedVideoTile } from '@/components/live/MaskedVideoTile';

const CYAN    = '#00FFFF';
const FUCHSIA = '#FF2DAA';
const PURPLE  = '#AA2DFF';
const GOLD    = '#FFD700';

const CYPHER_PARTICIPANTS = [
  { name: 'ACE KROWN',   emoji: '🎤', accent: CYAN,    shape: 'octagon'  as const, genre: 'Hip-Hop',   round: 1 },
  { name: 'NOVA FLAME',  emoji: '🔥', accent: FUCHSIA, shape: 'hexagon'  as const, genre: 'Trap',      round: 2 },
  { name: 'DELTA REX',   emoji: '🎵', accent: PURPLE,  shape: 'pentagon' as const, genre: 'R&B',       round: 3 },
  { name: 'LYRIC STORM', emoji: '⚡', accent: GOLD,    shape: 'diamond'  as const, genre: 'Freestyle', round: 4 },
];

const ROUND_SECONDS = 60;

const BOT_HYPE = [
  '🔥 bars on bars fr',
  'that flow is crazy',
  '⚡ this is the one',
  'who next??',
  'run it back!!',
  'GOATED 🏆',
  'crowd going 🤯',
  'drop it already!!',
  '🎤 REAL TALK',
  'lets gooooo 🔥',
];

interface ChatLine { id: number; name: string; msg: string; color: string }

export default function CypherStagePage() {
  const [activeSlot,   setActiveSlot]   = useState(0);
  const [roundSec,     setRoundSec]     = useState(ROUND_SECONDS);
  const [isRunning,    setIsRunning]    = useState(false);
  const [viewMode,     setViewMode]     = useState<'performer' | 'fan'>('performer');
  const [chat,         setChat]         = useState<ChatLine[]>([]);
  const [chatInput,    setChatInput]    = useState('');
  const [viewers,      setViewers]      = useState(342);
  const [showJoin,     setShowJoin]     = useState(false);
  const chatId = useRef(0);

  // Round countdown
  useEffect(() => {
    if (!isRunning) return;
    if (roundSec <= 0) {
      setIsRunning(false);
      setActiveSlot((s) => (s + 1) % CYPHER_PARTICIPANTS.length);
      setRoundSec(ROUND_SECONDS);
      return;
    }
    const t = setTimeout(() => setRoundSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isRunning, roundSec]);

  // Bot hype messages
  useEffect(() => {
    const t = setInterval(() => {
      const bot = CYPHER_PARTICIPANTS[Math.floor(Math.random() * CYPHER_PARTICIPANTS.length)]!;
      const msg = BOT_HYPE[Math.floor(Math.random() * BOT_HYPE.length)]!;
      setChat((prev) => [
        ...prev.slice(-40),
        { id: ++chatId.current, name: `Fan_${Math.floor(Math.random() * 999)}`, msg, color: bot.accent },
      ]);
      setViewers((v) => v + Math.floor(Math.random() * 3) - 1);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const sendChat = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChat((prev) => [
      ...prev.slice(-40),
      { id: ++chatId.current, name: 'YOU', msg: chatInput.trim(), color: CYAN },
    ]);
    setChatInput('');
  }, [chatInput]);

  const active = CYPHER_PARTICIPANTS[activeSlot]!;
  const mm = String(Math.floor(roundSec / 60)).padStart(2, '0');
  const ss = String(roundSec % 60).padStart(2, '0');
  const pct = ((ROUND_SECONDS - roundSec) / ROUND_SECONDS) * 100;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.18), transparent 55%), #050510',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.92)',
        borderBottom: `1px solid ${PURPLE}33`,
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/cypher" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em' }}>
          ← CYPHERS
        </Link>
        <div style={{ fontSize: 10, letterSpacing: '0.25em', fontWeight: 900, color: PURPLE }}>
          ⚡ CYPHER STAGE · LIVE
        </div>
        <div style={{ flex: 1 }} />

        {/* Viewers */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
          👁 <span style={{ color: CYAN }}>{viewers.toLocaleString()}</span>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['performer', 'fan'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 9, fontWeight: 800,
                border: `1px solid ${viewMode === v ? PURPLE : 'rgba(255,255,255,0.1)'}`,
                background: viewMode === v ? `${PURPLE}18` : 'transparent',
                color: viewMode === v ? PURPLE : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {v === 'performer' ? '🎤 Stage' : '🎭 Fan'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowJoin((p) => !p)}
          style={{
            padding: '7px 16px', borderRadius: 7, fontSize: 10, fontWeight: 900,
            background: `linear-gradient(135deg, ${PURPLE}, ${FUCHSIA})`,
            border: 'none', color: '#fff', cursor: 'pointer', letterSpacing: '0.08em',
          }}
        >
          + JOIN CYPHER
        </button>
      </div>

      {/* ── Join modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 56, right: 20, zIndex: 100,
              background: 'rgba(10,10,30,0.97)', border: `1px solid ${PURPLE}55`,
              borderRadius: 12, padding: '20px 24px', width: 280,
              boxShadow: `0 8px 40px ${PURPLE}30`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: PURPLE, marginBottom: 14, letterSpacing: '0.14em' }}>
              JOIN THIS CYPHER
            </div>
            {[
              { label: 'Request a Slot', href: '/cypher/create', icon: '🎤', color: PURPLE },
              { label: 'Watch as Fan',   href: '/fan/theater',   icon: '👀', color: CYAN },
              { label: 'Judge Rounds',   href: '/battles/judge', icon: '⚖️', color: GOLD },
            ].map((opt) => (
              <Link
                key={opt.label}
                href={opt.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                  background: `${opt.color}0a`, border: `1px solid ${opt.color}33`,
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 16 }}>{opt.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: opt.color }}>{opt.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setShowJoin(false)}
              style={{ width: '100%', marginTop: 4, padding: '6px 0', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', fontSize: 9, cursor: 'pointer' }}
            >
              CLOSE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

        {/* ── LEFT — Stage + Audience ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Active performer spotlight */}
          <div style={{
            borderRadius: 14, border: `2px solid ${active.accent}55`,
            background: `radial-gradient(ellipse at 50% 0%, ${active.accent}12, transparent 60%), rgba(8,14,38,.95)`,
            padding: '18px 20px',
            boxShadow: `0 0 30px ${active.accent}18`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `radial-gradient(circle, ${active.accent}22, transparent)`,
                border: `2px solid ${active.accent}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                {active.emoji}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: active.accent, letterSpacing: '0.06em' }}>
                  {active.name}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                  {active.genre} · Round {active.round} of {CYPHER_PARTICIPANTS.length}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: roundSec < 15 ? '#FF3C3C' : active.accent }}>
                  {mm}:{ss}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                  {isRunning ? 'ROUND TIME' : 'PAUSED'}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ ease: 'linear' }}
                style={{ height: '100%', background: active.accent, borderRadius: 2 }}
              />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsRunning((r) => !r)}
                style={{
                  padding: '9px 20px', borderRadius: 8, fontSize: 11, fontWeight: 900,
                  background: isRunning ? 'rgba(255,60,60,0.15)' : `${active.accent}22`,
                  border: `1px solid ${isRunning ? '#FF3C3C55' : active.accent + '55'}`,
                  color: isRunning ? '#FF3C3C' : active.accent,
                  cursor: 'pointer', letterSpacing: '0.08em',
                }}
              >
                {isRunning ? '⏸ PAUSE' : '▶ START ROUND'}
              </button>
              <button
                onClick={() => { setActiveSlot((s) => (s + 1) % CYPHER_PARTICIPANTS.length); setRoundSec(ROUND_SECONDS); setIsRunning(false); }}
                style={{
                  padding: '9px 16px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', letterSpacing: '0.08em',
                }}
              >
                ⏭ NEXT PERFORMER
              </button>
            </div>
          </div>

          {/* Participant grid */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 10 }}>
              CYPHER PARTICIPANTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {CYPHER_PARTICIPANTS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setActiveSlot(i); setRoundSec(ROUND_SECONDS); setIsRunning(false); }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                    outline: i === activeSlot ? `2px solid ${p.accent}` : 'none',
                    borderRadius: 10,
                  }}
                >
                  <MaskedVideoTile
                    shape={p.shape}
                    performerName={p.name}
                    genre={p.genre}
                    avatarEmoji={p.emoji}
                    size={140}
                    accentColor={p.accent}
                    isLive={i === activeSlot && isRunning}
                    rank={i + 1}
                    showActions={false}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 3D Audience — switches between fan POV and performer POV */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 10 }}>
              {viewMode === 'performer' ? 'YOUR LIVE AUDIENCE' : 'FAN POV — WATCHING THE CYPHER'}
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${PURPLE}33` }}>
              <AudienceScene
                view={viewMode}
                venue={2}
              />
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { href: '/cypher/rankings', label: '🏆 Rankings',      color: GOLD   },
              { href: '/cypher/create',   label: '+ Create Cypher',  color: PURPLE },
              { href: '/battles/live',    label: '⚔️ Battle Arena',   color: FUCHSIA},
              { href: '/live/lobby',      label: '🎭 Live Lobby',     color: CYAN   },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: '7px 14px', borderRadius: 7, fontSize: 10, fontWeight: 800,
                  background: `${l.color}0e`, border: `1px solid ${l.color}33`,
                  color: l.color, textDecoration: 'none', letterSpacing: '0.06em',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT — Chat + Queue ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Queue */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: `1px solid ${PURPLE}33`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 900, color: PURPLE, marginBottom: 12 }}>
              CYPHER QUEUE
            </div>
            {CYPHER_PARTICIPANTS.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, marginBottom: 6,
                  background: i === activeSlot ? `${p.accent}14` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i === activeSlot ? p.accent + '44' : 'transparent'}`,
                }}
              >
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: i === activeSlot ? p.accent : '#fff' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{p.genre}</div>
                </div>
                {i === activeSlot && isRunning && (
                  <span style={{ fontSize: 8, color: p.accent, fontWeight: 900, letterSpacing: '0.1em' }}>ON STAGE</span>
                )}
                {i === activeSlot && !isRunning && (
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>NEXT UP</span>
                )}
                {i < activeSlot && (
                  <span style={{ fontSize: 8, color: '#00FF7F', fontWeight: 800 }}>DONE ✓</span>
                )}
              </div>
            ))}
            <Link
              href="/cypher/create"
              style={{
                display: 'block', textAlign: 'center', marginTop: 8,
                padding: '7px 0', borderRadius: 7, fontSize: 9, fontWeight: 800,
                background: `${PURPLE}14`, border: `1px solid ${PURPLE}33`,
                color: PURPLE, textDecoration: 'none', letterSpacing: '0.1em',
              }}
            >
              + REQUEST A SLOT
            </Link>
          </div>

          {/* Live chat */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: '14px 16px', flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 900, color: CYAN, marginBottom: 10 }}>
              CYPHER CHAT
            </div>
            <div
              style={{
                height: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10,
              }}
            >
              {chat.map((c) => (
                <div key={c.id} style={{ fontSize: 10, lineHeight: 1.4 }}>
                  <span style={{ color: c.color, fontWeight: 700 }}>{c.name}: </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c.msg}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} style={{ display: 'flex', gap: 6 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                maxLength={140}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 7, color: '#fff', padding: '8px 10px', fontSize: 11, outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 12px', borderRadius: 7, fontSize: 10, fontWeight: 800,
                  background: `linear-gradient(135deg, ${PURPLE}, ${FUCHSIA})`,
                  border: 'none', color: '#fff', cursor: 'pointer',
                }}
              >
                SEND
              </button>
            </form>
          </div>

          {/* Reaction bar */}
          <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 8 }}>REACTIONS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['🔥', '👑', '⚡', '🎤', '💯', '🏆', '👏', '🎵'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setChat((prev) => [
                    ...prev.slice(-40),
                    { id: ++chatId.current, name: 'YOU', msg: emoji, color: FUCHSIA },
                  ])}
                  style={{
                    fontSize: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                    transition: 'transform 0.1s',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom ticker */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.92)', borderTop: `1px solid ${PURPLE}55`,
        height: 24, overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          whiteSpace: 'nowrap', fontSize: 9, color: PURPLE, letterSpacing: '0.14em', fontWeight: 700,
          animation: 'tmiTicker 30s linear infinite',
        }}>
          ⚡ CYPHER STAGE LIVE &nbsp;·&nbsp; {viewers.toLocaleString()} WATCHING &nbsp;·&nbsp;
          NEXT: {CYPHER_PARTICIPANTS[(activeSlot + 1) % CYPHER_PARTICIPANTS.length]?.name} &nbsp;·&nbsp;
          JOIN THE CYPHER &nbsp;·&nbsp; VOTE FOR YOUR FAVORITE &nbsp;·&nbsp; BATTLES OPEN IN ARENA &nbsp;·&nbsp;
          ⚡ CYPHER STAGE LIVE &nbsp;·&nbsp; {viewers.toLocaleString()} WATCHING &nbsp;·&nbsp;
          NEXT: {CYPHER_PARTICIPANTS[(activeSlot + 1) % CYPHER_PARTICIPANTS.length]?.name} &nbsp;·&nbsp;
        </div>
      </div>

      <style>{`
        @keyframes tmiTicker { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
      `}</style>
    </main>
  );
}
