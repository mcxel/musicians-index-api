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

type Priority = 'critical' | 'high' | 'medium' | 'low';
type TaskStatus = 'open' | 'in-progress' | 'blocked' | 'done';

type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  domain: string;
  owner: string;
  due: string;
};

const TASKS: Task[] = [
  { id: 't01', title: 'Fix 4 undeliverable Diamond VIP emails',        priority: 'critical', status: 'in-progress', domain: 'Comms',      owner: 'MC Michael Charlie', due: 'Today' },
  { id: 't02', title: 'Verify all onboarding paths complete 100%',     priority: 'critical', status: 'done',        domain: 'Auth',        owner: 'MC Michael Charlie', due: 'Done' },
  { id: 't03', title: 'Confirm middleware heal endpoint deployed',      priority: 'high',     status: 'done',        domain: 'Auth',        owner: 'FixBot',              due: 'Done' },
  { id: 't04', title: 'Review sponsor contract renewals (2 expiring)',  priority: 'critical', status: 'open',        domain: 'Revenue',     owner: 'SponsorBot',          due: 'Today' },
  { id: 't05', title: 'Address 7 unfilled venue slots next 14 days',   priority: 'high',     status: 'open',        domain: 'Booking',     owner: 'MC Michael Charlie', due: '48h' },
  { id: 't06', title: 'Raise VIP tier pricing ($15 floor x 3 venues)', priority: 'high',     status: 'open',        domain: 'Revenue',     owner: 'MC Michael Charlie', due: '72h' },
  { id: 't07', title: 'Reprice 4 billboard slots (1.4× multiplier)',   priority: 'high',     status: 'open',        domain: 'Ads',         owner: 'AdRotationBot',       due: '48h' },
  { id: 't08', title: 'Bundle 3 low-conv merch SKUs into fan drops',   priority: 'medium',   status: 'open',        domain: 'Merch',       owner: 'MC Michael Charlie', due: '1 week' },
  { id: 't09', title: 'Check avatar runtime restoration status',       priority: 'medium',   status: 'in-progress', domain: 'Avatar',      owner: 'ReviewBot',           due: 'Ongoing' },
  { id: 't10', title: 'Confirm all role-specific dashboards wired',    priority: 'high',     status: 'open',        domain: 'Profiles',    owner: 'RouteAuditBot',       due: '48h' },
  { id: 't11', title: 'Activate Radio Network channels (20 planned)',  priority: 'medium',   status: 'open',        domain: 'Radio',       owner: 'RadioDJBot',          due: 'Post-launch' },
  { id: 't12', title: 'Ensure all Home 1–5 routes return real data',   priority: 'high',     status: 'open',        domain: 'Homepage',    owner: 'RouteAuditBot',       due: '24h' },
  { id: 't13', title: 'Deploy stream & win session launch model',      priority: 'medium',   status: 'open',        domain: 'Radio',       owner: 'MC Michael Charlie', due: 'Phase 2' },
  { id: 't14', title: 'Verify ticket authority enforcement (Rule 17)', priority: 'high',     status: 'open',        domain: 'Tickets',     owner: 'TicketBot',           due: '1 week' },
  { id: 't15', title: 'Confirm XP engine wired to all activity types', priority: 'medium',   status: 'in-progress', domain: 'Progression', owner: 'XPGrantBot',          due: 'Ongoing' },
];

const PRIORITY_STYLE: Record<Priority, { color: string; bg: string; border: string }> = {
  critical: { color: '#fca5a5', bg: 'rgba(69,10,10,0.45)',  border: 'rgba(239,68,68,0.55)' },
  high:     { color: '#fde68a', bg: 'rgba(69,39,5,0.45)',   border: 'rgba(251,191,36,0.5)' },
  medium:   { color: '#c4b5fd', bg: 'rgba(44,14,69,0.45)',  border: 'rgba(168,85,247,0.45)' },
  low:      { color: '#94a3b8', bg: 'rgba(20,20,30,0.4)',   border: 'rgba(148,163,184,0.25)' },
};

const STATUS_STYLE: Record<TaskStatus, { color: string; bg: string }> = {
  'open':        { color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' },
  'in-progress': { color: '#67e8f9', bg: 'rgba(0,255,255,0.08)' },
  'blocked':     { color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  'done':        { color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
};

export default function MCTasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const visible = TASKS.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (priorityFilter === 'all' || t.priority === priorityFilter)
  );

  const critical = TASKS.filter(t => t.priority === 'critical' && t.status !== 'done').length;
  const open = TASKS.filter(t => t.status === 'open').length;
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length;
  const done = TASKS.filter(t => t.status === 'done').length;

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="Mission Control — Task Queue"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Tasks' ? '1px solid rgba(251,191,36,0.7)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Tasks' ? 'rgba(120,53,15,0.45)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Tasks' ? '#fde68a' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Counts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          { label: 'Critical Open', value: critical, color: '#f87171' },
          { label: 'Open',          value: open,     color: '#94a3b8' },
          { label: 'In Progress',   value: inProgress, color: '#67e8f9' },
          { label: 'Done',          value: done,     color: '#4ade80' },
          { label: 'Total',         value: TASKS.length, color: '#fde68a' },
        ].map(s => (
          <div key={s.label} style={{ border: `1px solid ${s.color}33`, borderRadius: 8, background: 'rgba(255,255,255,0.02)', padding: '6px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(['all', 'open', 'in-progress', 'blocked', 'done'] as const).map(s => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)} style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
            border: statusFilter === s ? '1px solid rgba(0,255,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
            background: statusFilter === s ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.3)',
            color: statusFilter === s ? '#67e8f9' : '#64748b',
          }}>{s}</button>
        ))}
        <span style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
          <button key={p} type="button" onClick={() => setPriorityFilter(p)} style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
            border: priorityFilter === p ? '1px solid rgba(251,191,36,0.6)' : '1px solid rgba(255,255,255,0.08)',
            background: priorityFilter === p ? 'rgba(120,53,15,0.3)' : 'rgba(0,0,0,0.3)',
            color: priorityFilter === p ? '#fde68a' : '#64748b',
          }}>{p}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'grid', gap: 5 }}>
        {visible.map(task => {
          const ps = PRIORITY_STYLE[task.priority];
          const ss = STATUS_STYLE[task.status];
          return (
            <div key={task.id} style={{ border: `1px solid ${ps.border}`, borderRadius: 8, background: ps.bg, padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: task.status === 'done' ? '#64748b' : '#e2e8f0', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</p>
                <p style={{ margin: '3px 0 0', fontSize: 9, color: '#64748b' }}>{task.domain} · {task.owner}</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, whiteSpace: 'nowrap' }}>{task.priority}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: ss.bg, color: ss.color, whiteSpace: 'nowrap' }}>{task.status}</span>
              <span style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>{task.due}</span>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#475569', fontSize: 11 }}>No tasks match the current filters.</div>
        )}
      </div>
    </AdminShell>
  );
}
