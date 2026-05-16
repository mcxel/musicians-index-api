'use client';
// ProducerRoomShell.tsx — Producer Lab: beat cast, collab, showcase
// Copilot wires: useProducerBeatLocker(producerId), useBeatCast(roomId)
// Proof: producer can push beat to room, all hear it
export function ProducerRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-producer-room" data-room-id={roomId}>
      <div className="tmi-producer-stage" data-slot="beat-locker">
        {/* ProducerBeatLocker — select and cast beat */}
      </div>
      <div className="tmi-producer-cast" data-slot="beat-cast">
        {/* BeatCastPanel — now casting, loop, swap */}
      </div>
      <div className="tmi-producer-artists" data-slot="artist-tiles">
        {/* Artists rapping over beat */}
      </div>
      <div className="tmi-producer-audience" data-slot="audience">
        {/* Fans watching the session */}
      </div>
      <div className="tmi-producer-actions">
        <button className="tmi-btn-primary">Cast Beat</button>
        <button className="tmi-btn-ghost">Loop</button>
        <button className="tmi-btn-ghost">Swap Beat</button>
        <button className="tmi-btn-ghost">Invite Artist</button>
      </div>
    </div>
  );
}
