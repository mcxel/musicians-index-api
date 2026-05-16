'use client';
// ArtistSponsorPanel.tsx — Active and past sponsors on artist profile
// Copilot wires: useArtistSponsors(artistId)
// Proof: active sponsors show with campaign info, past sponsors in history
export function ArtistSponsorPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-artist-sponsor-panel">
      <div className="tmi-artist-sponsor-panel__header">Sponsors</div>
      <div className="tmi-artist-sponsor-panel__active" data-slot="active-sponsors">
        {/* Active sponsor cards */}
      </div>
      <div className="tmi-artist-sponsor-panel__history" data-slot="past-sponsors">
        {/* Past sponsor history */}
      </div>
    </div>
  );
}
