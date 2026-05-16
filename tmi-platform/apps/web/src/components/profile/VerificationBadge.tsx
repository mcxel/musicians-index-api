'use client';
// VerificationBadge.tsx — Verified artist/producer/venue/sponsor badge
// Copilot wires: profile.isVerified from useArtistProfile(slug)
// Proof: verified profiles show badge, unverified do not
export type VerificationType = 'artist'|'producer'|'venue'|'sponsor';
export function VerificationBadge({ type, verified }: { type: VerificationType; verified: boolean }) {
  if (!verified) return null;
  return <span className={`tmi-verified-badge tmi-verified-badge--${type}`} title={`Verified ${type}`}>✓</span>;
}
