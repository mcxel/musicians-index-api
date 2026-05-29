'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'tmi-pwa-dismissed-until';
const VISIT_KEY = 'tmi-pwa-visits';
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const until = Number(localStorage.getItem(DISMISSED_KEY) ?? '0');
  return Date.now() < until;
}

function setDismissed() {
  localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isDismissed()) return;

    const visits = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    setIsIos(iOSDevice);
    if (visits >= 2) setVisible(true);

    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed() && !isStandalone) setVisible(true);
    };
    const onInstalled = () => { setVisible(false); setDeferredPrompt(null); };

    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Push page content DOWN by the banner height so nothing gets covered
  useEffect(() => {
    const body = document.body;
    if (visible) {
      body.style.paddingBottom = 'calc(80px + env(safe-area-inset-bottom, 0px))';
    } else {
      body.style.paddingBottom = '';
    }
    return () => { body.style.paddingBottom = ''; };
  }, [visible]);

  const dismiss = () => {
    setDismissed();
    setVisible(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
      setDeferredPrompt(null);
      return;
    }
    if (!isIos) { window.location.href = '/app-status'; return; }
    if (isIos && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText('Tap Share → Add to Home Screen');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install TMI app"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        // Above nav (400) and content (300) but below modals (600)
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(145deg, rgba(5,5,16,0.97) 0%, rgba(14,18,32,0.97) 100%)',
        borderTop: '1px solid rgba(0,255,255,0.22)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Icon + text */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 220px', minWidth: 0 }}>
        <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>📱</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', color: '#00FFFF', textTransform: 'uppercase', fontFamily: 'Inter,sans-serif' }}>
            INSTALL TMI
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontFamily: 'Inter,sans-serif', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deferredPrompt
              ? 'Add to home screen for an app-style launch.'
              : isIos
                ? 'Tap Share → Add to Home Screen.'
                : 'Installable now. Play Store packaging coming.'}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 14px',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#050510',
            background: 'linear-gradient(135deg,#00FFFF,#00AABB)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          {deferredPrompt ? 'INSTALL' : isIos ? (copied ? '✓ COPIED' : 'HOW TO') : 'OPEN GUIDE'}
        </button>
        {!deferredPrompt && !isIos && (
          <Link
            href="/app-status"
            style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, textDecoration: 'none', fontFamily: 'Inter,sans-serif' }}
          >
            MORE
          </Link>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss install banner for 7 days"
          style={{
            padding: '8px 12px',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          NOT NOW
        </button>
      </div>
    </div>
  );
}
