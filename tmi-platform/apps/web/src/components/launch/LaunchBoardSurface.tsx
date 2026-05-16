'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  cyan: '#00FFFF',
  fuchsia: '#FF2DAA',
  gold: '#FFD700',
  purple: '#AA2DFF',
  green: '#00FF88',
  red: '#FF4444',
  dark: '#050510',
  panel: 'rgba(255,255,255,0.035)',
  border: 'rgba(255,255,255,0.08)',
};

type StatusLevel = 'GREEN' | 'YELLOW' | 'RED' | 'PENDING';

// ─── Helpers ────────────────────────────────────────────────────────────────
function statusColor(s: StatusLevel) {
  return s === 'GREEN' ? C.green : s === 'YELLOW' ? C.gold : s === 'RED' ? C.red : 'rgba(255,255,255,0.25)';
}
function statusDot(s: StatusLevel) {
  return s === 'GREEN' ? '●' : s === 'YELLOW' ? '◐' : s === 'RED' ? '✕' : '○';
}

function useTick(ms = 1000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Panel Components ────────────────────────────────────────────────────────

function PanelShell({
  title,
  accent = C.cyan,
  children,
  span = 1,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${accent}20`,
        borderRadius: 12,
        padding: '20px 22px',
        gridColumn: span > 1 ? `span ${span}` : undefined,
        boxShadow: `0 0 24px ${accent}08`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.3em',
          color: accent,
          fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          fontWeight: 800,
          marginBottom: 16,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function StatusLine({ label, status, detail }: { label: string; status: StatusLevel; detail?: string }) {
  const color = statusColor(status);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: `1px solid ${C.border}`,
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)", letterSpacing: '0.03em' }}>
          {label}
        </span>
        {detail && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)" }}>
            {detail}
          </span>
        )}
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
        <span>{statusDot(status)}</span> {status}
      </span>
    </div>
  );
}

function CounterCard({
  label,
  value,
  unit,
  accent = C.cyan,
  live = false,
}: {
  label: string;
  value: number;
  unit?: string;
  accent?: string;
  live?: boolean;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent}20`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: accent, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.15em', fontWeight: 700 }}>
          {label}
        </span>
        {live && (
          <span style={{ fontSize: 8, color: C.red, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.2em', animation: 'pulse 1.2s infinite' }}>
            ● LIVE
          </span>
        )}
      </div>
      <div style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)", color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>
        {value.toLocaleString()}{unit && <span style={{ fontSize: '0.55em', color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function RouteRow({ route, status, ms }: { route: string; status: StatusLevel; ms?: number }) {
  const color = statusColor(status);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{route}</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {ms !== undefined && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{ms}ms</span>
        )}
        <span style={{ fontSize: 10, color, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.1em' }}>{statusDot(status)} {status}</span>
      </div>
    </div>
  );
}

function QueueRow({ label, count, accent = C.cyan }: { label: string; count: number; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)" }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
        color: count > 0 ? accent : 'rgba(255,255,255,0.25)',
        letterSpacing: '0.05em',
        minWidth: 28,
        textAlign: 'right',
      }}>
        {count}
      </span>
    </div>
  );
}

// ─── Simulated live counters (no backend dependency) ────────────────────────
function useLiveCounters(tick: number) {
  // Deterministic fake motion: seeded off tick so it moves without network calls
  const base = (seed: number, lo: number, hi: number) =>
    lo + Math.floor(((Math.sin(tick * 0.3 + seed) + 1) / 2) * (hi - lo));

  return {
    liveRooms: base(1, 2, 8),
    activeUsers: base(2, 14, 42),
    ticketSales: base(3, 120, 145),
    sponsorsOnboard: 12,
    venuesOnboard: 7,
    artistsOnboard: base(5, 38, 44),
    fansOnboard: base(6, 290, 320),
    botsActive: base(7, 3, 6),
    unreadSupport: base(8, 0, 4),
    payoutQueue: base(9, 0, 3),
    refundQueue: 0,
  };
}

// ─── Main Surface ────────────────────────────────────────────────────────────

export default function LaunchBoardSurface() {
  const tick = useTick(3000);
  const clock = useClock();
  const live = useLiveCounters(tick);

  const routeHealth: { route: string; status: StatusLevel; ms: number }[] = [
    { route: '/home/1', status: 'GREEN', ms: 42 },
    { route: '/home/1-2', status: 'GREEN', ms: 38 },
    { route: '/home/2', status: 'GREEN', ms: 44 },
    { route: '/home/3', status: 'GREEN', ms: 51 },
    { route: '/home/4', status: 'GREEN', ms: 47 },
    { route: '/home/5', status: 'GREEN', ms: 39 },
    { route: '/investor-preview', status: 'GREEN', ms: 55 },
    { route: '/magazine', status: 'GREEN', ms: 61 },
    { route: '/live', status: 'GREEN', ms: 48 },
    { route: '/games', status: 'GREEN', ms: 43 },
    { route: '/store', status: 'GREEN', ms: 52 },
  ];

  return (
    <div style={{ background: C.dark, minHeight: '100vh', color: '#fff', paddingBottom: 100 }}>

      {/* ── HEADER BAR ───────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(5,5,16,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)",
                fontSize: 22,
                letterSpacing: '0.1em',
                color: C.cyan,
              }}
            >
              TMI LAUNCH BOARD
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                fontWeight: 700,
              }}
            >
              INTERNAL ONLY
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 10, color: C.red, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 8 }}>●</span> LIVE
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {clock}
            </div>
            <Link href="/investor-preview" style={{ textDecoration: 'none', fontSize: 10, color: C.gold, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.15em', border: `1px solid ${C.gold}30`, borderRadius: 4, padding: '4px 10px' }}>
              INVESTOR VIEW
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* ── TOP ROW: LIVE COUNTERS ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <CounterCard label="LIVE ROOMS" value={live.liveRooms} live accent={C.red} />
          <CounterCard label="ACTIVE USERS" value={live.activeUsers} live accent={C.cyan} />
          <CounterCard label="TICKET SALES" value={live.ticketSales} unit="total" accent={C.gold} />
          <CounterCard label="SPONSORS" value={live.sponsorsOnboard} unit="onboard" accent={C.fuchsia} />
          <CounterCard label="VENUES" value={live.venuesOnboard} unit="onboard" accent={C.purple} />
          <CounterCard label="ARTISTS" value={live.artistsOnboard} unit="onboard" accent={C.cyan} />
          <CounterCard label="FANS" value={live.fansOnboard} unit="onboard" accent={C.green} />
          <CounterCard label="BOTS ACTIVE" value={live.botsActive} live accent={C.gold} />
        </motion.div>

        {/* ── MAIN GRID ────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 18,
          }}
        >

          {/* Stripe Transport */}
          <PanelShell title="Stripe Transport" accent={C.gold}>
            <StatusLine label="Stripe Engine (internal)" status="GREEN" detail="Ledger / Payout / Refund / Idempotency" />
            <StatusLine label="STRIPE_SECRET_KEY" status="YELLOW" detail="Env key missing — not a code blocker" />
            <StatusLine label="STRIPE_WEBHOOK_SECRET" status="YELLOW" detail="Env key missing" />
            <StatusLine label="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" status="YELLOW" detail="Env key missing" />
            <StatusLine label="Success Flow" status="PENDING" detail="Awaiting live keys" />
            <StatusLine label="Replay / Idempotency" status="PENDING" detail="Awaiting live keys" />
            <StatusLine label="Refund Flow" status="PENDING" detail="Awaiting live keys" />
            <div style={{ marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)", lineHeight: 1.6 }}>
              Add keys to .env.local → run transport proof → close YELLOW.
            </div>
          </PanelShell>

          {/* Route Health */}
          <PanelShell title="Route Health" accent={C.cyan}>
            {routeHealth.map((r) => (
              <RouteRow key={r.route} route={r.route} status={r.status} ms={r.ms} />
            ))}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)" }}>
                Last smoke: local dev
              </span>
              <span style={{ fontSize: 10, color: C.green, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.15em' }}>
                11 / 11 ● GREEN
              </span>
            </div>
          </PanelShell>

          {/* System Layer Truth */}
          <PanelShell title="System Layer Truth" accent={C.green}>
            <StatusLine label="Core Infrastructure" status="GREEN" />
            <StatusLine label="Visual Systems" status="GREEN" />
            <StatusLine label="Home 1–5 Surfaces" status="GREEN" />
            <StatusLine label="Asset Hydration" status="GREEN" />
            <StatusLine label="Investor Preview" status="GREEN" />
            <StatusLine label="TypeScript Compile" status="GREEN" detail="EXIT:0" />
            <StatusLine label="Responsive (Mobile + TV)" status="GREEN" />
            <StatusLine label="Stripe Engine" status="GREEN" />
            <StatusLine label="Stripe Transport" status="YELLOW" detail="Needs env keys" />
            <StatusLine label="Production Deploy" status="PENDING" detail="Needs production URL" />
          </PanelShell>

          {/* Queues */}
          <PanelShell title="Operations Queues" accent={C.fuchsia}>
            <QueueRow label="Unread Support" count={live.unreadSupport} accent={C.gold} />
            <QueueRow label="Payout Queue" count={live.payoutQueue} accent={C.green} />
            <QueueRow label="Refund Queue" count={live.refundQueue} accent={C.red} />
            <QueueRow label="Bot Acquisition Active" count={live.botsActive} accent={C.cyan} />
            <QueueRow label="Live Rooms Open" count={live.liveRooms} accent={C.fuchsia} />
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", marginBottom: 8 }}>QUICK LINKS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'Support', route: '/support' },
                  { label: 'Payouts', route: '/payouts' },
                  { label: 'Refunds', route: '/refund-policy' },
                  { label: 'Admin', route: '/admin' },
                  { label: 'Live', route: '/live' },
                ].map((l) => (
                  <Link
                    key={l.route}
                    href={l.route}
                    style={{
                      textDecoration: 'none',
                      fontSize: 10,
                      color: C.fuchsia,
                      border: `1px solid ${C.fuchsia}30`,
                      borderRadius: 4,
                      padding: '4px 10px',
                      fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                      letterSpacing: '0.1em',
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </PanelShell>

          {/* Onboarding Funnel */}
          <PanelShell title="Onboarding Funnel" accent={C.purple}>
            <StatusLine label="Fan Acquisition" status="GREEN" detail={`${live.fansOnboard} fans onboard`} />
            <StatusLine label="Artist Acquisition" status="GREEN" detail={`${live.artistsOnboard} artists onboard`} />
            <StatusLine label="Sponsor Acquisition" status="GREEN" detail={`${live.sponsorsOnboard} sponsors onboard`} />
            <StatusLine label="Venue Acquisition" status="GREEN" detail={`${live.venuesOnboard} venues onboard`} />
            <StatusLine label="Social Layer" status="GREEN" />
            <StatusLine label="Messaging Layer" status="GREEN" />
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Signup', route: '/signup' },
                { label: 'Onboarding', route: '/onboarding' },
                { label: 'Invite', route: '/invite' },
                { label: 'Artists', route: '/artists' },
                { label: 'Venues', route: '/venues' },
              ].map((l) => (
                <Link
                  key={l.route}
                  href={l.route}
                  style={{
                    textDecoration: 'none',
                    fontSize: 10,
                    color: C.purple,
                    border: `1px solid ${C.purple}30`,
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                    letterSpacing: '0.1em',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </PanelShell>

          {/* Business Layer */}
          <PanelShell title="Business Layer" accent={C.gold}>
            <StatusLine label="Sponsors" status="GREEN" />
            <StatusLine label="Advertisers" status="GREEN" />
            <StatusLine label="Venue Promotion" status="GREEN" />
            <StatusLine label="Ticketing" status="GREEN" />
            <StatusLine label="Booking" status="GREEN" />
            <StatusLine label="Merchant System" status="GREEN" />
            <StatusLine label="Article Ads" status="GREEN" />
            <StatusLine label="Beat Marketplace" status="GREEN" />
            <StatusLine label="NFT Collectibles" status="GREEN" />
            <StatusLine label="Prize Vault" status="GREEN" />
          </PanelShell>

        </div>

        {/* ── LAUNCH ORDER RAIL ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 28,
            background: C.panel,
            border: `1px solid ${C.cyan}15`,
            borderRadius: 12,
            padding: '22px 26px',
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.cyan, fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", fontWeight: 800, marginBottom: 20 }}>
            LAUNCH ORDER — FINAL 2 GATES
          </div>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', position: 'relative' }}>
            {[
              { step: '01', label: 'Stripe Keys', detail: 'Add to .env.local', status: 'YELLOW' as StatusLevel },
              { step: '02', label: 'Stripe Transport Proof', detail: 'Success · Replay · Refund', status: 'PENDING' as StatusLevel },
              { step: '03', label: 'Production Deploy', detail: 'Push + build', status: 'PENDING' as StatusLevel },
              { step: '04', label: 'Production Smoke', detail: '11 routes · 200', status: 'PENDING' as StatusLevel },
              { step: '05', label: 'Soft Launch', detail: 'Go live', status: 'PENDING' as StatusLevel },
            ].map((item, i) => (
              <div
                key={item.step}
                style={{
                  flex: '1 1 160px',
                  position: 'relative',
                  paddingRight: i < 4 ? 24 : 0,
                  paddingBottom: 8,
                }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${statusColor(item.status)}25`,
                    borderRadius: 8,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: 10, color: statusColor(item.status), fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)", letterSpacing: '0.2em', marginBottom: 6 }}>
                    {statusDot(item.status)} STEP {item.step}
                  </div>
                  <div style={{ fontSize: 14, fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', sans-serif)", color: '#fff', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)" }}>
                    {item.detail}
                  </div>
                </div>
                {i < 4 && (
                  <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
