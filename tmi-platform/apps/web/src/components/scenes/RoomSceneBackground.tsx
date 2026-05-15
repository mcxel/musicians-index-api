'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement';
// RoomSceneBackground.tsx — Full-bleed room background scene
// Copilot wires: useRoomScene(roomId) — returns scene config from DB
// Proof: correct scene loads per room type, host can change scene between turns
export function RoomSceneBackground({ sceneId, animated = true }: { sceneId: string; animated?: boolean }) {
  return (
    <div className="tmi-room-scene" aria-hidden="true" data-scene={sceneId}>
      <div
        className="tmi-room-scene__bg"
      >
        <ImageSlotWrapper
          imageId={`room-scene-${sceneId}`}
          roomId="room-scene"
          priority="high"
          fallbackUrl={`/scenes/${sceneId}/bg.jpg`}
          altText={`Room scene ${sceneId}`}
          className="w-full h-full object-cover"
          containerStyle={{ position: 'absolute', inset: 0 }}
        />
      </div>
      {animated && (
        <div className="tmi-room-scene__ambient" data-slot="ambient-overlay">
          {/* Optional animated ambient: fog, light rays, crowd blur */}
          {/* Copilot: render <video> WebM loop from R2 if scene has overlay */}
        </div>
      )}
    </div>
  );
}
