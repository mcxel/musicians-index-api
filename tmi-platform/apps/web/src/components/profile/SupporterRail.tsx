'use client';
// SupporterRail.tsx — Fan supporters/VIPs for artist profile
// Copilot wires: useArtistSupporters(artistId, { limit:12 })
// Proof: supporters load with tier badges
export function SupporterRail({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-supporter-rail">
      <div className="tmi-supporter-rail__header">Top Supporters</div>
      <div className="tmi-supporter-rail__list" data-slot="supporters">
        {/* Copilot maps supporter avatars with tier badges */}
      </div>
    </div>
  );
}
