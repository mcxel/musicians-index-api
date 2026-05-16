'use client';
// SponsorPreviewCard.tsx — Sponsor content in the preview slot
// Rules: clearly labeled 'Sponsored', max 10s animation, no autoplay audio
// Banned at: winner reveal, crown transfer, tier upgrade moments
// Copilot wires: useActiveSponsorCampaign({ placement:'preview-slot' })
// Proof: sponsor label shows, banned-moment suppression works
export function SponsorPreviewCard({ sponsorName, campaignTitle, mediaUrl, ctaLabel, ctaUrl }: { sponsorName: string; campaignTitle?: string; mediaUrl?: string; ctaLabel?: string; ctaUrl?: string }) {
  return (
    <div className="tmi-sponsor-preview-card">
      <div className="tmi-sponsor-preview-card__label">Sponsored by {sponsorName}</div>
      {campaignTitle && <div className="tmi-sponsor-preview-card__title">{campaignTitle}</div>}
      {mediaUrl && (
        <div className="tmi-sponsor-preview-card__media" data-slot="sponsor-media">
          {/* Media renders here — Copilot wires */}
        </div>
      )}
      {ctaLabel && ctaUrl && (
        <a href={ctaUrl} className="tmi-btn-primary tmi-btn--sm" rel="noopener">{ctaLabel}</a>
      )}
    </div>
  );
}
