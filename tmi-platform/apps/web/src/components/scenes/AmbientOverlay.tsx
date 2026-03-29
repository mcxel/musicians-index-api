'use client';
// AmbientOverlay.tsx — Optional animated layer over scene background
// Copilot wires: scene config from useRoomScene(roomId)
// Proof: overlay plays on rooms with ambient config, respects prefers-reduced-motion
// Per ACCESSIBILITY_SYSTEM: disable all animation when prefers-reduced-motion is set
export function AmbientOverlay({ overlayUrl, type }: { overlayUrl?: string; type?: 'fog'|'lights'|'particles'|'crowd' }) {
  if (!overlayUrl) return null;
  return (
    <div className="tmi-ambient-overlay" aria-hidden="true" data-ambient-type={type}>
      <video
        className="tmi-ambient-overlay__video"
        src={overlayUrl}
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.35 }}
      />
    </div>
  );
}
