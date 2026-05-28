'use client';

import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Radio, Zap, DollarSign, MessageSquare, Send, Mic, MicOff, PhoneOff, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import CanonOverseerShell from '@/components/admin/CanonOverseerShell';
import type { TMIAdminStats } from '@/lib/admin/AdminStatsEngine';

// ─── Data ─────────────────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) return {
    users:    { total: 1243, online: 87, newToday: 42, churned: 5 },
    rooms:    { total: 12, active: 7, topRoom: 'World Dance Party' },
    stream:   { activeListeners: 64, totalMinutesToday: 1823, xpPerMinute: 320 },
    business: { totalMembers: 1243, paidMembers: 128, revenueToday: 312.45 },
  };
  const ct = res.headers.get('content-type');
  if (ct?.includes('text/html')) throw new Error('HTML intercepted by middleware');
  return res.json();
};

interface MonitorFeed {
  id: string;
  name: string;
  role: string;
  status: 'live' | 'standby' | 'offline';
  viewers: number;
  color: string;
  bgGradient: string;
  resolution: string;
  fps: number;
  bitrate: string;
  signal: number;
}

const MONITOR_FEEDS: MonitorFeed[] = [
  {
    id: 'big-ace', name: 'Big Ace', role: 'Platform Director', status: 'live', viewers: 142,
    color: '#FFD700', bgGradient: 'linear-gradient(135deg, #1a1200 0%, #0d0a00 40%, #050410 100%)',
    resolution: '1080p', fps: 60, bitrate: '8Mb/s', signal: 4,
  },
  {
    id: 'dj-blend', name: 'DJ Blend', role: 'Live Performer', status: 'live', viewers: 89,
    color: '#FF2DAA', bgGradient: 'linear-gradient(135deg, #1a0015 0%, #0d0008 40%, #050410 100%)',
    resolution: '1080p', fps: 30, bitrate: '6Mb/s', signal: 3,
  },
  {
    id: 'nova-c', name: 'Nova Cipher', role: 'Battle Artist', status: 'standby', viewers: 0,
    color: '#AA2DFF', bgGradient: 'linear-gradient(135deg, #0f0018 0%, #080010 40%, #050410 100%)',
    resolution: '720p', fps: 30, bitrate: '4Mb/s', signal: 2,
  },
];

interface ChatMsg { id: number; from: string; text: string; ts: string; self: boolean }

const SEED_MSGS: ChatMsg[] = [
  { id: 1, from: 'Big Ace',  text: 'Sound check good on my end — ready when you are',  ts: '10:42', self: false },
  { id: 2, from: 'Marcel',   text: 'Copy. Audience at 87 and climbing 🔥',               ts: '10:43', self: true  },
  { id: 3, from: 'Big Ace',  text: 'DJ Blend just confirmed going live in 3',            ts: '10:44', self: false },
  { id: 4, from: 'Jay Paul', text: 'Stream pipeline stable — no drops',                  ts: '10:45', self: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SignalBars({ strength }: { strength: number }) {
  const heights = [4, 7, 10, 14];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h,
          borderRadius: 1,
          background: i < strength ? '#00FF88' : 'rgba(255,255,255,0.12)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

function AudioMeter({ active, color }: { active: boolean; color: string }) {
  const [levels, setLevels] = React.useState(() => Array(8).fill(0).map(() => Math.random() * 0.4));
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLevels(Array(8).fill(0).map(() => Math.random()));
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 14 }}>
      {levels.map((l, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 1,
          height: `${Math.max(12, l * 100)}%`,
          background: l > 0.85 ? '#FF2020' : l > 0.65 ? '#FFD700' : color,
          transition: 'height 0.1s ease',
          opacity: active ? 1 : 0.2,
        }} />
      ))}
    </div>
  );
}

