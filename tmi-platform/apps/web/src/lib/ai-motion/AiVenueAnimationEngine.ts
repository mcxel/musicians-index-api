import { createMotion } from "./AiMotionCreatorEngine";

export type VenueAnimationPreset = "lights" | "crowd" | "walls" | "stage-effects" | "vip-loop";

const durationByPreset: Record<VenueAnimationPreset, 2 | 4 | 5 | 6 | 7> = {
  lights: 4,
  crowd: 6,
  walls: 5,
  "stage-effects": 7,
  "vip-loop": 4,
};

export function createVenueAnimation(input: {
  venueSlug: string;
  preset: VenueAnimationPreset;
  ownerSystem: string;
  route: string;
}) {
  return createMotion({
    motionType: "venue-loop",
    subject: `${input.venueSlug}-${input.preset}`,
    durationSeconds: durationByPreset[input.preset],
    ownerSystem: input.ownerSystem,
    route: input.route,
  });
}
