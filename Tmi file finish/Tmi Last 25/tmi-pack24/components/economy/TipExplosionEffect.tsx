'use client';
// TipExplosionEffect.tsx — Animated tip notification floating up in room
// Copilot wires: subscribes to room.tip.received WebSocket event
// Proof: floats up with fan name + amount, fades out after 3s
// Per ANIMATION_AND_MOTION_SYSTEM: entrance 600ms spring, exit 300ms fade
export function TipExplosionEffect({ fromName, amount }: { fromName: string; amount: number }) {
  return (
    <div className="tmi-tip-explosion" aria-live="polite" aria-label={`${fromName} tipped $${amount}`}>
      <span className="tmi-tip-explosion__amount">${amount}</span>
      <span className="tmi-tip-explosion__from">from {fromName}</span>
      <span className="tmi-tip-explosion__icon" aria-hidden="true">💰</span>
    </div>
  );
}
