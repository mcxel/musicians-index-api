'use client';

/**
 * CanonicalAdSlot — one component family for all ad surfaces (Rule 12 / Rule 20).
 * Wraps UnifiedAdSlot + AdPlacementRegistry reserved dimensions + honest NO_FILL state.
 * LEGACY: prefer this over direct AdSenseUnit / adsbygoogle push in new surfaces.
 */

import React, { useEffect } from 'react';
import UnifiedAdSlot from '@/components/ads/UnifiedAdSlot';
import { getAdPlacementSlot } from '@/lib/commerce/AdPlacementRegistry';
import { resolveAdEntitlement } from '@/lib/commerce/AdEntitlementPolicy';
import { deriveHealthFromFill } from '@/lib/commerce/MonetizationHealthRegistry';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';
import { usePathname } from 'next/navigation';

export interface CanonicalAdSlotProps {
  slotId: string;
  venue?: string;
  role?: 'fan' | 'performer' | 'venue' | 'promoter' | 'sponsor' | 'advertiser' | 'admin';
  hasAdConsent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function CanonicalAdSlot({
  slotId,
  venue = 'dashboard',
  role,
  hasAdConsent = true,
  className,
  style,
}: CanonicalAdSlotProps) {
  const pathname = usePathname() ?? '/';
  const placement = getAdPlacementSlot(slotId);
  const entitlement = resolveAdEntitlement({ pathname, role, hasAdConsent });

  useEffect(() => {
    if (!placement) {
      deriveHealthFromFill(slotId, false, 'NO_FILL', true, 'AD-SLOT-001: unknown slotId');
      return;
    }
    const slot = getAdSlotForZone(placement.zoneKey);
    const hasFill = slot.type !== 'advertise-cta';
    deriveHealthFromFill(
      slotId,
      hasFill,
      placement.inventoryClass,
      entitlement === 'ADS_BLOCKED' || entitlement === 'NO_MONETIZATION',
      entitlement !== 'ADS_ALLOWED' ? `Entitlement: ${entitlement}` : undefined,
    );
  }, [slotId, placement, entitlement]);

  if (!placement) {
    return (
      <div
        data-ad-slot={slotId}
        data-ad-health="blocked"
        data-ad-error="AD-SLOT-001"
        style={{
          minHeight: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.12)',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.35)',
          fontSize: 10,
          ...style,
        }}
        className={className}
      >
        Ad slot not registered
      </div>
    );
  }

  if (entitlement === 'NO_MONETIZATION' || entitlement === 'ADS_BLOCKED') {
    return null;
  }

  const slotFill = getAdSlotForZone(placement.zoneKey);
  if (slotFill.type === 'advertise-cta' && entitlement !== 'SPONSOR_ONLY') {
    return (
      <div
        data-ad-slot={slotId}
        data-ad-health="no-fill"
        style={{
          width: '100%',
          minHeight: placement.minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,5,16,0.6)',
          border: '1px solid rgba(170,45,255,0.2)',
          borderRadius: 8,
          padding: '12px 16px',
          ...style,
        }}
        className={className}
      >
        <a
          href="/sponsors/advertise"
          style={{ color: '#AA2DFF', fontSize: 11, fontWeight: 800, textDecoration: 'none' }}
        >
          Advertise Here — sponsor this zone
        </a>
      </div>
    );
  }

  return (
    <div
      data-ad-slot={slotId}
      data-ad-surface={placement.surface}
      data-ad-health="on"
      style={{
        width: '100%',
        minHeight: placement.minHeight,
        maxWidth: placement.width,
        margin: '0 auto',
        ...style,
      }}
      className={className}
    >
      <UnifiedAdSlot
        venue={venue}
        slotKey={placement.zoneKey}
        format={placement.height <= 100 ? 'horizontal' : 'rectangle'}
        style={{ minHeight: placement.minHeight }}
      />
    </div>
  );
}
