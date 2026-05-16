'use client';

import React, { useState, useCallback, useEffect } from 'react';

type BotKind =
  | 'outreach_dm'
  | 'follow_campaign'
  | 'comment_campaign'
  | 'repost_campaign'
  | 'announcement'
  | 'welcome_sequence'
  | 're_engagement'
  | 'contest_reminder'
  | 'beat_promotion'
  | 'sponsor_outreach';

type BotStatus =
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'rate_limited'
  | 'rejected'
  | 'escalated';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface BotCampaign {
  id: string;
  campaignId: string;
  kind: BotKind;
  status: BotStatus;
  owner: string;
  targetCount: number;
  sentCount: number;
  failCount: number;
  optOutCount: number;
  rateLimit: number;
  rateLimitWindow: string;
  approvedBy: string | null;
  ts: number;
  lastActivity: number;
  errorMsg: string | null;
  risk: RiskLevel;
  humanApprovalRequired: boolean;
}

interface RateLimitBucket {
  kind: BotKind;
  used: number;
  limit: number;
  windowResetTs: number;
}

const KIND_LABEL: Record<BotKind, string> = {
  outreach_dm:       'Outreach DM',
  follow_campaign:   'Follow Campaign',
  comment_campaign:  'Comment Campaign',
  repost_campaign:   'Repost Campaign',
  announcement:      'Announcement Blast',
  welcome_sequence:  'Welcome Sequence',
  re_engagement:     'Re-engagement',
  contest_reminder:  'Contest Reminder',
  beat_promotion:    'Beat Promotion',
  sponsor_outreach:  'Sponsor Outreach',
};

const STATUS_COLOR: Record<BotStatus, string> = {
  pending_approval: 'text-amber-400 bg-amber-900/20 border-amber-700/40',
  approved:         'text-cyan-400 bg-cyan-900/20 border-cyan-700/40',
  running:          'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  paused:           'text-gray-400 bg-gray-800/40 border-gray-700/40',
  completed:        'text-blue-400 bg-blue-900/20 border-blue-700/40',
  failed:           'text-red-400 bg-red-900/20 border-red-700/40',
  rate_limited:     'text-orange-400 bg-orange-900/20 border-orange-700/40',
  rejected:         'text-red-500 bg-red-900/30 border-red-600/40',
  escalated:        'text-purple-400 bg-purple-900/20 border-purple-700/40',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low:      'text-emerald-400',
  medium:   'text-amber-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function pct(sent: number, target: number): string {
  if (target === 0) return '0%';
  return `${Math.round((sent / target) * 100)}%`;
}

const MOCK_CAMPAIGNS: BotCampaign[] = [
  {
    id: 'b1', campaignId: 'BOT-WEL-001', kind: 'welcome_sequence', status: 'running',
    owner: 'system', targetCount: 250, sentCount: 187, failCount: 3, optOutCount: 2,
    rateLimit: 50, rateLimitWindow: '1h', approvedBy: 'berntmusic33@gmail.com',
    ts: Date.now() - 7200000, lastActivity: Date.now() - 60000,
    errorMsg: null, risk: 'low', humanApprovalRequired: false,
  },
  {
    id: 'b2', campaignId: 'BOT-OUT-002', kind: 'outreach_dm', status: 'pending_approval',
    owner: 'berntmusic33@gmail.com', targetCount: 1000, sentCount: 0, failCount: 0, optOutCount: 0,
    rateLimit: 100, rateLimitWindow: '24h', approvedBy: null,
    ts: Date.now() - 1800000, lastActivity: Date.now() - 1800000,
    errorMsg: null, risk: 'high', humanApprovalRequired: true,
  },
  {
    id: 'b3', campaignId: 'BOT-CON-003', kind: 'contest_reminder', status: 'completed',
    owner: 'system', targetCount: 500, sentCount: 498, failCount: 2, optOutCount: 5,
    rateLimit: 200, rateLimitWindow: '12h', approvedBy: 'berntmusic33@gmail.com',
    ts: Date.now() - 86400000, lastActivity: Date.now() - 72000000,
    errorMsg: null, risk: 'low', humanApprovalRequired: false,
  },
  {
    id: 'b4', campaignId: 'BOT-SPO-004', kind: 'sponsor_outreach', status: 'rate_limited',
    owner: 'berntmusic33@gmail.com', targetCount: 200, sentCount: 47, failCount: 1, optOutCount: 0,
    rateLimit: 50, rateLimitWindow: '1h', approvedBy: 'berntmusic33@gmail.com',
    ts: Date.now() - 3600000, lastActivity: Date.now() - 600000,
    errorMsg: 'Rate limit hit: 50/50 per hour. Resuming at reset.', risk: 'medium', humanApprovalRequired: true,
  },
  {
    id: 'b5', campaignId: 'BOT-ANN-005', kind: 'announcement', status: 'failed',
    owner: 'system', targetCount: 300, sentCount: 12, failCount: 288, optOutCount: 0,
    rateLimit: 300, rateLimitWindow: '1h', approvedBy: 'berntmusic33@gmail.com',
    ts: Date.now() - 5400000, lastActivity: Date.now() - 5000000,
    errorMsg: 'Provider auth error: API key revoked. All sends failing.', risk: 'critical', humanApprovalRequired: false,
  },
];

