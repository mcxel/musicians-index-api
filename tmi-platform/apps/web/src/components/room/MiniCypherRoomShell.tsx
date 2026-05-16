'use client';
// MiniCypherRoomShell.tsx — Open drop-in daily cypher — anyone joins anytime
// Copilot wires: useOpenCypher(roomId), useMatchmaking() for random routing
// Proof: users can join/leave freely, no forced queue
export function MiniCypherRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-mini-cypher" data-room-id={roomId}>
      <div className="tmi-mini-cypher-header">
        <span className="tmi-badge tmi-badge--open">Open · Drop In Anytime</span>
        <div data-slot="genre" className="tmi-genre-tag">Hip Hop</div>
        <div data-slot="bpm" className="tmi-bpm">140 BPM</div>
      </div>
      <div className="tmi-mini-cypher-stage" data-slot="performers">
        {/* Performer tiles — ordered by join time, drop-in/drop-out */}
      </div>
      <div className="tmi-mini-cypher-actions">
        <button className="tmi-btn-primary">Jump In</button>
        <button className="tmi-btn-ghost">Watch</button>
        <button className="tmi-btn-ghost">Request Beat</button>
        <button className="tmi-btn-ghost">Invite Producer</button>
      </div>
    </div>
  );
}
