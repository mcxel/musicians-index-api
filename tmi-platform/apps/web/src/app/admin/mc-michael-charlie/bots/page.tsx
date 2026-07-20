'use client';
import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';

const NAV_LINKS = [
  { href: '/admin/mc-michael-charlie', label: 'Home' },
  { href: '/admin/mc-michael-charlie/overview', label: 'Overview' },
  { href: '/admin/mc-michael-charlie/operations', label: 'Operations' },
  { href: '/admin/mc-michael-charlie/bots', label: 'Bots' },
  { href: '/admin/mc-michael-charlie/tasks', label: 'Tasks' },
  { href: '/admin/mc-michael-charlie/corrections', label: 'Corrections' },
  { href: '/admin/mc-michael-charlie/communications', label: 'Comms' },
];

type BotStatus = 'active' | 'standby' | 'paused' | 'error';

type Bot = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: BotStatus;
  tasksCompleted: number;
  lastActive: string;
};

const BOT_ROSTER: Bot[] = [
  { id: 'b01', name: 'CopyBot',         department: 'Content',     role: 'Article + SEO writing',        status: 'active',  tasksCompleted: 842,  lastActive: '2 min ago' },
  { id: 'b02', name: 'ReviewBot',       department: 'Dev',         role: 'Code review + lint checks',    status: 'active',  tasksCompleted: 1230, lastActive: '5 min ago' },
  { id: 'b03', name: 'FixBot',          department: 'Dev',         role: 'Auto-patch TS/import errors',  status: 'active',  tasksCompleted: 415,  lastActive: '1 min ago' },
  { id: 'b04', name: 'DeployBot',       department: 'Infra',       role: 'CI/CD pipeline trigger',       status: 'standby', tasksCompleted: 78,   lastActive: '12 min ago' },
  { id: 'b05', name: 'DataBot',         department: 'Analytics',   role: 'Metrics ingestion + reporting', status: 'active', tasksCompleted: 2100, lastActive: 'now' },
  { id: 'b06', name: 'AlertBot',        department: 'Ops',         role: 'Incident detection + pages',   status: 'active',  tasksCompleted: 320,  lastActive: '30 sec ago' },
  { id: 'b07', name: 'SponsorBot',      department: 'Revenue',     role: 'Sponsor renewal outreach',     status: 'active',  tasksCompleted: 54,   lastActive: '8 min ago' },
  { id: 'b08', name: 'AdRotationBot',   department: 'Revenue',     role: 'Ad slot rotation + fill',      status: 'active',  tasksCompleted: 4820, lastActive: 'now' },
  { id: 'b09', name: 'EmailBot',        department: 'Comms',       role: 'Transactional email dispatch', status: 'active',  tasksCompleted: 1640, lastActive: '1 min ago' },
  { id: 'b10', name: 'RadioDJBot',      department: 'Media',       role: 'Radio rotation + DJ voice',    status: 'standby', tasksCompleted: 193,  lastActive: '22 min ago' },
  { id: 'b11', name: 'BattleRefBot',    department: 'Competition', role: 'Battle judging + scoring',     status: 'active',  tasksCompleted: 280,  lastActive: '4 min ago' },
  { id: 'b12', name: 'BotCrowdFill',    department: 'Audience',    role: 'Stadium fill + bot avatars',   status: 'active',  tasksCompleted: 8920, lastActive: 'now' },
  { id: 'b13', name: 'XPGrantBot',      department: 'Progression', role: 'XP distribution + tiers',      status: 'active', tasksCompleted: 5480, lastActive: 'now' },
  { id: 'b14', name: 'RouteAuditBot',   department: 'QA',          role: 'Broken route detection',       status: 'active',  tasksCompleted: 166,  lastActive: '9 min ago' },
  { id: 'b15', name: 'TicketBot',       department: 'Commerce',    role: 'Ticket issuance + claims',     status: 'active',  tasksCompleted: 740,  lastActive: '3 min ago' },
];

