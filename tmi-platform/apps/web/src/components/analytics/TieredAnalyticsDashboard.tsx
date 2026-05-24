'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Tier = 'fan' | 'supporter' | 'vip' | 'diamond';

interface StatDef {
  label:     string;
  value:     number;
  suffix?:   string;
  color:     string;
  icon:      string;
  minTier:   Tier;
  trend?:    number;   // % change, positive = up
}

const TIER_ORDER: Tier[] = ['fan', 'supporter', 'vip', 'diamond'];
function tierIndex(t: Tier) { return TIER_ORDER.indexOf(t); }
function canSee(userTier: Tier, minTier: Tier) {
  return tierIndex(userTier) >= tierIndex(minTier);
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; icon: string; upgradeHref: string }> = {
  fan:       { label: 'Fan',       color: '#00FFFF', icon: '🎧', upgradeHref: '/pricing' },
  supporter: { label: 'Supporter', color: '#00FF88', icon: '🎵', upgradeHref: '/pricing' },
  vip:       { label: 'VIP',       color: '#AA2DFF', icon: '💎', upgradeHref: '/pricing' },
  diamond:   { label: 'Diamond',   color: '#FFD700', icon: '👑', upgradeHref: '/pricing' },
};

const DEMO_STATS: StatDef[] = [
  { label: 'Plays',          value: 284,    color: '#00FFFF', icon: '▶️',  minTier: 'fan',       trend:  12 },
  { label: 'Votes Cast',     value: 47,     color: '#FF2DAA', icon: '🗳️',  minTier: 'fan',       trend:   8 },
  { label: 'Rooms Joined',   value: 19,     color: '#00FF88', icon: '🚪',  minTier: 'fan',       trend:   3 },
  { label: 'Tips Sent',      value: 6,      color: '#FFD700', icon: '💸',  minTier: 'supporter', trend:  -1 },
  { label: 'Fan Following',  value: 132,    color: '#AA2DFF', icon: '👥',  minTier: 'supporter', trend:  21 },
  { label: 'XP Earned',      value: 3450,   color: '#00FFFF', icon: '⭐',  minTier: 'supporter', trend:  15 },
  { label: 'Rank Movement',  value: 14,     suffix: '↑',      color: '#00FF88', icon: '📈', minTier: 'vip', trend: 14 },
  { label: 'Revenue Total',  value: 48,     suffix: ' USD',   color: '#FFD700', icon: '💰', minTier: 'vip', trend:  5 },
  { label: 'Crown Points',   value: 1820,   color: '#FFD700', icon: '👑',  minTier: 'diamond',   trend:  33 },
  { label: 'Avg Session',    value: 24,     suffix: ' min',   color: '#FF2DAA', icon: '⏱️', minTier: 'diamond', trend: -4 },
];

function useCountUp(target: number, active: boolean) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setDisplay(0); return; }
    let start: number | null = null;
    const duration = 1200;

    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, active]);

  return display;
}

function AnimatedStatCard({ stat, visible }: { stat: StatDef; visible: boolean }) {
  const count = useCountUp(stat.value, visible);
  const color = visible ? stat.color : 'rgba(255,255,255,0.15)';

  return (
    <div
      style={{
        background: visible ? `${stat.color}0d` : 'rgba(255,255,255,0.02)',
        border:     `1px solid ${visible ? `${stat.color}25` : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 14, padding: '18px 20px',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s',
      }}
    >
      {!visible && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(5,5,16,0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>🔒</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>{stat.icon}</span>
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
          {stat.label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {visible ? count.toLocaleString() : '—'}
        {visible && stat.suffix && (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>{stat.suffix}</span>
        )}
      </div>
      {visible && stat.trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: stat.trend >= 0 ? '#00FF88' : '#FF4455' }}>
          {stat.trend >= 0 ? '▲' : '▼'} {Math.abs(stat.trend)}% this week
        </div>
      )}
    </div>
  );
}

function SimpleBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              height: `${(d.value / max) * 100}%`,
              background: `linear-gradient(0deg, ${color}, ${color}55)`,
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.6s ease',
              minHeight: 3,
            }}
          />
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const WEEK_PLAYS_DATA = [
  { label: 'Mon', value: 32 },
  { label: 'Tue', value: 45 },
  { label: 'Wed', value: 28 },
  { label: 'Thu', value: 67 },
  { label: 'Fri', value: 89 },
  { label: 'Sat', value: 54 },
  { label: 'Sun', value: 40 },
];

export default function TieredAnalyticsDashboard({ initialTier = 'fan' }: { initialTier?: Tier }) {
  const [userTier, setUserTier] = useState<Tier>(initialTier);

  const tierCfg = TIER_CONFIG[userTier];
  const nextTierIdx = tierIndex(userTier) + 1;
  const nextTier = TIER_ORDER[nextTierIdx] as Tier | undefined;
  const nextTierCfg = nextTier ? TIER_CONFIG[nextTier] : null;

  return (
    <div style={{ background: '#050510', minHeight: '100vh', color: '#fff', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>YOUR ANALYTICS</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Stats Dashboard</h1>
          </div>
          {/* Tier selector (demo) */}
          <div style={{ display: 'flex', gap: 6 }}>
            {TIER_ORDER.map((t) => {
              const cfg = TIER_CONFIG[t];
              const active = t === userTier;
              return (
                <button
                  key={t}
                  onClick={() => setUserTier(t)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${active ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                    background: active ? `${cfg.color}15` : 'rgba(255,255,255,0.03)',
                    color: active ? cfg.color : 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active tier badge */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            padding: '8px 18px', background: `${tierCfg.color}12`,
            border: `1px solid ${tierCfg.color}35`, borderRadius: 24,
          }}
        >
          <span style={{ fontSize: 16 }}>{tierCfg.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: tierCfg.color, letterSpacing: '0.1em' }}>
            {tierCfg.label.toUpperCase()} TIER
          </span>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginBottom: 32 }}>
          {DEMO_STATS.map((stat) => (
            <AnimatedStatCard
              key={stat.label}
              stat={stat}
              visible={canSee(userTier, stat.minTier)}
            />
          ))}
        </div>

        {/* Weekly plays chart (VIP+) */}
        {canSee(userTier, 'vip') ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(170,45,255,0.2)',
              borderRadius: 14, padding: '20px', marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
              PLAYS — LAST 7 DAYS
            </div>
            <SimpleBarChart data={WEEK_PLAYS_DATA} color="#AA2DFF" />
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '20px', marginBottom: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 22 }}>🔒</span>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>
              Weekly trend charts unlock at VIP tier
            </p>
          </div>
        )}

        {/* Upgrade CTA */}
        {nextTierCfg && (
          <div
            style={{
              background: `${nextTierCfg.color}0a`,
              border: `1px solid ${nextTierCfg.color}30`,
              borderRadius: 14, padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: nextTierCfg.color, marginBottom: 4 }}>
                UPGRADE TO {nextTierCfg.label.toUpperCase()}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Unlock more metrics, trend charts, and deeper insights.
              </p>
            </div>
            <Link
              href={nextTierCfg.upgradeHref}
              style={{
                flexShrink: 0, padding: '10px 20px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: nextTierCfg.color, color: '#050510', textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Upgrade →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
