'use client';
// ArenaRoomShell.tsx — Arena room visual shell
// TMI Design: deep navy bg, neon orange accents, scattered triangles
// Copilot wires: useRoomInfrastructure(roomId), useSharedPreview(), useTurnQueue()
// Proof: room opens with all panels, watchdog reports healthy
export function ArenaRoomShell({ roomId, venueId }: { roomId: string; venueId?: string }) {
  return (
    <div className="tmi-arena-room" data-room-id={roomId} data-venue-id={venueId}>
      <div className="tmi-arena-stage" data-slot="shared-preview">
        {/* SharedPreviewStagePanel mounts here — Copilot wires */}
        <div className="tmi-placeholder tmi-placeholder--preview">Preview Stage</div>
      </div>
      <div className="tmi-arena-performers" data-slot="performer-tiles">
        {/* Performer video tiles — Copilot wires from room roster */}
      </div>
      <div className="tmi-arena-audience" data-slot="audience">
        {/* AudienceReactionRail — Copilot wires */}
      </div>
      <div className="tmi-arena-controls" data-slot="controls">
        {/* TurnQueueDock + LiveControlPanel — Copilot wires */}
      </div>
      <div className="tmi-arena-chat" data-slot="chat">
        {/* CommentaryPanel — Copilot wires */}
      </div>
      <div data-slot="watchdog">
        {/* RoomWatchdogBadge — Copilot wires */}
      </div>
    </div>
  );
}
