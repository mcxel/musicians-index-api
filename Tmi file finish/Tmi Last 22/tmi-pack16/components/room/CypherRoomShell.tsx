'use client';
// CypherRoomShell.tsx — Cypher room with mic queue and beat preview
// Copilot wires: useTurnQueue(), useProducerBeat(roomId), useRoomRoster(roomId)
// Proof: queue advances correctly, beat preview plays for all
export function CypherRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-cypher-room" data-room-id={roomId}>
      <div className="tmi-cypher-stage" data-slot="stage">
        <div className="tmi-cypher-performer" data-slot="current-performer">
          <div className="tmi-placeholder">Current Performer</div>
        </div>
        <div className="tmi-cypher-beat" data-slot="beat-preview">
          {/* BeatPreviewPanel — producer pushes beat here */}
          <div className="tmi-placeholder tmi-placeholder--beat">Beat Preview</div>
        </div>
      </div>
      <div className="tmi-cypher-queue" data-slot="queue">
        {/* TurnQueueDock — ordered mic queue */}
      </div>
      <div className="tmi-cypher-audience" data-slot="audience">
        {/* Audience tiles and reactions */}
      </div>
      <div className="tmi-cypher-actions">
        <button className="tmi-btn-primary">Request Mic</button>
        <button className="tmi-btn-ghost">Watch</button>
        <button className="tmi-btn-ghost">Drop Beat</button>
      </div>
    </div>
  );
}
