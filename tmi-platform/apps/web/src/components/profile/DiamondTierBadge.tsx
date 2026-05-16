'use client';
// DiamondTierBadge.tsx — Shows subscription tier with correct TMI visual
// PERMANENT DIAMOND: Marcel Dickens and B.J. M Beat's — see SUBSCRIPTION_SYSTEM.md
// Copilot wires: tier from useArtistProfile(slug) or useSubscription()
// Proof: Marcel and BJ always show Diamond — billing-integrity-bot verifies every 4h
export type TierLevel = 'free'|'bronze'|'gold'|'diamond'|'signature';
const TIER = {
  free:      { label:'Free',      color:'#4CAF50', glow:'#4CAF5044', icon:'' },
  bronze:    { label:'Bronze',    color:'#CD7F32', glow:'#CD7F3244', icon:'' },
  gold:      { label:'Gold',      color:'#FFD700', glow:'#FFD70044', icon:'⭐' },
  diamond:   { label:'Diamond',   color:'#00E5FF', glow:'#00E5FF55', icon:'💎' },
  signature: { label:'Signature', color:'#FF4800', glow:'#FF480055', icon:'👑' },
};
export function DiamondTierBadge({ tier }: { tier: TierLevel }) {
  const t = TIER[tier];
  return (
    <div className="tmi-tier-badge" style={{ color: t.color, borderColor: t.color, boxShadow: `0 0 12px ${t.glow}` }}>
      {t.icon} {t.label}
    </div>
  );
}
