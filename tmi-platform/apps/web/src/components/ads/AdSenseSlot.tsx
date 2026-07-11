'use client';

import { useEffect, useRef } from 'react';

// ── Ad slot IDs ─────────────────────────────────────────────────────────────
// To activate: go to your Google AdSense account → Ads → By ad unit → Create
// new display ad unit. Copy the data-ad-slot value here for each placement.
//
// Until real slot IDs are added, AdSense will auto-detect and fill the slots
// once the page traffic reaches the threshold for auto-ads.
export const AD_SLOTS = {
  // Homepage
  homepageBanner:          process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_BANNER          ?? '',
  homepageMid:             process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE_MID             ?? '',
  dashboardSidebar:        process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_SIDEBAR        ?? '',
  liveLobbyBanner:         process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIVE_LOBBY_BANNER        ?? '',
  // Articles / Magazine
  articleInline:           process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE           ?? '',
  magazineLeaderboard:     process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_LEADERBOARD     ?? '',
  magazineInline:          process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_INLINE          ?? '',
  magazineArticleEnd:      process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAGAZINE_ARTICLE_END     ?? '',
  // Games / Shows
  gameShowBanner:          process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_SHOW_BANNER         ?? '',
  gameShowInterstitial:    process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_SHOW_INTERSTITIAL   ?? '',
  showSidebar:             process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOW_SIDEBAR             ?? '',
  // Rooms
  roomLeaderboard:         process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROOM_LEADERBOARD         ?? '',
  roomBetweenSegments:     process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROOM_BETWEEN_SEGMENTS    ?? '',
  // Fallback
  sponsorFallback:         process.env.NEXT_PUBLIC_ADSENSE_SLOT_SPONSOR_FALLBACK         ?? '',
};

const PUBLISHER_ID = 'ca-pub-4088577529436039';

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  label?: string;
}

export default function AdSenseSlot({ slot, format = 'auto', style, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      type AdsByGoogle = { push: (v: Record<string, unknown>) => void };
      const adsbygoogle = (window as Window & { adsbygoogle?: AdsByGoogle }).adsbygoogle;
      if (adsbygoogle) adsbygoogle.push({});
    } catch { /* AdSense script not ready yet */ }
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {label && (
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textAlign: 'center', paddingBottom: 2 }}>
          {label}
        </div>
      )}
      {/*
        Rendered via dangerouslySetInnerHTML rather than JSX so React treats this
        subtree as opaque. adsbygoogle.push() makes Google's script inject an
        iframe/wrapper inside the <ins> tag directly, outside React's virtual DOM.
        If React manages the <ins> as a normal child, unmounting it on route
        navigation diffs against a DOM structure it no longer recognizes and
        throws "NotFoundError: removeChild/insertBefore ... not a child of this
        node". Isolating it this way means React only ever manages this wrapper
        div, never the AdSense-mutated internals.
      */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{
          __html: `<ins class="adsbygoogle" style="display:block" data-ad-client="${PUBLISHER_ID}" data-ad-slot="${slot || ''}" data-ad-format="${format}" data-full-width-responsive="true"></ins>`,
        }}
      />
    </div>
  );
}

/**
 * SponsorOrAd — shows paid sponsor content if available, otherwise falls back
 * to an AdSense unit. Drop this wherever a sponsor/advertiser slot lives.
 */
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
