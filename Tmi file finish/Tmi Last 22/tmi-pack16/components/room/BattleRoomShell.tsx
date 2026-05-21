'use client';
// BattleRoomShell.tsx — Battle room: turn-based preview + scoring
// Copilot wires: useTurnQueue(), useSharedPreview(), useBattleState(roomId)
// Rule: only current turn holder can open preview (turn lock enforced)
// Proof: Artist A opens preview → Artist B blocked → release → Artist B can open
export function BattleRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-battle-room" data-room-id={roomId}>
      <div className="tmi-battle-header">
        <div className="tmi-battle-label">BATTLE ROOM</div>
        <div className="tmi-battle-round" data-slot="round-status">Round 1</div>
        <div className="tmi-battle-timer" data-slot="timer">03:00</div>
      </div>
      <div className="tmi-battle-artists" data-slot="artist-tiles">
        {/* Two artist tiles side by side */}
        <div className="tmi-battle-artist" data-slot="artist-a">
          <div className="tmi-placeholder">Artist A</div>
          <button className="tmi-btn-primary tmi-btn--sm">Play My Song</button>
        </div>
        <div className="tmi-battle-vs">VS</div>
        <div className="tmi-battle-artist" data-slot="artist-b">
          <div className="tmi-placeholder">Artist B</div>
          <button className="tmi-btn-primary tmi-btn--sm" disabled>Play My Song</button>
        </div>
      </div>
      <div className="tmi-battle-preview" data-slot="shared-preview">
        {/* SharedPreviewStagePanel — docked to stage, not over faces */}
      </div>
      <div className="tmi-battle-audience" data-slot="audience">
        {/* Audience reactions + vote panel */}
      </div>
      <div className="tmi-battle-score" data-slot="score">
        {/* Battle score tracker */}
      </div>
    </div>
  );
}
