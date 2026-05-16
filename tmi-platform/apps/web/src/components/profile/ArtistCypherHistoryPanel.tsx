'use client';
// ArtistCypherHistoryPanel.tsx — Cypher participation history
// Copilot wires: useArtistCyphers(artistId, { limit:10 })
// Proof: cypher history loads with dates and rooms
export function ArtistCypherHistoryPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-cypher-history">
      <div className="tmi-cypher-history__header">Cypher History</div>
      <div className="tmi-cypher-history__list" data-slot="cyphers">
        {/* Copilot maps cypher history rows */}
      </div>
    </div>
  );
}
