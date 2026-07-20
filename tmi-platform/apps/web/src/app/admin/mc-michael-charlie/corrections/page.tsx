'use client';
import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import ProfitLeakScanner from '@/components/admin/profit/ProfitLeakScanner';
import RevenueCorrectionRail from '@/components/admin/profit/RevenueCorrectionRail';
import EmergencyCorrectionPanel from '@/components/admin/profit/EmergencyCorrectionPanel';

const NAV_LINKS = [
  { href: '/admin/mc-michael-charlie', label: 'Home' },
  { href: '/admin/mc-michael-charlie/overview', label: 'Overview' },
  { href: '/admin/mc-michael-charlie/operations', label: 'Operations' },
  { href: '/admin/mc-michael-charlie/bots', label: 'Bots' },
  { href: '/admin/mc-michael-charlie/tasks', label: 'Tasks' },
  { href: '/admin/mc-michael-charlie/corrections', label: 'Corrections' },
  { href: '/admin/mc-michael-charlie/communications', label: 'Comms' },
];

type CorrectionType = 'pricing' | 'routing' | 'email' | 'data' | 'auth';

type Correction = {
  id: string;
  type: CorrectionType;
  title: string;
  detail: string;
  status: 'pending' | 'applied' | 'rejected';
  impact: string;
};

const PENDING_CORRECTIONS: Correction[] = [
  { id: 'c1', type: 'pricing', title: 'Raise VIP ticket floor ($15 across 3 venues)', detail: 'Current floor is $35 — demand curve supports $50. Apply 1.43× multiplier.', status: 'pending', impact: '+$9,200/mo' },
  { id: 'c2', type: 'pricing', title: 'Reprice 4 billboard CPM slots', detail: '4 billboard slots sitting at 40% below market CPM rate. Apply 1.4× multiplier.', status: 'pending', impact: '+$4,800/mo' },
  { id: 'c3', type: 'email',   title: 'Fix 4 undeliverable Diamond VIP emails', detail: 'VIP-JPS-2026, VIP-KREACH-2026, VIP-KG-2026, VIP-SAVAGE-2026 have placeholder/internal emails.', status: 'pending', impact: '4 VIP invites at risk' },
  { id: 'c4', type: 'data',    title: 'Remove VIP-ACE-2026 invite (AI system agent)', detail: 'Big Ace is an AI agent — does not need a VIP signup invite.', status: 'applied', impact: 'Clarity + data hygiene' },
  { id: 'c5', type: 'routing', title: '3 broken /hub/venue sub-routes', detail: '/hub/venue/events, /hub/venue/tickets, /hub/venue/booking returning 404.', status: 'pending', impact: 'Venue user experience' },
  { id: 'c6', type: 'auth',    title: 'Confirm onboarding middleware heal deployed', detail: 'All users who had no tmi_onboarding_state cookie were getting bounced. Heal endpoint deployed at 45662ab7.', status: 'applied', impact: 'All users can complete onboarding' },
];

const TYPE_COLORS: Record<CorrectionType, string> = {
  pricing: '#FFD700',
  routing: '#00FFFF',
  email:   '#FF2DAA',
  data:    '#c4b5fd',
  auth:    '#4ade80',
};

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  applied:  { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(74,222,128,0.25)' },
  rejected: { color: '#f87171', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(248,113,113,0.25)' },
};

export default function MCCorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>(PENDING_CORRECTIONS);
  const [activePanel, setActivePanel] = useState<'scanner' | 'revenue' | 'emergency' | null>(null);

  function apply(id: string) {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'applied' as const } : c));
  }
  function reject(id: string) {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c));
  }

  const pending = corrections.filter(c => c.status === 'pending');
  const applied = corrections.filter(c => c.status === 'applied');

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="System Corrections"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Corrections' ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Corrections' ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Corrections' ? '#f87171' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>{pending.length}</span>
          <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pending</span>
        </div>
        <div style={{ border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>{applied.length}</span>
          <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Applied</span>
        </div>
      </div>

      {/* Correction list */}
      <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
        {corrections.map(c => {
          const ss = STATUS_STYLE[c.status];
          return (
            <div key={c.id} style={{ border: `1px solid ${ss.border}`, borderRadius: 10, background: ss.bg, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '1px 6px', borderRadius: 3, background: `${TYPE_COLORS[c.type]}20`, color: TYPE_COLORS[c.type], border: `1px solid ${TYPE_COLORS[c.type]}40` }}>{c.type}</span>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.status === 'applied' ? '#64748b' : '#e2e8f0', textDecoration: c.status === 'applied' ? 'line-through' : 'none' }}>{c.title}</p>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{c.detail}</p>
                <p style={{ margin: '4px 0 0', fontSize: 9, color: ss.color, fontWeight: 700 }}>Impact: {c.impact}</p>
              </div>
              {c.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => apply(c.id)} style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', cursor: 'pointer' }}>Apply</button>
                  <button type="button" onClick={() => reject(c.id)} style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer' }}>Reject</button>
                </div>
              )}
              {c.status !== 'pending' && (
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{c.status}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Deep scanners */}
      <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 }}>
        <p style={{ margin: '0 0 10px', color: '#94a3b8', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Deep Scanners</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {(['scanner', 'revenue', 'emergency'] as const).map(p => (
            <button key={p} type="button" onClick={() => setActivePanel(activePanel === p ? null : p)} style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
              border: activePanel === p ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.12)',
              background: activePanel === p ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.3)',
              color: activePanel === p ? '#f87171' : '#64748b',
            }}>
              {p === 'scanner' ? 'Profit Leak Scanner' : p === 'revenue' ? 'Revenue Correction Rail' : 'Emergency Correction'}
            </button>
          ))}
        </div>
        {activePanel === 'scanner'   && <ProfitLeakScanner />}
        {activePanel === 'revenue'   && <RevenueCorrectionRail />}
        {activePanel === 'emergency' && <EmergencyCorrectionPanel />}
      </div>
    </AdminShell>
  );
}