const MOCK_RATE_LIMITS: RateLimitBucket[] = [
  { kind: 'outreach_dm',      used: 43,  limit: 100, windowResetTs: Date.now() + 3600000 },
  { kind: 'follow_campaign',  used: 12,  limit: 50,  windowResetTs: Date.now() + 1800000 },
  { kind: 'announcement',     used: 300, limit: 300, windowResetTs: Date.now() + 900000  },
  { kind: 'welcome_sequence', used: 187, limit: 500, windowResetTs: Date.now() + 7200000 },
  { kind: 'sponsor_outreach', used: 50,  limit: 50,  windowResetTs: Date.now() + 2400000 },
];

export default function BotsDiagnosticsPage() {
  const [campaigns, setCampaigns] = useState<BotCampaign[]>(MOCK_CAMPAIGNS);
  const [filter, setFilter] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refresh = useCallback(() => {
    setLastRefresh(Date.now());
    // TODO: fetch from /api/admin/bot-telemetry when wired
  }, []);

  useEffect(() => {
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  const displayed = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const counts = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const pendingApproval = counts['pending_approval'] ?? 0;
  const running = counts['running'] ?? 0;
  const failedCount = counts['failed'] ?? 0;
  const rateLimitedCount = counts['rate_limited'] ?? 0;
  const criticalCount = campaigns.filter((c) => c.risk === 'critical').length;

  function simulateApprove(id: string) {
    setCampaigns((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: 'approved' as BotStatus, approvedBy: 'berntmusic33@gmail.com' } : c
    ));
  }

  function simulateReject(id: string) {
    setCampaigns((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: 'rejected' as BotStatus } : c
    ));
  }

  function simulatePause(id: string) {
    setCampaigns((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: 'paused' as BotStatus } : c
    ));
  }

  function simulateEscalate(id: string) {
    setCampaigns((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: 'escalated' as BotStatus } : c
    ));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Bot Diagnostics</h1>
            <p className="text-xs text-gray-400 mt-1">
              Rate limits · audit logs · campaign approvals · failure telemetry · escalation controls · opt-out compliance
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>{fmt(lastRefresh)}</div>
            <div>Auto 5s</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className={`border rounded p-3 ${pendingApproval > 0 ? 'bg-amber-900/20 border-amber-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Pending Approval</div>
            <div className={`text-2xl font-bold ${pendingApproval > 0 ? 'text-amber-400' : 'text-white'}`}>{pendingApproval}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Running</div>
            <div className="text-2xl font-bold text-emerald-400">{running}</div>
          </div>
          <div className={`border rounded p-3 ${rateLimitedCount > 0 ? 'bg-orange-900/20 border-orange-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Rate Limited</div>
            <div className={`text-2xl font-bold ${rateLimitedCount > 0 ? 'text-orange-400' : 'text-white'}`}>{rateLimitedCount}</div>
          </div>
          <div className={`border rounded p-3 ${failedCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Failed</div>
            <div className={`text-2xl font-bold ${failedCount > 0 ? 'text-red-400' : 'text-white'}`}>{failedCount}</div>
          </div>
          <div className={`border rounded p-3 ${criticalCount > 0 ? 'bg-red-900/30 border-red-600/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Critical Risk</div>
            <div className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{criticalCount}</div>
          </div>
        </div>

        {/* Rate limit gauges */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 mb-6">
          <div className="text-xs text-gray-400 mb-3">Rate Limit Buckets</div>
          <div className="space-y-2">
            {MOCK_RATE_LIMITS.map((bucket) => {
              const usedPct = Math.round((bucket.used / bucket.limit) * 100);
              const barColor = usedPct >= 100 ? 'bg-red-500' : usedPct >= 80 ? 'bg-orange-500' : 'bg-emerald-500';
              const resetIn = Math.max(0, Math.round((bucket.windowResetTs - Date.now()) / 60000));
              return (
                <div key={bucket.kind} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-36 shrink-0">{KIND_LABEL[bucket.kind]}</span>
                  <div className="flex-1 bg-gray-800 rounded h-1.5 overflow-hidden">
                    <div className={`h-full rounded ${barColor}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
                  </div>
                  <span className={`text-xs w-20 text-right ${usedPct >= 100 ? 'text-red-400' : 'text-gray-400'}`}>
                    {bucket.used}/{bucket.limit}
                  </span>
                  <span className="text-xs text-gray-600 w-20 text-right">reset {resetIn}m</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`text-xs px-2 py-1 rounded border ${filter === 'all' ? 'border-white/30 text-white bg-white/10' : 'border-gray-700 text-gray-400'}`}>
            all · {campaigns.length}
          </button>
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`text-xs px-2 py-1 rounded border ${STATUS_COLOR[status as BotStatus] ?? ''} ${filter === status ? 'ring-1 ring-white/30' : ''}`}>
              {status} · {count}
            </button>
          ))}
        </div>

        {/* Campaign list */}
        <div className="bg-gray-900 border border-gray-800 rounded mb-6">
          <div className="divide-y divide-gray-800/60 max-h-[480px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-600">No campaigns matching filter.</div>
            ) : displayed.map((c) => (
              <div key={c.id} className="px-4 py-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                  <span className="text-xs font-semibold text-gray-300 shrink-0">{c.campaignId}</span>
                  <span className="text-xs text-white flex-1 truncate">{KIND_LABEL[c.kind]}</span>
                  <span className={`text-xs shrink-0 font-semibold ${RISK_COLOR[c.risk]}`}>risk:{c.risk}</span>
                  {c.humanApprovalRequired && (
                    <span className="text-xs px-1 py-0.5 rounded border border-amber-700/40 text-amber-400 bg-amber-900/20 shrink-0">human req</span>
                  )}
                  <div className="flex gap-1 shrink-0">
                    {c.status === 'pending_approval' && (
                      <>
                        <button onClick={() => simulateApprove(c.id)} className="text-xs px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/50">Approve</button>
                        <button onClick={() => simulateReject(c.id)} className="text-xs px-2 py-0.5 rounded bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50">Reject</button>
                      </>
                    )}
                    {c.status === 'running' && (
                      <button onClick={() => simulatePause(c.id)} className="text-xs px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700">Pause</button>
                    )}
                    {(c.status === 'failed' || c.risk === 'critical') && (
                      <button onClick={() => simulateEscalate(c.id)} className="text-xs px-2 py-0.5 rounded bg-purple-900/30 border border-purple-700/40 text-purple-400 hover:bg-purple-900/50">Escalate</button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                  <span>owner: {c.owner}</span>
                  <span className="text-gray-600">
                    {c.sentCount}/{c.targetCount} sent ({pct(c.sentCount, c.targetCount)})
                  </span>
                  {c.failCount > 0 && <span className="text-red-400">{c.failCount} failed</span>}
                  {c.optOutCount > 0 && <span className="text-amber-400">{c.optOutCount} opted out</span>}
                  <span>limit: {c.rateLimit}/{c.rateLimitWindow}</span>
                  {c.approvedBy && <span>approved: {c.approvedBy}</span>}
                  <span>{fmt(c.lastActivity)}</span>
                </div>
                {c.errorMsg && (
                  <div className="mt-1 text-xs text-red-400">{c.errorMsg}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Opt-out + Compliance panel */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 mb-4">
          <div className="text-xs text-gray-400 mb-3">Compliance Gates</div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-800/40 rounded p-3">
              <div className="text-gray-400 mb-1">Opt-out enforcement</div>
              <div className="text-emerald-400 font-semibold">Active</div>
              <div className="text-gray-600 mt-1">All opted-out users excluded from every campaign run.</div>
            </div>
            <div className="bg-gray-800/40 rounded p-3">
              <div className="text-gray-400 mb-1">Human approval gate</div>
              <div className="text-emerald-400 font-semibold">Active</div>
              <div className="text-gray-600 mt-1">High-risk and DM campaigns require admin sign-off before send.</div>
            </div>
            <div className="bg-gray-800/40 rounded p-3">
              <div className="text-gray-400 mb-1">Platform rules compliance</div>
              <div className="text-amber-400 font-semibold">Partial</div>
              <div className="text-gray-600 mt-1">Rate limits enforced. Audit trail incomplete — needs API wiring.</div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-xs text-gray-400 mb-3">Bot Governance — Launch Checklist</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Per-kind rate limit buckets',
              'Rate limit reset tracking',
              'Human approval gate (high-risk)',
              'Campaign audit log',
              'Opt-out registry + enforcement',
              'Opt-out suppression on every send',
              'Campaign approval workflow',
              'Failure telemetry per campaign',
              'Escalation controls',
              'Bot replay prevention',
              'Anti-spam throttle (per user, per day)',
              'Platform rules compliance check',
              'Outreach DM volume caps',
              '/api/admin/bot-telemetry endpoint',
              'Bot failure recovery queue',
              'Admin alert on critical failures',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-gray-600">○</span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Wire /api/admin/bot-telemetry to surface live campaign events, opt-out counts, and rate limit state.
          </div>
        </div>
      </div>
    </div>
  );
}
