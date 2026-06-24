'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  getPerformersByCategory,
  PERFORMER_REGISTRY,
  type PerformerCategory,
  type PerformerIdentity,
} from '@/lib/performers/PerformerRegistry';
import { getActiveSessions } from '@/lib/broadcast/GlobalLiveSessionRegistry';

const GENRE_PAIRS: Array<{
  leftLabel: string;
  rightLabel: string;
  leftCat: PerformerCategory;
  rightCat: PerformerCategory;
  leftBg: string;
  rightBg: string;
}> = [
  {
    leftLabel: 'HIP-HOP RANKINGS',   rightLabel: 'R&B RANKINGS',
    leftCat:  'Hip-Hop',             rightCat:  'R&B',
    leftBg:  'linear-gradient(135deg,#4A1B8C,#7B3ABF)',
    rightBg: 'linear-gradient(135deg,#8C1B4A,#BF3A70)',
  },
  {
    leftLabel: 'EDM RANKINGS',       rightLabel: 'ROCK RANKINGS',
    leftCat:  'EDM',                 rightCat:  'Rock',
    leftBg:  'linear-gradient(135deg,#007A9E,#00B8D4)',
    rightBg: 'linear-gradient(135deg,#7A2B00,#C44E0A)',
  },
  {
    leftLabel: 'COMEDY RANKINGS',    rightLabel: 'DANCE CREWS',
    leftCat:  'Comedy',              rightCat:  'Dance Crews',
    leftBg:  'linear-gradient(135deg,#1B5E8C,#2E86C1)',
    rightBg: 'linear-gradient(135deg,#4A008C,#8C3ABF)',
  },
  {
    leftLabel: 'GOSPEL RANKINGS',    rightLabel: 'AFROBEATS RANKINGS',
    leftCat:  'Gospel',              rightCat:  'Afrobeats',
    leftBg:  'linear-gradient(135deg,#005C45,#00A37A)',
    rightBg: 'linear-gradient(135deg,#7A5000,#C48000)',
  },
  {
    leftLabel: 'RAP RANKINGS',       rightLabel: 'HIP HOP DANCE',
    leftCat:  'Rap',                 rightCat:  'Hip Hop Dance',
    leftBg:  'linear-gradient(135deg,#8C0000,#BF2626)',
    rightBg: 'linear-gradient(135deg,#003878,#005FC4)',
  },
];

const REAL_PERFORMER_COUNT = PERFORMER_REGISTRY.length;
const REAL_CATEGORY_COUNT = new Set(PERFORMER_REGISTRY.map((p) => p.category)).size;

