/**
 * AvatarLODEngine.ts
 * Governs Level-Of-Detail identity resolution for 3D Fan Avatars in venues & crowds.
 *
 * Invariant: LOD level changes geometry complexity (hero face-scan -> crowd proxy),
 * but MUST NEVER alter canonical identity (userId, displayName, initials, avatarDNA).
 */

export type AvatarLODLevel = "HERO" | "NEAR" | "MID" | "FAR" | "CROWD_PROXY";

export interface AvatarLODConfig {
  userId: string;
  displayName: string;
  initials: string;
  avatarDNA: string;
  distanceMeters: number;
  lodLevel: AvatarLODLevel;
  renderTarget: "full-mesh" | "simplified-mesh" | "billboard-sprite" | "crowd-dot";
}

export function resolveAvatarLOD(input: {
  userId: string;
  displayName: string;
  avatarDNA?: string;
  distanceMeters: number;
}): AvatarLODConfig {
  const name = (input.displayName ?? "").trim();
  const initials = name ? Array.from(name)[0]!.toUpperCase() : "?";
  const dist = Math.max(0, input.distanceMeters);

  let lodLevel: AvatarLODLevel = "HERO";
  let renderTarget: AvatarLODConfig["renderTarget"] = "full-mesh";

  if (dist > 60) {
    lodLevel = "CROWD_PROXY";
    renderTarget = "crowd-dot";
  } else if (dist > 30) {
    lodLevel = "FAR";
    renderTarget = "billboard-sprite";
  } else if (dist > 15) {
    lodLevel = "MID";
    renderTarget = "simplified-mesh";
  } else if (dist > 5) {
    lodLevel = "NEAR";
    renderTarget = "full-mesh";
  }

  return {
    userId: input.userId,
    displayName: name,
    initials,
    avatarDNA: input.avatarDNA ?? `dna-${input.userId}`,
    distanceMeters: dist,
    lodLevel,
    renderTarget,
  };
}
