'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AD_CONSENT_STORAGE_KEY,
  ADSENSE_SLOT_ENV,
  getAdSensePublisherId,
  type AdConsentValue,
} from '@/lib/ads/adConfig';

// Re-export slot map — values come from NEXT_PUBLIC_ADSENSE_SLOT_* (empty until ENV set)
export const AD_SLOTS = {
  homepageBanner: ADSENSE_SLOT_ENV.homepageBanner,
  homepageMid: ADSENSE_SLOT_ENV.homepageMid,
  dashboardSidebar: ADSENSE_SLOT_ENV.dashboardSidebar,
  liveLobbyBanner: ADSENSE_SLOT_ENV.liveLobbyBanner,
  articleInline: ADSENSE_SLOT_ENV.articleInline,
  magazineLeaderboard: ADSENSE_SLOT_ENV.magazineLeaderboard,
  magazineInline: ADSENSE_SLOT_ENV.magazineInline,
  magazineArticleEnd: ADSENSE_SLOT_ENV.magazineArticleEnd,
  gameShowBanner: ADSENSE_SLOT_ENV.gameShowBanner,
  gameShowInterstitial: ADSENSE_SLOT_ENV.gameShowInterstitial,
  showSidebar: ADSENSE_SLOT_ENV.showSidebar,
  roomLeaderboard: ADSENSE_SLOT_ENV.roomLeaderboard,
  roomBetweenSegments: ADSENSE_SLOT_ENV.roomBetweenSegments,
  sponsorFallback: ADSENSE_SLOT_ENV.sponsorFallback,
  dashboardBanner: ADSENSE_SLOT_ENV.dashboardBanner,
  dashboardMid: ADSENSE_SLOT_ENV.dashboardMid,
  arenaBanner: ADSENSE_SLOT_ENV.arenaBanner,
  arenaInterstitial: ADSENSE_SLOT_ENV.arenaInterstitial,
  battleBanner: ADSENSE_SLOT_ENV.battleBanner,
  battleInterstitial: ADSENSE_SLOT_ENV.battleInterstitial,
  cypherBanner: ADSENSE_SLOT_ENV.cypherBanner,
  concertBanner: ADSENSE_SLOT_ENV.concertBanner,
  concertSidebar: ADSENSE_SLOT_ENV.concertSidebar,
};

function readConsent(): AdConsentValue | null {
  try {
    const v = localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (v === 'accepted' || v === 'declined') return v;
  } catch {
    /* private mode */
  }
  return null;
}

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  label?: string;
}

export default function AdSenseSlot({ slot, format = 'auto', style, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [consent, setConsent] = useState<AdConsentValue | null>(null);
  const publisherId = getAdSensePublisherId();

  useEffect(() => {
    setConsent(readConsent());
    const onConsent = () => setConsent(readConsent());
    window.addEventListener('tmi:ad-consent', onConsent);
    return () => window.removeEventListener('tmi:ad-consent', onConsent);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted' || !slot || pushed.current) return;
    pushed.current = true;
    try {
      type AdsByGoogle = { push: (v: Record<string, unknown>) => void };
      const adsbygoogle = (window as Window & { adsbygoogle?: AdsByGoogle }).adsbygoogle;
      if (adsbygoogle) adsbygoogle.push({});
    } catch {
      /* AdSense script not ready yet */
    }
  }, [consent, slot]);

  if (!slot) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 40, ...style }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: 8 }}>
          Ad unit pending — set NEXT_PUBLIC_ADSENSE_SLOT_* in ENV
        </div>
      </div>
    );
  }

  if (consent !== 'accepted') {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 40, ...style }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: 8 }}>
          {consent === 'declined' ? 'Ads hidden' : 'Awaiting ad consent'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {label && (
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textAlign: 'center', paddingBottom: 2 }}>
          {label}
        </div>
      )}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{
          __html: `<ins class="adsbygoogle" style="display:block" data-ad-client="${publisherId}" data-ad-slot="${slot}" data-ad-format="${format}" data-full-width-responsive="true"></ins>`,
        }}
      />
    </div>
  );
}

interface SponsorOrAdProps {
  sponsorContent?: React.ReactNode;
  adSlot?: string;
  style?: React.CSSProperties;
}

export function SponsorOrAd({ sponsorContent, adSlot, style }: SponsorOrAdProps) {
  if (sponsorContent) return <div style={style}>{sponsorContent}</div>;
  return (
    <AdSenseSlot
      slot={adSlot ?? AD_SLOTS.sponsorFallback}
      format="auto"
      label="ADVERTISEMENT"
      style={style}
    />
  );
}
