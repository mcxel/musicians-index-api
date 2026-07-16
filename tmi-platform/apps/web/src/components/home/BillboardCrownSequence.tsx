'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BOT_ACCOUNT_REGISTRY, type BotAccount } from '@/lib/bots/BotAccountRegistry';
import { RANKING_CATEGORIES, type RankingCategory } from '@/lib/bots/RankingOccupancyEngine';
import { getTopPerformers } from '@/lib/performers/PerformerRegistry';

// ── Phase types ─────────────────────────────────────────────────────────────
type AnimPhase = 'rise' | 'settle' | 'crown' | 'exit';

const PHASE_DURATIONS_MS: Record<AnimPhase, number> = {
  rise:   600,
  settle: 200,
  crown:  2800,
  exit:   500,
};

// ── Seat data ────────────────────────────────────────────────────────────────
interface SeatOccupant {
  type: 'HUMAN' | 'BOT';
  displayName: string;
  score: number;
  tier: string;
  profileRoute: string;
  avatarUrl?: string;
  category: string;
  categoryLabel: string;
  accentColor: string;
}

const CATEGORY_META: Record<RankingCategory, { label: string; color: string; emoji: string }> = {
  overall:    { label: 'Overall',       color: '#FFD700', emoji: '👑' },
  'hip-hop':  { label: 'Hip-Hop',       color: '#FF2DAA', emoji: '🎤' },
  rnb:        { label: 'R&B / Soul',    color: '#FF6B9D', emoji: '🎵' },
  pop:        { label: 'Pop',           color: '#00E5FF', emoji: '⭐' },
  rock:       { label: 'Rock',          color: '#FF4D4D', emoji: '🎸' },
  country:    { label: 'Country',       color: '#FFB347', emoji: '🤠' },
  gospel:     { label: 'Gospel',        color: '#F5E642', emoji: '✝️' },
  edm:        { label: 'EDM / DJ',      color: '#00FFFF', emoji: '🎛️' },
  jazz:       { label: 'Jazz / Blues',  color: '#3FA7FF', emoji: '🎷' },
  latin:      { label: 'Latin / World', color: '#FF6B35', emoji: '🥁' },
  comedy:     { label: 'Comedy',        color: '#00FF88', emoji: '😂' },
  dance:      { label: 'Dance',         color: '#AA2DFF', emoji: '💃' },
  producer:   { label: 'Producers',     color: '#B8C8D8', emoji: '🎚️' },
};

function resolveSeatOccupants(): SeatOccupant[] {
  const topHumans = getTopPerformers(20);

  return RANKING_CATEGORIES.map((cat) => {
    const meta = CATEGORY_META[cat];
    const botForCat = BOT_ACCOUNT_REGISTRY.find(
      (b) => b.status === 'ACTIVE' && b.assignments.some((a) => a.category === cat && a.rankPosition === 1)
    );

    const humanMatch = topHumans.find((p) => {
      if (cat === 'overall') return true;
      const catLower = p.category?.toLowerCase() ?? '';
      const label = cat.replace('-', ' ');
      return catLower.includes(label);
    });

    const botScore = botForCat?.provisionalScore ?? 0;
    const humanScore = humanMatch?.xp ?? 0;
    const useHuman = humanMatch && humanScore >= (botForCat?.humanTakeoverThreshold ?? Infinity);

    if (useHuman && humanMatch) {
      return {
        type: 'HUMAN',
        displayName: humanMatch.name,
        score: humanScore,
        tier: humanMatch.tier ?? 'PRO',
        profileRoute: `/performers/${humanMatch.slug}`,
        avatarUrl: humanMatch.profileImageUrl,
        category: cat,
        categoryLabel: meta.label,
        accentColor: meta.color,
      };
    }

    if (botForCat) {
      return {
        type: 'BOT',
        displayName: `[BOT] ${botForCat.displayName}`,
        score: botScore,
        tier: botForCat.tier,
        profileRoute: botForCat.profileRoute,
        avatarUrl: botForCat.avatarUrl,
        category: cat,
        categoryLabel: meta.label,
        accentColor: meta.color,
      };
    }

    return {
      type: 'BOT',
      displayName: 'Open Seat',
      score: 0,
      tier: 'FREE',
      profileRoute: `/performers?genre=${cat}`,
      category: cat,
      categoryLabel: meta.label,
      accentColor: meta.color,
    };
  });
}

