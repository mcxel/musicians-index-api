import { createMotion } from "./AiMotionCreatorEngine";

export type EnvironmentMotionPreset = "particles" | "neon" | "ambient" | "confetti" | "camera";

const presetDuration: Record<EnvironmentMotionPreset, 2 | 4 | 5 | 6 | 7> = {
  particles: 4,
  neon: 5,
  ambient: 6,
  confetti: 2,
  camera: 7,
};

export function createEnvironmentMotion(input: {
  route: string;
  preset: EnvironmentMotionPreset;
  ownerSystem: string;
}) {
  return createMotion({
    motionType: "environment-loop",
    subject: `${input.route}-${input.preset}`,
    durationSeconds: presetDuration[input.preset],
    ownerSystem: input.ownerSystem,
    route: input.route,
  });
}
