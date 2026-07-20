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

type MsgThread = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  urgent: boolean;
};

const THREADS: MsgThread[] = [
  { id: 'm1', from: 'Big Ace',       subject: 'Diamond VIP email status?',                  preview: 'Still 4 invites undeliverable. Need real emails from Marcel…', time: '2h ago',  unread: true,  urgent: true  },
  { id: 'm2', from: 'AlertBot',      subject: 'VIP ticket pricing below market rate',        preview: 'Billboard CPM 40% below market. Flagging for correction…',     time: '3h ago',  unread: true,  urgent: true  },
  { id: 'm3', from: 'SponsorBot',    subject: 'Crown Stage renewal — 14 days remaining',     preview: 'Two sponsor contracts expiring. Sending renewal deck now…',     time: '5h ago',  unread: true,  urgent: true  },
  { id: 'm4', from: 'RouteAuditBot', subject: '3 routes returning 404 in /hub/venue',        preview: 'Venue dashboard /hub/venue/events, /hub/venue/tickets…',        time: '6h ago',  unread: false, urgent: false },
  { id: 'm5', from: 'DeployBot',     subject: 'Build succeeded — commit 45662ab7',           preview: 'Onboarding heal, middleware self-healing deployed cleanly…',     time: '8h ago',  unread: false, urgent: false },
  { id: 'm6', from: 'DataBot',       subject: 'Weekly revenue summary',                      preview: 'Week revenue: $89,200. Month revenue: $356,800…',               time: '9h ago',  unread: false, urgent: false },
  { id: 'm7', from: 'EmailBot',      subject: 'Transactional email report — 1,640 sent',     preview: '4 bounces, 2 deferred. VIP invites on watchlist…',              time: '10h ago', unread: false, urgent: false },
  { id: 'm8', from: 'Marcel (Owner)', subject: 'Big Ace and Michael Charlie admin pages',   preview: 'Both agents need their own administration pages…',              time: '12h ago', unread: false, urgent: false },
];

const COMPOSE_TARGETS = ['Big Ace', 'Marcel (Owner)', 'AlertBot', 'SponsorBot', 'DeployBot', 'RouteAuditBot', 'DataBot', 'EmailBot'];

export default function MCCommunicationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>('m1');
  const [composeTo, setComposeTo] = useState('Big Ace');
  const [composeMsg, setComposeMsg] = useState('');
  const [sent, setSent] = useState(false);

  const selected = THREADS.find(t => t.id === selectedId);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!composeMsg.trim()) return;
    setComposeMsg('');
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  }

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="Communications"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Comms' ? '1px solid rgba(255,45,170,0.7)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Comms' ? 'rgba(255,45,170,0.1)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Comms' ? '#FF2DAA' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12, alignItems: 'start' }}>
        {/* Thread list */}
        <div style={{ border: '1px solid rgba(255,45,170,0.2)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', background: 'rgba(20,5,15,0.9)', borderBottom: '1px solid rgba(255,45,170,0.15)' }}>
            <p style={{ margin: 0, fontSize: 10, color: '#FF2DAA', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Inbox</p>
          </div>
          {THREADS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                background: selectedId === t.id ? 'rgba(255,45,170,0.1)' : 'rgba(0,0,0,0.2)',
                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', display: 'block',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: t.unread ? 800 : 600, color: t.unread ? '#f1f5f9' : '#94a3b8' }}>{t.from}</span>
                {t.urgent && <span style={{ fontSize: 8, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3, padding: '1px 5px', fontWeight: 800, letterSpacing: '0.08em' }}>URGENT</span>}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: t.unread ? '#e2e8f0' : '#64748b', fontWeight: t.unread ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
              <p style={{ margin: '2px 0 0', fontSize: 9, color: '#475569' }}>{t.time}</p>
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ display: 'grid', gap: 10 }}>
          {/* Selected message */}
          {selected && (
            <div style={{ border: '1px solid rgba(255,45,170,0.25)', borderRadius: 12, background: 'rgba(10,3,8,0.7)', padding: 16 }}>
              <div style={{ marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{selected.subject}</p>
                <p style={{ margin: '3px 0 0', fontSize: 9, color: '#64748b' }}>From: {selected.from} · {selected.time}</p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>{selected.preview}</p>
            </div>
          )}

          {/* Compose */}
          <div style={{ border: '1px solid rgba(170,45,255,0.3)', borderRadius: 12, background: 'rgba(10,3,15,0.7)', padding: 14 }}>
            <p style={{ margin: '0 0 10px', color: '#c4b5fd', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Send Message</p>
            <form onSubmit={handleSend} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 24 }}>TO</label>
                <select
                  value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                  style={{ flex: 1, fontSize: 11, padding: '5px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(170,45,255,0.3)', color: '#e2e8f0', outline: 'none' }}
                >
                  {COMPOSE_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <textarea
                value={composeMsg}
                onChange={e => setComposeMsg(e.target.value)}
                placeholder="Type your message to the selected recipient…"
                rows={3}
                style={{ fontSize: 11, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(170,45,255,0.25)', color: '#e2e8f0', outline: 'none', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button type="submit" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 6, background: 'rgba(170,45,255,0.2)', border: '1px solid rgba(170,45,255,0.5)', color: '#c4b5fd', cursor: 'pointer' }}>
                  Send Message
                </button>
                {sent && <span style={{ fontSize: 10, color: '#4ade80' }}>✓ Message sent</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