const TIER_COLOR: Record<string, string> = {
  FREE:     '#888',
  PRO:      '#00BBFF',
  RUBY:     '#FF3366',
  SILVER:   '#B8C8D8',
  GOLD:     '#FFD700',
  PLATINUM: '#E8F0FF',
  DIAMOND:  '#00FFFF',
};

// ── Phase CSS ─────────────────────────────────────────────────────────────────
function phaseStyle(phase: AnimPhase, reduceMotion: boolean): React.CSSProperties {
  if (reduceMotion) {
    return {
      opacity: phase === 'exit' ? 0 : 1,
      transform: 'none',
      transition: 'opacity 200ms ease',
    };
  }
  switch (phase) {
    case 'rise':
      return { opacity: 0, transform: 'translateY(48px) scale(0.92)', transition: `all ${PHASE_DURATIONS_MS.rise}ms cubic-bezier(0.22,1,0.36,1)` };
    case 'settle':
      return { opacity: 1, transform: 'translateY(-4px) scale(1.015)', transition: `all ${PHASE_DURATIONS_MS.settle}ms ease-out` };
    case 'crown':
      return { opacity: 1, transform: 'translateY(0) scale(1)', transition: `all ${PHASE_DURATIONS_MS.settle}ms ease-out` };
    case 'exit':
      return { opacity: 0, transform: 'translateY(-36px) scale(1.04)', transition: `all ${PHASE_DURATIONS_MS.exit}ms cubic-bezier(0.4,0,0.8,0)` };
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BillboardCrownSequence() {
  const seats = useRef<SeatOccupant[]>(resolveSeatOccupants());
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>('rise');
  const [reduceMotion, setReduceMotion] = useState(false);
  // Some seat avatarUrls (bot accounts) point at images that don't exist on
  // disk — track which URLs 404 so we fall back to the emoji instead of
  // rendering a broken image icon.
  const [brokenImageUrls, setBrokenImageUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Phase sequencer
  useEffect(() => {
    if (reduceMotion) {
      // Simpler tick — just swap every 4s, no sub-phases
      const t = setInterval(() => {
        setIdx((prev) => (prev + 1) % seats.current.length);
      }, 4000);
      return () => clearInterval(t);
    }

    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      setPhase('rise');
      setTimeout(() => setPhase('settle'), 50); // trigger CSS transition
      timer = setTimeout(() => {
        setPhase('crown');
        timer = setTimeout(() => {
          setPhase('exit');
          timer = setTimeout(() => {
            setIdx((prev) => (prev + 1) % seats.current.length);
            advance();
          }, PHASE_DURATIONS_MS.exit + 50);
        }, PHASE_DURATIONS_MS.settle + PHASE_DURATIONS_MS.crown);
      }, PHASE_DURATIONS_MS.rise + 50);
    };

    advance();
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const seat = seats.current[idx];
  if (!seat) return null;

  const meta = CATEGORY_META[seat.category as RankingCategory];
  const isCrownPhase = phase === 'crown' || phase === 'settle';

  return (
    <section
      aria-label="Billboard Crown Spotlight"
      style={{
        margin: '0 0 36px',
        padding: '0 24px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.22em', color: '#FFD700', marginBottom: 14 }}>
        👑 CROWN SPOTLIGHT — #{' '}1 PER CATEGORY
      </div>

      {/* Spotlight stage */}
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${seat.accentColor}14, rgba(5,5,16,0.96))`,
          border: `1px solid ${seat.accentColor}${isCrownPhase ? '55' : '22'}`,
          boxShadow: isCrownPhase ? `0 0 60px ${seat.accentColor}30, 0 20px 60px ${seat.accentColor}18` : '0 12px 40px rgba(0,0,0,0.4)',
          transition: 'box-shadow 400ms ease, border-color 400ms ease',
          padding: '28px 32px',
          minHeight: 140,
        }}
      >
        {/* Crown glow behind */}
        {isCrownPhase && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 40%, ${seat.accentColor}18, transparent 65%)`,
              pointerEvents: 'none',
              transition: 'opacity 300ms ease',
            }}
          />
        )}

        {/* Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>{meta?.emoji ?? '🎵'}</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.18em', color: seat.accentColor, textTransform: 'uppercase' }}>
            {seat.categoryLabel}
          </span>
          <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto', letterSpacing: '.1em' }}>
            CATEGORY RANK #1
          </span>
        </div>

        {/* Animated occupant card */}
        <div style={{ ...phaseStyle(phase, reduceMotion), willChange: 'transform, opacity' }}>
          <Link href={seat.profileRoute} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  background: '#0a0614',
                  border: `2px solid ${isCrownPhase ? seat.accentColor : seat.accentColor + '55'}`,
                  boxShadow: isCrownPhase ? `0 0 24px ${seat.accentColor}55` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  transition: 'box-shadow 300ms, border-color 300ms',
                }}
              >
                {seat.avatarUrl && !brokenImageUrls.has(seat.avatarUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={seat.avatarUrl}
                    alt={seat.displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => {
                      const url = seat.avatarUrl!;
                      setBrokenImageUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 28 }}>{meta?.emoji ?? '🎵'}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {isCrownPhase && (
                    <span
                      style={{
                        fontSize: 18,
                        lineHeight: 1,
                        filter: `drop-shadow(0 0 8px ${seat.accentColor})`,
                        animation: reduceMotion ? 'none' : 'crownPulse 1.2s ease-in-out infinite',
                      }}
                    >
                      👑
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-orbitron, monospace)',
                      fontSize: 'clamp(16px, 2.5vw, 22px)',
                      fontWeight: 900,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {seat.displayName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: 20,
                      background: (TIER_COLOR[seat.tier] ?? '#555') + '22',
                      color: TIER_COLOR[seat.tier] ?? '#555',
                      border: `1px solid ${(TIER_COLOR[seat.tier] ?? '#555')}44`,
                      letterSpacing: 0.5,
                    }}
                  >
                    {seat.tier}
                  </span>
                  {seat.score > 0 && (
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      {seat.score.toLocaleString()} XP
                    </span>
                  )}
                  {seat.type === 'BOT' && seat.displayName !== 'Open Seat' && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(255,45,170,0.12)',
                        color: '#FF2DAA',
                        border: '1px solid rgba(255,45,170,0.3)',
                        fontFamily: 'monospace',
                      }}
                    >
                      PROVISIONAL SEAT
                    </span>
                  )}
                  {seat.type === 'HUMAN' && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(0,255,136,0.1)',
                        color: '#00FF88',
                        border: '1px solid rgba(0,255,136,0.25)',
                      }}
                    >
                      HUMAN CROWN HOLDER
                    </span>
                  )}
                  {seat.displayName === 'Open Seat' && (
                    <span style={{ fontSize: 11, color: '#FF8800', fontWeight: 700 }}>
                      Earn XP to claim this seat →
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 900,
                  fontFamily: 'var(--font-orbitron, monospace)',
                  color: isCrownPhase ? seat.accentColor : seat.accentColor + '55',
                  textShadow: isCrownPhase ? `0 0 24px ${seat.accentColor}` : 'none',
                  transition: 'color 300ms, text-shadow 300ms',
                  flexShrink: 0,
                }}
              >
                #1
              </div>
            </div>
          </Link>
        </div>

        {/* Category dot indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {seats.current.map((s, i) => (
            <button
              key={s.category}
              onClick={() => setIdx(i)}
              aria-label={`Jump to ${s.categoryLabel}`}
              style={{
                width: i === idx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === idx ? seat.accentColor : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 300ms ease',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes crownPulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.12); }
        }
      `}</style>
    </section>
  );
}
