/**
 * FlagshipVenueAtmosphere — thin WDP / Slow Jams helpers over EventVenueEnvironment.
 */

import {
  resolveEventVenueEnvironment,
  listSkinsForEventEnvironment,
  type VenueEnvironmentKind,
  type EventVenueEnvironmentResolution,
} from "@/lib/venues/EventVenueEnvironment";
import type { VenueSkin } from "@/lib/venue/venueSkinEngine";
import type { ExperiencePersonalityId } from "@/lib/live/ExperiencePersonality";

export type { VenueEnvironmentKind };
export type FlagshipAtmosphereExperience = "world-dance-party" | "slow-jams";

export interface FlagshipVenueChoice {
  experience: FlagshipAtmosphereExperience;
  environment: VenueEnvironmentKind;
  skinId: string;
  skin: VenueSkin | null;
  assetAvailable: boolean;
  label: string;
  copyTone: "hype" | "chill";
  venueIndex: 0 | 1 | 2 | 3 | 4 | 5;
  ambientEnergy: number;
}

export const FLAGSHIP_DEFAULT_SKIN = {
  "world-dance-party": { outdoor: "festival", indoor: "neon-club" },
  "slow-jams": { outdoor: "under-the-stars", indoor: "luxury-lounge" },
} as const;

function toChoice(
  experience: FlagshipAtmosphereExperience,
  r: EventVenueEnvironmentResolution,
): FlagshipVenueChoice {
  return {
    experience,
    environment: r.environment ?? "outdoor",
    skinId: r.skinId ?? FLAGSHIP_DEFAULT_SKIN[experience].outdoor,
    skin: r.skin,
    assetAvailable: r.assetAvailable,
    label: r.label,
    copyTone: r.copyTone === "chill" ? "chill" : "hype",
    venueIndex: r.venueIndex,
    ambientEnergy: r.ambientEnergy,
  };
}

export function listSelectableFlagshipSkins(
  experience: FlagshipAtmosphereExperience,
  environment: VenueEnvironmentKind,
): VenueSkin[] {
  return listSkinsForEventEnvironment(experience, environment);
}

export function resolveFlagshipVenueAtmosphere(input: {
  experience: FlagshipAtmosphereExperience;
  environment?: VenueEnvironmentKind | null;
  skinId?: string | null;
  isMini?: boolean;
}): FlagshipVenueChoice {
  const kind = input.isMini
    ? input.experience === "slow-jams"
      ? "mini-slow-jam"
      : "mini-dance-party"
    : input.experience;
  const resolved = resolveEventVenueEnvironment({
    kind,
    environment: input.environment,
    skinId: input.skinId,
  });
  return toChoice(input.experience, resolved);
}

export function personalityIdForFlagship(
  experience: FlagshipAtmosphereExperience,
): ExperiencePersonalityId {
  return experience === "slow-jams" ? "SLOW_JAM" : "LIVE_GUEST_QUEUE";
}

export function joinCopyForAtmosphere(choice: FlagshipVenueChoice): string {
  if (choice.copyTone === "chill") {
    return choice.assetAvailable ? "ENTER THE LOUNGE" : "ENTER LOUNGE · venue art pending";
  }
  return choice.assetAvailable ? "JOIN THE FLOOR" : "JOIN FLOOR · venue art pending";
}
