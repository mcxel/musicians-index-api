'use client';

import { useEffect, useRef, useState } from 'react';
import AdSenseSlot, { AD_SLOTS } from './AdSenseSlot';

// ── Network definitions ──────────────────────────────────────────────────────
type AdNetwork = 'adsense' | 'medianet' | 'amazon' | 'carbon' | 'propeller' | 'house';

export interface VenuePlacement {
  slot: string;           // AdSense slot key from AD_SLOTS
  networks: AdNetwork[];  // ordered preference list; round-robin rotates through these
  format?: 'horizontal' | 'rectangle' | 'auto';
  minHeight?: number;
}

// Per-venue placement configs
export const VENUE_PLACEMENTS: Record<string, VenuePlacement[]> = {
  'home-1': [
    { slot: 'homepageBanner',    networks: ['adsense', 'medianet', 'amazon'],    format: 'horizontal', minHeight: 90  },
    { slot: 'homepageMid',       networks: ['adsense', 'medianet', 'amazon'],    format: 'rectangle',  minHeight: 250 },
  ],
  'home-2': [
    { slot: 'homepageBanner',    networks: ['adsense', 'medianet', 'carbon'],    format: 'horizontal', minHeight: 90  },
    { slot: 'homepageMid',       networks: ['adsense', 'medianet', 'carbon'],    format: 'rectangle',  minHeight: 250 },
  ],
  'home-3': [
    { slot: 'liveLobbyBanner',   networks: ['adsense', 'propeller', 'amazon'],   format: 'horizontal', minHeight: 90  },
    { slot: 'homepageMid',       networks: ['adsense', 'propeller', 'amazon'],   format: 'rectangle',  minHeight: 250 },
  ],
  'home-4': [
    { slot: 'homepageBanner',    networks: ['adsense', 'medianet'],              format: 'horizontal', minHeight: 90  },
  ],
  'home-5': [
    { slot: 'homepageBanner',    networks: ['adsense', 'propeller', 'medianet'], format: 'horizontal', minHeight: 90  },
    { slot: 'homepageMid',       networks: ['adsense', 'propeller', 'medianet'], format: 'rectangle',  minHeight: 250 },
  ],
  'magazine': [
    { slot: 'magazineLeaderboard', networks: ['adsense', 'carbon', 'medianet'],   format: 'horizontal', minHeight: 90  },
    { slot: 'magazineInline',      networks: ['adsense', 'carbon', 'medianet'],   format: 'rectangle',  minHeight: 250 },
    { slot: 'magazineArticleEnd',  networks: ['adsense', 'carbon', 'amazon'],     format: 'rectangle',  minHeight: 250 },
  ],
  'games': [
    { slot: 'gameShowBanner',       networks: ['adsense', 'propeller', 'amazon'], format: 'horizontal', minHeight: 90  },
    { slot: 'gameShowInterstitial', networks: ['adsense', 'propeller', 'amazon'], format: 'rectangle',  minHeight: 250 },
  ],
  'shows': [
    { slot: 'showSidebar',         networks: ['adsense', 'medianet', 'carbon'],   format: 'rectangle',  minHeight: 250 },
    { slot: 'roomLeaderboard',     networks: ['adsense', 'medianet', 'carbon'],   format: 'horizontal', minHeight: 90  },
  ],
  'room': [
    { slot: 'roomLeaderboard',       networks: ['adsense', 'propeller'],           format: 'horizontal', minHeight: 90  },
    { slot: 'roomBetweenSegments',   networks: ['adsense', 'propeller', 'amazon'], format: 'rectangle',  minHeight: 250 },
  ],
  'dashboard': [
    { slot: 'dashboardBanner',       networks: ['adsense', 'medianet', 'amazon'],  format: 'horizontal', minHeight: 90  },
    { slot: 'dashboardSidebar',      networks: ['adsense', 'medianet', 'carbon'],  format: 'rectangle',  minHeight: 250 },
    { slot: 'dashboardMid',          networks: ['adsense', 'propeller', 'amazon'], format: 'rectangle',  minHeight: 250 },
  ],
  'arena': [
    { slot: 'arenaBanner',           networks: ['adsense', 'propeller', 'amazon'], format: 'horizontal', minHeight: 90  },
    { slot: 'arenaInterstitial',     networks: ['adsense', 'propeller'],           format: 'rectangle',  minHeight: 250 },
  ],
  'battle': [
    { slot: 'battleBanner',          networks: ['adsense', 'propeller', 'amazon'], format: 'horizontal', minHeight: 90  },
    { slot: 'battleInterstitial',    networks: ['adsense', 'propeller'],           format: 'rectangle',  minHeight: 250 },
  ],
  'cypher': [
    { slot: 'cypherBanner',          networks: ['adsense', 'medianet'],            format: 'horizontal', minHeight: 90  },
  ],
  'concert': [
    { slot: 'concertBanner',         networks: ['adsense', 'medianet', 'amazon'],  format: 'horizontal', minHeight: 90  },
    { slot: 'concertSidebar',        networks: ['adsense', 'medianet', 'carbon'],  format: 'rectangle',  minHeight: 250 },
  ],
};

// ── Network availability check ───────────────────────────────────────────────
function isNetworkConfigured(network: AdNetwork): boolean {
  if (typeof window === 'undefined') return false;
  switch (network) {
    case 'adsense':    return true; // always available via layout script
    case 'medianet':   return !!process.env.NEXT_PUBLIC_MEDIANET_CID;
    case 'amazon':     return !!process.env.NEXT_PUBLIC_AMAZON_PUB_ID;
    case 'carbon':     return !!process.env.NEXT_PUBLIC_CARBON_SERVE;
    case 'propeller':  return !!process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID;
    case 'house':      return true;
    default:           return false;
  }
}

