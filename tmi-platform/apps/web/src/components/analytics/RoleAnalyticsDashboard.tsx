'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Users, Music, Star, DollarSign, Zap, Radio, Eye, Award, BarChart2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'admin' | 'artist' | 'performer' | 'fan' | 'venue' | 'sponsor' | 'advertiser' | 'promoter';

interface KPICard   { label: string; value: string; delta?: string; up?: boolean; color: string; icon: React.ElementType }
interface BarDatum  { label: string; value: number; max: number; color: string }
interface LineDatum { label: string; value: number }
interface RingDatum { value: number; max: number; label: string; color: string }

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ label, value, delta, up, color, icon: Icon }: KPICard) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -8, top: -8, opacity: 0.08 }}><Icon size={80} color={color} /></div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: up !== undefined ? 4 : 0 }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 10, color: up ? '#00FF88' : '#FF4444', fontWeight: 700 }}>
          {up ? '▲' : '▼'} {delta}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: '100%', background: `linear-gradient(to right, transparent, ${color}60)` }} />
    </motion.div>
  );
}

// ─── Animated Bar Chart ───────────────────────────────────────────────────────

function BarChart({ data, title, accent }: { data: BarDatum[]; title: string; accent: string }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent}18`, borderRadius: 12, padding: '14px 16px', height: '100%' }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: accent, marginBottom: 12, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: d.color }}>{d.value.toLocaleString()}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: go ? `${Math.min((d.value / d.max) * 100, 100)}%` : 0 }}
                transition={{ duration: 0.85, delay: i * 0.07, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 3, background: d.color, boxShadow: `0 0 8px ${d.color}60` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data, title, accent, h = 100 }: { data: LineDatum[]; title: string; accent: string; h?: number }) {
  const [go, setGo] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => { const t = setTimeout(() => setGo(true), 160); return () => clearTimeout(t); }, []);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, [data]);

  const W = 300, H = h, pad = 10;
  const vals = data.map(d => d.value);
  const mn = Math.min(...vals), mx = Math.max(...vals) || 1;
  const pts = data.map((_, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - ((vals[i] - mn) / (mx - mn || 1)) * (H - pad * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const a = `${d} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const gId = `g${title.replace(/\W/g, '')}`;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent}18`, borderRadius: 12, padding: '14px 16px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: 13, fontWeight: 900, color: accent }}>{vals[vals.length - 1]?.toLocaleString()}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: h, display: 'block' }}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={a} fill={`url(#${gId})`} />
        <path ref={pathRef} d={d} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: len || 9999, strokeDashoffset: go ? 0 : len || 9999, transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={accent}
            style={{ opacity: go ? 1 : 0, transition: `opacity 0.3s ${0.9 + i * 0.07}s` }} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((dd, i) => (
          <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{dd.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Ring Gauge ───────────────────────────────────────────────────────────────

function Ring({ value, max, label, color }: RingDatum) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 320); return () => clearTimeout(t); }, []);
  const r = 28, circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <svg width={70} height={70} viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          transform="rotate(-90 35 35)"
          style={{ strokeDasharray: circ, strokeDashoffset: go ? circ * (1 - pct) : circ, transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color}80)` }} />
        <text x="35" y="39" textAnchor="middle" fill="white" fontSize="11" fontWeight="900">{Math.round(pct * 100)}%</text>
      </svg>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center', maxWidth: 70 }}>{label}</span>
    </div>
  );
}

// ─── Role Data ────────────────────────────────────────────────────────────────

const PLATFORM: KPICard[] = [
  { label: 'Users Online',   value: '87',      delta: '+12 this hour', up: true,  color: '#00FFFF', icon: Users     },
  { label: 'Live Rooms',     value: '7',        delta: '+2 today',      up: true,  color: '#FF2DAA', icon: Radio     },
  { label: 'XP Flow / Min',  value: '320',      delta: '▲ trending',    up: true,  color: '#FFD700', icon: Zap       },
  { label: 'Trending #1',    value: 'DJ Blend', delta: '14 votes',      up: true,  color: '#AA2DFF', icon: Star      },
];

const WEEKLY: LineDatum[] = [
  { label: 'Mon', value: 420 }, { label: 'Tue', value: 680 }, { label: 'Wed', value: 540 },
  { label: 'Thu', value: 890 }, { label: 'Fri', value: 1240 }, { label: 'Sat', value: 1580 }, { label: 'Sun', value: 1100 },
];

function getConfig(role: Role) {
  const configs: Record<Role, { label: string; color: string; admin: boolean; kpis: KPICard[]; bars: BarDatum[]; rings: RingDatum[] }> = {
    admin: {
      label: 'Admin — Full Spectrum', color: '#00FFFF', admin: true,
      kpis: [
        { label: 'Revenue Today',     value: '$312.45', delta: '+$45',     up: true,  color: '#00FF88', icon: DollarSign },
        { label: 'Paid Members',      value: '128',     delta: '+3 today', up: true,  color: '#00FFFF', icon: Users      },
        { label: 'Submissions Queue', value: '5',       delta: 'pending',  up: false, color: '#FFD700', icon: BarChart2  },
        { label: 'Bot Fleet Active',  value: '62',      delta: '100%',     up: true,  color: '#AA2DFF', icon: Zap        },
      ],
      bars: [
        { label: 'Tickets',       value: 4200, max: 6000, color: '#FFD700' },
        { label: 'Tips',          value: 1180, max: 6000, color: '#00FFFF' },
        { label: 'Subscriptions', value: 880,  max: 6000, color: '#AA2DFF' },
        { label: 'Sponsors',      value: 3000, max: 6000, color: '#00FF88' },
        { label: 'Ads',           value: 420,  max: 6000, color: '#FF2DAA' },
        { label: 'Bookings',      value: 1600, max: 6000, color: '#FF6B35' },
      ],
      rings: [
        { value: 87,  max: 1243, label: 'Users Online', color: '#00FFFF' },
        { value: 7,   max: 12,   label: 'Rooms Active', color: '#FF2DAA' },
        { value: 128, max: 1243, label: 'Paid Members', color: '#00FF88' },
      ],
    },
    artist: {
      label: 'Artist Analytics', color: '#FF2DAA', admin: false,
      kpis: [
        { label: 'Total Plays',    value: '2,847', delta: '+124 today', up: true,  color: '#FF2DAA', icon: Music      },
        { label: 'Your XP',        value: '4,200', delta: '+320 today', up: true,  color: '#FFD700', icon: Zap        },
        { label: 'Fan Base',       value: '312',   delta: '+18',        up: true,  color: '#00FFFF', icon: Users      },
        { label: 'Revenue Earned', value: '$84.20',delta: '+$12',       up: true,  color: '#00FF88', icon: DollarSign },
      ],
      bars: [
        { label: 'Plays',     value: 2847, max: 5000, color: '#FF2DAA' },
        { label: 'Votes',     value: 412,  max: 1000, color: '#FFD700' },
        { label: 'Tips',      value: 84,   max: 500,  color: '#00FF88' },
        { label: 'Reactions', value: 1240, max: 3000, color: '#00FFFF' },
      ],
      rings: [
        { value: 312,  max: 1000,  label: 'Fan Base',    color: '#FF2DAA' },
        { value: 2847, max: 10000, label: 'Total Plays', color: '#FFD700' },
        { value: 8,    max: 20,    label: 'Battle Wins', color: '#00FF88' },
      ],
    },
    performer: {
      label: 'Performer Analytics', color: '#AA2DFF', admin: false,
      kpis: [
        { label: 'Live Sets',      value: '12',     delta: '+2 this month', up: true, color: '#AA2DFF', icon: Radio      },
        { label: 'Total Votes',    value: '1,840',  delta: '+240',          up: true, color: '#FFD700', icon: Star       },
        { label: 'Your XP',        value: '6,400',  delta: '+480 today',    up: true, color: '#00FFFF', icon: Zap        },
        { label: 'Revenue Earned', value: '$142',   delta: '+$22',          up: true, color: '#00FF88', icon: DollarSign },
      ],
      bars: [
        { label: 'Live Sets',        value: 12,   max: 30,    color: '#AA2DFF' },
        { label: 'Total Votes',      value: 1840, max: 5000,  color: '#FFD700' },
        { label: 'Crowd Reactions',  value: 4200, max: 10000, color: '#00FFFF' },
        { label: 'Tips Received',    value: 142,  max: 1000,  color: '#00FF88' },
      ],
      rings: [
        { value: 12,   max: 30,    label: 'Live Sets',   color: '#AA2DFF' },
        { value: 1840, max: 5000,  label: 'Total Votes', color: '#FFD700' },
        { value: 6400, max: 20000, label: 'XP Progress', color: '#00FFFF' },
      ],
    },
    fan: {
      label: 'Fan Dashboard', color: '#00FFFF', admin: false,
      kpis: [
        { label: 'Your XP',           value: '1,240', delta: '+80 today',   up: true, color: '#00FFFF', icon: Zap   },
        { label: 'Artists Following', value: '24',    delta: '+2',           up: true, color: '#FF2DAA', icon: Star  },
        { label: 'Shows Attended',    value: '8',     delta: '+1 this week', up: true, color: '#FFD700', icon: Eye   },
        { label: 'Votes Cast',        value: '156',   delta: '+12 today',    up: true, color: '#AA2DFF', icon: Award },
      ],
      bars: [
        { label: 'Reactions Sent', value: 892,  max: 2000, color: '#00FFFF' },
        { label: 'Shows Watched',  value: 8,    max: 30,   color: '#FF2DAA' },
        { label: 'Votes Cast',     value: 156,  max: 500,  color: '#AA2DFF' },
        { label: 'XP Earned',      value: 1240, max: 5000, color: '#FFD700' },
      ],
      rings: [
        { value: 1240, max: 5000, label: 'XP Progress',       color: '#00FFFF' },
        { value: 24,   max: 100,  label: 'Artists Followed',  color: '#FF2DAA' },
        { value: 8,    max: 30,   label: 'Shows This Month',  color: '#FFD700' },
      ],
    },
    venue: {
      label: 'Venue Analytics', color: '#00FF88', admin: false,
      kpis: [
        { label: 'Events This Month', value: '4',      delta: '+1',    up: true, color: '#00FF88', icon: Radio      },
        { label: 'Ticket Revenue',    value: '$4,200', delta: '+$800', up: true, color: '#FFD700', icon: DollarSign },
        { label: 'Total Attendance',  value: '1,840',  delta: '+220',  up: true, color: '#00FFFF', icon: Users      },
        { label: 'Avg Occupancy',     value: '84%',    delta: '+6%',   up: true, color: '#FF2DAA', icon: TrendingUp },
      ],
      bars: [
        { label: 'Jan', value: 1200, max: 5000, color: '#00FF88' },
        { label: 'Feb', value: 1800, max: 5000, color: '#00FF88' },
        { label: 'Mar', value: 2400, max: 5000, color: '#00FF88' },
        { label: 'Apr', value: 3100, max: 5000, color: '#00FF88' },
        { label: 'May', value: 4200, max: 5000, color: '#00FF88' },
      ],
      rings: [
        { value: 4200, max: 10000, label: 'Ticket Rev', color: '#FFD700' },
        { value: 84,   max: 100,   label: 'Occupancy',  color: '#00FF88' },
        { value: 1840, max: 5000,  label: 'Attendance', color: '#00FFFF' },
      ],
    },
    sponsor: {
      label: 'Sponsor Analytics', color: '#FFD700', admin: false,
      kpis: [
        { label: 'Impressions Today',  value: '14,200', delta: '+2.1k',  up: true, color: '#FFD700', icon: Eye        },
        { label: 'Click-Through Rate', value: '3.8%',   delta: '+0.4%',  up: true, color: '#00FFFF', icon: TrendingUp },
        { label: 'Gifts Activated',    value: '24',     delta: 'week',   up: true, color: '#FF2DAA', icon: Award      },
        { label: 'ROI Estimate',       value: '4.2x',   delta: '↑',      up: true, color: '#00FF88', icon: DollarSign },
      ],
      bars: [
        { label: 'Banner Impr.',  value: 8400, max: 20000, color: '#FFD700' },
        { label: 'Gifts Active',  value: 24,   max: 100,   color: '#FF2DAA' },
        { label: 'Clicks',        value: 540,  max: 1000,  color: '#00FFFF' },
        { label: 'Conversions',   value: 38,   max: 200,   color: '#00FF88' },
      ],
      rings: [
        { value: 14200, max: 50000, label: 'Impressions', color: '#FFD700' },
        { value: 38,    max: 540,   label: 'Conversions', color: '#00FF88' },
        { value: 24,    max: 100,   label: 'Gifts Active', color: '#FF2DAA' },
      ],
    },
    advertiser: {
      label: 'Advertiser Analytics', color: '#FF6B35', admin: false,
      kpis: [
        { label: 'Ad Impressions',   value: '22,400', delta: '+3.4k', up: true, color: '#FF6B35', icon: Eye        },
        { label: 'CTR',              value: '2.1%',   delta: '+0.2%', up: true, color: '#00FFFF', icon: TrendingUp },
        { label: 'Campaigns Active', value: '3',      delta: '→',     up: true, color: '#FFD700', icon: Radio      },
        { label: 'Spend Today',      value: '$84',    delta: 'budget',up: true, color: '#FF2DAA', icon: DollarSign },
      ],
      bars: [
        { label: 'Impressions', value: 22400, max: 50000, color: '#FF6B35' },
        { label: 'Clicks',      value: 470,   max: 2000,  color: '#00FFFF' },
        { label: 'Conversions', value: 28,    max: 200,   color: '#00FF88' },
        { label: 'Spend',       value: 84,    max: 500,   color: '#FF2DAA' },
      ],
      rings: [
        { value: 22400, max: 50000, label: 'Impressions', color: '#FF6B35' },
        { value: 470,   max: 2000,  label: 'Clicks',      color: '#00FFFF' },
        { value: 28,    max: 470,   label: 'Conversions', color: '#00FF88' },
      ],
    },
    promoter: {
      label: 'Promoter Analytics', color: '#FF2DAA', admin: false,
      kpis: [
        { label: 'Events Promoted', value: '6',      delta: '+1',   up: true, color: '#FF2DAA', icon: Radio      },
        { label: 'Tickets Sold',    value: '1,240',  delta: '+180', up: true, color: '#FFD700', icon: Star       },
        { label: 'Revenue Share',   value: '$620',   delta: '+$90', up: true, color: '#00FF88', icon: DollarSign },
        { label: 'Fan Reach',       value: '4,800',  delta: '+320', up: true, color: '#00FFFF', icon: Users      },
      ],
      bars: [
        { label: 'Tickets Sold',  value: 1240, max: 3000,  color: '#FF2DAA' },
        { label: 'Fan Reach',     value: 4800, max: 10000, color: '#00FFFF' },
        { label: 'Revenue Share', value: 620,  max: 2000,  color: '#00FF88' },
        { label: 'Events',        value: 6,    max: 20,    color: '#FFD700' },
      ],
      rings: [
        { value: 1240, max: 3000, label: 'Tickets Sold',  color: '#FF2DAA' },
        { value: 6,    max: 20,   label: 'Events',         color: '#FFD700' },
        { value: 620,  max: 2000, label: 'Revenue Share',  color: '#00FF88' },
      ],
    },
  };
  return configs[role] ?? configs.fan;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function RoleAnalyticsDashboard({ defaultRole }: { defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole ?? 'fan');
  const [tick, setTick] = useState('');

  useEffect(() => {
    setTick(new Date().toLocaleTimeString());
    const t = setInterval(() => setTick(new Date().toLocaleTimeString()), 1000);
    if (!defaultRole) {
      const m = document.cookie.match(/tmi_role=([^;]+)/);
      const r = m?.[1]?.toLowerCase() as Role | undefined;
      if (r && r in getConfig) setRole(r);
    }
    return () => clearInterval(t);
  }, [defaultRole]);

  const cfg = getConfig(role);

  return (
    <div style={{ color: '#fff', fontFamily: 'inherit' }}>

      {/* Role tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['admin','artist','performer','fan','venue','sponsor','advertiser','promoter'] as Role[]).map(r => (
          <button key={r} onClick={() => setRole(r)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 900, cursor: 'pointer',
              border: `1px solid ${role === r ? cfg.color + '55' : 'rgba(255,255,255,0.1)'}`,
              background: role === r ? `${cfg.color}10` : 'transparent',
              color: role === r ? cfg.color : 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
            {r}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.2)', alignSelf: 'center' }}>Live · {tick}</span>
      </div>

      {/* Platform-wide KPIs */}
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>
        Platform — Live
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {PLATFORM.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <KPICard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Personal KPIs */}
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: cfg.color, marginBottom: 10, textTransform: 'uppercase' }}>
        {cfg.label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {cfg.kpis.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.04 }}>
            <KPICard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        <BarChart data={cfg.bars} title="Breakdown" accent={cfg.color} />
        <LineChart data={WEEKLY} title="Weekly Activity" accent={cfg.color} h={120} />
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${cfg.color}18`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: cfg.color, marginBottom: 12, textTransform: 'uppercase' }}>Progress Rings</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 }}>
            {cfg.rings.map((r, i) => <Ring key={i} {...r} />)}
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {cfg.admin && (
        <>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#FF2020', marginBottom: 10, textTransform: 'uppercase' }}>
            System Controls
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: '🎛️ Overseer Deck',      href: '/admin/overseer',          color: '#00FFFF' },
              { label: '📡 Broadcast Studio',   href: '/broadcast/studio',        color: '#FF2DAA' },
              { label: '📺 Video Observatory',  href: '/admin/video-observatory', color: '#AA2DFF' },
              { label: '⚙️ Platform Settings',  href: '/admin/settings',          color: '#FFD700' },
            ].map(btn => (
              <Link key={btn.label} href={btn.href} style={{
                display: 'block', padding: '12px 14px', textAlign: 'center',
                background: `${btn.color}08`, border: `1px solid ${btn.color}25`,
                borderRadius: 12, color: btn.color, textDecoration: 'none',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
              }}>
                {btn.label} →
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
