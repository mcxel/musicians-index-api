'use client';
// ArtistBattleHistoryPanel.tsx — Battle record: wins, losses, notable moments
// Copilot wires: useArtistBattles(artistId, { limit:10 })
// Proof: battle record shows correctly, W/L counts accurate
export function ArtistBattleHistoryPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-battle-history">
      <div className="tmi-battle-history__header">Battle Record</div>
      <div className="tmi-battle-history__record" data-slot="record">
        <span className="tmi-battle-record__wins">0W</span>
        <span className="tmi-battle-record__sep">—</span>
        <span className="tmi-battle-record__losses">0L</span>
      </div>
      <div className="tmi-battle-history__list" data-slot="battles">
        {/* Copilot maps battle history rows */}
      </div>
    </div>
  );
}
