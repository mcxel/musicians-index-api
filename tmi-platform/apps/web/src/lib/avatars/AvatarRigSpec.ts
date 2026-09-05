/**
 * AvatarRigSpec.ts — AvatarRig Specification for TMI Platform
 * Canonical contract for skeleton deform bones, ARKit-52 morph targets, sockets, and LOD triangle budgets.
 */

export const AVATAR_RIG_VERSION = "AvatarRig/1.0" as const;
export const MOTION_PACKAGE_VERSION = "AvatarMotionPackage/1.0" as const;

export const REQUIRED_DEFORM_BONES = [
  "Root",
  "Hips",
  "Spine_01",
  "Spine_02",
  "Chest",
  "Neck",
  "Head",
  "Jaw",
  "Eye_L",
  "Eye_R",
  "Clavicle_L",
  "UpperArm_L",
  "LowerArm_L",
  "Hand_L",
  "Clavicle_R",
  "UpperArm_R",
  "LowerArm_R",
  "Hand_R",
  "UpperLeg_L",
  "LowerLeg_L",
  "Foot_L",
  "Toe_L",
  "UpperLeg_R",
  "LowerLeg_R",
  "Foot_R",
  "Toe_R",
] as const;

export type RequiredDeformBone = (typeof REQUIRED_DEFORM_BONES)[number];

export const OPTIONAL_DEFORM_BONES = [
  "Thumb_01_L", "Thumb_02_L", "Index_01_L", "Index_02_L", "Middle_01_L",
  "Thumb_01_R", "Thumb_02_R", "Index_01_R", "Index_02_R", "Middle_01_R",
] as const;

export const ARKIT_BLENDSHAPES = [
  "browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight",
  "cheekPuff", "cheekSquintLeft", "cheekSquintRight",
  "eyeBlinkLeft", "eyeBlinkRight", "eyeLookDownLeft", "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight",
  "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight", "eyeSquintLeft", "eyeSquintRight",
  "eyeWideLeft", "eyeWideRight", "jawForward", "jawLeft", "jawRight", "jawOpen", "mouthClose", "mouthFunnel",
  "mouthPucker", "mouthLeft", "mouthRight", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight",
  "mouthDimpleLeft", "mouthDimpleRight", "mouthStretchLeft", "mouthStretchRight", "mouthRollLower", "mouthRollUpper",
  "mouthShrugLower", "mouthShrugUpper", "mouthPressLeft", "mouthPressRight", "mouthLowerDownLeft", "mouthLowerDownRight",
  "mouthUpperUpLeft", "mouthUpperUpRight", "noseSneerLeft", "noseSneerRight", "tongueOut",
] as const;

export type ArKitBlendshape = (typeof ARKIT_BLENDSHAPES)[number];

export const REQUIRED_SOCKETS = [
  "Socket_Hair",
  "Socket_Hat",
  "Socket_Headphones",
  "Socket_Badge",
  "Socket_Backpack",
  "Socket_Prop_L",
  "Socket_Prop_R",
] as const;

export type RequiredSocket = (typeof REQUIRED_SOCKETS)[number];

export const SOCKET_PARENT_BONES: Record<RequiredSocket, RequiredDeformBone> = {
  Socket_Hair: "Head",
  Socket_Hat: "Head",
  Socket_Headphones: "Head",
  Socket_Badge: "Chest",
  Socket_Backpack: "Chest",
  Socket_Prop_L: "Hand_L",
  Socket_Prop_R: "Hand_R",
};

export const LOD_TRIANGLE_BUDGETS = {
  LOD0: 50000,
  LOD1: 15000,
  LOD2: 5000,
} as const;

export const BOBBLEHEAD_ARCHETYPE = {
  archetype: "BH-A",
  heightMeters: 1.65,
  headScale: 1.55,
  origin: [0, 0, 0] as [number, number, number],
  authoringUpAxis: "Z" as const,
  runtimeForwardAxis: "-Y" as const,
  gltfUpAxis: "Y" as const,
} as const;
