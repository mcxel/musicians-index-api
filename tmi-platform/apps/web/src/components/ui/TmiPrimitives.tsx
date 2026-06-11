'use client';

import React, { useEffect } from 'react';
import { C, FONTS, FONT_IMPORT, KEYFRAMES } from '@/lib/tmiTokens';

// ── Font + global CSS injector (mount once per page) ──────────────────────────
export function TMIGlobalStyles() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = FONT_IMPORT;
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ${KEYFRAMES}
      .tmi-mq     { animation: tmiMq     1.9s ease-in-out infinite; }
      .tmi-mqB    { animation: tmiMqB    1.9s ease-in-out infinite; }
      .tmi-blink  { animation: tmiBlink  1.2s ease-in-out infinite; }
      .tmi-sway   { animation: tmiSway   2s   ease-in-out infinite; transform-origin: bottom center; }
      .tmi-float  { animation: tmiFloat  1.5s ease-out   forwards; }
      .tmi-ticker { animation: tmiTicker 14s  linear     infinite; }
      .tmi-flicker{ animation: tmiFlick  4s   ease-in-out infinite; }
      .tmi-pulse  { animation: tmiPulse  2s   ease-in-out infinite; }

      .tmi-btn {
        background:    transparent;
        border:        1px solid ${C.red};
        color:         ${C.amber};
        font-family:   ${FONTS.body};
        font-size:     10px;
        font-weight:   700;
        cursor:        pointer;
        border-radius: 4px;
        padding:       5px 9px;
        transition:    all .15s;
        letter-spacing:.06em;
        text-transform:uppercase;
      }
      .tmi-btn:hover  { background:rgba(230,48,0,.25); color:${C.gold}; box-shadow:0 0 8px rgba(230,48,0,.35); }
      .tmi-btn.gold   { border-color:${C.gold};  color:${C.gold};  }
      .tmi-btn.green  { border-color:${C.green}; color:${C.green}; }
      .tmi-btn.danger { border-color:${C.red};   color:${C.red};   }
      .tmi-btn.active { background:rgba(230,48,0,.3); color:${C.gold}; }

      .tmi-input {
        background:    rgba(12,20,50,.9);
        border:        1px solid ${C.border};
        color:         ${C.amber};
        font-family:   ${FONTS.body};
        font-size:     11px;
        outline:       none;
        border-radius: 4px;
        padding:       7px 11px;
        width:         100%;
      }
      .tmi-input::placeholder { color: ${C.dim}; }
      .tmi-input:focus { border-color:${C.red}; }

      .tmi-scroll::-webkit-scrollbar       { width: 4px; }
      .tmi-scroll::-webkit-scrollbar-track { background: rgba(230,48,0,.1); }
      .tmi-scroll::-webkit-scrollbar-thumb { background: ${C.red}; border-radius:2px; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
  return null;
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function Panel({ children, style = {}, className = '' }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, ...style }}>
      {children}
    </div>
  );
}

// ── Card (inner panel) ────────────────────────────────────────────────────────
export function Card({ children, style = {} }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, ...style }}>
      {children}
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function Label({ children, style = {} }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: C.amber, textTransform: 'uppercase', ...style }}>
      {children}
    </div>
  );
}

