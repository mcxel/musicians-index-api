'use client';

/**
 * SeatCategoryPicker — visual seating tier selector.
 *
 * Allows users to choose their seating tier before entering venue:
 *   Free Back Row → Paid Mid Row → Premium Front Row → Sponsor VIP
 *
 * Displays seat tier policies (row priority, glow level, benefits).
 * Updates AudiencePresenceEntity with selected tier.
 */

import { useState } from 'react';
import { useAudiencePresence } from '@/components/live/AudiencePresenceProvider';
import { TMI_SEAT_TIER_POLICIES, type TmiSeatTier } from '@/lib/audience/tmiSeatTierEngine';

interface SeatCategoryPickerProps {
  roomId: string;
  onSelect?: (tier: TmiSeatTier) => void;
  accentColor?: string;
}

const TIER_DISPLAY: Record<TmiSeatTier, { label: string; emoji: string; description: string; color: string }> = {
  'free-back-row': {
    label: 'Back Row',
    emoji: '🪑',
    description: 'General admission • Best for casual viewing',
    color: '#00E5FF',
  },
  'paid-mid-row': {
    label: 'Mid Row',
    emoji: '🪑✨',
    description: 'Premium seats • Closer to stage',
    color: '#AA2DFF',
  },
  'premium-front-row': {
    label: 'Front Row',
    emoji: '🪑💫',
    description: 'VIP seating • Front row premium',
    color: '#FFD700',
  },
  'sponsor-vip-front-glow': {
    label: 'Sponsor VIP',
    emoji: '👑',
    description: 'Exclusive VIP • Maximum glow + status',
    color: '#FF2DAA',
  },
};

export default function SeatCategoryPicker({
  roomId,
  onSelect,
  accentColor = '#00E5FF',
}: SeatCategoryPickerProps) {
  const { entity, setEntity } = useAudiencePresence();
  const [selected, setSelected] = useState<TmiSeatTier>((entity?.tier as TmiSeatTier) ?? 'free-back-row');

  const handleSelect = (tier: TmiSeatTier) => {
    setSelected(tier);
    if (entity) {
      setEntity({ ...entity, tier: tier as string });
    }
    onSelect?.(tier);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      padding: '16px',
      background: 'linear-gradient(160deg, rgba(10,6,20,0.95) 0%, rgba(5,3,16,0.96) 100%)',
      borderRadius: 12,
      border: `1px solid ${accentColor}22`,
    }}>
      <div>
        <h3 style={{
          fontSize: 10, fontWeight: 900, color: accentColor,
          letterSpacing: '.15em', margin: 0, marginBottom: 12,
        }}>
          SELECT YOUR SEATING
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {TMI_SEAT_TIER_POLICIES.map((policy) => {
          const display = TIER_DISPLAY[policy.tier];
          const isSelected = selected === policy.tier;

          return (
            <button
              key={policy.tier}
              onClick={() => handleSelect(policy.tier)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                padding: '12px 10px',
                background: isSelected ? `${display.color}14` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isSelected ? display.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: 20,
                lineHeight: 1,
              }}>
                {display.emoji}
              </div>
              <div style={{
                fontSize: 9, fontWeight: 900, color: display.color,
                letterSpacing: '.05em',
              }}>
                {display.label}
              </div>
              <div style={{
                fontSize: 7, color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.3,
              }}>
                {display.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tier Benefits */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 8,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '.1em' }}>
          YOUR SELECTION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{TIER_DISPLAY[selected].emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: TIER_DISPLAY[selected].color }}>
              {TIER_DISPLAY[selected].label}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Row Priority: {TMI_SEAT_TIER_POLICIES.find(p => p.tier === selected)?.rowPriority} • Glow: {TMI_SEAT_TIER_POLICIES.find(p => p.tier === selected)?.glowLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