const STATUS_STYLE: Record<BotStatus, { bg: string; color: string; border: string }> = {
  active:  { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80',  border: 'rgba(74,222,128,0.3)' },
  standby: { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24',  border: 'rgba(251,191,36,0.3)' },
  paused:  { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8',  border: 'rgba(148,163,184,0.25)' },
  error:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171',  border: 'rgba(248,113,113,0.3)' },
};

const DEPT_COLORS: Record<string, string> = {
  Dev: '#00FFFF', Content: '#FF2DAA', Revenue: '#FFD700', Ops: '#f59e0b',
  Analytics: '#c4b5fd', Infra: '#a78bfa', Comms: '#67e8f9', Media: '#818cf8',
  Competition: '#fb7185', Audience: '#34d399', Progression: '#fbbf24',
  QA: '#94a3b8', Commerce: '#fde68a',
};

export default function MCBotsPage() {
  const [filter, setFilter] = useState<BotStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = BOT_ROSTER.filter(b =>
    (filter === 'all' || b.status === filter) &&
    (search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.department.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all:     BOT_ROSTER.length,
    active:  BOT_ROSTER.filter(b => b.status === 'active').length,
    standby: BOT_ROSTER.filter(b => b.status === 'standby').length,
    paused:  BOT_ROSTER.filter(b => b.status === 'paused').length,
    error:   BOT_ROSTER.filter(b => b.status === 'error').length,
  };

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="Bot Oversight"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Bots' ? '1px solid rgba(0,255,255,0.7)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Bots' ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Bots' ? '#67e8f9' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {(['all', 'active', 'standby', 'paused', 'error'] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              border: filter === s ? '1px solid rgba(0,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === s ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.3)',
              color: filter === s ? '#67e8f9' : '#64748b',
            }}
          >
            {s} ({counts[s]})
          </button>
        ))}
        <input
          type="text"
          placeholder="Search bots…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto', fontSize: 11, padding: '5px 12px', borderRadius: 6,
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f1f5f9', outline: 'none', width: 160,
          }}
        />
      </div>

      {/* Bot roster table */}
      <div style={{ border: '1px solid rgba(0,255,255,0.18)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 110px 1fr 90px 70px 100px', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '8px 14px', background: 'rgba(0,20,30,0.8)' }}>
          {['Bot', 'Department', 'Role', 'Tasks Done', 'Status', 'Last Active'].map(h => (
            <span key={h} style={{ fontSize: 9, color: '#67e8f9', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>
        {visible.map((bot, i) => {
          const ss = STATUS_STYLE[bot.status];
          return (
            <div key={bot.id} style={{ display: 'grid', gridTemplateColumns: '180px 110px 1fr 90px 70px 100px', gap: 0, padding: '9px 14px', alignItems: 'center', background: i % 2 === 0 ? 'rgba(0,0,0,0.25)' : 'rgba(0,20,30,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{bot.name}</span>
              <span style={{ fontSize: 10, color: DEPT_COLORS[bot.department] ?? '#94a3b8', fontWeight: 700 }}>{bot.department}</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{bot.role}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fde68a' }}>{bot.tasksCompleted.toLocaleString()}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 4, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, textTransform: 'uppercase', textAlign: 'center' }}>{bot.status}</span>
              <span style={{ fontSize: 9, color: '#64748b' }}>{bot.lastActive}</span>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: 11 }}>No bots match filter.</div>
        )}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <Link href="/admin/bots" style={{ fontSize: 10, color: '#67e8f9', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 6, padding: '5px 12px', textDecoration: 'none', fontWeight: 700 }}>
          Full Bot Roster →
        </Link>
        <Link href="/admin/mc-michael-charlie/corrections" style={{ fontSize: 10, color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, padding: '5px 12px', textDecoration: 'none', fontWeight: 700 }}>
          Send Corrections →
        </Link>
      </div>
    </AdminShell>
  );
}
