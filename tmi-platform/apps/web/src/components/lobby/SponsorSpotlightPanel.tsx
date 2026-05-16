'use client';
// SponsorSpotlightPanel.tsx — Sponsor card — follows SPONSOR_RULES strictly
// Rules: clearly labeled, max 8s animation, no autoplay audio, fallback to house ad
// Banned at: winner reveal, crown transfer, tier upgrade
// Copilot wires: useActiveSponsor({ placement: 'homepage3-marketplace' })
// Proof: sponsor shows when active, house ad shows when no campaign
export function SponsorSpotlightPanel() {
  return (
    <div className="tmi-sponsor-spotlight">
      <div className="tmi-sponsor-spotlight__label">SPONSOR SPOTLIGHT</div>
      <div className="tmi-sponsor-spotlight__content" data-slot="sponsor-content">
        {/* Copilot wires: active campaign or house ad fallback */}
        <div className="tmi-placeholder tmi-placeholder--sponsor">
          Powered By: [RETRO LOGO]
        </div>
      </div>
      <div className="tmi-sponsor-spotlight__attribution">with High-end Ad</div>
    </div>
  );
}