// ── Round-robin counter per venue+slot ──────────────────────────────────────
function nextNetwork(venueKey: string, networks: AdNetwork[]): AdNetwork {
  if (typeof window === 'undefined') return networks[0] ?? 'adsense';
  const key = `tmi_ad_net_${venueKey}`;
  const idx = parseInt(sessionStorage.getItem(key) ?? '0', 10);
  const next = (idx + 1) % networks.length;
  sessionStorage.setItem(key, String(next));
  const chosen = networks[idx] ?? 'adsense';
  return isNetworkConfigured(chosen) ? chosen : 'adsense';
}

// ── Network renderers ────────────────────────────────────────────────────────
function MediaNetAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cid = process.env.NEXT_PUBLIC_MEDIANET_CID;
    if (!cid || !ref.current) return;
    const s = document.createElement('script');
    s.src = `//contextual.media.net/dmedianet.js?cid=${cid}`;
    s.async = true;
    ref.current.appendChild(s);
    return () => { try { ref.current?.removeChild(s); } catch {} };
  }, []);
  return <div ref={ref} style={style} />;
}

function AmazonAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pubId = process.env.NEXT_PUBLIC_AMAZON_PUB_ID;
    if (!pubId || !ref.current || typeof (window as any).apstag === 'undefined') return;
    try {
      (window as any).apstag.fetchBids({ pubID: pubId, adSlots: [{ slotID: ref.current.id, sizes: [[728, 90]] }] }, () => {
        (window as any).apstag.setDisplayBids();
      });
    } catch {}
  }, []);
  const id = `amzn-${Math.random().toString(36).slice(2, 8)}`;
  return <div id={id} ref={ref} style={style} />;
}

function CarbonAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const serve = process.env.NEXT_PUBLIC_CARBON_SERVE;
    const placement = process.env.NEXT_PUBLIC_CARBON_PLACEMENT;
    if (!serve || !ref.current) return;
    const s = document.createElement('script');
    s.src = `//cdn.carbonads.com/carbon.js?serve=${serve}&placement=${placement ?? 'tmiplatform'}`;
    s.id = '_carbonads_js';
    s.async = true;
    ref.current.appendChild(s);
    return () => { try { ref.current?.removeChild(s); } catch {} };
  }, []);
  return <div ref={ref} style={style} />;
}

function PropellerAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const zoneId = process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID;
    if (!zoneId || !ref.current) return;
    const s = document.createElement('script');
    s.src = `https://a.magsrv.com/ad-provider.js`;
    s.async = true;
    const cfg = document.createElement('script');
    cfg.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}, "serve_id": "${zoneId}"});`;
    ref.current.appendChild(s);
    ref.current.appendChild(cfg);
    return () => { try { ref.current?.removeChild(s); ref.current?.removeChild(cfg); } catch {} };
  }, []);
  return <div ref={ref} style={style} />;
}

function HousePromo({ style, accentColor = '#00FFFF' }: { style?: React.CSSProperties; accentColor?: string }) {
  return (
    <a href="/sponsors" style={{ textDecoration: 'none', display: 'block', ...style }}>
      <div style={{ width: '100%', height: '100%', minHeight: style?.minHeight ?? 90, background: `linear-gradient(135deg, ${accentColor}18, rgba(5,5,16,0.9))`, border: `1px solid ${accentColor}44`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 24px' }}>
        <span style={{ fontSize: 10, letterSpacing: '0.22em', color: accentColor, fontWeight: 800 }}>ADVERTISE WITH TMI</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>→ SPONSOR THIS SPOT</span>
      </div>
    </a>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export interface UnifiedAdSlotProps {
  venue: string;            // key into VENUE_PLACEMENTS, e.g. 'home-1', 'magazine', 'games'
  slotKey: string;          // key in AD_SLOTS
  format?: 'horizontal' | 'rectangle' | 'auto';
  label?: string;
  style?: React.CSSProperties;
  accentColor?: string;
}

export default function UnifiedAdSlot({ venue, slotKey, format = 'horizontal', label = 'ADVERTISEMENT', style, accentColor }: UnifiedAdSlotProps) {
  const [network, setNetwork] = useState<AdNetwork>('adsense');
  const venueKey = `${venue}_${slotKey}`;

  useEffect(() => {
    // Determine rotation config for this venue
    const placements = VENUE_PLACEMENTS[venue] ?? [];
    const placement = placements.find((p) => p.slot === slotKey);
    const networks = placement?.networks ?? ['adsense'];
    setNetwork(nextNetwork(venueKey, networks));
  }, [venue, slotKey, venueKey]);

  const containerStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    ...style,
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: style?.minHeight ?? (format === 'rectangle' ? 250 : 90),
  };

  return (
    <div style={containerStyle} aria-label={label} data-tmi-ad-venue={venue} data-tmi-ad-network={network}>
      {label && (
        <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: 4 }}>
          {label}
        </div>
      )}
      {network === 'adsense' && (
        <AdSenseSlot
          slot={(AD_SLOTS as Record<string, string>)[slotKey] ?? AD_SLOTS.sponsorFallback}
          format={format}
          label=""
          style={innerStyle}
        />
      )}
      {network === 'medianet'  && <MediaNetAd   style={innerStyle} />}
      {network === 'amazon'    && <AmazonAd     style={innerStyle} />}
      {network === 'carbon'    && <CarbonAd     style={innerStyle} />}
      {network === 'propeller' && <PropellerAd  style={innerStyle} />}
      {network === 'house'     && <HousePromo   style={innerStyle} accentColor={accentColor} />}
    </div>
  );
}
