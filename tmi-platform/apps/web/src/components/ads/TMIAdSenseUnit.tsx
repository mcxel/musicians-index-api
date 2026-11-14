'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AD_CONSENT_STORAGE_KEY,
  getAdSensePublisherId,
  type AdConsentValue,
} from '@/lib/ads/adConfig';
import { decideAdSenseLoad, detectNonHumanClientTraffic } from '@/lib/ads/AdLoadDirector';

export interface TMIAdSenseUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function readConsent(): AdConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (v === 'accepted' || v === 'declined') return v;
  } catch {
    /* private mode */
  }
  return null;
}

export default function TMIAdSenseUnit({
  slotId,
  format = 'auto',
  responsive = true,
  className,
  style,
}: TMIAdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adClientId = getAdSensePublisherId();
  const [consent, setConsent] = useState<AdConsentValue | null>(null);
  const pushed = useRef(false);
  const pathname = usePathname() ?? '/';
  const decision = decideAdSenseLoad({
    pathname,
    hasConsent: consent === 'accepted',
    billableAds: true,
    nonHuman: detectNonHumanClientTraffic(),
  });

  useEffect(() => {
    setConsent(readConsent());
    const onConsent = () => setConsent(readConsent());
    window.addEventListener('tmi:ad-consent', onConsent);
    return () => window.removeEventListener('tmi:ad-consent', onConsent);
  }, []);

  useEffect(() => {
    if (!decision.allowed || !slotId || pushed.current) return;
    try {
      if (typeof window !== 'undefined' && containerRef.current) {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (err) {
      console.warn('[TMIAdSenseUnit] Error initializing Google AdSense slot:', err);
    }
  }, [slotId, decision.allowed]);

  if (!slotId) {
    return (
      <div
        className={className}
        style={{
          minHeight: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          border: '1px dashed rgba(255, 215, 0, 0.18)',
          borderRadius: 6,
          ...style,
        }}
      >
        Ad slot not configured (set NEXT_PUBLIC_ADSENSE_SLOT_* in ENV)
      </div>
    );
  }

  if (!decision.allowed) {
    return (
      <div
        className={className}
        style={{
          minHeight: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          ...style,
        }}
      >
        {consent === 'declined'
          ? 'Ads hidden — consent declined'
          : consent !== 'accepted'
            ? 'Ads pending consent'
            : 'Ads not eligible'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      data-tmi-ad-slot="adsense"
      data-ad-safe="true"
      style={{
        width: '100%',
        overflow: 'hidden',
        minHeight: 90,
        marginBlock: 16,
        padding: '12px 8px',
        isolation: 'isolate',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 8,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.15em',
          textAlign: 'center',
          paddingBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 90 }}
        data-ad-client={adClientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
