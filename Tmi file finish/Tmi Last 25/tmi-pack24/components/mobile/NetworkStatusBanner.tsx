'use client';
// NetworkStatusBanner.tsx — Shows low-bandwidth warning in rooms
// Copilot wires: useNetworkQuality() via Network Information API
// Proof: shows on 2G/slow-3G, activates low-bandwidth mode in AudioProvider
export function NetworkStatusBanner({ quality }: { quality: 'good'|'fair'|'poor' }) {
  if (quality === 'good') return null;
  return (
    <div className={`tmi-network-banner tmi-network-banner--${quality}`} role="status">
      {quality === 'poor'
        ? '⚠️ Very slow connection — switching to audio-only mode'
        : '⚠️ Slow connection — video quality reduced'}
    </div>
  );
}
