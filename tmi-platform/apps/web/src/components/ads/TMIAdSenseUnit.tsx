'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AD_CONSENT_STORAGE_KEY,
  getAdSensePublisherId,
  type AdConsentValue,
} from '@/lib/ads/adConfig';

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

  useEffect(() => {
    setConsent(readConsent());
    const onConsent = () => setConsent(readConsent());
    window.addEventListener('tmi:ad-consent', onConsent);
    return () => window.removeEventListener('tmi:ad-consent', onConsent);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted' || !slotId || pushed.current) return;
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
  }, [slotId, consent]);

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

  if (consent !== 'accepted') {
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
        {consent === 'declined' ? 'Ads hidden — consent declined' : 'Ads pending consent'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        overflow: 'hidden',
        minHeight: 90,
        background: 'rgba(5, 5, 16, 0.4)',
        border: '1px dashed rgba(255, 215, 0, 0.18)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBlock: 8,
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={adClientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
