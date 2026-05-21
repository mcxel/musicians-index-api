export type RoleType = "FAN" | "PERFORMER" | "ADMIN";

export type AvatarMorphSchema = {
  height: number; // 0.4 – 2.5
  girth: number; // 0.5 – 2.0
  muscleMass: number; // 0.0 – 1.0
  melanin: number; // 0.0 – 1.0
  boneStructure: number; // 0.0 – 1.0
};

export type AvatarAnimationState = "idle" | "active" | "performing";

export type AvatarState = {
  id: string;
  role: RoleType;
  morph: AvatarMorphSchema;
  outfitId?: string;
  animationState?: AvatarAnimationState;
  hasCameraEnabled: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampAvatarMorph = (morph: AvatarMorphSchema): AvatarMorphSchema => ({
  height: clamp(morph.height, 0.4, 2.5),
  girth: clamp(morph.girth, 0.5, 2.0),
  muscleMass: clamp(morph.muscleMass, 0.0, 1.0),
  melanin: clamp(morph.melanin, 0.0, 1.0),
  boneStructure: clamp(morph.boneStructure, 0.0, 1.0),
});

export const createDefaultAvatar = (role: RoleType): AvatarState => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `avatar_${Date.now()}`,
  role,
  morph: {
    height: 1,
    girth: 1,
    muscleMass: 0.5,
    melanin: 0.5,
    boneStructure: 0.5,
  },
  animationState: "idle",
  hasCameraEnabled: false,
});
