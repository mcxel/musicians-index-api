'use client';

import { useEffect, useState } from 'react';

const SW_RELOAD_KEY = 'tmi-sw-reload-pending';
const SW_VERSION_KEY = 'tmi-sw-version';
const SW_REPAIR_KEY = 'tmi-sw-stall-repair';
const SW_ACTIVATION_TIMEOUT_MS = 12000;

let swTelemetrySequence = 0;

function buildTelemetryEventId() {
  swTelemetrySequence += 1;
  return `sw_${Date.now()}_${swTelemetrySequence}`;
}

function sendSwTelemetry(eventName: string, meta: Record<string, string | number | boolean> = {}) {
  try {
    void fetch('/api/telemetry/ingest', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: buildTelemetryEventId(),
        eventName,
        domain: 'diagnostics',
        ts: Date.now(),
        activePersona: 'fan',
        allPersonas: ['fan'],
        meta,
      }),
    });
  } catch {
    // Ignore telemetry failures.
  }
}

export function PWARegistration() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let reloading = false;
    let activationTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

    const clearActivationTimer = () => {
      if (activationTimer !== null) {
        globalThis.clearTimeout(activationTimer);
        activationTimer = null;
      }
    };

    const repairBrokenWorker = async (reason: string) => {
      if (sessionStorage.getItem(SW_REPAIR_KEY) === '1') return;
      sessionStorage.setItem(SW_REPAIR_KEY, '1');
      clearActivationTimer();
      setStatusMessage('Refreshing app runtime...');
      sendSwTelemetry('sw.update.repair_started', { reason });

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys
              .filter((key) => key.startsWith('tmi-shell-'))
              .map((key) => caches.delete(key))
          );
        }
      } catch {
        sendSwTelemetry('sw.update.repair_failed', { reason });
      }

      window.location.reload();
    };

    const requestActivation = (registration: ServiceWorkerRegistration, reason: string) => {
      if (!registration.waiting) return;
      sessionStorage.setItem(SW_RELOAD_KEY, '1');
      setStatusMessage('Updating TMI for a safer reload...');
      sendSwTelemetry('sw.update.activate_requested', { reason });
      registration.waiting.postMessage({ type: 'TMI_SW_SKIP_WAITING' });

      clearActivationTimer();
      activationTimer = globalThis.setTimeout(() => {
        if (navigator.serviceWorker.controller) {
          void repairBrokenWorker('activation-timeout');
        }
      }, SW_ACTIVATION_TIMEOUT_MS);
    };

    const handleControllerChange = () => {
      if (reloading) return;
      if (sessionStorage.getItem(SW_RELOAD_KEY) !== '1') return;
      reloading = true;
      clearActivationTimer();
      sessionStorage.removeItem(SW_RELOAD_KEY);
      setStatusMessage('Finishing update...');
      sendSwTelemetry('sw.update.controller_changed');
      window.location.reload();
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'TMI_SW_ACTIVATED') {
        if (typeof event.data.version === 'string') {
          sessionStorage.setItem(SW_VERSION_KEY, event.data.version);
        }
        clearActivationTimer();
        setStatusMessage(null);
        sendSwTelemetry('sw.activated', { version: String(event.data.version ?? 'unknown') });
      }

      if (event.data.type === 'TMI_SW_VERSION') {
        sendSwTelemetry('sw.version.reported', { version: String(event.data.version ?? 'unknown') });
      }
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        void registration.update();
        navigator.serviceWorker.controller?.postMessage({ type: 'TMI_SW_GET_VERSION' });

        if (registration.waiting) {
          requestActivation(registration, 'waiting-on-load');
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          sendSwTelemetry('sw.update.found');

          installing.addEventListener('statechange', () => {
            if (installing.state !== 'installed') return;
            if (!navigator.serviceWorker.controller) return;
            requestActivation(registration, 'installed-update');
          });
        });
      } catch {
        // Ignore registration failures.
      }
    };

    const checkForUpdates = () => {
      if (document.visibilityState === 'hidden') return;
      void navigator.serviceWorker.getRegistration('/sw.js').then((registration) => {
        if (!registration) return;
        void registration.update();
        if (registration.waiting) {
          requestActivation(registration, 'visibility-recheck');
        }
      });
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', checkForUpdates);
    window.addEventListener('focus', checkForUpdates);
    void register();

    return () => {
      clearActivationTimer();
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', checkForUpdates);
      window.removeEventListener('focus', checkForUpdates);
    };
  }, []);

  if (!statusMessage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'rgba(5, 5, 16, 0.94)',
        border: '1px solid rgba(0,255,255,0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        color: '#EAFBFF',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
      }}
    >
      {statusMessage}
    </div>
  );
}
