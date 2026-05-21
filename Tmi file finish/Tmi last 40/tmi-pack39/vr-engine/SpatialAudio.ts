// packages/vr-engine/src/SpatialAudio.ts
// 3D spatial audio for VR — sound comes from correct position.
// Audience claps from left = you hear it from the left.

export interface SpatialAudioSource {
  id: string;
  type: "ambient" | "avatar_voice" | "stage_music" | "crowd_section" | "sponsor_board" | "object";
  position: { x: number; y: number; z: number };
  audio: string;         // references AUDIO_CATALOG
  volume: number;        // 0-1
  refDistance: number;   // meters at which volume is 1.0
  maxDistance: number;   // meters beyond which volume is 0
  rolloffFactor: number; // how fast volume decreases with distance
  loop: boolean;
  isDirectional: boolean;
  coneInnerAngle?: number; // for directional sources (stage speakers)
  coneOuterAngle?: number;
}

// ── STADIUM SPATIAL AUDIO LAYOUT ─────────────────────────
export function buildStadiumSpatialLayout(
  stagePosition: { x: number; y: number; z: number }
): SpatialAudioSource[] {
  return [
    // Main stage — loudest source
    {
      id: "stage-main", type: "stage_music",
      position: stagePosition, audio: "/audio/spatial/stage-feed.mp3",
      volume: 1.0, refDistance: 5, maxDistance: 200, rolloffFactor: 1,
      loop: true, isDirectional: true, coneInnerAngle: 120, coneOuterAngle: 180,
    },
    // Left speaker stack
    { id: "speaker-left", type: "stage_music",
      position: { x: stagePosition.x - 15, y: stagePosition.y + 5, z: stagePosition.z },
      audio: "/audio/spatial/stage-feed.mp3",
      volume: 0.8, refDistance: 8, maxDistance: 100, rolloffFactor: 1,
      loop: true, isDirectional: true, coneInnerAngle: 90, coneOuterAngle: 160,
    },
    // Right speaker stack
    { id: "speaker-right", type: "stage_music",
      position: { x: stagePosition.x + 15, y: stagePosition.y + 5, z: stagePosition.z },
      audio: "/audio/spatial/stage-feed.mp3",
      volume: 0.8, refDistance: 8, maxDistance: 100, rolloffFactor: 1,
      loop: true, isDirectional: true, coneInnerAngle: 90, coneOuterAngle: 160,
    },
    // Crowd ambient (general)
    { id: "crowd-ambient", type: "ambient",
      position: { x: 0, y: 0, z: -20 },
      audio: "/audio/spatial/stadium-crowd.mp3",
      volume: 0.4, refDistance: 20, maxDistance: 300, rolloffFactor: 0.5,
      loop: true, isDirectional: false,
    },
  ];
}

// ── CLAP LOCALIZATION ─────────────────────────────────────
// When fan claps, sound comes from their actual VR position
export interface ClapEvent {
  avatarId: string;
  position: { x: number; y: number; z: number };
  intensity: number;   // 0-1, based on how hard they clap (hand tracking)
}

export function buildClapSource(event: ClapEvent): SpatialAudioSource {
  return {
    id: `clap-${event.avatarId}-${Date.now()}`,
    type: "avatar_voice",
    position: event.position,
    audio: "/audio/spatial/clap-single.mp3",
    volume: event.intensity,
    refDistance: 2,
    maxDistance: 20,
    rolloffFactor: 2,
    loop: false,
    isDirectional: false,
  };
}
