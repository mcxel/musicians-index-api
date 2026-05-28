'use client';

import Link from 'next/link';

type Variant = 'after-golive' | 'after-room-join' | 'after-profile-create' | 'lobby' | 'compact';

interface FoundingSupporterCTAProps {
  variant?: Variant;
}

const COPY: Record<Variant, { headline: string; sub: string; cta: string }> = {
  'after-golive': {
    headline: 'You just went live.',
    sub: 'Support the beta build and earn your Founding Member badge — it never expires.',
    cta: 'SUPPORT THE BUILD',
  },
  'after-room-join': {
    headline: 'You are helping shape this arena.',
    sub: 'Founding supporters get permanent badges, extra vibe packs, and priority during launch.',
    cta: 'BECOME A FOUNDER',
  },
  'after-profile-create': {
    headline: 'Your profile is live.',
    sub: 'Founding Members get permanent placement, exclusive badges, and premier identity perks.',
    cta: 'JOIN AS FOUNDING MEMBER',
  },
  'lobby': {
    headline: 'Support this Beta Venue.',
    sub: 'Founders help keep the Arena live. All purchases persist permanently after V1 launch.',
    cta: 'SUPPORT THE BUILD →',
  },
  'compact': {
    headline: '',
    sub: '',
    cta: 'SUPPORT THE BUILD →',
  },
};

export default function FoundingSupporterCTA({ variant = 'compact' }: FoundingSupporterCTAProps) {
  const copy = COPY[variant];

  if (variant === 'compact') {
    return (
      <Link
        href="/pricing"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          border: '1px solid rgba(170,45,255,0.4)',
          background: 'rgba(170,45,255,0.08)',
          color: '#AA2DFF',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.12em',
          textDecoration: 'none',
          borderRadius: 4,
        }}
      >
        🚧 SUPPORT THE BUILD →
      </Link>
    );
  }

  if (variant === 'lobby') {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'rgba(170,45,255,0.07)',
        border: '1px solid rgba(170,45,255,0.25)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{copy.headline}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{copy.sub}</div>
        </div>
        <Link
          href="/pricing"
          style={{
            padding: '7px 14px',
            borderRadius: 4,
            background: '#AA2DFF',
            color: '#fff',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {copy.cta}
        </Link>
      </div>
    );
  }

  // Full variants: after-golive, after-room-join, after-profile-create
  return (
    <div style={{
      padding: '20px 22px',
      background: 'linear-gradient(135deg, rgba(170,45,255,0.1), rgba(5,5,16,0.97))',
      border: '1px solid rgba(170,45,255,0.3)',
      borderRadius: 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#AA2DFF', marginBottom: 8 }}>
        🚧 BETA SEASON · FOUNDING SUPPORTERS
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{copy.headline}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16, maxWidth: 380, margin: '0 auto 16px' }}>
        {copy.sub}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/pricing"
          style={{
            padding: '10px 22px',
            borderRadius: 6,
            background: '#AA2DFF',
            color: '#fff',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          {copy.cta}
        </Link>
        <Link
          href="/pricing"
          style={{
            padding: '10px 22px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}
        >
          SEE ALL PACKS
        </Link>
      </div>
      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
        All purchases persist permanently · Beta XP may reset at V1
      </div>
    </div>
  );
}
