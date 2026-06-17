'use client';

import { useEffect, useRef, useState } from 'react';
import AdSenseSlot, { AD_SLOTS } from './AdSenseSlot';
import { getActiveSponsorForZone, type ActiveSponsorDisplay } from '@/lib/commerce/SponsorRegistry';

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

// ── Independent per-instance network picker ──────────────────────────────────
// Each slot instance gets its own random starting offset so that multiple slots
// on the same page (e.g., 10 magazine inserts) serve different ad networks
// simultaneously, maximising fill diversity and CPM.
function pickNetwork(instanceSeed: number, networks: AdNetwork[]): AdNetwork {
  if (typeof window === 'undefined') return networks[0] ?? 'adsense';
  // Walk the list starting at the instance seed until a configured network is found
  for (let i = 0; i < networks.length; i++) {
    const candidate = networks[(instanceSeed + i) % networks.length] ?? 'adsense';
    if (isNetworkConfigured(candidate)) return candidate;
  }
  return 'adsense';
}

// Advance a global page-level counter so the NEXT slot on the same page gets a
// different starting position, even when both use the same venue+slotKey.
const _pageSeedCounters: Record<string, number> = {};
function claimSeed(venueKey: string, count: number): number {
  const current = _pageSeedCounters[venueKey] ?? Math.floor(Math.random() * count);
  _pageSeedCounters[venueKey] = (current + 1) % count;
  return current;
}

// ── Network renderers ────────────────────────────────────────────────────────
function MediaNetAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cid = process.env.NEXT_PUBLIC_MEDIANET_CID;
    const node = ref.current;
    if (!cid || !node) return;
    const s = document.createElement('script');
    s.src = `//contextual.media.net/dmedianet.js?cid=${cid}`;
    s.async = true;
    node.appendChild(s);
    return () => { try { node.removeChild(s); } catch (_e) { void _e; } };
  }, []);
  return <div ref={ref} style={style} />;
}

interface ApsTag {
  fetchBids: (opts: { pubID: string; adSlots: { slotID: string; sizes: number[][] }[] }, cb: () => void) => void;
  setDisplayBids: () => void;
}

function AmazonAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`amzn-${Math.random().toString(36).slice(2, 8)}`);
  useEffect(() => {
    const pubId = process.env.NEXT_PUBLIC_AMAZON_PUB_ID;
    const apstag = (window as Window & { apstag?: ApsTag }).apstag;
    if (!pubId || !ref.current || !apstag) return;
    try {
      apstag.fetchBids({ pubID: pubId, adSlots: [{ slotID: id.current, sizes: [[728, 90]] }] }, () => {
        apstag.setDisplayBids();
      });
    } catch (_e) { void _e; }
  }, []);
  return <div id={id.current} ref={ref} style={style} />;
}

function CarbonAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const serve = process.env.NEXT_PUBLIC_CARBON_SERVE;
    const placement = process.env.NEXT_PUBLIC_CARBON_PLACEMENT;
    const node = ref.current;
    if (!serve || !node) return;
    const s = document.createElement('script');
    s.src = `//cdn.carbonads.com/carbon.js?serve=${serve}&placement=${placement ?? 'tmiplatform'}`;
    s.id = '_carbonads_js';
    s.async = true;
    node.appendChild(s);
    return () => { try { node.removeChild(s); } catch (_e) { void _e; } };
  }, []);
  return <div ref={ref} style={style} />;
}

function PropellerAd({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const zoneId = process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID;
    const node = ref.current;
    if (!zoneId || !node) return;
    const s = document.createElement('script');
    s.src = `https://a.magsrv.com/ad-provider.js`;
    s.async = true;
    const cfg = document.createElement('script');
    cfg.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}, "serve_id": "${zoneId}"});`;
    node.appendChild(s);
    node.appendChild(cfg);
    return () => { try { node.removeChild(s); node.removeChild(cfg); } catch (_e) { void _e; } };
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

// Rendered when a sponsor has purchased this zone. Auto-replaced by ad networks when removed.
function SponsorTile({ sponsor, style }: { sponsor: ActiveSponsorDisplay; style?: React.CSSProperties }) {
  const accent = sponsor.accentColor;
  return (
    <a href={sponsor.ctaHref} style={{ textDecoration: 'none', display: 'block', ...style }}>
      <div style={{ width: '100%', minHeight: style?.minHeight ?? 90, background: `linear-gradient(135deg, ${accent}22, rgba(5,5,16,0.92))`, border: `1px solid ${accent}55`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', gap: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 4, right: 8, fontSize: 8, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>SPONSORED</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {sponsor.logoUrl && <img src={sponsor.logoUrl} alt={sponsor.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: `1px solid ${accent}44`, flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.04em' }}>{sponsor.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sponsor.tagline}</div>
          </div>
        </div>
        <div style={{ flexShrink: 0, background: accent, color: '#000', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', padding: '6px 14px', borderRadius: 4 }}>
          {sponsor.ctaLabel}
        </div>
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
  const [sponsor, setSponsor] = useState<ActiveSponsorDisplay | null>(null);
  const venueKey = `${venue}_${slotKey}`;
  const zone = `${venue}-${slotKey}`;

  useEffect(() => {
    // Sponsor check — takes priority over all ad networks
    const activeSponsor = getActiveSponsorForZone(zone);
    if (activeSponsor) {
      setSponsor(activeSponsor);
      return;
    }
    setSponsor(null);
    // No sponsor: each slot instance claims an independent starting offset so
    // multiple slots on the same page serve different networks simultaneously.
    const placements = VENUE_PLACEMENTS[venue] ?? [];
    const placement = placements.find((p) => p.slot === slotKey);
    const networks = placement?.networks ?? ['adsense'];
    const seed = claimSeed(venueKey, networks.length);
    setNetwork(pickNetwork(seed, networks));
  }, [venue, slotKey, venueKey, zone]);

  const containerStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    ...style,
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: style?.minHeight ?? (format === 'rectangle' ? 250 : 90),
  };

  // Active sponsor owns this zone — render branded tile, skip ad networks
  if (sponsor) {
    return (
      <div style={containerStyle} aria-label="SPONSORED" data-tmi-ad-venue={venue} data-tmi-ad-network="sponsor">
        <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: 4 }}>SPONSORED</div>
        <SponsorTile sponsor={sponsor} style={innerStyle} />
      </div>
    );
  }

  return (
    <div style={containerStyle} aria-label={label} data-tmi-ad-venue={venue} data-tmi-ad-network={network}>
      {label && (
        <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: 4 }}>
          {label}
        </div>
      )}
      {network === 'adsense' && (
        ((AD_SLOTS as Record<string, string>)[slotKey] || AD_SLOTS.sponsorFallback)
          ? (
            <AdSenseSlot
              slot={(AD_SLOTS as Record<string, string>)[slotKey] || AD_SLOTS.sponsorFallback}
              format={format}
              label=""
              style={innerStyle}
            />
          )
          // Rule 12 — no real AdSense slot ID configured yet: never show an empty
          // <ins> tag, fall through to the guaranteed "Advertise Here" CTA instead.
          : <HousePromo style={innerStyle} accentColor={accentColor} />
      )}
      {network === 'medianet'  && <MediaNetAd   style={innerStyle} />}
      {network === 'amazon'    && <AmazonAd     style={innerStyle} />}
      {network === 'carbon'    && <CarbonAd     style={innerStyle} />}
      {network === 'propeller' && <PropellerAd  style={innerStyle} />}
      {network === 'house'     && <HousePromo   style={innerStyle} accentColor={accentColor} />}
    </div>
  );
}
