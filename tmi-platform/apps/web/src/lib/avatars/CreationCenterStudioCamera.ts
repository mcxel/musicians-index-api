/**
 * CreationCenterStudioCamera — category travel for the frozen Creation Center.
 * Same Avatar remains mounted; only camera focus / presentation travel changes.
 * NOT a second camera engine — maps onto AvatarViewer cameraFocus.
 */

import type { AvatarCameraFocus } from "@/components/3d/AvatarLobbyCanvas";

export type CreationCenterCategory =
  | "BASES"
  | "BODY"
  | "FACE_SCAN"
  | "FACE"
  | "SKIN"
  | "HAIR"
  | "OUTFITS"
  | "ACCESSORIES"
  | "EMOTES"
  | "SAVED_LOOKS"
  | "FOUNDRY";

export type CreationCenterCameraAngle = "front" | "side" | "back" | "closeup" | "fullbody";

export interface CreationCenterCameraPlan {
  focus: AvatarCameraFocus;
  angle: CreationCenterCameraAngle;
  lightingBias: "identity" | "face_inspect" | "full_body" | "feet" | "animation_safe" | "technical";
  label: string;
}

const CATEGORY_PLAN: Record<CreationCenterCategory, CreationCenterCameraPlan> = {
  BASES: { focus: "body", angle: "fullbody", lightingBias: "full_body", label: "Full-body identity" },
  BODY: { focus: "body", angle: "fullbody", lightingBias: "full_body", label: "Body diversity proportion" },
  FACE_SCAN: { focus: "face", angle: "closeup", lightingBias: "face_inspect", label: "Face scan framing" },
  FACE: { focus: "face", angle: "closeup", lightingBias: "face_inspect", label: "Face studio morphs" },
  SKIN: { focus: "face", angle: "closeup", lightingBias: "face_inspect", label: "Skin inspection" },
  HAIR: { focus: "face", angle: "closeup", lightingBias: "face_inspect", label: "Hair framing" },
  OUTFITS: { focus: "body", angle: "fullbody", lightingBias: "full_body", label: "Outfit full-body" },
  ACCESSORIES: { focus: "body", angle: "front", lightingBias: "full_body", label: "Accessory framing" },
  EMOTES: { focus: "body", angle: "fullbody", lightingBias: "animation_safe", label: "Animation-safe frame" },
  SAVED_LOOKS: { focus: "body", angle: "fullbody", lightingBias: "full_body", label: "Loadout preview" },
  FOUNDRY: { focus: "body", angle: "front", lightingBias: "technical", label: "Foundry technical frame" },
};

export function resolveCreationCenterCamera(
  category: CreationCenterCategory,
  angleOverride?: CreationCenterCameraAngle | null,
): CreationCenterCameraPlan {
  const base = CATEGORY_PLAN[category] ?? CATEGORY_PLAN.BASES;
  if (!angleOverride) return base;

  if (angleOverride === "closeup") {
    return { ...base, focus: "face", angle: "closeup", lightingBias: "face_inspect" };
  }
  if (angleOverride === "fullbody") {
    return { ...base, focus: "body", angle: "fullbody", lightingBias: "full_body" };
  }
  return { ...base, angle: angleOverride, focus: base.focus === "feet" ? "feet" : "body" };
}

/** Shoes / lower-body travel when catalog sub-intent requests it. */
export function resolveShoesCamera(): CreationCenterCameraPlan {
  return {
    focus: "feet",
    angle: "front",
    lightingBias: "feet",
    label: "Shoes / lower body",
  };
}


/** Upper-body framing for wardrobe and accessory inspection. */
export function resolveUpperBodyCamera(): CreationCenterCameraPlan {
  return {
    focus: "upper",
    angle: "front",
    lightingBias: "full_body",
    label: "Upper body framing",
  };
}
