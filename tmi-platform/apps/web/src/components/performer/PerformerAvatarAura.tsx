'use client';

/**
 * PerformerAvatarAura
 * Client wrapper that places DynamicRadialAura around the performer avatar.
 * Used by PerformerProfileShell (server component) — rendered as a client island.
 */

import DynamicRadialAura, { type SponsorSlot } from '@/components/performer/DynamicRadialAura';

interface PerformerAvatarAuraProps {
  sponsors: SponsorSlot[];
  performerName: string;
  accentColor?: string;
}

export default function PerformerAvatarAura({
  sponsors,
  performerName,
  accentColor = '#FF2DAA',
}: PerformerAvatarAuraProps) {
  const initials = performerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'TM';

  const avatar = (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `2px solid ${accentColor}50`,
        background: `${accentColor}14`,
        overflow: 'hidden',
        boxShadow: sponsors.length > 0
          ? `0 0 28px ${accentColor}44, 0 0 56px ${accentColor}18`
          : `0 0 20px ${accentColor}18`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.6s ease',
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>{initials}</span>
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.14em', color: accentColor }}>LIVE SELF</span>
    </div>
  );

  if (sponsors.length === 0) {
    return (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          flexShrink: 0,
        }}
      >
        {avatar}
      </div>
    );
  }

  return (
    <div style={{ flexShrink: 0 }}>
      <DynamicRadialAura
        sponsors={sponsors}
        radius={64}
        performerSize={72}
      >
        {avatar}
      </DynamicRadialAura>
    </div>
  );
}
