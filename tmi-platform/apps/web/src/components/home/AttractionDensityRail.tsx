'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_RANDOM_PAGE_POOL,
  pickWeightedRandomPage,
} from '@/lib/magazine/MagazineRandomPageEngine';
import {
  getTierStyleToken,
  parseTier,
  SubscriptionTier,
} from '@/lib/magazine/SubscriptionStylingEngine';

type AttractionDensityRailProps = {
  surface: 'home-1' | 'home-2' | 'home-3' | 'home-4' | 'home-5';
};

function seededCounter(seed: number, low: number, high: number, tick: number): number {
  const spread = high - low;
  const value = (Math.sin(seed + tick * 0.37) + 1) / 2;
  return low + Math.floor(value * spread);
}

export default function AttractionDensityRail({ surface }: AttractionDensityRailProps) {
  const [tick, setTick] = useState(0);
  const [tier, setTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2800);
    const fromStorage = parseTier(window.localStorage.getItem('tmi-subscription-tier'));
    setTier(fromStorage);
    return () => window.clearInterval(id);
  }, []);

  const token = getTierStyleToken(tier);

  const randomPage = useMemo(() => {
    const roll = ((Math.sin(tick * 0.29 + surface.length) + 1) / 2) * 0.999;
    return pickWeightedRandomPage(DEFAULT_RANDOM_PAGE_POOL, roll);
  }, [surface, tick]);

  const rewards = {
    tickets: seededCounter(1.3, 118, 188, tick),
    tips: seededCounter(2.1, 3400, 7400, tick),
    streams: seededCounter(3.4, 88000, 124000, tick),
    prize: seededCounter(4.8, 21000, 42000, tick),
    xp: seededCounter(5.7, 960, 1680, tick),
  };

  const social = {
    viewers: seededCounter(6.2, 420, 920, tick),
    rooms: seededCounter(7.7, 6, 22, tick),
    liveNow: seededCounter(8.4, 3, 11, tick),
    voting: seededCounter(9.2, 120, 460, tick),
  };

  const stickers = ['LIVE', 'HOT', 'NEW', 'RANK +2', 'TREND ↑'];

  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '10px 24px 18px',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          border: `1px solid ${token.accent}55`,
          background:
            'radial-gradient(circle at 10% 10%, rgba(255,45,170,0.2), transparent 38%), radial-gradient(circle at 100% 100%, rgba(0,255,255,0.16), transparent 44%), linear-gradient(160deg, rgba(8,5,28,0.95), rgba(5,5,16,0.96))',
          padding: '12px 14px',
          overflow: 'hidden',
          boxShadow: `0 0 24px ${token.glow}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            opacity: 0.28,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 8, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800 }}>
              ISSUE 2026-W28
            </span>
            {stickers.map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: i % 2 === 0 ? '#050510' : '#fff',
                  background: i % 2 === 0 ? '#FFD700' : '#FF2DAA',
                  borderRadius: 4,
                  padding: '2px 6px',
                  animation: i === 0 ? 'tmi-live-pulse 1.2s infinite' : undefined,
                }}
              >
                {s}
              </span>
            ))}
            <span style={{ fontSize: 8, color: token.accent, marginLeft: 'auto', letterSpacing: '0.12em', fontWeight: 800 }}>
              TIER {token.prestigeLabel.toUpperCase()}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
            }}
          >
            <MetricCell label="Ticket Sales" value={`${rewards.tickets}`} color="#FFD700" />
            <MetricCell label="Tip Totals" value={`$${rewards.tips.toLocaleString()}`} color="#00FF88" />
            <MetricCell label="Streams" value={`${rewards.streams.toLocaleString()}`} color="#00FFFF" />
            <MetricCell label="Prize Money" value={`$${rewards.prize.toLocaleString()}`} color="#FF2DAA" />
            <MetricCell label="XP Total" value={`${rewards.xp.toLocaleString()}`} color="#AA2DFF" />
            <MetricCell label="Viewers Live" value={`${social.viewers}`} color="#00FFFF" />
            <MetricCell label="Rooms Open" value={`${social.rooms}`} color="#FFD700" />
            <MetricCell label="Voting Live" value={`${social.voting}`} color="#FF2DAA" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em' }}>
                ROTATION INJECTOR · ARTIST → NEWS → RANDOM
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, 30 + (tick % 7) * 10)}%`,
                    background: `linear-gradient(90deg, ${token.accent}, #FFD700, #FF2DAA)`,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>

            <Link
              href={randomPage.route}
              style={{
                textDecoration: 'none',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#050510',
                background: '#00FFFF',
                borderRadius: 6,
                padding: '8px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              RANDOM PAGE: {randomPage.title}
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes tmi-live-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(255,215,0,0.55); }
            50% { opacity: 0.72; box-shadow: 0 0 12px rgba(255,215,0,0.95); }
          }
        `}</style>
      </div>
    </section>
  );
}

function MetricCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${color}45`,
        padding: '7px 8px',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ fontSize: 8, letterSpacing: '0.12em', color, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}