// Film grain filter ID must be unique per tile to avoid SVG filter ID collision
function FilmGrain({ id }: { id: string }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

function PerformerWindow({ feed, expanded, onExpand }: { feed: MonitorFeed; expanded: boolean; onExpand: () => void }) {
  const isLive = feed.status === 'live';
  const [muted, setMuted] = React.useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        borderRadius: 10,
        border: `1px solid ${feed.color}30`,
        background: '#050510',
        overflow: 'hidden',
        boxShadow: isLive ? `0 4px 32px ${feed.color}12` : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <FilmGrain id={feed.id} />

      {/* Video viewport */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: feed.bgGradient }}>

        {/* Film grain texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }} />

        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)',
        }} />

        {/* Radial vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.72) 100%)',
        }} />

        {/* Bottom lower-third gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', zIndex: 4,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
        }} />

        {/* Center content — subtle name monogram in background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isLive ? 0.06 : 0.12,
        }}>
          <span style={{
            fontSize: 72, fontWeight: 900, letterSpacing: '-0.05em',
            color: feed.color, fontFamily: 'monospace',
          }}>
            {feed.name.split(' ').map(w => w[0]).join('')}
          </span>
        </div>

        {/* TOP BAR — status + controls */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px',
        }}>
          {/* LIVE badge */}
          {isLive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,32,32,0.5)', borderRadius: 4,
              padding: '3px 7px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020',
                boxShadow: '0 0 5px #FF2020', display: 'inline-block' }} />
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#fff' }}>LIVE</span>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
              padding: '3px 7px',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.15em', textTransform: 'uppercase' }}>{feed.status}</span>
            </div>
          )}

          {/* Top-right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SignalBars strength={feed.signal} />
            <button onClick={onExpand}
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4,
                padding: '3px 5px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center' }}>
              <Maximize2 size={9} />
            </button>
          </div>
        </div>

        {/* BOTTOM lower-third */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: '10px 10px 8px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '0.02em',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>{feed.name}</div>
            <div style={{ fontSize: 9, color: feed.color, fontWeight: 700, letterSpacing: '0.06em', marginTop: 1 }}>
              {feed.role.toUpperCase()}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginTop: 2 }}>
              {feed.resolution} · {feed.fps}fps · {feed.bitrate}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {isLive && (
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: feed.color }}>👁</span>
                {feed.viewers.toLocaleString()}
              </div>
            )}
            <AudioMeter active={isLive && !muted} color={feed.color} />
          </div>
        </div>
      </div>

      {/* Control strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', borderTop: `1px solid ${feed.color}14`,
        background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
          CAM_{feed.id.replace(/-/g, '_').toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={() => setMuted(m => !m)}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 7px', borderRadius: 5, cursor: 'pointer',
              border: `1px solid ${muted ? 'rgba(255,32,32,0.4)' : `${feed.color}35`}`,
              background: muted ? 'rgba(255,32,32,0.1)' : `${feed.color}0d`,
              color: muted ? '#FF2020' : feed.color }}>
            {muted ? <MicOff size={9} /> : <Mic size={9} />}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', padding: '4px 7px', borderRadius: 5, cursor: 'pointer',
            border: '1px solid rgba(255,32,32,0.25)', background: 'rgba(255,32,32,0.08)',
            color: '#FF6060' }}>
            <PhoneOff size={9} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TeamChatPanel() {
  const [msgs, setMsgs] = useState<ChatMsg[]>(SEED_MSGS);
  const [draft, setDraft] = useState('');
  const [muted, setMuted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  function send() {
    if (!draft.trim()) return;
    setMsgs(prev => [...prev, {
      id: Date.now(),
      from: 'Marcel',
      text: draft.trim(),
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      self: true,
    }]);
    setDraft('');
  }

  return (
    <div className="flex flex-col rounded-xl border overflow-hidden h-full"
      style={{ borderColor: 'rgba(0,255,255,0.15)', background: '#050510' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'rgba(0,255,255,0.1)', background: 'rgba(0,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <MessageSquare size={12} className="text-[#00FFFF]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFFF]">Team Comms</span>
        </div>
        <button onClick={() => setMuted(m => !m)}
          className="p-1 rounded transition hover:bg-white/10">
          {muted ? <MicOff size={11} className="text-red-400" /> : <Mic size={11} className="text-[#00FFFF]" />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {msgs.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, x: msg.self ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}>
              {!msg.self && (
                <span className="text-[8px] font-bold mb-0.5" style={{ color: '#FFD700' }}>{msg.from}</span>
              )}
              <div className="max-w-[88%] rounded-lg px-2.5 py-1.5 text-[10px]"
                style={msg.self
                  ? { background: 'rgba(0,255,255,0.12)', border: '1px solid rgba(0,255,255,0.2)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}>
                {msg.text}
              </div>
              <span className="text-[8px] text-white/25 mt-0.5">{msg.ts}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-2 py-2 border-t flex gap-1.5" style={{ borderColor: 'rgba(0,255,255,0.1)' }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message team…"
          className="flex-1 rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 outline-none focus:border-[#00FFFF]/40"
        />
        <button onClick={send}
          className="flex items-center justify-center w-7 h-7 rounded bg-[#00FFFF]/15 border border-[#00FFFF]/30 text-[#00FFFF] hover:bg-[#00FFFF]/25 transition">
          <Send size={11} />
        </button>
      </div>
    </div>
  );
}

function KPICard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border p-5 group"
      style={{ background: '#0a0a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-110">
        <Icon size={96} color={color} />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">{title}</div>
        <div className="text-4xl font-black tracking-tight mb-1.5" style={{ color }}>{value}</div>
        <div className="text-[10px] font-mono text-white/35">{sub}</div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-40"
        style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverseerDeck() {
  const { data: stats } = useSWR<TMIAdminStats>('/api/admin/stats', fetcher, { refreshInterval: 5000 });
  const [expandedFeed, setExpandedFeed] = useState<string | null>(null);
  const [tick, setTick] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTick(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = stats ?? {
    users:    { total: 1243, online: 87, newToday: 42, churned: 5 },
    rooms:    { total: 12, active: 7, topRoom: 'World Dance Party' },
    stream:   { activeListeners: 64, totalMinutesToday: 1823, xpPerMinute: 320 },
    business: { totalMembers: 1243, paidMembers: 128, revenueToday: 312.45 },
  };

  return (
    <main className="min-h-screen text-white font-sans" style={{ background: 'radial-gradient(ellipse at top, #0d0025 0%, #050510 55%, #000 100%)' }}>
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex justify-between items-end border-b pb-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
              <span className="text-[10px] tracking-[0.3em] font-black text-[#00FF88]">SYSTEM ONLINE</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              OVERSEER DECK
            </h1>
            <p className="text-xs text-white/30 mt-1 tracking-widest">ADMIN COMMAND CENTER · BERNTOUTGLOBAL LLC</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-[10px] text-white/40 tracking-widest uppercase">Global Time</div>
              <div className="text-2xl font-mono text-[#00FFFF]">{tick}</div>
            </div>
            <div className="flex gap-2">
              <Link href="/broadcast/studio"
                className="px-4 py-2 rounded text-[10px] font-black tracking-widest text-[#FF2DAA] border transition hover:bg-[#FF2DAA]/10"
                style={{ borderColor: 'rgba(255,45,170,0.3)', textDecoration: 'none' }}>
                🎛️ BROADCAST STUDIO →
              </Link>
              <Link href="/admin/video-observatory"
                className="px-4 py-2 rounded text-[10px] font-black tracking-widest text-[#00FFFF] border transition hover:bg-[#00FFFF]/10"
                style={{ borderColor: 'rgba(0,255,255,0.3)', textDecoration: 'none' }}>
                📺 VIDEO WALL →
              </Link>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Active Users"    value={s.users.online.toLocaleString()}           sub={`${s.users.newToday} new today`}           icon={Users}      color="#00FFFF" />
          <KPICard title="Active Rooms"    value={s.rooms.active.toString()}                  sub={`Top: ${s.rooms.topRoom}`}                  icon={Radio}      color="#FF2DAA" />
          <KPICard title="XP Flow / Min"   value={s.stream.xpPerMinute.toLocaleString()}      sub={`${s.stream.activeListeners} listeners`}    icon={Zap}        color="#FFD700" />
          <KPICard title="Today's Revenue" value={`$${s.business.revenueToday.toFixed(2)}`}  sub={`${s.business.paidMembers} paid members`}   icon={DollarSign} color="#00FF88" />
        </div>

        {/* ── Multi-View Monitor ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,215,0,0.4), transparent)' }} />
            <span className="text-[9px] font-black tracking-[0.25em] text-[#FFD700] uppercase">Multi-View Monitor</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,215,0,0.4), transparent)' }} />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 260px' }}>
            {MONITOR_FEEDS.map(feed => (
              <PerformerWindow
                key={feed.id}
                feed={feed}
                expanded={expandedFeed === feed.id}
                onExpand={() => setExpandedFeed(expandedFeed === feed.id ? null : feed.id)}
              />
            ))}
            <TeamChatPanel />
          </div>
        </section>

        {/* ── Canon Overseer Shell (full command center) ──────── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(170,45,255,0.4), transparent)' }} />
            <span className="text-[9px] font-black tracking-[0.25em] text-[#AA2DFF] uppercase">Command Center</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(170,45,255,0.4), transparent)' }} />
          </div>
          <CanonOverseerShell />
        </section>

      </div>
    </main>
  );
}
