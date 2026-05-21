'use client';
// OfflineStateBanner.tsx — Shown when network is offline
// Copilot wires: useOnlineStatus() via navigator.onLine + online/offline events
// Proof: appears when offline, disappears when back online, room join blocked
export function OfflineStateBanner() {
  return (
    <div className="tmi-offline-banner" role="alert" aria-live="assertive">
      <span className="tmi-offline-banner__icon" aria-hidden="true">📡</span>
      <span className="tmi-offline-banner__text">You're offline — reconnecting...</span>
    </div>
  );
}
