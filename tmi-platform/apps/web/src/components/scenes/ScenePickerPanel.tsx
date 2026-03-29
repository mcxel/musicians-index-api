'use client';
// ScenePickerPanel.tsx — Host UI to change room scene between turns
// Copilot wires: useRoomScenes(roomType), changeScene(roomId, sceneId)
// Proof: only host sees this, scenes shown for correct room type, change applies after current turn
export function ScenePickerPanel({ roomId, roomType }: { roomId: string; roomType: string }) {
  return (
    <div className="tmi-scene-picker">
      <div className="tmi-scene-picker__header">Change Scene</div>
      <div className="tmi-scene-picker__note">Scene changes take effect after current turn</div>
      <div className="tmi-scene-picker__grid" data-slot="scenes">
        {/* Copilot maps scene thumbnails for this roomType */}
        <div className="tmi-scene-thumb tmi-placeholder tmi-scene-thumb--active">
          Stadium Night
        </div>
      </div>
    </div>
  );
}
