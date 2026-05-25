'use client';

/**
 * PerformerAvatarAura
 * Client wrapper that places DynamicRadialAura around the performer avatar.
 * Used by PerformerProfileShell (server component) — rendered as a client island.
 */

import DynamicRadialAura, { type SponsorSlot } from '@/components/performer/DynamicRadialAura';

interface PerformerAvatarAuraProps {
  sponsors: SponsorSlot[];
  avatarUrl?: string;
  accentColor?: string;
}

export default function PerformerAvatarAura({
  sponsors,
  avatarUrl,
  accentColor = '#FF2DAA',
}: PerformerAvatarAuraProps) {
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
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        transition: 'box-shadow 0.6s ease',
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Performer avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        '🎭'
      )}
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
