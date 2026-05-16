'use client';
// ProducerBeatLocker.tsx — Beat locker: select approved beat and cast to room
// Copilot wires: useProducerBeats(producerId), useBeatCast(roomId)
// Proof: producer selects beat, all room members hear it
export function ProducerBeatLocker({ producerId, roomId }: { producerId: string; roomId: string }) {
  return (
    <div className="tmi-beat-locker">
      <div className="tmi-beat-locker__header">My Beat Locker</div>
      <div className="tmi-beat-locker__list" data-slot="beats">
        {/* Copilot maps producer's beats here */}
        <div className="tmi-beat-item tmi-placeholder">Beat 1 — Hip Hop 140 BPM</div>
        <div className="tmi-beat-item tmi-placeholder">Beat 2 — Trap 145 BPM</div>
      </div>
      <div className="tmi-beat-locker__actions">
        <button className="tmi-btn-primary">Cast Beat to Room</button>
        <button className="tmi-btn-ghost">Upload New Beat</button>
      </div>
    </div>
  );
}
