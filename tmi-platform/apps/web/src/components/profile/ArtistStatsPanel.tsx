'use client';
// ArtistStatsPanel.tsx — Artist performance stats: streams, followers, revenue, wins
// Copilot wires: useArtistStats(artistId)
// Proof: all stats load, Marcel/BJ show Diamond-tier stats
export function ArtistStatsPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-artist-stats">
      <div className="tmi-artist-stats__header">Performance</div>
      <div className="tmi-artist-stats__grid" data-slot="stats">
        {[
          ['Streams','0'],['Followers','0'],['Cypher Wins','0'],
          ['Battle Record','0-0'],['Revenue','$0'],['Fan Club Members','0'],
        ].map(([label, val]) => (
          <div key={label} className="tmi-stat-tile">
            <span className="tmi-stat-tile__val" data-slot={label?.toLowerCase().replace(' ','-')}>{val}</span>
            <span className="tmi-stat-tile__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
