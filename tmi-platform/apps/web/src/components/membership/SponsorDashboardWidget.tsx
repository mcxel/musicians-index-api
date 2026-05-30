'use client';

import Link from 'next/link';
import {
  SponsorshipCapacityEngine,
  TIER_CAPACITY,
  CONTEST_SPONSOR_THRESHOLD,
  type PerformerTier,
  type SponsorSlot,
} from '@/lib/commerce/SponsorshipCapacityEngine';

interface SponsorDashboardWidgetProps {
  tier: PerformerTier;
  slots: SponsorSlot[];
  performerName?: string;
}

const TIER_COLORS: Record<PerformerTier, string> = {
  free:           'rgba(255,255,255,0.4)',
  ruby:           '#FF4444',
  silver:         '#C0C0C0',
  gold:           '#FFD700',
  platinum:       '#AA2DFF',
  diamond:        '#00FF88',
  'diamond-band': '#00FF88',
};

const TIER_CHECKOUT: Record<PerformerTier, string> = {
  free:           '/pricing',
  ruby:           '/api/stripe/checkout?priceId=price_performer_ruby&mode=subscription&amount=299&productName=TMI+Performer+Ruby',
  silver:         '/api/stripe/checkout?priceId=price_performer_silver&mode=subscription&amount=499&productName=TMI+Performer+Silver',
  gold:           '/api/stripe/checkout?priceId=price_performer_gold&mode=subscription&amount=999&productName=TMI+Performer+Gold',
  platinum:       '/api/stripe/checkout?priceId=price_performer_platinum&mode=subscription&amount=1999&productName=TMI+Performer+Platinum',
  diamond:        '/api/stripe/checkout?priceId=price_performer_diamond&mode=subscription&amount=2999&productName=TMI+Performer+Diamond',
  'diamond-band': '/api/stripe/checkout?priceId=price_performer_band&mode=subscription&amount=2499&productName=TMI+Band+Group+Diamond',
};

function ProgressBar({ filled, total, color }: { filled: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, (filled / total) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 4,
        background: pct >= 100 ? '#FF4444' : pct >= 75 ? '#FFD700' : color,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

export default function SponsorDashboardWidget({ tier, slots, performerName }: SponsorDashboardWidgetProps) {
  const cap = TIER_CAPACITY[tier];
  const localFilled = SponsorshipCapacityEngine.countByType(slots, 'local');
  const majorFilled = SponsorshipCapacityEngine.countByType(slots, 'major');
  const totalFilled = SponsorshipCapacityEngine.countTotal(slots);
  const contestGap  = SponsorshipCapacityEngine.contestGap(slots);
  const isEligible  = SponsorshipCapacityEngine.isContestEligible(slots);
  const upgrade     = SponsorshipCapacityEngine.upgradeGain(tier);
  const color       = TIER_COLORS[tier];

  return (
    <div style={{
      background: 'rgba(5,5,16,0.96)',
      border: `1px solid ${color}25`,
      borderRadius: 14,
      padding: '20px 22px',
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color, textTransform: 'uppercase', marginBottom: 3 }}>
            SPONSOR INVENTORY
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {performerName ? `${performerName}'s` : 'Your'} Sponsor Slots
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 20,
          background: `${color}15`, border: `1px solid ${color}40`,
          fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color,
        }}>
          {tier.toUpperCase()}
        </div>
      </div>

      {/* Slot bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
        {/* Local */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>LOCAL SPONSORS</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: localFilled >= cap.local ? '#FF4444' : 'rgba(255,255,255,0.7)' }}>
              {localFilled} / {cap.local}
            </span>
          </div>
          <ProgressBar filled={localFilled} total={cap.local} color={color} />
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
            {cap.local - localFilled > 0 ? `${cap.local - localFilled} slots open` : 'All slots filled'}
            {' · '}restaurants, barbers, local venues, music teachers
          </div>
        </div>

        {/* Major */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>MAJOR SPONSORS</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: majorFilled >= cap.major ? '#FF4444' : 'rgba(255,255,255,0.7)' }}>
              {majorFilled} / {cap.major}
            </span>
          </div>
          <ProgressBar filled={majorFilled} total={cap.major} color={color} />
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
            {cap.major - majorFilled > 0 ? `${cap.major - majorFilled} slots open` : 'All slots filled'}
            {' · '}Fender, Sony, Nike, Walmart, national brands
          </div>
        </div>
      </div>

      {/* Total + contest eligibility */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: isEligible ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isEligible ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8, marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: isEligible ? '#00FF88' : 'rgba(255,255,255,0.5)' }}>
            {isEligible ? '✓ CONTEST ELIGIBLE' : `${contestGap} more sponsor${contestGap !== 1 ? 's' : ''} to qualify`}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            Yearly contests require {CONTEST_SPONSOR_THRESHOLD} total sponsors (any combination)
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{totalFilled}</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>TOTAL</div>
        </div>
      </div>

      {/* Upgrade hook */}
      {upgrade && (
        <div style={{
          padding: '12px 14px',
          background: `${TIER_COLORS[upgrade.tier]}08`,
          border: `1px solid ${TIER_COLORS[upgrade.tier]}25`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              Upgrade to{' '}
              <span style={{ color: TIER_COLORS[upgrade.tier] }}>{upgrade.tier.toUpperCase()}</span>
              {' '}— unlock{' '}
              <strong style={{ color: TIER_COLORS[upgrade.tier] }}>+{upgrade.additionalLocal}</strong> more slots
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
              {TIER_CAPACITY[upgrade.tier].local} Local + {TIER_CAPACITY[upgrade.tier].major} Major at next tier
            </div>
          </div>
          <Link
            href={TIER_CHECKOUT[upgrade.tier]}
            style={{
              padding: '8px 14px', borderRadius: 6, fontSize: 9, fontWeight: 900,
              background: TIER_COLORS[upgrade.tier], color: '#050510',
              textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            UPGRADE
          </Link>
        </div>
      )}

      {tier === 'diamond' || tier === 'diamond-band' ? (
        <div style={{ textAlign: 'center', paddingTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
          MAXIMUM TIER · PRIORITY SPONSOR MARKETPLACE ACCESS
        </div>
      ) : null}
    </div>
  );
}
