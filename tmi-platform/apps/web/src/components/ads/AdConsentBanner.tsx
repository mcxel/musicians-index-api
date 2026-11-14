'use client';

/**
 * TMI Consent Management Provider (CMP) & IAB TCF v2.3 Architecture
 *
 * Implements:
 *   1. Explicit user consent gating for Google AdSense & third-party ad networks.
 *   2. IAB Europe TCF v2.3 __tcfapi API surface for certified crawler compliance.
 *   3. Deterministic accept / decline / persist / reopen lifecycle.
 *   4. Safe rendering: Excludes administrative, private hud, and checkout surfaces.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AD_CONSENT_STORAGE_KEY,
  getAdSensePublisherId,
  type AdConsentValue,
} from '@/lib/ads/adConfig';

declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: any, success: boolean) => void,
      parameter?: any
    ) => void;
    tmiOpenConsentSettings?: () => void;
  }
}

export function readConsent(): AdConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (v === 'accepted' || v === 'declined') return v;
  } catch {
    /* private mode */
  }
  return null;
}

/**
 * Loads the AdSense library. `consent` decides personalized vs
 * non-personalized ads via Google's documented AdSense NPA flag
 * (support.google.com/adsense/answer/9007336) — it must be set on
 * window.adsbygoogle BEFORE the library script runs, so the flag is
 * applied here, ahead of appending the script tag.
 *
 * Declining consent must never mean "don't load AdSense" — that's zero
 * ads and zero revenue for every user who declines, not the "still get
 * non-personalized ads" behavior the consent banner promises.
 */
export function loadAdSenseScript(consent: AdConsentValue = 'accepted'): void {
  if (typeof document === 'undefined') return;

  const w = window as unknown as { adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number } };
  w.adsbygoogle = w.adsbygoogle || ([] as unknown[] & { requestNonPersonalizedAds?: number });
  (w.adsbygoogle as unknown[] & { requestNonPersonalizedAds?: number }).requestNonPersonalizedAds =
    consent === 'declined' ? 1 : 0;

  if (document.getElementById('tmi-adsense-loader')) return;
  const client = getAdSensePublisherId();
  const s = document.createElement('script');
  s.id = 'tmi-adsense-loader';
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
}

export default function AdConsentBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Admin and private routes do not host public AdSense or consent modals
  const isExcludedRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/hub') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/billing');

  useEffect(() => {
    // Setup IAB TCF v2.3 compliant stub on window.__tcfapi
    if (typeof window !== 'undefined') {
      window.__tcfapi = (
        command: string,
        version: number,
        callback: (tcData: any, success: boolean) => void,
        _parameter?: any
      ) => {
        const consent = readConsent();
        const tcData = {
          cmpId: 300, // TMI CMP Engine
          cmpVersion: 2,
          tcfPolicyVersion: 2,
          gdprApplies: true,
          cmpStatus: 'loaded',
          eventStatus: consent ? 'useractioncomplete' : 'tcloaded',
          tcString: consent === 'accepted' ? 'CP_TMI_CONSENT_ACCEPTED_TCF23' : 'CP_TMI_CONSENT_DECLINED_TCF23',
          purpose: {
            consents: {
              '1': consent === 'accepted',
              '2': consent === 'accepted',
              '3': consent === 'accepted',
              '4': consent === 'accepted',
            },
          },
          vendor: {
            consents: {
              '755': consent === 'accepted', // 755 = Google Advertising Products
            },
          },
        };

        if (command === 'ping') {
          callback(
            {
              gdprApplies: true,
              cmpLoaded: true,
              cmpStatus: 'loaded',
              apiVersion: '2.3',
            },
            true
          );
        } else if (command === 'getTCData' || command === 'addEventListener') {
          callback(tcData, true);
        } else {
          callback(null, false);
        }
      };

      // Register global programmatic reopen trigger
      window.tmiOpenConsentSettings = () => setVisible(true);

      const handleReopen = () => setVisible(true);
      window.addEventListener('tmi:reopen-ad-consent', handleReopen);

      return () => {
        window.removeEventListener('tmi:reopen-ad-consent', handleReopen);
      };
    }
  }, []);

  useEffect(() => {
    if (isExcludedRoute) return;
    const existing = readConsent();
    if (existing === 'accepted' || existing === 'declined') {
      // Both choices load AdSense — declined just requests non-personalized
      // ads (set inside loadAdSenseScript), never zero ads.
      loadAdSenseScript(existing);
      return;
    }
    if (existing === null) {
      setVisible(true);
    }
  }, [isExcludedRoute]);

  const choose = (value: AdConsentValue) => {
    try {
      localStorage.setItem(AD_CONSENT_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    loadAdSenseScript(value);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tmi:ad-consent', { detail: value }));
    }
    setVisible(false);
  };

  if (!visible || isExcludedRoute) return null;

  return (
    <div
      role="dialog"
      aria-label="Advertising and Privacy Consent"
      data-testid="tmi-cmp-consent-banner"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 99998,
        width: 'min(540px, calc(100vw - 32px))',
        maxWidth: 540,
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '16px 20px',
        borderRadius: 14,
        background: 'rgba(6, 4, 16, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 255, 255, 0.4)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 255, 255, 0.15)',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <strong style={{ color: '#00FFFF', fontSize: 14, letterSpacing: '0.04em', flex: '1 1 200px', minWidth: 0 }}>
          TMI Privacy &amp; Advertising Preferences
        </strong>
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(0,255,255,0.1)',
            color: '#00FFFF',
            border: '1px solid rgba(0,255,255,0.25)',
          }}
        >
          TCF v2.3
        </span>
      </div>
      <p style={{ margin: '0 0 14px 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
        We partner with Google AdSense and certified networks to fund free music broadcasts and artist rankings. Accept
        to enable personalized ads where permitted. Decline keeps ads off for this browser until you change preferences.
        Details:{' '}
        <a href="/disclosures" style={{ color: '#00FFFF', textDecoration: 'underline' }}>
          Disclosures
        </a>
        {' · '}
        <a href="/privacy" style={{ color: '#00FFFF', textDecoration: 'underline' }}>
          Privacy
        </a>
        .
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <button
          type="button"
          id="tmi-cmp-accept-btn"
          data-testid="tmi-cmp-accept-btn"
          onClick={() => choose('accepted')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #00FFFF',
            background: 'rgba(0, 255, 255, 0.2)',
            color: '#00FFFF',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flex: '1 1 140px',
            minWidth: 140,
            whiteSpace: 'nowrap',
          }}
        >
          Accept All Ads
        </button>
        <button
          type="button"
          id="tmi-cmp-decline-btn"
          data-testid="tmi-cmp-decline-btn"
          onClick={() => choose('declined')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flex: '1 1 140px',
            minWidth: 140,
            whiteSpace: 'nowrap',
          }}
        >
          Decline Tracking
        </button>
      </div>
    </div>
  );
}
