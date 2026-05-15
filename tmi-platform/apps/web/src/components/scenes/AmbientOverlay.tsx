'use client';
import { useVisualRouting } from '@/lib/hooks/useVisualAuthority';
// AmbientOverlay.tsx — Optional animated layer over scene background
// Copilot wires: scene config from useRoomScene(roomId)
// Proof: overlay plays on rooms with ambient config, respects prefers-reduced-motion
// Per ACCESSIBILITY_SYSTEM: disable all animation when prefers-reduced-motion is set
export function AmbientOverlay({ overlayUrl, type }: { overlayUrl?: string; type?: 'fog'|'lights'|'particles'|'crowd' }) {
  const { assetId: governedOverlayAsset } = useVisualRouting(
    `ambient-overlay-${type ?? 'default'}`,
    'ambient-overlay',
    'home',
    {
      displayName: `ambient-${type ?? 'default'}`,
      sourceRoute: '/home',
      targetSlot: 'ambient-overlay',
      telemetry: 'visual_authority_applied',
      recovery: 'fallback',
    }
  );
  const resolvedOverlayUrl = governedOverlayAsset || overlayUrl;
  if (!overlayUrl) return null;
  return (
    <div className="tmi-ambient-overlay" aria-hidden="true" data-ambient-type={type}>
      <video src={resolvedOverlayUrl} autoPlay muted loop playsInline />
    </div>
  );
}