function TopTenList({
  performers,
  animState,
  delayBase,
}: {
  performers: PerformerIdentity[];
  animState: 'visible' | 'exiting' | 'entering';
  delayBase: number;
}) {
  if (performers.length === 0) {
    return (
      <div
        style={{
          fontSize: 11,
          color: 'rgba(0,0,0,0.4)',
          padding: '24px 0',
          textAlign: 'center',
        }}
      >
        No performers in this category yet.
      </div>
    );
  }
  return (
    <>
      {performers.slice(0, 10).map((p, i) => {
        const delay = i * 25 + delayBase;
        return (
          <Link
            key={p.id}
            href={p.profileRoute}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,40,60,0.82)',
              border: '1.5px solid rgba(0,229,255,0.28)',
              borderRadius: 7,
              padding: '5px 7px',
              marginBottom: 5,
              textDecoration: 'none',
              color: 'inherit',
              opacity: animState === 'exiting' ? 0 : 1,
              transform:
                animState === 'exiting'
                  ? 'translateY(-14px)'
                  : animState === 'entering'
                  ? 'translateY(20px)'
                  : 'translateY(0)',
              transition: `opacity 0.32s ease ${delay}ms, transform 0.36s cubic-bezier(0.25,1,0.5,1) ${delay}ms`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-orbitron,monospace)',
                fontSize: i < 3 ? 15 : 12,
                color: '#FFD700',
                minWidth: 16,
                textAlign: 'center',
                textShadow: '0 0 8px rgba(255,215,0,0.5)',
              }}
            >
              {i + 1}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#FFD700,#FF9500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flexShrink: 0,
                border: '1.5px solid rgba(0,229,255,0.5)',
                overflow: 'hidden',
              }}
            >
              {p.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.profileImageUrl}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>🎵</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 7, color: 'rgba(0,229,255,0.8)' }}>{p.category}</div>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              <span
                style={{
                  fontSize: 6,
                  fontWeight: 700,
                  color: '#0D0820',
                  background: '#00E5FF',
                  borderRadius: 3,
                  padding: '2px 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                VIEW
              </span>
              <span
                style={{
                  fontSize: 6,
                  fontWeight: 700,
                  color: '#fff',
                  background: '#FF2DAA',
                  borderRadius: 3,
                  padding: '2px 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                VOTE
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}22`,
        borderRadius: 8,
        padding: '10px 8px',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div
        style={{
          fontSize: 7,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function BillboardOpenBookSpread() {
  const [pairIdx, setPairIdx] = useState(0);
  const [animState, setAnimState] = useState<'visible' | 'exiting' | 'entering'>('visible');
  const [timerPct, setTimerPct] = useState(100);
  const [liveCount, setLiveCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLiveCount(getActiveSessions().length);
  }, []);

  useEffect(() => {
    let elapsed = 0;
    const DURATION = 8000;
    const TICK = 80;

    timerRef.current = setInterval(() => {
      elapsed += TICK;
      setTimerPct(Math.max(0, 100 - (elapsed / DURATION) * 100));
    }, TICK);

    rotateRef.current = setInterval(() => {
      elapsed = 0;
      setTimerPct(100);
      setAnimState('exiting');
      setTimeout(() => {
        setPairIdx((prev) => (prev + 1) % GENRE_PAIRS.length);
        setAnimState('entering');
        setTimeout(() => setAnimState('visible'), 420);
      }, 340);
    }, DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rotateRef.current) clearInterval(rotateRef.current);
    };
  }, []);

  const pair = GENRE_PAIRS[pairIdx]!;
  const leftPerformers = getPerformersByCategory(pair.leftCat)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
  const rightPerformers = getPerformersByCategory(pair.rightCat)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 1100,
        margin: '0 auto',
        padding: '28px 20px 0',
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 8,
          letterSpacing: '.28em',
          color: '#FFD700',
          fontWeight: 900,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        BILLBOARD — OPEN BOOK RANKINGS
      </div>

      {/* Genre label + timer bar + dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          padding: '0 4px',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '.04em' }}>
          TOP TEN: {pair.leftLabel} ↔ {pair.rightLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 8, color: 'rgba(0,229,255,0.7)', letterSpacing: '.1em' }}>
            NEXT GENRE
          </span>
          <div
            style={{
              width: 72,
              height: 3,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${timerPct}%`,
                background: 'linear-gradient(90deg,#00E5FF,#FF2DAA)',
                borderRadius: 2,
                transition: 'width 0.08s linear',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {GENRE_PAIRS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPairIdx(i);
                  setTimerPct(100);
                }}
                aria-label={`Switch to genre pair ${i + 1}`}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: i === pairIdx ? '#00E5FF' : 'rgba(255,255,255,0.2)',
                  boxShadow: i === pairIdx ? '0 0 8px rgba(0,229,255,0.7)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Open Book Spread */}
      <div style={{ perspective: '1200px' }}>
        <div style={{ position: 'relative' }}>
          {/* Book shadow */}
          <div
            style={{
              position: 'absolute',
              bottom: -12,
              left: '8%',
              right: '8%',
              height: 20,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
              filter: 'blur(8px)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 28px 1fr',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,215,0,0.1)',
            }}
          >
            {/* LEFT PAGE */}
            <div
              style={{
                background: 'linear-gradient(180deg,#F7E76C 0%,#EDD84A 100%)',
                padding: '14px 12px',
                minHeight: 500,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: 8,
                  background: 'linear-gradient(90deg,rgba(0,0,0,0.1),transparent)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  marginBottom: 10,
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: '.03em',
                  color: '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  background: pair.leftBg,
                  transition: 'background 0.4s ease',
                }}
              >
                {pair.leftLabel}
              </div>
              <TopTenList performers={leftPerformers} animState={animState} delayBase={0} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 16,
                  opacity: 0.2,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  width: 16,
                  height: 16,
                  background: '#FFD700',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 7,
                  fontWeight: 900,
                  color: '#0D0820',
                }}
              >
                1
              </div>
            </div>

            {/* SPINE */}
            <div
              style={{
                background: 'linear-gradient(90deg,#1A0A3D,#2D1B69,#1A0A3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  writingMode: 'vertical-rl',
                  fontSize: 6,
                  fontWeight: 700,
                  color: 'rgba(255,215,0,0.45)',
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                THE MUSICIAN&apos;S INDEX
              </div>
            </div>

            {/* RIGHT PAGE */}
            <div
              style={{
                background: 'linear-gradient(180deg,#EDD84A 0%,#F7E76C 100%)',
                padding: '14px 12px',
                minHeight: 500,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 8,
                  background: 'linear-gradient(270deg,rgba(0,0,0,0.1),transparent)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  marginBottom: 10,
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: '.03em',
                  color: '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  background: pair.rightBg,
                  transition: 'background 0.4s ease',
                }}
              >
                {pair.rightLabel}
              </div>
              <TopTenList performers={rightPerformers} animState={animState} delayBase={80} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 16,
                  opacity: 0.2,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  width: 16,
                  height: 16,
                  background: '#FFD700',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 7,
                  fontWeight: 900,
                  color: '#0D0820',
                }}
              >
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar — real data only (Rule 20) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10,
          marginTop: 16,
          background: 'rgba(13,8,32,0.95)',
          border: '1px solid rgba(255,215,0,0.1)',
          borderRadius: 10,
          padding: '12px 16px',
        }}
      >
        <StatCard label="PERFORMERS RANKED" value={String(REAL_PERFORMER_COUNT)} color="#00E5FF" />
        <StatCard
          label="LIVE NOW"
          value={liveCount > 0 ? String(liveCount) : '—'}
          color="#E63000"
        />
        <StatCard label="CATEGORIES" value={String(REAL_CATEGORY_COUNT)} color="#FFD700" />
        <StatCard label="GENRE PAIRS" value={String(GENRE_PAIRS.length)} color="#FF2DAA" />
      </div>

      {/* Bottom nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid rgba(255,215,0,0.1)',
        }}
      >
        <Link
          href="/home/1"
          style={{
            textDecoration: 'none',
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '.1em',
          }}
        >
          ← DISCOVERY HUB
        </Link>
        <Link
          href="/performers"
          style={{
            textDecoration: 'none',
            fontSize: 9,
            fontWeight: 900,
            color: '#fff',
            background: '#FF2DAA',
            borderRadius: 12,
            padding: '5px 16px',
            letterSpacing: '.08em',
          }}
        >
          GET RANKED ↗
        </Link>
      </div>
    </div>
  );
}
