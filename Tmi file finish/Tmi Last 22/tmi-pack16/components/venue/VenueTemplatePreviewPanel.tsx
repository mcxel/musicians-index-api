'use client';
// VenueTemplatePreviewPanel.tsx — Shows which room template this venue uses
// Copilot wires: useVenueTemplate(venueId)
// Proof: template name and preview image show
export function VenueTemplatePreviewPanel({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-template">
      <div className="tmi-venue-template__header">Venue Style</div>
      <div className="tmi-venue-template__preview" data-slot="template-preview">
        {/* Template thumbnail */}
      </div>
      <div className="tmi-venue-template__name" data-slot="template-name">Club Stage</div>
    </div>
  );
}
