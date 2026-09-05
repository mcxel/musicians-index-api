export const FOUNDRY_CONFIG = {
  maxAutomaticRepairAttempts: 3,
  jobIdPrefix: "JOB",
  blenderExecutable: process.env.TMI_BLENDER_BIN ?? "blender",
  avatarRigVersion: "AvatarRig/1.0",
  motionPackageVersion: "AvatarMotionPackage/1.0",
  authoring: {
    upAxis: "Z",
    metersPerUnit: 1,
    gltfUpAxis: "Y",
    forwardAxis: "-Y",
  },
} as const;