// ── TitleText (Orbitron neon flicker) ─────────────────────────────────────────
export function TitleText({ children, style = {} }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="tmi-flicker" style={{ fontFamily: FONTS.display, fontWeight: 900, color: C.red, textTransform: 'uppercase', letterSpacing: '.08em', ...style }}>
      {children}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, style = {}, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button className={`tmi-btn ${className}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// ── Dot (status indicator) ────────────────────────────────────────────────────
export function Dot({ color = C.green, size = 8, pulse = true }: {
  color?: string;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      className={pulse ? 'tmi-blink' : ''}
      style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }}
    />
  );
}

// ── BotBar ────────────────────────────────────────────────────────────────────
export function BotBar({ bots = [] }: { bots: { name: string; status: 'active' | 'busy' | 'idle' | 'error' }[] }) {
  const colorOf = (status: string) =>
    status === 'active' ? C.green : status === 'busy' ? C.gold : C.dim;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '6px 10px', background: 'rgba(0,0,0,.3)', borderTop: `1px solid ${C.border}` }}>
      {bots.map(({ name, status }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Dot color={colorOf(status)} size={6} />
          <span style={{ fontFamily: FONTS.body, fontSize: 8, color: C.dim }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

// ── MarqueeLights ─────────────────────────────────────────────────────────────
export function MarqueeLights({ children, height = 200, hCount = 18, vCount = 9 }: {
  children?: React.ReactNode;
  height?: number;
  hCount?: number;
  vCount?: number;
}) {
  const bulbs: { key: string; style: React.CSSProperties; cls: string }[] = [];

  for (let i = 0; i < hCount; i++) {
    const pct = `${(i / (hCount - 1)) * 96 + 2}%`;
    bulbs.push({ key: `t${i}`, style: { top: 4, left: pct },    cls: i % 2 === 0 ? 'tmi-mq' : 'tmi-mqB' });
    bulbs.push({ key: `b${i}`, style: { bottom: 4, left: pct }, cls: i % 2 === 0 ? 'tmi-mqB' : 'tmi-mq' });
  }
  for (let i = 1; i < vCount - 1; i++) {
    const pct = `${(i / (vCount - 1)) * 86 + 7}%`;
    bulbs.push({ key: `l${i}`, style: { left: 4, top: pct },  cls: i % 2 === 0 ? 'tmi-mq' : 'tmi-mqB' });
    bulbs.push({ key: `r${i}`, style: { right: 4, top: pct }, cls: i % 2 === 0 ? 'tmi-mqB' : 'tmi-mq' });
  }

  return (
    <div className="tmi-pulse" style={{ position: 'relative', height, border: `2px solid ${C.red}`, borderRadius: 8, overflow: 'hidden', background: '#06000a' }}>
      {bulbs.map(({ key, style, cls }) => (
        <div key={key} className={cls} style={{ position: 'absolute', width: 9, height: 9, borderRadius: '50%', background: '#FFD700', transform: 'translate(-50%,-50%)', ...style }} />
      ))}
      <div style={{ position: 'absolute', inset: 14, borderRadius: 4, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ── AudienceSVG ───────────────────────────────────────────────────────────────
export function AudienceSVG({ count = 21 }: { count?: number }) {
  const COLORS = ['#8B4513','#5C3317','#2F1B0E','#704214','#3D2008','#6B2C00','#4a1e00'];
  const people = Array.from({ length: count }, (_, i) => i);

  return (
    <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sglow" cx="50%" cy="0%" r="60%">
          <stop offset="0%"   stopColor="#FF8C00" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a0002" stopOpacity="0"   />
        </radialGradient>
      </defs>
      <rect width="400" height="160" fill="#0a0002" />
      <ellipse cx="200" cy="15" rx="130" ry="45" fill="url(#sglow)" />
      {people.map((i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        const x   = 35 + col * 50 + (row % 2) * 22;
        const y   = 60 + row * 30;
        const c   = COLORS[i % COLORS.length] ?? '#8B4513';
        const delay = `${((i * 0.18) % 2)}s`;
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + 18} rx="10" ry="14" fill={c} />
            <circle  cx={x} cy={y}       r="7"        fill={c} />
            {i % 3 === 0 && (
              <line
                className="tmi-sway"
                style={{ animationDelay: delay, transformOrigin: `${x}px ${y + 5}px` }}
                x1={x} y1={y + 5} x2={x - 11} y2={y - 14}
                stroke={c} strokeWidth="3" strokeLinecap="round"
              />
            )}
            {i % 4 === 0 && (
              <rect x={x - 13} y={y - 21} width="5" height="8" fill="#00E5FF" rx="1" opacity="0.8" />
            )}
          </g>
        );
      })}
      <rect x="0" y="130" width="400" height="30" fill="#0a0002" />
    </svg>
  );
}

// ── MiniBarChart (pure CSS, no recharts) ──────────────────────────────────────
export function MiniBarChart({ data = [], height = 56, color = C.red, labelKey = 'd', valueKey = 'v' }: {
  data?: Record<string, number>[];
  height?: number;
  color?: string;
  labelKey?: string;
  valueKey?: string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, height: `${((d[valueKey] ?? 0) / max) * 100}%`, background: color, borderRadius: '2px 2px 0 0', minWidth: 10, opacity: 0.7 + ((d[valueKey] ?? 0) / max) * 0.3 }} />
        ))}
      </div>
      {data[0]?.[labelKey] !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          {data.map((d, i) => (
            <span key={i} style={{ fontSize: 7, color: C.dim, flex: 1, textAlign: 'center' }}>{d[labelKey]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StackedBarChart ───────────────────────────────────────────────────────────
export function StackedBarChart({ data = [], keys = [], colors = [], labelKey = 'd', height = 100 }: {
  data?: Record<string, number>[];
  keys?: string[];
  colors?: string[];
  labelKey?: string;
  height?: number;
}) {
  const totals = data.map((d) => keys.reduce((s, k) => s + (d[k] ?? 0), 0));
  const max    = Math.max(...totals, 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, height: `${(totals[i]! / max) * 100}%`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            {keys.map((k, j) => (
              <div key={k} style={{ height: `${((d[k] ?? 0) / (totals[i] || 1)) * 100}%`, background: colors[j] ?? C.red, marginTop: j > 0 ? 1 : 0, borderRadius: j === keys.length - 1 ? '2px 2px 0 0' : 0, minHeight: 2 }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 7, color: C.dim, flex: 1, textAlign: 'center' }}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  );
}

// ── HealthRow ─────────────────────────────────────────────────────────────────
export function HealthRow({ label, status, color }: {
  label: string;
  status: string;
  color: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontFamily: FONTS.body, fontSize: 9, color: C.dim }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Dot color={color} size={6} pulse={color === C.red} />
        <span style={{ fontSize: 8, color, fontWeight: 700 }}>{status}</span>
      </div>
    </div>
  );
}

// ── TrustKillerEntry ──────────────────────────────────────────────────────────
export function TrustKillerEntry({ type, msg, time }: {
  type: 'WARN' | 'ERROR' | 'OK';
  msg: string;
  time: string;
}) {
  const color = type === 'WARN' ? C.gold : type === 'ERROR' ? C.red : C.green;
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 5, padding: '4px 6px', background: 'rgba(0,0,0,.3)', borderRadius: 3, borderLeft: `2px solid ${color}` }}>
      <span style={{ fontSize: 7, color, fontWeight: 700, minWidth: 36 }}>[{type}]</span>
      <span style={{ fontSize: 9, color: C.amber, flex: 1 }}>{msg}</span>
      <span style={{ fontSize: 7, color: C.dim, minWidth: 40, textAlign: 'right' }}>{time}</span>
    </div>
  );
}

// ── LiveRoomRow ───────────────────────────────────────────────────────────────
export function LiveRoomRow({ name, viewers, status = 'live', onView }: {
  name: string;
  viewers: number;
  status?: 'live' | 'private' | 'idle';
  onView?: () => void;
}) {
  const dotColor = status === 'live' ? C.green : status === 'private' ? C.gold : C.dim;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, padding: '4px 6px', background: 'rgba(230,48,0,.05)', borderRadius: 3 }}>
      <div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Dot color={dotColor} size={5} />
          <span style={{ fontFamily: FONTS.body, fontSize: 9, color: C.amber }}>{name}</span>
        </div>
        <span style={{ fontFamily: FONTS.body, fontSize: 7, color: C.dim }}>👁 {viewers.toLocaleString()}</span>
      </div>
      <button className="tmi-btn" onClick={onView} style={{ padding: '2px 5px', fontSize: 7 }}>View</button>
    </div>
  );
}
