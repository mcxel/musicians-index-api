'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'tmi-pwa-dismissed';
const VISIT_KEY = 'tmi-pwa-visits';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    const visits = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    setIsIos(iOSDevice);

    if (!dismissed && !isStandalone && visits >= 2) {
      setVisible(true);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (!dismissed && !isStandalone) {
        setVisible(true);
      }
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
      }
      setDeferredPrompt(null);
      return;
    }

    if (!isIos) {
      window.location.href = '/app-status';
      return;
    }

    if (isIos && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText('Tap Share, then Add to Home Screen.');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!visible) return null;

  return (
    <div className="tmi-pwa-prompt" role="banner" aria-label="Install TMI app">
      <div className="tmi-pwa-prompt__content">
        <span className="tmi-pwa-prompt__icon" aria-hidden="true">📱</span>
        <div className="tmi-pwa-prompt__text">
          <strong>Install TMI</strong>
          <span>
            {deferredPrompt
              ? 'Add TMI to your home screen for an app-style launch.'
              : isIos
                ? 'On iPhone or iPad, use Share then Add to Home Screen.'
                : 'TMI is installable from the browser now. Play Store packaging comes later.'}
          </span>
        </div>
      </div>
      <div className="tmi-pwa-prompt__actions">
        <button className="tmi-pwa-prompt__primary" onClick={handleInstall}>
          {deferredPrompt ? 'Install' : isIos ? (copied ? 'Copied' : 'Copy Steps') : 'Open Guide'}
        </button>
        {!deferredPrompt && !isIos ? (
          <Link className="tmi-pwa-prompt__ghost" href="/app-status">
            Learn More
          </Link>
        ) : null}
        <button className="tmi-pwa-prompt__ghost" onClick={dismiss}>Not Now</button>
      </div>
      <style>{`
        .tmi-pwa-prompt {
          position: fixed;
          left: 14px;
          right: 14px;
          bottom: 88px;
          z-index: 120;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border: 1px solid rgba(0,255,255,0.22);
          background: linear-gradient(145deg, rgba(5,5,16,0.96), rgba(18,24,40,0.96));
          box-shadow: 0 18px 32px rgba(0,0,0,0.45);
          backdrop-filter: blur(12px);
        }

        .tmi-pwa-prompt__content {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          min-width: 220px;
          flex: 1 1 280px;
        }

        .tmi-pwa-prompt__icon {
          font-size: 24px;
          line-height: 1;
        }

        .tmi-pwa-prompt__text {
          display: grid;
          gap: 4px;
          font-family: Inter, sans-serif;
        }

        .tmi-pwa-prompt__text strong {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #00FFFF;
        }

        .tmi-pwa-prompt__text span {
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255,255,255,0.86);
        }

        .tmi-pwa-prompt__actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .tmi-pwa-prompt__primary,
        .tmi-pwa-prompt__ghost {
          appearance: none;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
        }

        .tmi-pwa-prompt__primary {
          color: #050510;
          background: linear-gradient(135deg, #00FFFF, #00AABB);
        }

        .tmi-pwa-prompt__ghost {
          color: #f7f5ee;
          background: rgba(255,255,255,0.06);
        }

        @media (max-width: 640px) {
          .tmi-pwa-prompt {
            bottom: 76px;
          }
        }
      `}</style>
    </div>
  );
}
