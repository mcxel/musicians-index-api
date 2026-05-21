'use client';
// RoomSceneBackground.tsx — Full-bleed room background scene
// Copilot wires: useRoomScene(roomId) — returns scene config from DB
// Proof: correct scene loads per room type, host can change scene between turns
export function RoomSceneBackground({ sceneId, animated = true }: { sceneId: string; animated?: boolean }) {
  return (
    <div className="tmi-room-scene" aria-hidden="true" data-scene={sceneId}>
      <div
        className="tmi-room-scene__bg"
        style={{ backgroundImage: `url(/scenes/${sceneId}/bg.jpg)` }}
      />
      {animated && (
        <div className="tmi-room-scene__ambient" data-slot="ambient-overlay">
          {/* Optional animated ambient: fog, light rays, crowd blur */}
          {/* Copilot: render <video> WebM loop from R2 if scene has overlay */}
        </div>
      )}
    </div>
  );
}
