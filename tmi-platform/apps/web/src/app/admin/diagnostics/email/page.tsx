'use client';

import React, { useEffect, useState, useCallback } from 'react';

type EmailKind =
  | 'signup_confirmation'
  | 'magic_link'
  | 'password_reset'
  | 'admin_invite'
  | 'performer_invite'
  | 'diamond_welcome'
  | 'ticket_receipt'
  | 'payment_receipt'
  | 'subscription_renewal'
  | 'beat_purchase'
  | 'support_reply';

type DeliveryStatus = 'delivered' | 'bounced' | 'pending' | 'failed' | 'throttled' | 'expired';

interface EmailEvent {
  id: string;
  kind: EmailKind;
  recipient: string;
  status: DeliveryStatus;
  ts: number;
  latencyMs: number | null;
  attempts: number;
  errorMsg: string | null;
  tokenExpired?: boolean;
}

const KIND_LABEL: Record<EmailKind, string> = {
  signup_confirmation: 'Signup Confirmation',
  magic_link:         'Magic Link / Admin Invite',
  password_reset:     'Password Reset',
  admin_invite:       'Admin Invite',
  performer_invite:   'Performer Invite',
  diamond_welcome:    'Diamond Welcome',
  ticket_receipt:     'Ticket Receipt',
  payment_receipt:    'Payment Receipt',
  subscription_renewal: 'Subscription Renewal',
  beat_purchase:      'Beat Purchase',
  support_reply:      'Support Reply',
};

const STATUS_COLOR: Record<DeliveryStatus, string> = {
  delivered: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  pending:   'text-cyan-400 bg-cyan-900/20 border-cyan-700/40',
  bounced:   'text-red-400 bg-red-900/20 border-red-700/40',
  failed:    'text-red-500 bg-red-900/20 border-red-700/40',
  throttled: 'text-amber-400 bg-amber-900/20 border-amber-700/40',
  expired:   'text-orange-400 bg-orange-900/20 border-orange-700/40',
};

const RECOVERY_ACTION: Record<DeliveryStatus, string> = {
  delivered: 'No action required',
  pending:   'Monitor — will retry up to 3×',
  bounced:   'Check recipient address validity',
  failed:    'Inspect SMTP config / provider status',
  throttled: 'Back off — rate limit hit, queue will drain',
  expired:   'Token expired — user must re-request',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Simulated events — replace with real email telemetry API when wired
const MOCK_EVENTS: EmailEvent[] = [
  { id: 'e1', kind: 'signup_confirmation', recipient: 'antoineking@gmail.com', status: 'delivered', ts: Date.now() - 120000, latencyMs: 340, attempts: 1, errorMsg: null },
  { id: 'e2', kind: 'diamond_welcome', recipient: 'antoineking@gmail.com', status: 'delivered', ts: Date.now() - 119000, latencyMs: 410, attempts: 1, errorMsg: null },
  { id: 'e3', kind: 'magic_link', recipient: 'berntmusic33@gmail.com', status: 'delivered', ts: Date.now() - 60000, latencyMs: 290, attempts: 1, errorMsg: null },
  { id: 'e4', kind: 'password_reset', recipient: 'unknown@example.com', status: 'bounced', ts: Date.now() - 30000, latencyMs: null, attempts: 2, errorMsg: 'User does not exist' },
  { id: 'e5', kind: 'ticket_receipt', recipient: 'fan@example.com', status: 'pending', ts: Date.now() - 5000, latencyMs: null, attempts: 1, errorMsg: null },
];

export default function EmailDiagnosticsPage() {
  const [events, setEvents] = useState<EmailEvent[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refresh = useCallback(() => {
    setLastRefresh(Date.now());
    // TODO: fetch from /api/admin/email-telemetry when wired
  }, []);

  useEffect(() => {
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  const displayed = filter === 'all' ? events : events.filter((e) => e.status === filter);

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  const riskCount = (counts['bounced'] ?? 0) + (counts['failed'] ?? 0);
  const successRate = events.length > 0
    ? Math.round(((counts['delivered'] ?? 0) / events.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Email Diagnostics</h1>
            <p className="text-xs text-gray-400 mt-1">
              Signup · magic links · resets · invites · receipts · bounces · throttling · token expiry
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>{fmt(lastRefresh)}</div>
            <div>Auto 5s</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Total Sent</div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Delivery Rate</div>
            <div className={`text-2xl font-bold ${successRate >= 95 ? 'text-emerald-400' : successRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
              {successRate}%
            </div>
          </div>
          <div className={`border rounded p-3 ${riskCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Bounced / Failed</div>
            <div className={`text-2xl font-bold ${riskCount > 0 ? 'text-red-400' : 'text-white'}`}>{riskCount}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-cyan-400">{counts['pending'] ?? 0}</div>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`text-xs px-2 py-1 rounded border ${filter === 'all' ? 'border-white/30 text-white bg-white/10' : 'border-gray-700 text-gray-400'}`}>all · {events.length}</button>
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilter(status as DeliveryStatus)} className={`text-xs px-2 py-1 rounded border ${filter === status ? 'ring-1 ring-white/30' : ''} ${STATUS_COLOR[status as DeliveryStatus] ?? ''}`}>
              {status} · {count}
            </button>
          ))}
        </div>

        {/* Event log */}
        <div className="bg-gray-900 border border-gray-800 rounded mb-6">
          <div className="divide-y divide-gray-800/60 max-h-[500px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-600">No events matching filter.</div>
            ) : displayed.map((e) => (
              <div key={e.id} className="px-4 py-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${STATUS_COLOR[e.status]}`}>{e.status}</span>
                  <span className="text-xs font-semibold text-white">{KIND_LABEL[e.kind]}</span>
                  <span className="text-xs text-gray-400 truncate flex-1">{e.recipient}</span>
                  {e.latencyMs && <span className="text-xs text-gray-500 shrink-0">{e.latencyMs}ms</span>}
                  <span className="text-xs text-gray-600 shrink-0">{e.attempts}× attempt{e.attempts > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  <span className="text-gray-500">{fmt(e.ts)}</span>
                  <span className={e.status === 'delivered' ? 'text-gray-600' : 'text-amber-400'}>{RECOVERY_ACTION[e.status]}</span>
                  {e.errorMsg && <span className="text-red-400">{e.errorMsg}</span>}
                  {e.tokenExpired && <span className="text-orange-400">token expired</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required flows checklist */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-xs text-gray-400 mb-3">Required Email Flows — Launch Checklist</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Signup confirmation',
              'Login magic link',
              'Admin invite link',
              'Password reset',
              'Expired token rejection',
              'Replay prevention',
              'Resend throttling (max 3×)',
              'Delivery telemetry logging',
              'Failed email recovery queue',
              'Diamond welcome email',
              'Ticket receipt',
              'Payment/subscription receipt',
              'Beat/NFT purchase receipt',
              'Support ticket acknowledgment',
            ].map((flow) => (
              <div key={flow} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-gray-600">○</span>
                {flow}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-600">Wire /api/admin/email-telemetry to surface live delivery events from your email provider (SendGrid/Postmark/Resend).</div>
        </div>
      </div>
    </div>
  );
}
