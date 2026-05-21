'use client';
// WatchRoomShell.tsx — Watch/Listen party: synchronized shared media
// Copilot wires: useSharedMedia(roomId), useWatchPartySync(roomId)
// Proof: all viewers hear/see same content at same timestamp
export function WatchRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-watch-room" data-room-id={roomId}>
      <div className="tmi-watch-main" data-slot="shared-media">
        {/* Synchronized media player — all at same timestamp */}
      </div>
      <div className="tmi-watch-host" data-slot="host-panel">
        {/* Host commentary overlay */}
      </div>
      <div className="tmi-watch-reactions" data-slot="reactions">
        {/* Live reaction rail */}
      </div>
      <div className="tmi-watch-chat" data-slot="chat">
        {/* Commentary chat */}
      </div>
    </div>
  );
}
