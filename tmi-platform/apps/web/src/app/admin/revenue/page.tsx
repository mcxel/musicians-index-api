"use client";

import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import { useCallback, useEffect, useMemo, useState } from 'react';

type RevenueApi = {
  mode: string;
  note: string;
  totals: {
    today: string;
    month: string;
    todayCents: number;
    monthCents: number;
  };
  subscriptions: {
    active: number | string;
  };
  streams: Record<string, { todayCents: number; monthCents: number; countToday: number; countMonth: number }>;
  telemetry: {
    verifiedEventsToday: number;
  };
  config: {
    secretConfigured: boolean;
    publishableConfigured: boolean;
    webhookConfigured: boolean;
  };
};

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueApi | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [pulseFlash, setPulseFlash] = useState(false);
  const [lastPulseLabel, setLastPulseLabel] = useState('none');
  const [pulseMessage, setPulseMessage] = useState('Pulse engine idle');

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/revenue', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as RevenueApi;
      setData(json);
    } catch {
      // Keep fallback values when API fails.
    }
  }, []);

  useEffect(() => {
    void loadRevenue();
    const timer = window.setInterval(loadRevenue, 10000);
    return () => {
      window.clearInterval(timer);
    };
  }, [loadRevenue]);

  const playPulseTone = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.AudioContext === 'undefined' && typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined') return;

    const Context = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;

    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 220;
    gain.gain.value = 0.001;

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.02, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.start(now);
    oscillator.stop(now + 0.23);

    oscillator.onended = () => {
      void context.close();
    };
  }, []);

  const fireFoundingPulse = useCallback(async () => {
    if (simulating) return;
    setSimulating(true);
    setPulseFlash(true);
    setPulseMessage('Injecting founding builder pulse...');

    try {
      const res = await fetch('/api/admin/stripe-telemetry/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenueStream: 'founding_packs',
          amountCents: 9900,
          currency: 'usd',
          eventType: 'checkout.session.completed',
        }),
      });

      if (!res.ok) {
        setPulseMessage('Pulse failed: admin session required or endpoint unavailable');
        return;
      }

      playPulseTone();
      const label = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      setLastPulseLabel(label);
      setPulseMessage('Founding builder pulse inserted and persisted');
      await loadRevenue();
    } catch {
      setPulseMessage('Pulse failed: network/runtime error');
    } finally {
      setSimulating(false);
      window.setTimeout(() => setPulseFlash(false), 900);
    }
  }, [loadRevenue, playPulseTone, simulating]);

  const handleAction = useCallback((actionId: string) => {
    if (actionId === 'simulate-founding-pulse') {
      return fireFoundingPulse();
    }
  }, [fireFoundingPulse]);

  const revenueActions = useMemo(() => {
    return [
      {
        id: 'simulate-founding-pulse',
        label: simulating ? 'Firing Pulse...' : 'Fire Founding Pulse',
        tone: pulseFlash ? 'green' as const : 'yellow' as const,
      },
      ...commonAdminActions,
    ];
  }, [pulseFlash, simulating]);

  const metrics = useMemo(() => {
    if (!data) {
      return [
        { label: 'Revenue Today', value: 'Loading', tone: 'white' as const },
        { label: 'Revenue Month', value: 'Loading', tone: 'white' as const },
        { label: 'Active Subs', value: 'Loading', tone: 'white' as const },
        { label: 'Webhook Events', value: 'Loading', tone: 'white' as const },
      ];
    }

    const configHealthy = data.config.secretConfigured && data.config.publishableConfigured && data.config.webhookConfigured;

    return [
      { label: 'Revenue Today', value: data.totals.today, tone: configHealthy ? 'green' as const : 'red' as const },
      { label: 'Revenue Month', value: data.totals.month, tone: 'yellow' as const },
      { label: 'Active Subs', value: String(data.subscriptions.active), tone: 'green' as const },
      { label: 'Webhook Events Today', value: String(data.telemetry.verifiedEventsToday), tone: 'white' as const },
      { label: 'Founding Packs (Today)', value: money(data.streams.founding_packs?.todayCents ?? 0), tone: 'yellow' as const },
      { label: 'Subscriptions (Today)', value: money(data.streams.subscriptions?.todayCents ?? 0), tone: 'green' as const },
      { label: 'Last Sim Pulse', value: lastPulseLabel, tone: pulseFlash ? 'green' as const : 'white' as const },
    ];
  }, [data, lastPulseLabel, pulseFlash]);

  const rows = useMemo(() => {
    if (!data) {
      return [
        { primary: 'Loading revenue streams', secondary: 'Awaiting admin revenue API', status: 'loading', value: '...', chips: ['booting'] },
      ];
    }

    const rowsBase: Array<{ key: string; label: string; detail: string; chips: string[] }> = [
      { key: 'subscriptions', label: 'Subscription Revenue', detail: 'Recurring tiers + renewals', chips: ['subscriptions', 'renewals'] },
      { key: 'founding_packs', label: 'Founding Pack Revenue', detail: 'One-time founder purchases', chips: ['founding', 'one-time'] },
      { key: 'sponsors', label: 'Sponsor Revenue', detail: 'Sponsor checkout/webhook flow', chips: ['sponsors', 'campaigns'] },
      { key: 'one_time', label: 'One-Time Checkout Revenue', detail: 'Non-subscription purchases', chips: ['checkout', 'payment'] },
    ];

    const mapped = rowsBase.map((row) => {
      const stream = data.streams[row.key] ?? { todayCents: 0, monthCents: 0, countToday: 0, countMonth: 0 };
      return {
        primary: row.label,
        secondary: `${row.detail} · ${stream.countToday} tx today / ${stream.countMonth} tx month`,
        status: stream.todayCents > 0 ? 'live' : 'watch',
        value: `${money(stream.todayCents)} today · ${money(stream.monthCents)} month`,
        chips: row.chips,
      };
    });

    const configBlockers = [
      !data.config.secretConfigured ? 'STRIPE_SECRET_KEY missing/placeholder' : null,
      !data.config.webhookConfigured ? 'STRIPE_WEBHOOK_SECRET missing/placeholder' : null,
      !data.config.publishableConfigured ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing/placeholder' : null,
    ].filter(Boolean) as string[];

    mapped.push({
      primary: 'Stripe Config Health',
      secondary: configBlockers.length ? configBlockers.join(' · ') : 'All Stripe keys configured',
      status: configBlockers.length ? 'blocked' : 'ready',
      value: data.note,
      chips: ['config', data.mode],
    });

    return mapped;
  }, [data]);

  return (
    <AdminOpsConsole
      title="Administrator Revenue"
      subtitle="Live command center fed by Stripe API + persistent webhook telemetry."
      headerControls={
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => void fireFoundingPulse()}
            disabled={simulating}
            style={{
              border: '1px solid rgba(0,255,136,0.65)',
              borderRadius: 999,
              background: pulseFlash ? 'rgba(0,255,136,0.22)' : 'rgba(0,255,136,0.09)',
              color: '#00ff88',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              cursor: simulating ? 'default' : 'pointer',
              boxShadow: pulseFlash ? '0 0 0 1px rgba(0,255,136,0.45), 0 0 24px rgba(0,255,136,0.25)' : 'none',
              opacity: simulating ? 0.7 : 1,
            }}
          >
            {simulating ? 'Injecting...' : 'Simulate Pulse'}
          </button>
          <span style={{ fontSize: 11, color: pulseFlash ? '#00ff88' : '#9ca3af' }}>{pulseMessage}</span>
        </div>
      }
      metrics={metrics}
      rowsTitle="Revenue Streams"
      rows={rows}
      actions={revenueActions}
      quickLinks={adminOpsLinks}
      onAction={handleAction}
    />
  );
}
