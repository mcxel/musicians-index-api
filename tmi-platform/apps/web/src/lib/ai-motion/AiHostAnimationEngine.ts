import { createMotion } from "./AiMotionCreatorEngine";

export type HostAnimationPreset = "intro" | "idle" | "reaction" | "celebration" | "announcement";

const presetDuration: Record<HostAnimationPreset, 2 | 4 | 5 | 6 | 7> = {
  intro: 6,
  idle: 4,
  reaction: 2,
  celebration: 7,
  announcement: 5,
};

export function createHostAnimation(input: {
  hostName: string;
  preset: HostAnimationPreset;
  ownerSystem: string;
  route: string;
}) {
  return createMotion({
    motionType:
      input.preset === "intro"
        ? "host-intro"
        : input.preset === "idle"
        ? "host-idle"
        : input.preset === "reaction"
        ? "host-reaction"
        : "host-celebration",
    subject: `${input.hostName}-${input.preset}`,
    durationSeconds: presetDuration[input.preset],
    ownerSystem: input.ownerSystem,
    route: input.route,
  });
}
