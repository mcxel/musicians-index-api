'use client';

/**
 * Minimal CMP stub — gates adsbygoogle until the user accepts.
 * Not a full TCF/IAB CMP; ops may replace with a certified CMP for EEA.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AD_CONSENT_STORAGE_KEY,
  getAdSensePublisherId,
  type AdConsentValue,
} from '@/lib/ads/adConfig';

function readConsent(): AdConsentValue | null {
  try {
    const v = localStorage.getItem(AD_CONSENT_STORAGE_KEY);
    if (v === 'accepted' || v === 'declined') return v;
  } catch {
    /* private mode */
  }
  return null;
}

function loadAdSenseScript(): void {
  if (typeof document === 'undefined') return;
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
  // Admin operational surfaces have no ad inventory and the fixed bottom
  // banner (zIndex 99999) sits on top of the Living OS Control Desk there.
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;
    const existing = readConsent();
    if (existing === 'accepted') {
      loadAdSenseScript();
      return;
    }
    if (existing === null) setVisible(true);
  }, [isAdminRoute]);

  const choose = (value: AdConsentValue) => {
    try {
      localStorage.setItem(AD_CONSENT_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    if (value === 'accepted') loadAdSenseScript();
    window.dispatchEvent(new CustomEvent('tmi:ad-consent', { detail: value }));
    setVisible(false);
  };

  if (!visible || isAdminRoute) return null;

  return (
    <div
      role="dialog"
      aria-label="Advertising consent"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 99999,
        maxWidth: 520,
        margin: '0 auto',
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(5,5,16,0.96)',
        border: '1px solid rgba(0,229,255,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <strong style={{ color: '#00E5FF', display: 'block', marginBottom: 6 }}>
        Ads &amp; privacy
      </strong>
      We use Google AdSense to fund the platform. Accept to load personalized/non-personalized
      ads. Decline keeps the site usable without AdSense.
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => choose('accepted')}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #00E5FF',
            background: 'rgba(0,229,255,0.18)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Accept ads
        </button>
        <button
          type="button"
          onClick={() => choose('declined')}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
